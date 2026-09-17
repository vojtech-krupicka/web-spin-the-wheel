"use client";

import { useEffect, useState } from "react";
import { formatDateTime } from "@/lib/datetime";

type WinnerBannerProps = {
  name: string;
  at: string;
};

/** Full-width banner over the (blurred) visualization — fades/scales in, mirrors Roll the Dice's result popup. */
export function WinnerBanner({ name, at }: WinnerBannerProps) {
  const [entered, setEntered] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setEntered(true), 20);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      className={`absolute inset-x-[-16px] top-1/2 z-[6] -translate-y-1/2 border-y border-border bg-panel-inset px-6 py-8 text-center transition-all duration-300 ${
        entered ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
      }`}
    >
      <p className="text-xs font-bold tracking-[0.1em] text-faint uppercase">The winner is</p>
      <p
        className="mt-2 truncate text-3xl font-bold"
        style={{
          backgroundImage: "var(--gradient-accent)",
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
        }}
      >
        {name}
      </p>
      <p className="mt-2 text-xs text-faint">{formatDateTime(at)}</p>
    </div>
  );
}
