"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Switch } from "./Switch";
import { isMuted, setMuted } from "@/lib/sound";

/** The Sound on/off row shared by every Settings popover. */
export function SoundToggleRow() {
  const [muted, setMutedState] = useState(() => isMuted());

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      {muted ? <VolumeX size={18} className="text-muted" /> : <Volume2 size={18} />}
      <span className="flex-1 text-left text-sm font-semibold">Sound</span>
      <Switch
        checked={!muted}
        onChange={(checked) => {
          setMuted(!checked);
          setMutedState(!checked);
        }}
        aria-label="Toggle sound"
      />
    </div>
  );
}
