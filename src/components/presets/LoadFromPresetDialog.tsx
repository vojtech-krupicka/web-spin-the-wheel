"use client";

import { useState } from "react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PresetBrowser } from "./PresetBrowser";
import type { Preset } from "@/lib/db/schema";

type LoadFromPresetDialogProps = {
  hash: string;
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onAppend: (names: string[]) => void;
  onReplace: (names: string[]) => void;
};

/**
 * Reuses PresetBrowser in "picker" mode: checkboxes instead of a kebab menu,
 * multi-select across both foldouts, and Append/Replace instead of a single
 * confirm. Replace repurposes DialogShell's addAction pill since it only has
 * room for one FAB + one extra action.
 */
export function LoadFromPresetDialog({ hash, bottomBar, onDismiss, onAppend, onReplace }: LoadFromPresetDialogProps) {
  const [selected, setSelected] = useState<Map<number, Preset>>(new Map());
  const [confirmReplace, setConfirmReplace] = useState(false);

  function toggle(preset: Preset) {
    setSelected((prev) => {
      const next = new Map(prev);
      if (next.has(preset.id)) next.delete(preset.id);
      else next.set(preset.id, preset);
      return next;
    });
  }

  function combinedNames(): string[] {
    return Array.from(selected.values()).flatMap((preset) => preset.data.names);
  }

  return (
    <DialogShell
      title="Load from preset"
      onDismiss={onDismiss}
      onConfirm={() => onAppend(combinedNames())}
      confirmLabel="Append"
      confirmDisabled={selected.size === 0}
      addAction={selected.size > 0 ? { label: "Replace", onClick: () => setConfirmReplace(true) } : undefined}
      bottomBar={bottomBar}
    >
      <PresetBrowser hash={hash} mode="picker" selectedIds={new Set(selected.keys())} onToggleSelect={toggle} />

      {confirmReplace && (
        <ConfirmDialog
          title="Replace current list?"
          message="This replaces everything currently in the textarea with the selected presets' names."
          confirmLabel="Replace"
          danger
          onConfirm={() => {
            setConfirmReplace(false);
            onReplace(combinedNames());
          }}
          onCancel={() => setConfirmReplace(false)}
        />
      )}
    </DialogShell>
  );
}
