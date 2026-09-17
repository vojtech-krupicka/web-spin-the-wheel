import type { ReactNode } from "react";

type MenuItemProps = {
  icon: ReactNode;
  label: string;
  onClick: () => void;
};

/** A single row in a dropdown menu popover (e.g. Settings popovers). */
export function MenuItem({ icon, label, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/5"
    >
      {icon}
      {label}
    </button>
  );
}
