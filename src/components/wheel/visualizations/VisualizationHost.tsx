"use client";

import { LotteryBowl } from "./LotteryBowl";
import { Carousel } from "./Carousel";
import { Cylinder } from "./Cylinder";
import { WheelPie } from "./WheelPie";
import type { SpinPlan } from "@/lib/spin/forceEngine";
import type { WheelVisualization } from "@/lib/db/schema";

type VisualizationHostProps = {
  visualization: WheelVisualization;
  entries: string[];
  spinning: boolean;
  plan: SpinPlan | null;
  onSettled: () => void;
};

/** Dispatches on the wheel's chosen visualization. */
export function VisualizationHost({ visualization, entries, spinning, plan, onSettled }: VisualizationHostProps) {
  switch (visualization) {
    case "bowl":
      return <LotteryBowl entries={entries} spinning={spinning} plan={plan} onSettled={onSettled} />;
    case "carousel":
      return <Carousel entries={entries} spinning={spinning} plan={plan} onSettled={onSettled} />;
    case "cylinder":
      return <Cylinder entries={entries} spinning={spinning} plan={plan} onSettled={onSettled} />;
    case "wheel":
      return <WheelPie entries={entries} spinning={spinning} plan={plan} onSettled={onSettled} />;
  }
}
