"use client";

import { useState, type ReactNode } from "react";
import { AlertCircle, ArrowDownAZ, Check, Clipboard, Copy, Eraser, FolderOpen, ListX, Save } from "lucide-react";

export type ToolKind = "load-preset" | "copy" | "paste" | "sort" | "dedupe" | "save-preset" | "clear";

const SYNC_TOOL_CONFIG: Record<"sort" | "dedupe" | "clear", { icon: ReactNode; label: string }> = {
  sort: { icon: <ArrowDownAZ size={16} aria-hidden="true" />, label: "Sort" },
  dedupe: { icon: <ListX size={16} aria-hidden="true" />, label: "Deduplicate" },
  clear: { icon: <Eraser size={16} aria-hidden="true" />, label: "Clear" },
};

type TextareaToolRowProps = {
  tools: ToolKind[];
  /** Return whether the copy actually succeeded — shown as brief inline feedback. */
  onCopy?: () => Promise<boolean> | boolean;
  /** Return whether the paste actually found clipboard text — clipboard-read is often blocked by the browser, so this can legitimately fail. */
  onPaste?: () => Promise<boolean> | boolean;
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
  const syncHandlers: Partial<Record<keyof typeof SYNC_TOOL_CONFIG, (() => void) | undefined>> = {
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
        {tools.includes("copy") && onCopy && (
          <FeedbackButton icon={<Copy size={16} aria-hidden="true" />} label="Copy" onClick={onCopy} />
        )}
        {tools.includes("paste") && onPaste && (
          <FeedbackButton
            icon={<Clipboard size={16} aria-hidden="true" />}
            label="Paste"
            errorHint="Couldn't read the clipboard — your browser may be blocking it. Try Ctrl+V directly in the text box instead."
            onClick={onPaste}
          />
        )}
        {(Object.keys(SYNC_TOOL_CONFIG) as (keyof typeof SYNC_TOOL_CONFIG)[])
          .filter((tool) => tools.includes(tool))
          .map((tool) => (
            <button
              key={tool}
              type="button"
              onClick={syncHandlers[tool]}
              aria-label={SYNC_TOOL_CONFIG[tool].label}
              title={SYNC_TOOL_CONFIG[tool].label}
              className={iconButtonClass}
            >
              {SYNC_TOOL_CONFIG[tool].icon}
            </button>
          ))}
      </div>
    </div>
  );
}

type FeedbackButtonProps = {
  icon: ReactNode;
  label: string;
  errorHint?: string;
  onClick: () => Promise<boolean> | boolean;
};

/** A tool button that briefly shows a check/alert icon so a fallible clipboard action isn't silently invisible either way. */
function FeedbackButton({ icon, label, errorHint, onClick }: FeedbackButtonProps) {
  const [state, setState] = useState<"idle" | "success" | "error">("idle");

  async function handleClick() {
    const ok = await onClick();
    setState(ok ? "success" : "error");
    setTimeout(() => setState("idle"), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={label}
      title={state === "error" ? (errorHint ?? `${label} failed`) : label}
      className={`${iconButtonClass} ${state === "success" ? "border-emerald-500/50 text-emerald-400" : ""} ${
        state === "error" ? "border-red-500/50 text-red-400" : ""
      }`}
    >
      {state === "success" ? (
        <Check size={16} aria-hidden="true" />
      ) : state === "error" ? (
        <AlertCircle size={16} aria-hidden="true" />
      ) : (
        icon
      )}
    </button>
  );
}
