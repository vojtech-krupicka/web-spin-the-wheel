"use server";

import { findDashboardByHash } from "@/lib/db/dashboards";
import { copyWheel, createWheel, removeWheel, resetWheelSession, updateWheel } from "@/lib/db/wheels";
import {
  copyPreset,
  createPreset,
  listPrivatePresets,
  listPublicPresets,
  removePreset,
  updatePreset,
  type ListPresetsOptions,
  type PresetListResult,
} from "@/lib/db/presets";
import type { Preset, Wheel } from "@/lib/db/schema";
import { PRESET_CATEGORIES, WHEEL_CATEGORIES, findCategory } from "@/lib/categories";
import { parseNameList } from "@/lib/nameList";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

type WheelFormInput = {
  name: string;
  category: string;
  namesText: string;
};

function validateWheelForm(input: WheelFormInput): { name: string; category: string; templateBucket: string[] } | { error: string } {
  const name = input.name.trim();
  if (!name) return { error: "Give your wheel a name." };
  if (!findCategory(WHEEL_CATEGORIES, input.category)) return { error: "Pick a category." };
  return { name, category: input.category, templateBucket: parseNameList(input.namesText) };
}

export async function createWheelAction(hash: string, input: WheelFormInput): Promise<ActionResult<Wheel>> {
  const dashboard = await findDashboardByHash(hash);
  if (!dashboard) return { ok: false, error: "Dashboard not found." };

  const validated = validateWheelForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const wheel = await createWheel({ dashboardId: dashboard.id, ...validated });
  return { ok: true, data: wheel };
}

export async function updateWheelAction(wheelId: number, input: WheelFormInput): Promise<ActionResult<Wheel>> {
  const validated = validateWheelForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const wheel = await updateWheel({ id: wheelId, ...validated });
  return { ok: true, data: wheel };
}

export async function removeWheelAction(wheelId: number): Promise<ActionResult> {
  await removeWheel(wheelId);
  return { ok: true, data: undefined };
}

export async function copyWheelAction(wheelId: number): Promise<ActionResult<Wheel>> {
  const wheel = await copyWheel(wheelId);
  return { ok: true, data: wheel };
}

export async function resetWheelAction(wheelId: number): Promise<ActionResult<Wheel>> {
  const wheel = await resetWheelSession(wheelId);
  return { ok: true, data: wheel };
}

// ---- Presets ----

type PresetFormInput = {
  name: string;
  category: string;
  namesText: string;
  public: boolean;
};

function validatePresetForm(input: PresetFormInput): { name: string; category: string; names: string[]; public: boolean } | { error: string } {
  const name = input.name.trim();
  if (!name) return { error: "Give your preset a name." };
  if (!findCategory(PRESET_CATEGORIES, input.category)) return { error: "Pick a category." };
  return { name, category: input.category, names: parseNameList(input.namesText), public: input.public };
}

export async function createPresetAction(hash: string, input: PresetFormInput): Promise<ActionResult<Preset>> {
  const dashboard = await findDashboardByHash(hash);
  if (!dashboard) return { ok: false, error: "Dashboard not found." };

  const validated = validatePresetForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const preset = await createPreset({ dashboardId: dashboard.id, ...validated });
  return { ok: true, data: preset };
}

export async function updatePresetAction(presetId: number, input: PresetFormInput): Promise<ActionResult<Preset>> {
  const validated = validatePresetForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const preset = await updatePreset({ id: presetId, ...validated });
  return { ok: true, data: preset };
}

export async function removePresetAction(presetId: number): Promise<ActionResult> {
  await removePreset(presetId);
  return { ok: true, data: undefined };
}

export async function copyPresetAction(hash: string, presetId: number): Promise<ActionResult<Preset>> {
  const dashboard = await findDashboardByHash(hash);
  if (!dashboard) return { ok: false, error: "Dashboard not found." };

  const preset = await copyPreset(presetId, dashboard.id);
  return { ok: true, data: preset };
}

export async function listPresetsAction(
  hash: string,
  scope: "private" | "public",
  options: ListPresetsOptions,
): Promise<ActionResult<PresetListResult>> {
  const dashboard = await findDashboardByHash(hash);
  if (!dashboard) return { ok: false, error: "Dashboard not found." };

  const result = scope === "private" ? await listPrivatePresets(dashboard.id, options) : await listPublicPresets(dashboard.id, options);
  return { ok: true, data: result };
}
