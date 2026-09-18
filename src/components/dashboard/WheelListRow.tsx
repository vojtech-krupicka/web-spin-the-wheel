"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { WheelViewDialog } from "./WheelViewDialog";
import { findCategory, WHEEL_CATEGORIES } from "@/lib/categories";
import { copyWheelAction, removeWheelAction } from "@/app/d/[hash]/actions";
import type { Wheel } from "@/lib/db/schema";

type WheelListRowProps = {
  hash: string;
  wheel: Wheel;
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onEdit: (wheel: Wheel) => void;
  onCopied: (wheel: Wheel) => void;
  onReset: (wheel: Wheel) => void;
  onRemoved: (wheelId: number) => void;
};

export function WheelListRow({ hash, wheel, bottomBar, onEdit, onCopied, onReset, onRemoved }: WheelListRowProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [viewBucket, setViewBucket] = useState<"current" | "template" | null>(null);
  const category = findCategory(WHEEL_CATEGORIES, wheel.category);

  async function handleCopy() {
    setMenuOpen(false);
    const result = await copyWheelAction(wheel.id);
    if (result.ok) onCopied(result.data);
  }

  async function handleRemove() {
    await removeWheelAction(wheel.id);
    onRemoved(wheel.id);
  }

  return (
    <div className="flex items-center gap-3 border-b border-border py-3.5">
      {category && (
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${category.color}22` }}
        >
          <category.icon size={17} style={{ color: category.color }} aria-hidden="true" />
        </div>
      )}
      <button
        type="button"
        onClick={() => router.push(`/d/${hash}/w/${wheel.id}`)}
        className="min-w-0 flex-1 text-left"
      >
        {category && (
          <div className="truncate text-[10px] font-bold tracking-[0.08em] text-faint uppercase">
            {category.name}
          </div>
        )}
        <div className="truncate text-[15px] font-bold">{wheel.name}</div>
      </button>
      <div className="flex shrink-0 items-center gap-1 text-sm font-semibold text-muted">
        <button
          type="button"
          onClick={() => setViewBucket("current")}
          aria-label={`View ${wheel.name}'s current list`}
          className="rounded-lg px-1 py-1 underline decoration-dotted underline-offset-4 transition hover:text-white"
        >
          {wheel.data.currentBucket.length}
        </button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          onClick={() => setViewBucket("template")}
          aria-label={`View ${wheel.name}'s template`}
          className="rounded-lg px-1 py-1 underline decoration-dotted underline-offset-4 transition hover:text-white"
        >
          {wheel.data.templateBucket.length}
        </button>
      </div>
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Wheel options"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white"
        >
          <MoreVertical size={17} aria-hidden="true" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <div className="absolute top-full right-0 z-40 mt-1 w-40 rounded-xl border border-border bg-panel p-1.5 shadow-2xl">
              <MenuItem
                icon={<Pencil size={15} aria-hidden="true" />}
                label="Edit"
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(wheel);
                }}
              />
              <MenuItem icon={<Copy size={15} aria-hidden="true" />} label="Copy" onClick={handleCopy} />
              <MenuItem
                icon={<Trash2 size={15} aria-hidden="true" />}
                label="Remove"
                danger
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmRemove(true);
                }}
              />
            </div>
          </>
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

      {viewBucket && (
        <WheelViewDialog
          wheel={wheel}
          bucket={viewBucket}
          bottomBar={bottomBar}
          onDismiss={() => setViewBucket(null)}
          onEdit={onEdit}
          onCopied={onCopied}
          onReset={onReset}
          onRemoved={onRemoved}
        />
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
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
