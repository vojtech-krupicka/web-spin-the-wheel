"use client";

import { useEffect, useRef, useState } from "react";
import { Disc3 } from "lucide-react";

type SpinButtonProps = {
  disabled: boolean;
  spinning: boolean;
  /** Called on release with how long the button was held, in ms. */
  onRelease: (holdMs: number) => void;
};

const MAX_HOLD_MS = 1800;

/** The floating circular Spin call-to-action — press and hold to charge force, release to spin. */
export function SpinButton({ disabled, spinning, onRelease }: SpinButtonProps) {
  const [charging, setCharging] = useState(false);
  const [chargeProgress, setChargeProgress] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  function stopCharging() {
    setCharging(false);
    setChargeProgress(0);
    startRef.current = null;
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }

  function handlePointerDown() {
    if (disabled || spinning || charging) return;
    startRef.current = Date.now();
    setCharging(true);
    const tick = () => {
      if (startRef.current === null) return;
      setChargeProgress(Math.min((Date.now() - startRef.current) / MAX_HOLD_MS, 1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  function handlePointerUp() {
    if (!charging || startRef.current === null) return;
    const holdMs = Date.now() - startRef.current;
    stopCharging();
    onRelease(holdMs);
  }

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    },
    [],
  );

  const scale = spinning ? 1 : 1 + chargeProgress * 0.1;
  const glowSize = 34 + chargeProgress * 18;
  const glowAlpha = 0.55 + chargeProgress * 0.3;

  // Charging glow is computed live from hold progress, so idle/charging state
  // is expressed as inline style; spinning/disabled stay fixed Tailwind classes.
  const style =
    !spinning && !disabled
      ? {
          transform: `translateX(-50%) scale(${scale})`,
          boxShadow: `0 0 0 6px var(--bg-stop-2), 0 0 ${glowSize}px rgba(139,92,246,${glowAlpha})`,
        }
      : { transform: "translateX(-50%) scale(1)" };

  return (
    <button
      type="button"
      disabled={disabled}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={style}
      className={`cta-gradient absolute bottom-[-38px] left-1/2 z-[7] flex h-[168px] w-[168px] cursor-pointer touch-none flex-col items-center justify-center gap-1 rounded-full transition-[box-shadow,transform] duration-100 disabled:cursor-not-allowed ${
        spinning
          ? "animate-pulse shadow-[0_0_0_6px_var(--bg-stop-2),0_0_44px_rgba(139,92,246,0.75)]"
          : disabled
            ? "shadow-[0_0_0_6px_var(--bg-stop-2)] grayscale"
            : ""
      }`}
    >
      <Disc3 size={30} strokeWidth={2.6} className={`text-[#0a0b14] ${spinning ? "animate-spin" : ""}`} aria-hidden="true" />
      <span className={`font-bold text-[#0a0b14] ${spinning ? "text-[22px]" : "text-[28px]"}`}>
        {spinning ? "Spinning" : charging ? "Hold…" : "Spin"}
      </span>
    </button>
  );
}
