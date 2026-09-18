"use client";

import { useEffect, useRef, useState } from "react";
import type { SpinPlan } from "@/lib/spin/forceEngine";

type LotteryBowlProps = {
  entries: string[];
  spinning: boolean;
  plan: SpinPlan | null;
  onSettled: () => void;
};

type Placement = { left: number; top: number; rotate: number };

/** Names scattered small/dim; the draw randomly highlights candidates, decelerating, before settling enlarged on the winner. */
export function LotteryBowl({ entries, spinning, plan, onSettled }: LotteryBowlProps) {
  const [placements, setPlacements] = useState<Placement[]>([]);
  const [highlighted, setHighlighted] = useState<number | null>(null);
  const [settledIndex, setSettledIndex] = useState<number | null>(null);
  const [prevSpinning, setPrevSpinning] = useState(spinning);
  const entriesRef = useRef(entries);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    entriesRef.current = entries;
    onSettledRef.current = onSettled;
  });

  const entriesKey = entries.join("|");
  useEffect(() => {
    // Layout uses Math.random, which can't run during render — regenerate only when the actual name set changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- randomized scatter layout, not derivable from props
    setPlacements(
      entries.map(() => ({
        left: 24 + Math.random() * 52,
        top: 26 + Math.random() * 48,
        rotate: -16 + Math.random() * 32,
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entriesKey is the intentional dependency, not entries itself
  }, [entriesKey]);

  if (spinning !== prevSpinning) {
    setPrevSpinning(spinning);
    if (spinning) setSettledIndex(null);
  }

  useEffect(() => {
    if (!spinning || !plan || entries.length === 0) return;
    let cancelled = false;
    const start = Date.now();

    function tick() {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      if (elapsed >= plan!.durationMs) {
        setHighlighted(plan!.winnerIndex);
        setSettledIndex(plan!.winnerIndex);
        onSettledRef.current();
        return;
      }
      const progress = elapsed / plan!.durationMs;
      const pool = entriesRef.current;
      setHighlighted(Math.floor(Math.random() * pool.length));
      setTimeout(tick, 70 + progress * 260);
    }
    tick();

    return () => {
      cancelled = true;
    };
  }, [spinning, plan, entries.length]);

  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-faint">No names in the current list.</div>
    );
  }

  return (
    <div className="relative h-full w-full p-6">
      {entries.map((name, i) => {
        const isActive = highlighted === i;
        const isSettled = settledIndex === i;
        const p = placements[i] ?? { left: 50, top: 50, rotate: 0 };
        return (
          <div
            key={i}
            className="absolute max-w-[112px] truncate rounded-full border px-3 py-1 text-xs font-bold transition-all duration-150"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              transform: `translate(-50%, -50%) rotate(${isActive || isSettled ? 0 : p.rotate}deg) scale(${
                isSettled ? 1.7 : isActive ? 1.3 : 0.85
              })`,
              opacity: isSettled ? 1 : isActive ? 0.95 : 0.35,
              zIndex: isSettled ? 10 : isActive ? 5 : 1,
              borderColor: isSettled || isActive ? "var(--color-accent-cyan)" : "var(--color-border)",
              background: isSettled ? "var(--gradient-accent)" : "var(--color-panel-inset)",
              color: isSettled ? "#0a0b14" : undefined,
            }}
          >
            {name}
          </div>
        );
      })}
    </div>
  );
}
