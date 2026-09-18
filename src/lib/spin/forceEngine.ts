import { pickWinnerIndex } from "./pickWinner";

export type SpinPlan = {
  winnerIndex: number;
  durationMs: number;
  /** Extra full cycles through the list before settling — purely cosmetic, scales with force. */
  extraCycles: number;
};

const MIN_DURATION_MS = 1400;
const MAX_DURATION_MS = 3200;
const MAX_HOLD_MS = 1800;
const MIN_CYCLES = 2;
const MAX_CYCLES = 6;

function forceFraction(holdMs: number): number {
  return Math.min(Math.max(holdMs, 0), MAX_HOLD_MS) / MAX_HOLD_MS;
}

function animationFromForce(holdMs: number): { durationMs: number; extraCycles: number } {
  const force = forceFraction(holdMs);
  return {
    durationMs: MIN_DURATION_MS + force * (MAX_DURATION_MS - MIN_DURATION_MS),
    extraCycles: Math.round(MIN_CYCLES + force * (MAX_CYCLES - MIN_CYCLES)),
  };
}

/** Fair mode: the winner is drawn independently of force — holding the button only makes the animation longer/wilder. */
export function planFairSpin(entries: string[], holdMs: number): SpinPlan {
  return { winnerIndex: pickWinnerIndex(entries), ...animationFromForce(holdMs) };
}

/**
 * Force-affects-odds mode: a fresh random permutation of the list is
 * generated the instant you press, and how long you hold selects a position
 * in it (wrapping around) — a real causal input to the result, but since the
 * permutation is new every time and advances faster than human reaction
 * time, it isn't something you can reliably aim.
 */
export function planForceAffectsOddsSpin(entries: string[], holdMs: number): SpinPlan {
  const n = entries.length;
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const STEPS_PER_SECOND = 12;
  const step = Math.floor((holdMs / 1000) * STEPS_PER_SECOND) % n;

  return { winnerIndex: order[step], ...animationFromForce(holdMs) };
}

export function planSpin(mode: "fair" | "force-affects-odds", entries: string[], holdMs: number): SpinPlan {
  return mode === "fair" ? planFairSpin(entries, holdMs) : planForceAffectsOddsSpin(entries, holdMs);
}
