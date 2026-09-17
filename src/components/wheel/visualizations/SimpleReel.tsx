"use client";

import { useEffect, useRef, useState } from "react";

type SimpleReelProps = {
  entries: string[];
  spinning: boolean;
  targetName: string | null;
  onSettled: () => void;
};

/**
 * Placeholder visualization: cycles through random names, decelerating, and
 * settles on `targetName` — the winner is already decided by the time this
 * starts, this is purely cosmetic. Stands in for the real bowl/carousel/
 * cylinder/wheel visualizations until those are built.
 */
export function SimpleReel({ entries, spinning, targetName, onSettled }: SimpleReelProps) {
  const [display, setDisplay] = useState(entries[0] ?? "—");
  const entriesRef = useRef(entries);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    entriesRef.current = entries;
    onSettledRef.current = onSettled;
  });

  useEffect(() => {
    if (!spinning || !targetName) return;

    let cancelled = false;
    const duration = 1800 + Math.random() * 900;
    const start = Date.now();

    function tick() {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      if (elapsed >= duration) {
        setDisplay(targetName!);
        onSettledRef.current();
        return;
      }
      const progress = elapsed / duration;
      const pool = entriesRef.current;
      setDisplay(pool[Math.floor(Math.random() * pool.length)] ?? "—");
      setTimeout(tick, 60 + progress * 240);
    }
    tick();

    return () => {
      cancelled = true;
    };
  }, [spinning, targetName]);

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="w-full max-w-xs rounded-2xl border border-border bg-panel-inset px-6 py-10 text-center">
        <div className={`truncate text-2xl font-bold ${spinning ? "text-muted" : ""}`}>{display}</div>
      </div>
    </div>
  );
}
