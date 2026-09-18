import { findDashboardById } from "@/lib/db/dashboards";
import { findPresetById } from "@/lib/db/presets";
import { findWheelById } from "@/lib/db/wheels";
import { canAccessDashboard } from "@/lib/session";
import type { Dashboard, Preset, Wheel } from "@/lib/db/schema";

type AuthzResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** Verifies the caller's session can access this already-resolved dashboard (e.g. one looked up by hash). */
export async function requireDashboardAccess(dashboard: Dashboard | undefined): Promise<AuthzResult<Dashboard>> {
  if (!dashboard) return { ok: false, error: "Dashboard not found." };
  if (!(await canAccessDashboard(dashboard))) return { ok: false, error: "Not authorized." };
  return { ok: true, data: dashboard };
}

/** Resolves a wheel by id and verifies the caller's session can access the dashboard that owns it. */
export async function requireWheelAccess(wheelId: number): Promise<AuthzResult<Wheel>> {
  const wheel = await findWheelById(wheelId);
  if (!wheel) return { ok: false, error: "Wheel not found." };

  const dashboard = await findDashboardById(wheel.dashboardId);
  if (!dashboard || !(await canAccessDashboard(dashboard))) return { ok: false, error: "Not authorized." };

  return { ok: true, data: wheel };
}

/** Resolves a preset by id and verifies the caller's session can access the dashboard that owns it. */
export async function requirePresetAccess(presetId: number): Promise<AuthzResult<Preset>> {
  const preset = await findPresetById(presetId);
  if (!preset) return { ok: false, error: "Preset not found." };

  const dashboard = await findDashboardById(preset.dashboardId);
  if (!dashboard || !(await canAccessDashboard(dashboard))) return { ok: false, error: "Not authorized." };

  return { ok: true, data: preset };
}

/** For copying: a preset is readable by its own dashboard, or by anyone if it's public. */
export async function requirePresetReadAccess(presetId: number, viewerDashboardId: number): Promise<AuthzResult<Preset>> {
  const preset = await findPresetById(presetId);
  if (!preset) return { ok: false, error: "Preset not found." };
  if (preset.dashboardId !== viewerDashboardId && !preset.public) return { ok: false, error: "Not authorized." };

  return { ok: true, data: preset };
}
