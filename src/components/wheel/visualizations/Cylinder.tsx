"use client";

import { useEffect, useRef, useState } from "react";
import { nextLoopTarget, normalizeOffset } from "@/lib/spin/loopOffset";
import type { SpinPlan } from "@/lib/spin/forceEngine";

type CylinderProps = {
  entries: string[];
  spinning: boolean;
  plan: SpinPlan | null;
  onSettled: () => void;
};

const ROW_HEIGHT = 56;
const VIEWPORT_ROWS = 5;
const CENTER_INDEX = Math.floor(VIEWPORT_ROWS / 2);
const LOOP_REPEATS = 10;

/** Vertical slot-machine reel — the row that stops under the center marker wins. */
export function Cylinder({ entries, spinning, plan, onSettled }: CylinderProps) {
  const [offset, setOffset] = useState(0);
  const [prevSpinning, setPrevSpinning] = useState(spinning);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  // Spin start/settle transitions are pure/deterministic given plan, so they're
  // committed synchronously during render rather than in an effect. While idle,
  // the transition style below is already unset, so normalizing the offset
  // back into [0, loopSize) lands on the identical pixel position with no jump.
  if (spinning !== prevSpinning && entries.length > 0) {
    setPrevSpinning(spinning);
    if (spinning && plan) {
      setOffset((prev) => nextLoopTarget(prev, entries.length, plan.extraCycles, plan.winnerIndex, ROW_HEIGHT));
    } else if (!spinning) {
      setOffset((prev) => normalizeOffset(prev, entries.length, ROW_HEIGHT));
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

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div
        className="relative w-full max-w-xs overflow-hidden rounded-xl border border-border bg-panel"
        style={{ height: ROW_HEIGHT * VIEWPORT_ROWS }}
      >
        <div
          className="pointer-events-none absolute inset-x-0 z-10 border-y-2 border-accent-cyan/70 bg-accent-cyan/5"
          style={{ top: CENTER_INDEX * ROW_HEIGHT, height: ROW_HEIGHT }}
        />
        <div
          style={{
            transform: `translateY(${CENTER_INDEX * ROW_HEIGHT - offset}px)`,
            transition: plan && spinning ? `transform ${plan.durationMs}ms cubic-bezier(0.15,0.7,0.1,1)` : undefined,
          }}
        >
          {rendered.map((name, i) => (
            <div key={i} style={{ height: ROW_HEIGHT }} className="flex items-center justify-center px-4 text-center">
              <span className="truncate text-lg font-bold">{name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
