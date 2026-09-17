"use client";

import { SimpleReel } from "./SimpleReel";
import type { WheelVisualization } from "@/lib/db/schema";

type VisualizationHostProps = {
  visualization: WheelVisualization;
  entries: string[];
  spinning: boolean;
  targetName: string | null;
  onSettled: () => void;
};

/**
 * Dispatches on the wheel's chosen visualization. Only the placeholder
 * reel exists so far — bowl/carousel/cylinder/wheel all render it too until
 * each is built, at which point this switches on `visualization` for real.
 */
export function VisualizationHost({ entries, spinning, targetName, onSettled }: VisualizationHostProps) {
  return <SimpleReel entries={entries} spinning={spinning} targetName={targetName} onSettled={onSettled} />;
}
