"use client";

import { WheelListRow } from "./WheelListRow";
import type { Wheel } from "@/lib/db/schema";

type WheelsListProps = {
  hash: string;
  wheels: Wheel[];
  onEdit: (wheel: Wheel) => void;
  onCopied: (wheel: Wheel) => void;
  onRemoved: (wheelId: number) => void;
};

export function WheelsList({ hash, wheels, onEdit, onCopied, onRemoved }: WheelsListProps) {
  if (wheels.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 pt-16 text-center">
        <p className="text-sm font-semibold text-muted">No wheels yet</p>
        <p className="text-xs text-faint">Create one to start picking winners.</p>
      </div>
    );
  }

  return (
    <div>
      {wheels.map((wheel) => (
        <WheelListRow key={wheel.id} hash={hash} wheel={wheel} onEdit={onEdit} onCopied={onCopied} onRemoved={onRemoved} />
      ))}
    </div>
  );
}
