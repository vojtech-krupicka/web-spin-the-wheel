"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { Combobox } from "@/components/ui/Combobox";
import { Textarea } from "@/components/ui/Textarea";
import { TextareaToolRow } from "@/components/ui/TextareaToolRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Switch } from "@/components/ui/Switch";
import { PRESET_CATEGORIES } from "@/lib/categories";
import { dedupeNames, parseNameList, sortNames } from "@/lib/nameList";
import { copyToClipboard, readFromClipboard } from "@/lib/clipboard";
import { createPresetAction, removePresetAction, updatePresetAction } from "@/app/d/[hash]/actions";
import type { Preset } from "@/lib/db/schema";

type PresetEditDialogProps = {
  hash: string;
  mode: "create" | "edit";
  preset?: Preset;
  initialNamesText?: string;
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onSaved: (preset: Preset) => void;
  onRemoved?: (presetId: number) => void;
};

export function PresetEditDialog({ hash, mode, preset, initialNamesText, bottomBar, onDismiss, onSaved, onRemoved }: PresetEditDialogProps) {
  const [name, setName] = useState(preset?.name ?? "");
  const [category, setCategory] = useState<string | null>(preset?.category ?? null);
  const [namesText, setNamesText] = useState(preset?.data.names.join("\n") ?? initialNamesText ?? "");
  const [isPublic, setIsPublic] = useState(preset?.public ?? false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function handleSave() {
    if (!category) {
      setError("Pick a category.");
      return;
    }
    setPending(true);
    setError(null);
    const result =
      mode === "create"
        ? await createPresetAction(hash, { name, category, namesText, public: isPublic })
        : await updatePresetAction(preset!.id, { name, category, namesText, public: isPublic });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.data);
  }

  async function handleRemove() {
    if (!preset) return;
    await removePresetAction(preset.id);
    onRemoved?.(preset.id);
  }

  return (
    <DialogShell
      title={mode === "create" ? "New preset" : preset!.name}
      onDismiss={onDismiss}
      onConfirm={handleSave}
      confirmLabel="Save"
      confirmDisabled={pending || !name.trim() || !category}
      bottomBar={bottomBar}
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold tracking-[0.1em] text-faint">NAME</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Preset name"
              className="w-full rounded-xl border border-border bg-panel-inset px-4 py-3 text-[15px] outline-none focus:border-border-strong placeholder:text-faint"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold tracking-[0.1em] text-faint">CATEGORY</label>
            <Combobox categories={PRESET_CATEGORIES} value={category} onChange={setCategory} />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border bg-panel-inset px-4 py-3">
          <span className="text-sm font-semibold">Public</span>
          <Switch checked={isPublic} onChange={setIsPublic} aria-label="Toggle public visibility" />
        </div>

        {mode === "edit" && (
          <button
            type="button"
            onClick={() => setConfirmRemove(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/[0.08] py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/[0.14]"
          >
            <Trash2 size={15} aria-hidden="true" />
            Remove
          </button>
        )}

        <div className="h-px bg-border" />

        <div>
          <TextareaToolRow
            tools={["copy", "paste", "sort", "dedupe", "clear"]}
            onCopy={() => copyToClipboard(namesText)}
            onPaste={async () => {
              const clip = await readFromClipboard();
              if (clip) setNamesText((prev) => (prev ? `${prev}\n${clip}` : clip));
            }}
            onSort={() => setNamesText(sortNames(parseNameList(namesText)).join("\n"))}
            onDedupe={() => setNamesText(dedupeNames(parseNameList(namesText)).join("\n"))}
            onClear={() => setNamesText("")}
          />
          <div className="mt-2">
            <Textarea value={namesText} onChange={setNamesText} placeholder="One name per line" rows={12} />
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-400">
            {error}
          </p>
        )}
      </div>

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
    </DialogShell>
  );
}
