"use client";

import { PresetBrowser } from "@/components/presets/PresetBrowser";
import type { Preset } from "@/lib/db/schema";

type PresetsScreenProps = {
  hash: string;
  refreshToken: number;
  onEdit: (preset: Preset) => void;
};

export function PresetsScreen({ hash, refreshToken, onEdit }: PresetsScreenProps) {
  return <PresetBrowser hash={hash} mode="manage" onEdit={onEdit} refreshToken={refreshToken} />;
}
