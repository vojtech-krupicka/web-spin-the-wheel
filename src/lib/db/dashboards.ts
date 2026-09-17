import { eq } from "drizzle-orm";
import { db } from "./index";
import { dashboards, type Dashboard } from "./schema";
import { generateDashboardHash } from "@/lib/dashboardHash";

const MAX_HASH_ATTEMPTS = 5;

export function findDashboardByHash(hash: string): Promise<Dashboard | undefined> {
  return db.query.dashboards.findFirst({ where: eq(dashboards.hash, hash) });
}

export function findDashboardById(id: number): Promise<Dashboard | undefined> {
  return db.query.dashboards.findFirst({ where: eq(dashboards.id, id) });
}

type CreateDashboardInput = {
  name: string;
  passwordHash: string | null;
};

/** Creates a dashboard with a unique 5-char hash, retrying on collision. */
export async function createDashboard({ name, passwordHash }: CreateDashboardInput): Promise<Dashboard> {
  return db.transaction(async (tx) => {
    let dashboard: Dashboard | undefined;

    for (let attempt = 0; attempt < MAX_HASH_ATTEMPTS && !dashboard; attempt++) {
      const hash = generateDashboardHash();
      const existing = await tx.query.dashboards.findFirst({ where: eq(dashboards.hash, hash) });
      if (existing) continue;

      [dashboard] = await tx.insert(dashboards).values({ hash, name, passwordHash }).returning();
    }

    if (!dashboard) {
      throw new Error("Could not generate a unique dashboard hash — please try again.");
    }

    return dashboard;
  });
}

type UpdateDashboardInput = {
  id: number;
  name: string;
  /** undefined = leave unchanged, null = clear, string = new hash */
  passwordHash?: string | null;
};

export async function updateDashboard({ id, name, passwordHash }: UpdateDashboardInput): Promise<Dashboard> {
  const [updated] = await db
    .update(dashboards)
    .set({
      name,
      ...(passwordHash !== undefined ? { passwordHash } : {}),
    })
    .where(eq(dashboards.id, id))
    .returning();

  return updated;
}

export async function deleteDashboard(id: number): Promise<void> {
  await db.delete(dashboards).where(eq(dashboards.id, id));
}
