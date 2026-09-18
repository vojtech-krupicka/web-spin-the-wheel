import { X } from "lucide-react";
import { createPortal } from "react-dom";

type HelpPopupProps = {
  onDismiss: () => void;
};

type Section = { title: string; body: string[] };

const SECTIONS: Section[] = [
  {
    title: "Dashboards",
    body: [
      "Join an existing dashboard with its 5-character code, or create a new one from the home screen.",
      "A dashboard can be password-protected — the code plus password gets anyone back in later.",
    ],
  },
  {
    title: "Presets",
    body: [
      "A preset is a reusable, named list of names. Private presets are yours only; public ones are visible (read-only, copy-only) to every dashboard, but only you can edit or delete your own.",
      "Load one or more presets straight into a wheel's names from its Load-from-preset tool — Append adds to what's already there, Replace swaps it out.",
    ],
  },
  {
    title: "Wheels",
    body: [
      "A wheel has two separate lists: the template (what you edit and reuse) and the current list (what's actually being spun right now). Sort/Shuffle/spin removals only ever touch the current list.",
      "Reset copies the template into the current list and starts a fresh history session — the usual way to start a new round with the same names.",
      "Duplicate a name in the list to give it extra odds — there's no separate weight number, repeating the name is the weight.",
    ],
  },
  {
    title: "Spinning",
    body: [
      "Press and hold Spin to charge force, then release. In Fair mode (default) force only changes how long/wild the spin looks — every name always has equal odds.",
      "Force-affects-odds mode (wheel Settings menu) makes hold time a real input to the result: a fresh random order is generated the instant you press, and how long you hold picks a position in it. It's not something you can reliably aim for, since that order is brand new and moving fast every single spin.",
    ],
  },
  {
    title: "After a spin",
    body: [
      "Keep it leaves the winner in the current list. Remove it takes out the one that just won. Remove all clears every copy of that name at once, if you gave it extra odds via duplicates.",
      "Every winner is logged to History, grouped by session.",
    ],
  },
];

/** Short how-to-use reference, shared by every Settings popover. */
export function HelpPopup({ onDismiss }: HelpPopupProps) {
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={onDismiss}>
      <div
        className="flex max-h-[80vh] w-full max-w-sm flex-col rounded-2xl border border-border bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <h3 className="text-[10px] font-bold tracking-[0.1em] text-faint uppercase">Help</h3>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-1 text-muted transition hover:bg-white/5"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto">
          {SECTIONS.map((section) => (
            <div key={section.title}>
              <h4 className="mb-1.5 text-sm font-bold text-accent-cyan">{section.title}</h4>
              <div className="flex flex-col gap-1.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-sm text-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  );
}
