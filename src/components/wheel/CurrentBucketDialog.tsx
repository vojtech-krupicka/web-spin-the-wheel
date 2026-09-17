"use client";

import { useState } from "react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { TextareaToolRow } from "@/components/ui/TextareaToolRow";
import { PresetEditDialog } from "@/components/presets/PresetEditDialog";
import { copyToClipboard, readFromClipboard } from "@/lib/clipboard";
import { dedupeNames, parseNameList } from "@/lib/nameList";
import { updateCurrentBucketAction } from "@/app/d/[hash]/w/[wheelId]/actions";

type CurrentBucketDialogProps = {
  hash: string;
  wheelId: number;
  names: string[];
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onSaved: (names: string[]) => void;
};

/** Static table by default; an Edit switch swaps it for a free-edit textarea. */
export function CurrentBucketDialog({ hash, wheelId, names, bottomBar, onDismiss, onSaved }: CurrentBucketDialogProps) {
  const [editing, setEditing] = useState(false);
  const [namesText, setNamesText] = useState(names.join("\n"));
  const [saveAsPresetOpen, setSaveAsPresetOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    if (!editing) {
      onDismiss();
      return;
    }
    setPending(true);
    const result = await updateCurrentBucketAction(wheelId, parseNameList(namesText));
    setPending(false);
    if (result.ok) onSaved(result.data.data.currentBucket);
  }

  return (
    <DialogShell
      title="Current list"
      onDismiss={onDismiss}
      onConfirm={handleConfirm}
      confirmLabel={editing ? "Save" : "OK"}
      confirmDisabled={pending}
      bottomBar={bottomBar}
    >
      <div className="mb-3 flex items-center justify-between rounded-xl border border-border bg-panel-inset px-4 py-3">
        <span className="text-sm font-semibold">Edit</span>
        <Switch checked={editing} onChange={setEditing} aria-label="Toggle edit mode" />
      </div>

      {editing ? (
        <div>
          <TextareaToolRow
            tools={["copy", "paste", "dedupe", "save-preset"]}
            onCopy={() => copyToClipboard(namesText)}
            onPaste={async () => {
              const clip = await readFromClipboard();
              if (!clip) return false;
              setNamesText((prev) => (prev ? `${prev}\n${clip}` : clip));
              return true;
            }}
            onDedupe={() => setNamesText(dedupeNames(parseNameList(namesText)).join("\n"))}
            onSavePreset={() => setSaveAsPresetOpen(true)}
          />
          <div className="mt-2">
            <Textarea value={namesText} onChange={setNamesText} placeholder="One name per line" rows={12} />
          </div>
        </div>
      ) : names.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-faint">No names in the current list.</p>
      ) : (
        <div>
          {names.map((entryName, index) => (
            <div key={index} className="border-b border-border py-2.5 text-sm font-semibold">
              {entryName}
            </div>
          ))}
        </div>
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
