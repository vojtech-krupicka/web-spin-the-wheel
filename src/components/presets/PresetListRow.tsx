"use client";

import { useState, type ReactNode } from "react";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { findCategory, PRESET_CATEGORIES } from "@/lib/categories";
import { copyPresetAction, removePresetAction } from "@/app/d/[hash]/actions";
import type { Preset } from "@/lib/db/schema";

type PresetListRowProps = {
  hash: string;
  preset: Preset;
  listType: "private" | "public";
  mode: "manage" | "picker";
  selected?: boolean;
  onToggleSelect?: (preset: Preset) => void;
  onEdit?: (preset: Preset) => void;
  onChanged?: () => void;
};

export function PresetListRow({ hash, preset, listType, mode, selected, onToggleSelect, onEdit, onChanged }: PresetListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const category = findCategory(PRESET_CATEGORIES, preset.category);

  async function handleCopy() {
    setMenuOpen(false);
    await copyPresetAction(hash, preset.id);
    onChanged?.();
  }

  async function handleRemove() {
    await removePresetAction(preset.id);
    onChanged?.();
  }

  return (
    <div className="flex items-center gap-3 border-b border-border py-3">
      {mode === "picker" && onToggleSelect && (
        <Checkbox checked={!!selected} onChange={() => onToggleSelect(preset)} aria-label={`Select ${preset.name}`} />
      )}

      {category && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${category.color}22` }}>
          <category.icon size={17} style={{ color: category.color }} aria-hidden="true" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {category && (
            <span className="truncate text-[10px] font-bold tracking-[0.08em] text-faint uppercase">{category.name}</span>
          )}
          {listType === "private" && preset.public && <Badge label="Public" />}
        </div>
        <div className="truncate text-[15px] font-bold">{preset.name}</div>
      </div>

      <span className="shrink-0 text-sm font-semibold text-muted">{preset.data.names.length}</span>

      {mode === "manage" && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Preset options"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white"
          >
            <MoreVertical size={17} aria-hidden="true" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
              <div className="absolute top-full right-0 z-40 mt-1 w-40 rounded-xl border border-border bg-panel p-1.5 shadow-2xl">
                {listType === "private" && (
                  <MenuItem
                    icon={<Pencil size={15} aria-hidden="true" />}
                    label="Edit"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(preset);
                    }}
                  />
                )}
                <MenuItem icon={<Copy size={15} aria-hidden="true" />} label="Copy" onClick={handleCopy} />
                {listType === "private" && (
                  <MenuItem
                    icon={<Trash2 size={15} aria-hidden="true" />}
                    label="Remove"
                    danger
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmRemove(true);
                    }}
                  />
                )}
              </div>
            </>
          )}
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
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-white/5 ${
        danger ? "text-red-400" : ""
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
