"use client";

import { useEffect, useRef, useState } from "react";
import { nextLoopTarget, normalizeOffset } from "@/lib/spin/loopOffset";
import type { SpinPlan } from "@/lib/spin/forceEngine";

type CarouselProps = {
  entries: string[];
  spinning: boolean;
  plan: SpinPlan | null;
  onSettled: () => void;
};

const CARD_WIDTH = 140;
const GAP = 12;
const STEP = CARD_WIDTH + GAP;
const VIEWPORT_WIDTH = 320;
const LOOP_REPEATS = 10;

/** Horizontal reel — the card centered under the pointer line when it stops wins. */
export function Carousel({ entries, spinning, plan, onSettled }: CarouselProps) {
  const [offset, setOffset] = useState(0);
  const [prevSpinning, setPrevSpinning] = useState(spinning);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  if (spinning !== prevSpinning && entries.length > 0) {
    setPrevSpinning(spinning);
    if (spinning && plan) {
      setOffset((prev) => nextLoopTarget(prev, entries.length, plan.extraCycles, plan.winnerIndex, STEP));
    } else if (!spinning) {
      setOffset((prev) => normalizeOffset(prev, entries.length, STEP));
    }
  }

  useEffect(() => {
    if (!spinning || !plan) return;
    const id = setTimeout(() => onSettledRef.current(), plan.durationMs);
    return () => clearTimeout(id);
  }, [spinning, plan]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-faint">No names in the current list.</div>
    );
  }

  const rendered = Array.from({ length: LOOP_REPEATS }, () => entries).flat();
  const translateX = VIEWPORT_WIDTH / 2 - CARD_WIDTH / 2 - offset;

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="relative overflow-hidden" style={{ width: VIEWPORT_WIDTH, height: 110 }}>
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 w-0.5 -translate-x-1/2 bg-accent-cyan/70" />
        <div
          className="flex items-center"
          style={{
            gap: GAP,
            transform: `translateX(${translateX}px)`,
            transition: plan && spinning ? `transform ${plan.durationMs}ms cubic-bezier(0.15,0.7,0.1,1)` : undefined,
          }}
        >
          {rendered.map((name, i) => (
            <div
              key={i}
              style={{ width: CARD_WIDTH }}
              className="flex h-24 shrink-0 items-center justify-center rounded-xl border border-border bg-panel-inset px-3 text-center"
            >
              <span className="truncate text-sm font-bold">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
