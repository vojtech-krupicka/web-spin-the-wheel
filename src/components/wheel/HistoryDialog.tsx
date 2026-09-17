"use client";

import { useState } from "react";
import { DialogShell } from "@/components/ui/DialogShell";
import type { BottomBarSlot } from "@/components/layout/BottomBar";
import { Foldout } from "@/components/ui/Foldout";
import type { WheelSession } from "@/lib/db/schema";

type HistoryDialogProps = {
  sessions: WheelSession[];
  bottomBar: { left: BottomBarSlot; right: BottomBarSlot };
  onDismiss: () => void;
};

/** Every session as a foldout, most-recent first and open by default; the rest start collapsed. */
export function HistoryDialog({ sessions, bottomBar, onDismiss }: HistoryDialogProps) {
  const reversed = [...sessions].reverse();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <DialogShell title="History" onDismiss={onDismiss} onConfirm={onDismiss} confirmLabel="OK" bottomBar={bottomBar}>
      {reversed.length === 0 ? (
        <p className="px-1 py-4 text-center text-xs text-faint">No sessions yet.</p>
      ) : (
        reversed.map((session, index) => (
          <Foldout
            key={session.startedAt}
            title={`${new Date(session.startedAt).toLocaleString()} (${session.winners.length} ${
              session.winners.length === 1 ? "entry" : "entries"
            })`}
            open={openIndex === index}
            onToggle={() => setOpenIndex((prev) => (prev === index ? null : index))}
          >
            {session.winners.length === 0 ? (
              <p className="px-1 py-3 text-center text-xs text-faint">No winners yet.</p>
            ) : (
              <div>
                {[...session.winners].reverse().map((winner, winnerIndex) => (
                  <div key={winnerIndex} className="flex items-center justify-between border-b border-border py-2 text-sm">
                    <span className="truncate font-semibold">{winner.name}</span>
                    <span className="shrink-0 text-xs text-faint">{new Date(winner.at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Foldout>
        ))
      )}
    </DialogShell>
  );
}
