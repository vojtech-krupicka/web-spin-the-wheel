"use server";

import { createDashboard, findDashboardByHash } from "@/lib/db/dashboards";
import { hashPassword, verifyPassword } from "@/lib/password";
import { unlockDashboard } from "@/lib/session";

type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

// ---- Home page: join / create ----

export async function checkDashboardAction(
  hash: string,
): Promise<ActionResult<{ hasPassword: boolean }>> {
  const dashboard = await findDashboardByHash(hash.trim().toLowerCase());
  if (!dashboard) return { ok: false, error: "No dashboard found with that hash." };
  return { ok: true, data: { hasPassword: dashboard.passwordHash !== null } };
}

export async function joinDashboardWithPasswordAction(
  hash: string,
  password: string,
): Promise<ActionResult> {
  const dashboard = await findDashboardByHash(hash.trim().toLowerCase());
  if (!dashboard) return { ok: false, error: "No dashboard found with that hash." };
  if (!dashboard.passwordHash) return { ok: true, data: undefined };

  const valid = await verifyPassword(password, dashboard.passwordHash);
  if (!valid) return { ok: false, error: "Incorrect password." };

  await unlockDashboard(dashboard.id);
  return { ok: true, data: undefined };
}

export async function createDashboardAction(
  name: string,
  password: string,
  repeatPassword: string,
): Promise<ActionResult<{ hash: string }>> {
  const trimmedName = name.trim();
  if (!trimmedName) return { ok: false, error: "Give your dashboard a name." };
  if (password !== repeatPassword) return { ok: false, error: "Passwords don't match." };

  const passwordHash = password ? await hashPassword(password) : null;
  const dashboard = await createDashboard({ name: trimmedName, passwordHash });
  await unlockDashboard(dashboard.id);

  return { ok: true, data: { hash: dashboard.hash } };
}
