"use client";

import { useState } from "react";
import { Info, Settings } from "lucide-react";
import { AboutPopup } from "@/components/ui/AboutPopup";
import { MenuItem } from "@/components/ui/MenuItem";

type WheelSettingsPopoverProps = {
  onOpenWheelOptions: () => void;
  onDismiss: () => void;
};

type View = "menu" | "about";

/**
 * Wheel-level Settings popup: Wheel options / About. Visualization and
 * Force-mode switches land here once the real visualizations exist —
 * this is intentionally the minimal version until then.
 */
export function WheelSettingsPopover({ onOpenWheelOptions, onDismiss }: WheelSettingsPopoverProps) {
  const [view, setView] = useState<View>("menu");

  if (view === "about") return <AboutPopup onDismiss={() => setView("menu")} />;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onDismiss} />
      <div
        className="absolute top-full right-0 z-40 mt-2 w-56 rounded-2xl border border-border bg-panel p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <MenuItem
          icon={<Settings size={18} />}
          label="Wheel options"
          onClick={() => {
            onDismiss();
            onOpenWheelOptions();
          }}
        />
        <div className="my-1 border-t border-border" />
        <MenuItem icon={<Info size={18} />} label="About" onClick={() => setView("about")} />
      </div>
    </>
  );
}
