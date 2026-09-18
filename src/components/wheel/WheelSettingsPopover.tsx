"use client";

import { useState } from "react";
import { CircleDashed, Disc3, GalleryHorizontal, HelpCircle, Info, Rows3, Settings, type LucideIcon } from "lucide-react";
import { AboutPopup } from "@/components/ui/AboutPopup";
import { HelpPopup } from "@/components/ui/HelpPopup";
import { MenuItem } from "@/components/ui/MenuItem";
import { SoundToggleRow } from "@/components/ui/SoundToggleRow";
import { Switch } from "@/components/ui/Switch";
import type { WheelMode, WheelVisualization } from "@/lib/db/schema";

type WheelSettingsPopoverProps = {
  visualization: WheelVisualization;
  onVisualizationChange: (visualization: WheelVisualization) => void;
  mode: WheelMode;
  onModeChange: (mode: WheelMode) => void;
  onOpenWheelOptions: () => void;
  onDismiss: () => void;
};

type View = "menu" | "help" | "about";

const VISUALIZATIONS: { id: WheelVisualization; label: string; icon: LucideIcon }[] = [
  { id: "bowl", label: "Lottery bowl", icon: CircleDashed },
  { id: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { id: "cylinder", label: "Cylinder", icon: Rows3 },
  { id: "wheel", label: "Wheel", icon: Disc3 },
];

/** Wheel-level Settings popup: visualization, force mode, Wheel options, About. */
export function WheelSettingsPopover({
  visualization,
  onVisualizationChange,
  mode,
  onModeChange,
  onOpenWheelOptions,
  onDismiss,
}: WheelSettingsPopoverProps) {
  const [view, setView] = useState<View>("menu");

  if (view === "help") return <HelpPopup onDismiss={() => setView("menu")} />;
  if (view === "about") return <AboutPopup onDismiss={() => setView("menu")} />;

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onDismiss} />
      <div
        className="absolute top-full right-0 z-40 mt-2 w-64 rounded-2xl border border-border bg-panel p-2 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-2 py-2">
          <p className="mb-2 px-1 text-[10px] font-bold tracking-[0.1em] text-faint uppercase">Visualization</p>
          <div className="grid grid-cols-4 gap-1.5">
            {VISUALIZATIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onVisualizationChange(option.id)}
                aria-label={option.label}
                aria-pressed={visualization === option.id}
                title={option.label}
                className={`flex h-10 items-center justify-center rounded-lg border transition ${
                  visualization === option.id
                    ? "cta-gradient border-transparent text-[#0a0b14]"
                    : "border-border bg-panel-inset text-muted hover:border-border-strong hover:text-white"
                }`}
              >
                <option.icon size={17} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-2.5">
          <span className="flex-1 text-left text-sm font-semibold">Force affects odds</span>
          <Switch
            checked={mode === "force-affects-odds"}
            onChange={(checked) => onModeChange(checked ? "force-affects-odds" : "fair")}
            aria-label="Toggle force-affects-odds mode"
          />
        </div>

        <SoundToggleRow />
        <div className="my-1 border-t border-border" />
        <MenuItem
          icon={<Settings size={18} />}
          label="Wheel options"
          onClick={() => {
            onDismiss();
            onOpenWheelOptions();
          }}
        />
        <div className="my-1 border-t border-border" />
        <MenuItem icon={<HelpCircle size={18} />} label="Help" onClick={() => setView("help")} />
        <MenuItem icon={<Info size={18} />} label="About" onClick={() => setView("about")} />
      </div>
    </>
  );
}
