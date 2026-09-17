"use client";

import { useState } from "react";
import { Info, Settings } from "lucide-react";
import { AboutPopup } from "@/components/ui/AboutPopup";
import { MenuItem } from "@/components/ui/MenuItem";
import { SoundToggleRow } from "@/components/ui/SoundToggleRow";

type SettingsPopoverProps = {
  onOpenDashboardOptions: () => void;
  onDismiss: () => void;
};

type View = "menu" | "about";

/** Dashboard-level Settings popup: Dashboard options / About. */
export function SettingsPopover({ onOpenDashboardOptions, onDismiss }: SettingsPopoverProps) {
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
          label="Dashboard options"
          onClick={() => {
            onDismiss();
            onOpenDashboardOptions();
          }}
        />
        <SoundToggleRow />
        <div className="my-1 border-t border-border" />
        <MenuItem icon={<Info size={18} />} label="About" onClick={() => setView("about")} />
      </div>
    </>
  );
}
