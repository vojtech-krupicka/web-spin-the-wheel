import { X } from "lucide-react";
import { createPortal } from "react-dom";

type AboutPopupProps = {
  onDismiss: () => void;
};

/** Short "about this app" info modal. */
export function AboutPopup({ onDismiss }: AboutPopupProps) {
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onDismiss}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">About</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition hover:bg-white/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <p className="text-sm text-muted">
          Spin the Wheel is a simple, mobile-friendly random-winner picker: a lottery bowl draw or a
          spinning wheel, carousel, or slot-machine cylinder, all built to settle any decision fairly.
        </p>
      </div>
    </div>,
    document.body,
  );
}
