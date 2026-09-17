"use client";

import type { ReactNode } from "react";
import { ArrowDownAZ, Clipboard, Copy, Eraser, FolderOpen, ListX, Save } from "lucide-react";

export type ToolKind = "load-preset" | "copy" | "paste" | "sort" | "dedupe" | "save-preset" | "clear";

const TOOL_CONFIG: Record<Exclude<ToolKind, "load-preset" | "save-preset">, { icon: ReactNode; label: string }> = {
  copy: { icon: <Copy size={16} aria-hidden="true" />, label: "Copy" },
  paste: { icon: <Clipboard size={16} aria-hidden="true" />, label: "Paste" },
  sort: { icon: <ArrowDownAZ size={16} aria-hidden="true" />, label: "Sort" },
  dedupe: { icon: <ListX size={16} aria-hidden="true" />, label: "Deduplicate" },
  clear: { icon: <Eraser size={16} aria-hidden="true" />, label: "Clear" },
};

type TextareaToolRowProps = {
  tools: ToolKind[];
  onCopy?: () => void;
  onPaste?: () => void;
  onSort?: () => void;
  onDedupe?: () => void;
  onClear?: () => void;
  onLoadPreset?: () => void;
  onSavePreset?: () => void;
};

const iconButtonClass =
  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-panel text-muted transition hover:border-border-strong hover:text-white";

/** Icon row of textarea tools — each caller wires only the tools it needs. */
export function TextareaToolRow({
  tools,
  onCopy,
  onPaste,
  onSort,
  onDedupe,
  onClear,
  onLoadPreset,
  onSavePreset,
}: TextareaToolRowProps) {
  const handlers: Partial<Record<ToolKind, (() => void) | undefined>> = {
    copy: onCopy,
    paste: onPaste,
    sort: onSort,
    dedupe: onDedupe,
    clear: onClear,
    "load-preset": onLoadPreset,
    "save-preset": onSavePreset,
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {tools.includes("load-preset") && (
        <button
          type="button"
          onClick={onLoadPreset}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-accent-cyan/40 bg-accent-cyan/[0.06] px-3 text-xs font-bold text-accent-cyan transition hover:bg-accent-cyan/[0.12]"
        >
          <FolderOpen size={16} aria-hidden="true" />
          Load from preset
        </button>
      )}
      {tools.includes("save-preset") && (
        <button
          type="button"
          onClick={onSavePreset}
          className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-border bg-panel px-3 text-xs font-bold text-muted transition hover:border-border-strong hover:text-white"
        >
          <Save size={16} aria-hidden="true" />
          Save as preset
        </button>
      )}
      {tools.includes("load-preset") || tools.includes("save-preset") ? (
        <div className="h-6 w-px shrink-0 bg-border" />
      ) : null}
      {(Object.keys(TOOL_CONFIG) as (keyof typeof TOOL_CONFIG)[])
        .filter((tool) => tools.includes(tool))
        .map((tool) => (
          <button
            key={tool}
            type="button"
            onClick={handlers[tool]}
            aria-label={TOOL_CONFIG[tool].label}
            title={TOOL_CONFIG[tool].label}
            className={iconButtonClass}
          >
            {TOOL_CONFIG[tool].icon}
          </button>
        ))}
    </div>
  );
}
