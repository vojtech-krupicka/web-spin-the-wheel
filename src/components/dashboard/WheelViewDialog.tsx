"use client";

import { useState } from "react";
import { Copy, Pencil, RotateCcw, Trash2 } from "lucide-react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { findCategory, WHEEL_CATEGORIES } from "@/lib/categories";
import { copyWheelAction, removeWheelAction, resetWheelAction } from "@/app/d/[hash]/actions";
import type { Wheel } from "@/lib/db/schema";

type WheelViewDialogProps = {
  wheel: Wheel;
  bucket: "current" | "template";
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
  onEdit: (wheel: Wheel) => void;
  onCopied: (wheel: Wheel) => void;
  onReset: (wheel: Wheel) => void;
  onRemoved: (wheelId: number) => void;
};

/** Read-only preview of a wheel's current or template list, plus the same actions the kebab menu offers. */
export function WheelViewDialog({ wheel, bucket, bottomBar, onDismiss, onEdit, onCopied, onReset, onRemoved }: WheelViewDialogProps) {
  const [confirmCopy, setConfirmCopy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const category = findCategory(WHEEL_CATEGORIES, wheel.category);
  const names = bucket === "current" ? wheel.data.currentBucket : wheel.data.templateBucket;

  async function handleCopy() {
    const result = await copyWheelAction(wheel.id);
    if (result.ok) onCopied(result.data);
    onDismiss();
  }

  async function handleReset() {
    const result = await resetWheelAction(wheel.id);
    if (result.ok) onReset(result.data);
    onDismiss();
  }

  async function handleRemove() {
    await removeWheelAction(wheel.id);
    onRemoved(wheel.id);
    onDismiss();
  }

  return (
    <DialogShell title={wheel.name} onDismiss={onDismiss} onConfirm={onDismiss} confirmLabel="OK" bottomBar={bottomBar}>
      <div className="mb-4 flex items-center justify-between">
        {category && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.08em] text-faint uppercase">
            <category.icon size={14} style={{ color: category.color }} aria-hidden="true" />
            {category.name}
          </span>
        )}
        <span className="text-xs font-bold tracking-[0.08em] text-accent-cyan uppercase">
          {bucket === "current" ? "Current list" : "Template"}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => {
            onDismiss();
            onEdit(wheel);
          }}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-panel py-2.5 text-xs font-bold text-muted transition hover:border-border-strong hover:text-white"
        >
          <Pencil size={15} aria-hidden="true" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => setConfirmCopy(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-panel py-2.5 text-xs font-bold text-muted transition hover:border-border-strong hover:text-white"
        >
          <Copy size={15} aria-hidden="true" />
          Copy
        </button>
        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-border bg-panel py-2.5 text-xs font-bold text-muted transition hover:border-border-strong hover:text-white"
        >
          <RotateCcw size={15} aria-hidden="true" />
          Reset
        </button>
        <button
          type="button"
          onClick={() => setConfirmRemove(true)}
          className="flex flex-col items-center justify-center gap-1 rounded-xl border border-red-500/40 bg-red-500/[0.08] py-2.5 text-xs font-bold text-red-400 transition hover:bg-red-500/[0.14]"
        >
          <Trash2 size={15} aria-hidden="true" />
          Remove
        </button>
      </div>

      <div className="mb-2 h-px bg-border" />

      {names.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-faint">
          {bucket === "current" ? "No names in the current list." : "No names in the template."}
        </p>
      ) : (
        <div>
          {names.map((entryName, index) => (
            <div key={index} className="border-b border-border py-2.5 text-sm font-semibold">
              {entryName}
            </div>
          ))}
        </div>
      )}

      {confirmCopy && (
        <ConfirmDialog
          title="Copy wheel?"
          message={`Creates a duplicate named "${wheel.name} - copy" with the same template — no current list or history.`}
          confirmLabel="Copy"
          onConfirm={() => {
            setConfirmCopy(false);
            handleCopy();
          }}
          onCancel={() => setConfirmCopy(false)}
        />
      )}
      {confirmReset && (
        <ConfirmDialog
          title="Reset wheel?"
          message="This starts a new session and refills the current list from the template — any in-progress changes to the current list are lost."
          confirmLabel="Reset"
          danger
          onConfirm={() => {
            setConfirmReset(false);
            handleReset();
          }}
          onCancel={() => setConfirmReset(false)}
        />
      )}
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
    </DialogShell>
  );
}
