"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, Check, History, List, Menu, Shuffle, Trash2 } from "lucide-react";
import { TopBar } from "@/components/layout/TopBar";
import { BottomBar, type BottomBarSlot } from "@/components/layout/BottomBar";
import { EdgePill } from "./EdgePill";
import { HistoryDialog } from "./HistoryDialog";
import { CurrentBucketDialog } from "./CurrentBucketDialog";
import { WinnerBanner } from "./WinnerBanner";
import { WheelSettingsPopover } from "./WheelSettingsPopover";
import { SpinButton } from "./SpinButton";
import { VisualizationHost } from "./visualizations/VisualizationHost";
import { WheelEditDialog } from "@/components/dashboard/WheelEditDialog";
import { planSpin, type SpinPlan } from "@/lib/spin/forceEngine";
import {
  sortCurrentBucketAction,
  shuffleCurrentBucketAction,
  recordWinnerAction,
  updateCurrentBucketAction,
  updateWheelSettingsAction,
} from "@/app/d/[hash]/w/[wheelId]/actions";
import type { Wheel, WheelMode, WheelSession, WheelVisualization } from "@/lib/db/schema";

type WheelScreenProps = {
  hash: string;
  wheel: Wheel;
};

type ActiveDialog = "history" | "current-bucket" | null;
type Winner = { name: string; at: string };

export function WheelScreen({ hash, wheel }: WheelScreenProps) {
  const router = useRouter();
  const [name, setName] = useState(wheel.name);
  const [currentBucket, setCurrentBucket] = useState(wheel.data.currentBucket);
  const [historyBucket, setHistoryBucket] = useState<WheelSession[]>(wheel.data.historyBucket);
  const [visualization, setVisualization] = useState<WheelVisualization>(wheel.data.visualization);
  const [mode, setMode] = useState<WheelMode>(wheel.data.mode);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [spinPlan, setSpinPlan] = useState<SpinPlan | null>(null);
  const [winner, setWinner] = useState<Winner | null>(null);

  const busy = spinning || winner !== null;

  async function handleSort() {
    const nextDirection = sortDirection === "asc" ? "desc" : "asc";
    const result = await sortCurrentBucketAction(wheel.id, nextDirection);
    if (result.ok) {
      setCurrentBucket(result.data.data.currentBucket);
      setSortDirection(nextDirection);
    }
  }

  async function handleShuffle() {
    const result = await shuffleCurrentBucketAction(wheel.id);
    if (result.ok) setCurrentBucket(result.data.data.currentBucket);
  }

  function handleSpinRelease(holdMs: number) {
    if (busy || activeDialog || currentBucket.length === 0) return;
    setSpinPlan(planSpin(mode, currentBucket, holdMs));
    setSpinning(true);
  }

  async function handleSettled() {
    if (!spinPlan) return;
    const winningName = currentBucket[spinPlan.winnerIndex];
    setSpinning(false);

    const result = await recordWinnerAction(wheel.id, winningName);
    if (!result.ok) {
      setSpinPlan(null);
      return;
    }
    setHistoryBucket(result.data.data.historyBucket);
    const lastSession = result.data.data.historyBucket[result.data.data.historyBucket.length - 1];
    const lastWinner = lastSession?.winners[lastSession.winners.length - 1];

    setTimeout(() => {
      setWinner({ name: winningName, at: lastWinner?.at ?? new Date().toISOString() });
    }, 500);
  }

  async function handleContinue(remove: boolean) {
    if (remove && winner) {
      const index = currentBucket.indexOf(winner.name);
      if (index !== -1) {
        const next = currentBucket.filter((_, i) => i !== index);
        const result = await updateCurrentBucketAction(wheel.id, next);
        if (result.ok) setCurrentBucket(result.data.data.currentBucket);
      }
    }
    setWinner(null);
    setSpinPlan(null);
  }

  async function handleVisualizationChange(next: WheelVisualization) {
    setVisualization(next);
    await updateWheelSettingsAction(wheel.id, { visualization: next });
  }

  async function handleModeChange(next: WheelMode) {
    setMode(next);
    await updateWheelSettingsAction(wheel.id, { mode: next });
  }

  const dialogBottomBar = {
    left: { icon: sortIcon(sortDirection), label: "Sort names", disabled: true },
    right: { icon: <Shuffle size={22} strokeWidth={1.9} aria-hidden="true" />, label: "Shuffle names", disabled: true },
  };

  const mainBottomBar: { left: BottomBarSlot; right: BottomBarSlot } = winner
    ? {
        left: { icon: <Check size={22} strokeWidth={1.9} aria-hidden="true" />, label: "Keep it", onClick: () => handleContinue(false) },
        right: {
          icon: <Trash2 size={22} strokeWidth={1.9} aria-hidden="true" />,
          label: "Remove it",
          onClick: () => handleContinue(true),
        },
      }
    : {
        left: { icon: sortIcon(sortDirection), label: "Sort names", onClick: handleSort, disabled: busy },
        right: {
          icon: <Shuffle size={22} strokeWidth={1.9} aria-hidden="true" />,
          label: "Shuffle names",
          onClick: handleShuffle,
          disabled: busy,
        },
      };

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar
        left={
          <button
            type="button"
            onClick={() => router.push(`/d/${hash}`)}
            aria-label="Back"
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        }
        center={
          <button type="button" onClick={() => setEditOpen(true)} className="truncate text-sm font-bold">
            {name}
          </button>
        }
        right={
          <div className="relative">
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Settings"
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-border bg-white/[0.06] text-[#cbd5e1] transition hover:bg-white/10"
            >
              <Menu size={15} strokeWidth={2} aria-hidden="true" />
            </button>
            {settingsOpen && (
              <WheelSettingsPopover
                visualization={visualization}
                onVisualizationChange={handleVisualizationChange}
                mode={mode}
                onModeChange={handleModeChange}
                onOpenWheelOptions={() => setEditOpen(true)}
                onDismiss={() => setSettingsOpen(false)}
              />
            )}
          </div>
        }
      />

      <div className="relative mx-4 mt-[18px] flex-1">
        <div className="absolute inset-0 overflow-hidden rounded-[20px] border border-border bg-panel-inset">
          <div className={`h-full transition-all ${winner ? "scale-[0.98] opacity-40 blur-sm" : ""}`}>
            <VisualizationHost
              visualization={visualization}
              entries={currentBucket}
              spinning={spinning}
              plan={spinPlan}
              onSettled={handleSettled}
            />
          </div>
          {winner && <WinnerBanner name={winner.name} at={winner.at} />}
        </div>

        <BottomBar left={mainBottomBar.left} right={mainBottomBar.right} />

        <SpinButton
          disabled={busy || activeDialog !== null || currentBucket.length === 0}
          spinning={spinning}
          onRelease={handleSpinRelease}
        />
      </div>

      {activeDialog !== "history" && (
        <EdgePill
          side="left"
          icon={<History size={18} aria-hidden="true" />}
          label="History"
          onClick={() => setActiveDialog("history")}
          disabled={busy}
        />
      )}
      {activeDialog !== "current-bucket" && (
        <EdgePill
          side="right"
          icon={<List size={18} aria-hidden="true" />}
          label="Current list"
          onClick={() => setActiveDialog("current-bucket")}
          disabled={busy}
        />
      )}

      {activeDialog === "history" && (
        <HistoryDialog sessions={historyBucket} bottomBar={dialogBottomBar} onDismiss={() => setActiveDialog(null)} />
      )}

      {activeDialog === "current-bucket" && (
        <CurrentBucketDialog
          hash={hash}
          wheelId={wheel.id}
          names={currentBucket}
          bottomBar={dialogBottomBar}
          onDismiss={() => setActiveDialog(null)}
          onSaved={(names) => {
            setCurrentBucket(names);
            setActiveDialog(null);
          }}
        />
      )}

      {editOpen && (
        <WheelEditDialog
          hash={hash}
          mode="edit"
          wheel={{ ...wheel, name, data: { ...wheel.data, currentBucket, historyBucket, visualization, mode } }}
          bottomBar={dialogBottomBar}
          onDismiss={() => setEditOpen(false)}
          onSaved={(updated) => {
            setName(updated.name);
            setEditOpen(false);
          }}
          onRemoved={() => router.push(`/d/${hash}`)}
          onReset={(updated) => {
            setCurrentBucket(updated.data.currentBucket);
            setHistoryBucket(updated.data.historyBucket);
          }}
        />
      )}
    </div>
  );
}

function sortIcon(direction: "asc" | "desc") {
  return direction === "asc" ? (
    <ArrowDownAZ size={22} strokeWidth={1.9} aria-hidden="true" />
  ) : (
    <ArrowUpAZ size={22} strokeWidth={1.9} aria-hidden="true" />
  );
}
