"use client";

import { PresetBrowser } from "@/components/presets/PresetBrowser";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import type { Preset } from "@/lib/db/schema";

type PresetsScreenProps = {
  hash: string;
  refreshToken: number;
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onEdit: (preset: Preset) => void;
};

export function PresetsScreen({ hash, refreshToken, bottomBar, onEdit }: PresetsScreenProps) {
  return <PresetBrowser hash={hash} mode="manage" bottomBar={bottomBar} onEdit={onEdit} refreshToken={refreshToken} />;
}
