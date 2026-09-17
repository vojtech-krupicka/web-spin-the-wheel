"use client";

import { useEffect, useRef, useState } from "react";
import type { SpinPlan } from "@/lib/spin/forceEngine";

type WheelPieProps = {
  entries: string[];
  spinning: boolean;
  plan: SpinPlan | null;
  onSettled: () => void;
};

const COLORS = ["#06b6d4", "#8b5cf6", "#f97316", "#22c55e", "#ec4899", "#eab308", "#3b82f6", "#f43f5e", "#a855f7", "#14b8a6"];

export function WheelPie({ entries, spinning, plan, onSettled }: WheelPieProps) {
  const [rotation, setRotation] = useState(0);
  const [prevSpinning, setPrevSpinning] = useState(spinning);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  // Spin just started: commit the target rotation synchronously during
  // render (React's documented pattern for "adjust state when a prop
  // changes") rather than in an effect — this is pure/deterministic given
  // plan, not a sync with anything external.
  if (spinning !== prevSpinning) {
    setPrevSpinning(spinning);
    if (spinning && plan && entries.length > 0) {
      const seg = 360 / entries.length;
      const targetAngle = plan.winnerIndex * seg + seg / 2;
      const base = Math.ceil(rotation / 360) * 360;
      setRotation(base + plan.extraCycles * 360 + (360 - targetAngle));
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

  if (entries.length === 1) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-4 border-accent-cyan/60 bg-panel-inset px-4 text-center text-lg font-bold">
          {entries[0]}
        </div>
      </div>
    );
  }

  const seg = 360 / entries.length;

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="relative">
        <div className="absolute top-[-4px] left-1/2 z-10 -translate-x-1/2">
          <div className="h-0 w-0 border-x-[9px] border-t-[15px] border-x-transparent border-t-white drop-shadow" />
        </div>
        <svg
          viewBox="0 0 200 200"
          width="280"
          height="280"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: plan && spinning ? `transform ${plan.durationMs}ms cubic-bezier(0.17,0.67,0.12,0.99)` : undefined,
          }}
        >
          {entries.map((name, i) => {
            const startAngle = i * seg;
            const endAngle = (i + 1) * seg;
            const largeArc = seg > 180 ? 1 : 0;
            const [x1, y1] = polarToCartesian(100, 100, 95, startAngle);
            const [x2, y2] = polarToCartesian(100, 100, 95, endAngle);
            const midAngle = startAngle + seg / 2;
            const [lx, ly] = polarToCartesian(100, 100, 62, midAngle);
            return (
              <g key={i}>
                <path
                  d={`M 100 100 L ${x1} ${y1} A 95 95 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={COLORS[i % COLORS.length]}
                  stroke="var(--bg-stop-2)"
                  strokeWidth="1"
                />
                <text
                  x={lx}
                  y={ly}
                  fill="#0a0b14"
                  fontSize="7.5"
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle}, ${lx}, ${ly})`}
                >
                  {truncate(name, 12)}
                </text>
              </g>
            );
          })}
          <circle cx="100" cy="100" r="14" fill="var(--bg-stop-2)" stroke="var(--color-border-strong)" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): [number, number] {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function truncate(s: string, n: number) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
