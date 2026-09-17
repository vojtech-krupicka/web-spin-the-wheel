import type { ReactNode } from "react";

export type BottomBarSlot = {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
};

type BottomBarProps = {
  left: BottomBarSlot;
  right: BottomBarSlot;
};

/**
 * Full-bleed bottom bar with two side buttons (BL1/BR1) — shared by every
 * screen and dialog shell. Unlike Roll the Dice's fixed Players/Hand nav,
 * this app's side buttons mean different things per screen (Dashboard/Presets
 * nav, Sort/Shuffle, Continue/Continue-and-remove, ...), so both slots are
 * fully generic.
 */
export function BottomBar({ left, right }: BottomBarProps) {
  return (
    <div className="absolute right-[-16px] bottom-0 left-[-16px] z-[2] flex h-[100px] border-t border-border bg-panel">
      <NavButton {...left} side="left" />
      <NavButton {...right} side="right" />
    </div>
  );
}

function NavButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  side,
}: BottomBarSlot & { side: "left" | "right" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`group flex h-full w-1/2 cursor-pointer flex-col items-center justify-center gap-2 transition-colors hover:bg-white/5 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100 ${
        side === "left" ? "pr-12" : "pl-12"
      } ${active ? "text-accent-cyan" : "text-muted hover:text-white"}`}
    >
      <span
        className={`inline-flex transition-transform duration-150 group-hover:scale-110 ${
          side === "left" ? "-translate-x-3" : "translate-x-3"
        }`}
      >
        {icon}
      </span>
      <span
        className={`text-[13px] font-bold transition-transform duration-150 group-hover:scale-110 ${
          side === "left" ? "-translate-x-3" : "translate-x-3"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
