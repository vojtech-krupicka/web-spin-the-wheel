import type { ReactNode } from "react";

type EdgePillProps = {
  side: "left" | "right";
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

/**
 * A floating pill docked to the screen edge, above the bottom bar — used for
 * History (left) and Current list (right). Fixed + z-50 so it stays visible
 * and clickable above a full-screen DialogShell overlay (z-40), matching the
 * "other pill stays visible above the dialog" rule.
 */
export function EdgePill({ side, icon, label, onClick, disabled }: EdgePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`fixed bottom-[114px] z-50 flex items-center gap-2 border border-border bg-panel py-2.5 text-xs font-bold text-[#cbd5e1] shadow-lg transition hover:bg-panel-hover disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-panel ${
        side === "left" ? "left-0 rounded-r-full border-l-0 pr-4 pl-3.5" : "right-0 flex-row-reverse rounded-l-full border-r-0 pr-3.5 pl-4"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
