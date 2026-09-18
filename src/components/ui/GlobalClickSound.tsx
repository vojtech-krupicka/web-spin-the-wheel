"use client";

import { useEffect } from "react";
import { playClick } from "@/lib/sound";

/**
 * Plays a tap sound for every button click app-wide — mount once near the
 * root. A button can opt out with `data-sound="none"` when it has its own
 * distinct sound instead (e.g. the Spin button's tick loop).
 */
export function GlobalClickSound() {
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const button = target.closest("button");
      if (!button || button.disabled) return;
      if (button.dataset.sound === "none") return;
      playClick();
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
