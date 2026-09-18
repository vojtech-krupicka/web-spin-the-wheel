"use server";

import {
  appendWheelWinner,
  shuffleWheelCurrentBucket,
  sortWheelCurrentBucket,
  updateWheelCurrentBucket,
  updateWheelVisualizationAndMode,
} from "@/lib/db/wheels";
import { requireWheelAccess } from "@/lib/authz";
import type { Wheel, WheelMode, WheelVisualization } from "@/lib/db/schema";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

export async function sortCurrentBucketAction(wheelId: number, direction: "asc" | "desc"): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await sortWheelCurrentBucket(wheelId, direction);
  return { ok: true, data: wheel };
}

export async function shuffleCurrentBucketAction(wheelId: number): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await shuffleWheelCurrentBucket(wheelId);
  return { ok: true, data: wheel };
}

export async function updateCurrentBucketAction(wheelId: number, names: string[]): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await updateWheelCurrentBucket(wheelId, names);
  return { ok: true, data: wheel };
}

export async function recordWinnerAction(wheelId: number, name: string): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await appendWheelWinner(wheelId, name);
  return { ok: true, data: wheel };
}

export async function updateWheelSettingsAction(
  wheelId: number,
  updates: { visualization?: WheelVisualization; mode?: WheelMode },
): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await updateWheelVisualizationAndMode(wheelId, updates);
  return { ok: true, data: wheel };
}
