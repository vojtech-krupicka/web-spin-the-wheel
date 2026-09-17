"use client";

import type { WheelVisualization } from "@/lib/db/schema";

/**
 * Sound effects via the Web Audio API. Real clips live in `public/sounds/`;
 * each category falls back to a synthesized sound automatically if its clip
 * is missing or fails to load, so the app never goes silent.
 */

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  if (audioCtx.state === "suspended") void audioCtx.resume();
  return audioCtx;
}

const MASTER_VOLUME = 0.25;

const MUTE_STORAGE_KEY = "wheel-app-muted";
let muted = typeof window !== "undefined" && window.localStorage.getItem(MUTE_STORAGE_KEY) === "1";

export function isMuted(): boolean {
  return muted;
}

export function setMuted(value: boolean): void {
  muted = value;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(MUTE_STORAGE_KEY, value ? "1" : "0");
  }
}

/** Decoded-clip cache, keyed by URL, so repeated plays don't re-fetch/re-decode. */
const clipCache = new Map<string, Promise<AudioBuffer | null>>();

function loadClip(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  let cached = clipCache.get(url);
  if (!cached) {
    cached = fetch(url)
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then((data) => ctx.decodeAudioData(data))
      .catch(() => null);
    clipCache.set(url, cached);
  }
  return cached;
}

/**
 * Plays a random clip from `urls` at a random pitch within `pitchRange`
 * (a `playbackRate` multiplier, so `[0.9, 1.1]` is +-10%). Falls back to
 * `fallback()` when there are no candidates, or the chosen clip can't be
 * loaded/decoded. Passing a single-element array plays that exact clip.
 */
function playRandomClip(urls: string[], pitchRange: [number, number], volume: number, fallback: () => void): void {
  const ctx = getContext();
  if (!ctx || urls.length === 0) {
    fallback();
    return;
  }

  const url = urls[Math.floor(Math.random() * urls.length)];
  void loadClip(ctx, url).then((buffer) => {
    if (!buffer) {
      fallback();
      return;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = pitchRange[0] + Math.random() * (pitchRange[1] - pitchRange[0]);
    const gain = ctx.createGain();
    gain.gain.value = volume;
    source.connect(gain).connect(ctx.destination);
    source.start();
  });
}

/** A gain node with a fast linear attack and an exponential decay to silence. */
function envelope(ctx: AudioContext, attack: number, decay: number, peak: number): GainNode {
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  return gain;
}

// ---- Click ----

const CLICK_CLIPS: string[] = ["/sounds/mouseclick.ogg"];

function playSynthClick(): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(1100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.05);

  const gain = envelope(ctx, 0.002, 0.05, MASTER_VOLUME * 0.5);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.08);
}

/** Short, crisp UI click for general button taps. */
export function playClick(): void {
  if (muted) return;
  playRandomClip(CLICK_CLIPS, [1, 1], MASTER_VOLUME * 0.9, playSynthClick);
}

// ---- Spin ticks — one fixed clip per visualization ----

const VISUALIZATION_TICK_CLIPS: Record<WheelVisualization, string> = {
  bowl: "/sounds/bowl.ogg",
  carousel: "/sounds/carousel.ogg",
  cylinder: "/sounds/cylinder.ogg",
  wheel: "/sounds/wheel.ogg",
};

function playSynthTick(): void {
  const ctx = getContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  osc.type = "square";
  osc.frequency.setValueAtTime(1700, ctx.currentTime);

  const gain = envelope(ctx, 0.001, 0.03, MASTER_VOLUME * 0.35);
  osc.connect(gain).connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.04);
}

/** One tick of the given visualization's own sound, with a small pitch jitter so repeats don't sound identical. */
export function playVisualizationTick(visualization: WheelVisualization): void {
  if (muted) return;
  playRandomClip([VISUALIZATION_TICK_CLIPS[visualization]], [0.94, 1.06], MASTER_VOLUME * 0.5, playSynthTick);
}

// ---- Winner banner chime ----

const WIN_CHIME_CLIPS: string[] = ["/sounds/win-banner-chime.mp3"];

function playSynthChime(): void {
  const ctx = getContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 784.0];
  notes.forEach((freq, i) => {
    const start = ctx.currentTime + i * 0.09;
    const osc = ctx.createOscillator();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, start);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.linearRampToValueAtTime(MASTER_VOLUME * 0.8, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.42);
  });
}

/** The winner banner's fanfare, played once when it appears. */
export function playWinChime(): void {
  if (muted) return;
  playRandomClip(WIN_CHIME_CLIPS, [1, 1], MASTER_VOLUME * 1.1, playSynthChime);
}
