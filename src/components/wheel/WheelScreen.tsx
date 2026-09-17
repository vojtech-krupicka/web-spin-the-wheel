"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownAZ, ArrowLeft, ArrowUpAZ, Check, History, List, Menu, Shuffle, Trash2, Trash } from "lucide-react";
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
import { pickTickClip, playShove, playTick, playWinChime } from "@/lib/sound";
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

  // Ticks (wheel/carousel/cylinder) or shoves (bowl) for the spin's duration —
  // one tick clip is picked per spin and reused throughout; shoves pick fresh
  // each time. Timed on the same decelerating cadence as LotteryBowl's own
  // highlight cycling, so it feels tied to the visual even without a literal
  // per-frame hook into the (CSS-driven) wheel/carousel/cylinder animations.
  useEffect(() => {
    if (!spinning || !spinPlan) return;
    let cancelled = false;
    const tickClip = visualization === "bowl" ? null : pickTickClip();
    const start = Date.now();

    function tick() {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      if (elapsed >= spinPlan!.durationMs) return;
      if (visualization === "bowl") playShove();
      else playTick(tickClip!);
      const progress = elapsed / spinPlan!.durationMs;
      setTimeout(tick, 70 + progress * 260);
    }
    tick();

    return () => {
      cancelled = true;
    };
  }, [spinning, spinPlan, visualization]);

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
      playWinChime();
    }, 500);
  }

  async function handleContinue(action: "keep" | "remove-one" | "remove-all") {
    if (action !== "keep" && winner) {
      let next = currentBucket;
      if (action === "remove-all") {
        next = currentBucket.filter((n) => n !== winner.name);
      } else {
        const index = currentBucket.indexOf(winner.name);
        if (index !== -1) next = currentBucket.filter((_, i) => i !== index);
      }
      const result = await updateCurrentBucketAction(wheel.id, next);
      if (result.ok) setCurrentBucket(result.data.data.currentBucket);
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
        left: { icon: <Check size={22} strokeWidth={1.9} aria-hidden="true" />, label: "Keep it", onClick: () => handleContinue("keep") },
        right: {
          icon: <Trash2 size={22} strokeWidth={1.9} aria-hidden="true" />,
          label: "Remove it",
          onClick: () => handleContinue("remove-one"),
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

        {winner ? (
          <button
            type="button"
            onClick={() => handleContinue("remove-all")}
            className="cta-gradient absolute bottom-[-38px] left-1/2 z-[7] flex h-[168px] w-[168px] -translate-x-1/2 cursor-pointer flex-col items-center justify-center gap-1 rounded-full shadow-[0_0_0_6px_var(--bg-stop-2),0_0_34px_rgba(139,92,246,0.55)] transition-all duration-200 hover:scale-[1.03] hover:shadow-[0_0_0_6px_var(--bg-stop-2),0_0_46px_rgba(139,92,246,0.8)] active:scale-95"
          >
            <Trash size={30} strokeWidth={2.6} className="text-[#0a0b14]" aria-hidden="true" />
            <span className="text-[22px] font-bold text-[#0a0b14]">Remove all</span>
          </button>
        ) : (
          <SpinButton
            disabled={busy || activeDialog !== null || currentBucket.length === 0}
            spinning={spinning}
            onRelease={handleSpinRelease}
          />
        )}
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
