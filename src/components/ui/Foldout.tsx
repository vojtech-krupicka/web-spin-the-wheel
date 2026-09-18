import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type FoldoutProps = {
  title: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
};

/** A content-agnostic accordion shell — header with a chevron, collapsible body. */
export function Foldout({ title, open, onToggle, children }: FoldoutProps) {
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-lg bg-white/[0.04] px-3 py-2.5 text-left"
      >
        <span className="text-xs font-bold tracking-wide text-white">{title}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="pt-1">{children}</div>}
    </div>
  );
}
