"use client";

import { useState } from "react";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { Badge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { findCategory, PRESET_CATEGORIES } from "@/lib/categories";
import { copyPresetAction, removePresetAction } from "@/app/d/[hash]/actions";
import type { Preset } from "@/lib/db/schema";

type PresetViewDialogProps = {
  hash: string;
  preset: Preset;
  listType: "private" | "public";
  /** Manage-mode rows have a kebab menu (Edit/Copy/Remove); picker-mode rows don't, so this view is names-only there too. */
  mode: "manage" | "picker";
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onEdit?: (preset: Preset) => void;
  onChanged?: () => void;
};

/** Read-only preset preview — names list plus the same actions the kebab menu offers, for presets (especially public ones) whose contents you otherwise can't see. */
export function PresetViewDialog({ hash, preset, listType, mode, bottomBar, onDismiss, onEdit, onChanged }: PresetViewDialogProps) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmCopy, setConfirmCopy] = useState(false);
  const category = findCategory(PRESET_CATEGORIES, preset.category);
  const showActions = mode === "manage";

  async function handleCopy() {
    await copyPresetAction(hash, preset.id);
    onChanged?.();
    onDismiss();
  }

  async function handleRemove() {
    await removePresetAction(preset.id);
    onChanged?.();
    onDismiss();
  }

  return (
    <DialogShell title={preset.name} onDismiss={onDismiss} onConfirm={onDismiss} confirmLabel="OK" bottomBar={bottomBar}>
      <div className="mb-4 flex items-center gap-2">
        {category && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-faint uppercase">
            <category.icon size={14} style={{ color: category.color }} aria-hidden="true" />
            {category.name}
          </span>
        )}
        {listType === "private" && preset.public && <Badge label="Public" />}
      </div>

      {showActions && (
        <div className="mb-4 flex gap-3">
          {listType === "private" && (
            <button
              type="button"
              onClick={() => {
                onDismiss();
                onEdit?.(preset);
              }}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-panel py-2.5 text-sm font-bold text-muted transition hover:border-border-strong hover:text-white"
            >
              <Pencil size={15} aria-hidden="true" />
              Edit
            </button>
          )}
          <button
            type="button"
            onClick={() => setConfirmCopy(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-panel py-2.5 text-sm font-bold text-muted transition hover:border-border-strong hover:text-white"
          >
            <Copy size={15} aria-hidden="true" />
            Copy
          </button>
          {listType === "private" && (
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/[0.08] py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/[0.14]"
            >
              <Trash2 size={15} aria-hidden="true" />
              Remove
            </button>
          )}
        </div>
      )}

      <div className="mb-2 h-px bg-border" />

      {preset.data.names.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-faint">No names in this preset.</p>
      ) : (
        <div>
          {preset.data.names.map((entryName, index) => (
            <div key={index} className="border-b border-border py-2.5 text-sm font-semibold">
              {entryName}
            </div>
          ))}
        </div>
      )}

      {confirmRemove && (
        <ConfirmDialog
          title="Remove preset?"
          message="This permanently deletes the preset."
          confirmLabel="Remove"
          danger
          onConfirm={handleRemove}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
      {confirmCopy && (
        <ConfirmDialog
          title="Copy preset?"
          message={`Creates a private duplicate named "${preset.name} - copy".`}
          confirmLabel="Copy"
          onConfirm={() => {
            setConfirmCopy(false);
            handleCopy();
          }}
          onCancel={() => setConfirmCopy(false)}
        />
      )}
    </DialogShell>
  );
}
