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

/** Icon row of textarea tools — each caller wires only the tools it needs. Load/Save-preset (when present) pin left, the rest pin right. */
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
  };
  const hasPresetTools = tools.includes("load-preset") || tools.includes("save-preset");

  return (
    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
      {hasPresetTools && (
        <div className="flex shrink-0 items-center gap-2">
          {tools.includes("load-preset") && (
            <button
              type="button"
              onClick={onLoadPreset}
              aria-label="Load from preset"
              title="Load from preset"
              className={`${iconButtonClass} border-accent-cyan/40 bg-accent-cyan/[0.06] text-accent-cyan hover:border-accent-cyan/60 hover:bg-accent-cyan/[0.12] hover:text-accent-cyan`}
            >
              <FolderOpen size={16} aria-hidden="true" />
            </button>
          )}
          {tools.includes("save-preset") && (
            <button type="button" onClick={onSavePreset} aria-label="Save as preset" title="Save as preset" className={iconButtonClass}>
              <Save size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}

      <div className="flex shrink-0 items-center gap-2">
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
    </div>
  );
}
