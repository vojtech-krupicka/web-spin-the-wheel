"use client";

import { useState } from "react";
import { LayoutGrid, Library } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar } from "@/components/layout/BottomBar";
import { LeaveButton } from "./LeaveButton";
import { SettingsButton } from "./SettingsButton";
import { SettingsPopover } from "./SettingsPopover";
import { DashboardEditDialog } from "./DashboardEditDialog";
import { WheelsList } from "./WheelsList";
import { WheelEditDialog } from "./WheelEditDialog";
import { CreateFab } from "./CreateFab";
import type { Wheel } from "@/lib/db/schema";

type DashboardShellProps = {
  hash: string;
  initialName: string;
  hasPassword: boolean;
  initialWheels: Wheel[];
};

type WheelDialogState = { mode: "create" } | { mode: "edit"; wheel: Wheel } | null;

export function DashboardShell({ hash, initialName, hasPassword: initialHasPassword, initialWheels }: DashboardShellProps) {
  const [name, setName] = useState(initialName);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [wheels, setWheels] = useState(initialWheels);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [wheelDialog, setWheelDialog] = useState<WheelDialogState>(null);

  const bottomBar = {
    left: {
      icon: <LayoutGrid size={22} strokeWidth={1.9} aria-hidden="true" />,
      label: "Dashboard",
      active: true,
    },
    right: {
      icon: <Library size={22} strokeWidth={1.9} aria-hidden="true" />,
      label: "Presets",
      disabled: true,
    },
  };

  // Shown (disabled) inside every dialog opened from this screen — matches
  // the wireframe's "Dashboard[disabled]/Presets[disabled]" bottom bar.
  const dialogBottomBar = {
    left: { ...bottomBar.left, active: false, disabled: true },
    right: { ...bottomBar.right, disabled: true },
  };

  function handleWheelSaved(wheel: Wheel) {
    setWheels((prev) => {
      const exists = prev.some((w) => w.id === wheel.id);
      const next = exists ? prev.map((w) => (w.id === wheel.id ? wheel : w)) : [...prev, wheel];
      return [...next].sort((a, b) => a.name.localeCompare(b.name));
    });
    setWheelDialog(null);
  }

  function handleWheelCopied(wheel: Wheel) {
    setWheels((prev) => [...prev, wheel].sort((a, b) => a.name.localeCompare(b.name)));
  }

  function handleWheelRemoved(wheelId: number) {
    setWheels((prev) => prev.filter((w) => w.id !== wheelId));
    setWheelDialog(null);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        left={<LeaveButton hash={hash} />}
        center={
          <button
            type="button"
            onClick={() => {
              setSettingsOpen(false);
              setEditOpen(true);
            }}
            className="truncate text-sm font-bold"
          >
            {name}
          </button>
        }
        right={
          <div className="relative">
            <SettingsButton onClick={() => setSettingsOpen(true)} />
            {settingsOpen && (
              <SettingsPopover onOpenDashboardOptions={() => setEditOpen(true)} onDismiss={() => setSettingsOpen(false)} />
            )}
          </div>
        }
      />

      <div className="relative mx-4 mt-[18px] flex-1">
        <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-border bg-panel-inset">
          <div className="h-full overflow-y-auto px-4 pt-4 pb-[160px]">
            <WheelsList
              hash={hash}
              wheels={wheels}
              onEdit={(wheel) => setWheelDialog({ mode: "edit", wheel })}
              onCopied={handleWheelCopied}
              onRemoved={handleWheelRemoved}
            />
          </div>
        </div>

        <BottomBar left={bottomBar.left} right={bottomBar.right} />
        <CreateFab label="Create Wheel" onClick={() => setWheelDialog({ mode: "create" })} />
      </div>

      {editOpen && (
        <DashboardEditDialog
          hash={hash}
          name={name}
          hasPassword={hasPassword}
          bottomBar={dialogBottomBar}
          onNameChange={setName}
          onPasswordChanged={() => setHasPassword(true)}
          onDismiss={() => setEditOpen(false)}
        />
      )}

      {wheelDialog && (
        <WheelEditDialog
          hash={hash}
          mode={wheelDialog.mode}
          wheel={wheelDialog.mode === "edit" ? wheelDialog.wheel : undefined}
          bottomBar={dialogBottomBar}
          onDismiss={() => setWheelDialog(null)}
          onSaved={handleWheelSaved}
          onRemoved={handleWheelRemoved}
        />
      )}
    </div>
  );
}
