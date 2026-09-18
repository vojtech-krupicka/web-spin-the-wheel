import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type SessionData = {
  /** ids of password-protected dashboards this browser has unlocked. */
  unlockedDashboardIds: number[];
};

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set — copy .env.example to .env and fill it in.");
}

const sessionOptions = {
  cookieName: "wheel-session",
  password: process.env.SESSION_SECRET,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

async function getSession() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if (!session.unlockedDashboardIds) session.unlockedDashboardIds = [];
  return session;
}

export async function isDashboardUnlocked(dashboardId: number): Promise<boolean> {
  const session = await getSession();
  return session.unlockedDashboardIds!.includes(dashboardId);
}

/** Password-less dashboards are accessible to anyone with the hash; protected ones need an unlocked session. */
export async function canAccessDashboard(dashboard: { id: number; passwordHash: string | null }): Promise<boolean> {
  if (!dashboard.passwordHash) return true;
  return isDashboardUnlocked(dashboard.id);
}

export async function unlockDashboard(dashboardId: number): Promise<void> {
  const session = await getSession();
  if (!session.unlockedDashboardIds!.includes(dashboardId)) {
    session.unlockedDashboardIds!.push(dashboardId);
  }
  await session.save();
}

export async function lockDashboard(dashboardId: number): Promise<void> {
  const session = await getSession();
  session.unlockedDashboardIds = session.unlockedDashboardIds!.filter((id) => id !== dashboardId);
  await session.save();
}
