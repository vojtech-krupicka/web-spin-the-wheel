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
import { PresetsScreen } from "./PresetsScreen";
import { PresetEditDialog } from "@/components/presets/PresetEditDialog";
import { CreateFab } from "./CreateFab";
import type { Preset, Wheel } from "@/lib/db/schema";

type DashboardShellProps = {
  hash: string;
  initialName: string;
  hasPassword: boolean;
  initialWheels: Wheel[];
};

type Screen = "wheels" | "presets";
type WheelDialogState = { mode: "create" } | { mode: "edit"; wheel: Wheel } | null;
type PresetDialogState = { mode: "create" } | { mode: "edit"; preset: Preset } | null;

export function DashboardShell({ hash, initialName, hasPassword: initialHasPassword, initialWheels }: DashboardShellProps) {
  const [name, setName] = useState(initialName);
  const [hasPassword, setHasPassword] = useState(initialHasPassword);
  const [wheels, setWheels] = useState(initialWheels);
  const [screen, setScreen] = useState<Screen>("wheels");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [wheelDialog, setWheelDialog] = useState<WheelDialogState>(null);
  const [presetDialog, setPresetDialog] = useState<PresetDialogState>(null);
  const [presetRefreshToken, setPresetRefreshToken] = useState(0);

  const bottomBar = {
    left: {
      icon: <LayoutGrid size={22} strokeWidth={1.9} aria-hidden="true" />,
      label: "Dashboard",
      active: screen === "wheels",
      onClick: () => setScreen("wheels"),
    },
    right: {
      icon: <Library size={22} strokeWidth={1.9} aria-hidden="true" />,
      label: "Presets",
      active: screen === "presets",
      onClick: () => setScreen("presets"),
    },
  };

  // Shown (disabled) inside every dialog opened from this screen — matches
  // the wireframe's "Dashboard[disabled]/Presets[disabled]" bottom bar.
  const dialogBottomBar = {
    left: { ...bottomBar.left, active: false, disabled: true, onClick: undefined },
    right: { ...bottomBar.right, active: false, disabled: true, onClick: undefined },
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

  function handlePresetSaved() {
    setPresetDialog(null);
    setPresetRefreshToken((t) => t + 1);
  }

  function handlePresetRemoved() {
    setPresetDialog(null);
    setPresetRefreshToken((t) => t + 1);
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
            {screen === "wheels" ? (
              <WheelsList
                hash={hash}
                wheels={wheels}
                onEdit={(wheel) => setWheelDialog({ mode: "edit", wheel })}
                onCopied={handleWheelCopied}
                onRemoved={handleWheelRemoved}
              />
            ) : (
              <PresetsScreen
                hash={hash}
                refreshToken={presetRefreshToken}
                onEdit={(preset) => setPresetDialog({ mode: "edit", preset })}
              />
            )}
          </div>
        </div>

        <BottomBar left={bottomBar.left} right={bottomBar.right} />
        <CreateFab
          label={screen === "wheels" ? "Create Wheel" : "Create preset"}
          onClick={() => (screen === "wheels" ? setWheelDialog({ mode: "create" }) : setPresetDialog({ mode: "create" }))}
        />
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

      {presetDialog && (
        <PresetEditDialog
          hash={hash}
          mode={presetDialog.mode}
          preset={presetDialog.mode === "edit" ? presetDialog.preset : undefined}
          bottomBar={dialogBottomBar}
          onDismiss={() => setPresetDialog(null)}
          onSaved={handlePresetSaved}
          onRemoved={handlePresetRemoved}
        />
      )}
    </div>
  );
}
