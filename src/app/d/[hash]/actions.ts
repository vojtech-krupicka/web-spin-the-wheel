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
import { requireDashboardAccess, requirePresetAccess, requirePresetReadAccess, requireWheelAccess } from "@/lib/authz";
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
  const access = await requireDashboardAccess(dashboard);
  if (!access.ok) return access;

  const validated = validateWheelForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const wheel = await createWheel({ dashboardId: access.data.id, ...validated });
  return { ok: true, data: wheel };
}

export async function updateWheelAction(wheelId: number, input: WheelFormInput): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const validated = validateWheelForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const wheel = await updateWheel({ id: wheelId, ...validated });
  return { ok: true, data: wheel };
}

export async function removeWheelAction(wheelId: number): Promise<ActionResult> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  await removeWheel(wheelId);
  return { ok: true, data: undefined };
}

export async function copyWheelAction(wheelId: number): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

  const wheel = await copyWheel(wheelId);
  return { ok: true, data: wheel };
}

export async function resetWheelAction(wheelId: number): Promise<ActionResult<Wheel>> {
  const access = await requireWheelAccess(wheelId);
  if (!access.ok) return access;

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
  const access = await requireDashboardAccess(dashboard);
  if (!access.ok) return access;

  const validated = validatePresetForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const preset = await createPreset({ dashboardId: access.data.id, ...validated });
  return { ok: true, data: preset };
}

export async function updatePresetAction(presetId: number, input: PresetFormInput): Promise<ActionResult<Preset>> {
  const access = await requirePresetAccess(presetId);
  if (!access.ok) return access;

  const validated = validatePresetForm(input);
  if ("error" in validated) return { ok: false, error: validated.error };

  const preset = await updatePreset({ id: presetId, ...validated });
  return { ok: true, data: preset };
}

export async function removePresetAction(presetId: number): Promise<ActionResult> {
  const access = await requirePresetAccess(presetId);
  if (!access.ok) return access;

  await removePreset(presetId);
  return { ok: true, data: undefined };
}

export async function copyPresetAction(hash: string, presetId: number): Promise<ActionResult<Preset>> {
  const dashboard = await findDashboardByHash(hash);
  const dashboardAccess = await requireDashboardAccess(dashboard);
  if (!dashboardAccess.ok) return dashboardAccess;

  const presetAccess = await requirePresetReadAccess(presetId, dashboardAccess.data.id);
  if (!presetAccess.ok) return presetAccess;

  const preset = await copyPreset(presetId, dashboardAccess.data.id);
  return { ok: true, data: preset };
}

export async function listPresetsAction(
  hash: string,
  scope: "private" | "public",
  options: ListPresetsOptions,
): Promise<ActionResult<PresetListResult>> {
  const dashboard = await findDashboardByHash(hash);
  const access = await requireDashboardAccess(dashboard);
  if (!access.ok) return access;

  const result = scope === "private" ? await listPrivatePresets(access.data.id, options) : await listPublicPresets(access.data.id, options);
  return { ok: true, data: result };
}
