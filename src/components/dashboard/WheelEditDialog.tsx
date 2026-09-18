"use client";

import { useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { Combobox } from "@/components/ui/Combobox";
import { Textarea } from "@/components/ui/Textarea";
import { TextareaToolRow } from "@/components/ui/TextareaToolRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { WHEEL_CATEGORIES } from "@/lib/categories";
import { dedupeNames, parseNameList, sortNames } from "@/lib/nameList";
import { copyToClipboard, readFromClipboard } from "@/lib/clipboard";
import { createWheelAction, removeWheelAction, resetWheelAction, updateWheelAction } from "@/app/d/[hash]/actions";
import { LoadFromPresetDialog } from "@/components/presets/LoadFromPresetDialog";
import { PresetEditDialog } from "@/components/presets/PresetEditDialog";
import type { Wheel } from "@/lib/db/schema";

type WheelEditDialogProps = {
  hash: string;
  mode: "create" | "edit";
  wheel?: Wheel;
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onSaved: (wheel: Wheel) => void;
  onRemoved?: (wheelId: number) => void;
  onReset?: (wheel: Wheel) => void;
};

export function WheelEditDialog({ hash, mode, wheel, bottomBar, onDismiss, onSaved, onRemoved, onReset }: WheelEditDialogProps) {
  const [name, setName] = useState(wheel?.name ?? "");
  const [category, setCategory] = useState<string | null>(wheel?.category ?? null);
  const [namesText, setNamesText] = useState(wheel?.data.templateBucket.join("\n") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [loadFromPresetOpen, setLoadFromPresetOpen] = useState(false);
  const [saveAsPresetOpen, setSaveAsPresetOpen] = useState(false);

  async function handleSave() {
    if (!category) {
      setError("Pick a category.");
      return;
    }
    setPending(true);
    setError(null);
    const result =
      mode === "create"
        ? await createWheelAction(hash, { name, category, namesText })
        : await updateWheelAction(wheel!.id, { name, category, namesText });
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved(result.data);
  }

  async function handleRemove() {
    if (!wheel) return;
    await removeWheelAction(wheel.id);
    onRemoved?.(wheel.id);
  }

  async function handleReset() {
    if (!wheel) return;
    setPending(true);
    const result = await resetWheelAction(wheel.id);
    setPending(false);
    setConfirmReset(false);
    if (result.ok) onReset?.(result.data);
    onDismiss();
  }

  return (
    <DialogShell
      title={mode === "create" ? "New wheel" : wheel!.name}
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
              placeholder="Wheel name"
              className="w-full rounded-xl border border-border bg-panel-inset px-4 py-3 text-[15px] outline-none focus:border-border-strong placeholder:text-faint"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold tracking-[0.1em] text-faint">CATEGORY</label>
            <Combobox categories={WHEEL_CATEGORIES} value={category} onChange={setCategory} />
          </div>
        </div>

        {mode === "edit" && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirmRemove(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/[0.08] py-2.5 text-sm font-bold text-red-400 transition hover:bg-red-500/[0.14]"
            >
              <Trash2 size={15} aria-hidden="true" />
              Remove
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-panel py-2.5 text-sm font-bold text-muted transition hover:border-border-strong hover:text-white"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Reset
            </button>
          </div>
        )}

        <div className="h-px bg-border" />

        <div>
          <TextareaToolRow
            tools={["load-preset", "copy", "paste", "sort", "dedupe", "save-preset", "clear"]}
            onLoadPreset={() => setLoadFromPresetOpen(true)}
            onCopy={() => copyToClipboard(namesText)}
            onPaste={async () => {
              const clip = await readFromClipboard();
              if (!clip) return false;
              setNamesText((prev) => (prev ? `${prev}\n${clip}` : clip));
              return true;
            }}
            onSort={() => setNamesText(sortNames(parseNameList(namesText)).join("\n"))}
            onDedupe={() => setNamesText(dedupeNames(parseNameList(namesText)).join("\n"))}
            onSavePreset={() => setSaveAsPresetOpen(true)}
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
          title="Remove wheel?"
          message="This permanently deletes the wheel, its names, and its history."
          confirmLabel="Remove"
          danger
          onConfirm={handleRemove}
          onCancel={() => setConfirmRemove(false)}
        />
      )}
      {confirmReset && (
        <ConfirmDialog
          title="Reset wheel?"
          message="This starts a new session and refills the current list from the template — any in-progress changes to the current list are lost."
          confirmLabel="Reset"
          danger
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      )}

      {loadFromPresetOpen && (
        <LoadFromPresetDialog
          hash={hash}
          bottomBar={bottomBar}
          onDismiss={() => setLoadFromPresetOpen(false)}
          onAppend={(names) => {
            setNamesText((prev) => (prev ? `${prev}\n${names.join("\n")}` : names.join("\n")));
            setLoadFromPresetOpen(false);
          }}
          onReplace={(names) => {
            setNamesText(names.join("\n"));
            setLoadFromPresetOpen(false);
          }}
        />
      )}

      {saveAsPresetOpen && (
        <PresetEditDialog
          hash={hash}
          mode="create"
          initialNamesText={namesText}
          bottomBar={bottomBar}
          onDismiss={() => setSaveAsPresetOpen(false)}
          onSaved={() => setSaveAsPresetOpen(false)}
        />
      )}
    </DialogShell>
  );
}
