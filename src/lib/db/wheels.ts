import { asc, eq } from "drizzle-orm";
import { db } from "./index";
import { wheels, type Wheel, type WheelData } from "./schema";
import { shuffleNames, sortNames } from "@/lib/nameList";

export function listWheelsForDashboard(dashboardId: number): Promise<Wheel[]> {
  return db.query.wheels.findMany({
    where: eq(wheels.dashboardId, dashboardId),
    orderBy: asc(wheels.name),
  });
}

export function findWheelById(id: number): Promise<Wheel | undefined> {
  return db.query.wheels.findFirst({ where: eq(wheels.id, id) });
}

type CreateWheelInput = {
  dashboardId: number;
  name: string;
  category: string;
  templateBucket: string[];
};

export async function createWheel({ dashboardId, name, category, templateBucket }: CreateWheelInput): Promise<Wheel> {
  const [wheel] = await db
    .insert(wheels)
    .values({
      dashboardId,
      name,
      category,
      data: {
        templateBucket,
        currentBucket: [],
        historyBucket: [],
        visualization: "wheel",
        mode: "fair",
      },
    })
    .returning();
  return wheel;
}

type UpdateWheelInput = {
  id: number;
  name: string;
  category: string;
  templateBucket: string[];
};

/** Edits name/category/template only — current/history buckets are untouched. */
export async function updateWheel({ id, name, category, templateBucket }: UpdateWheelInput): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");

  const [updated] = await db
    .update(wheels)
    .set({
      name,
      category,
      updatedAt: new Date(),
      data: { ...existing.data, templateBucket },
    })
    .where(eq(wheels.id, id))
    .returning();
  return updated;
}

export async function removeWheel(id: number): Promise<void> {
  await db.delete(wheels).where(eq(wheels.id, id));
}

/** Duplicates a wheel's template only — fresh empty current/history buckets. */
export async function copyWheel(id: number): Promise<Wheel> {
  const source = await findWheelById(id);
  if (!source) throw new Error("Wheel not found.");

  const [copy] = await db
    .insert(wheels)
    .values({
      dashboardId: source.dashboardId,
      name: `${source.name} - copy`,
      category: source.category,
      data: {
        templateBucket: source.data.templateBucket,
        currentBucket: [],
        historyBucket: [],
        visualization: source.data.visualization,
        mode: source.data.mode,
      },
    })
    .returning();
  return copy;
}

/** Starts a new history session and reseeds current_bucket from template_bucket. */
export async function resetWheelSession(id: number): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");

  return updateWheelData(id, {
    ...existing.data,
    currentBucket: [...existing.data.templateBucket],
    historyBucket: [...existing.data.historyBucket, { startedAt: new Date().toISOString(), winners: [] }],
  });
}

export async function updateWheelData(id: number, data: WheelData): Promise<Wheel> {
  const [updated] = await db
    .update(wheels)
    .set({ data, updatedAt: new Date() })
    .where(eq(wheels.id, id))
    .returning();
  return updated;
}

export async function sortWheelCurrentBucket(id: number, direction: "asc" | "desc"): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");
  return updateWheelData(id, { ...existing.data, currentBucket: sortNames(existing.data.currentBucket, direction) });
}

export async function shuffleWheelCurrentBucket(id: number): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");
  return updateWheelData(id, { ...existing.data, currentBucket: shuffleNames(existing.data.currentBucket) });
}

export async function updateWheelCurrentBucket(id: number, currentBucket: string[]): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");
  return updateWheelData(id, { ...existing.data, currentBucket });
}

/** Appends a winner to the most recently started session. */
export async function appendWheelWinner(id: number, name: string): Promise<Wheel> {
  const existing = await findWheelById(id);
  if (!existing) throw new Error("Wheel not found.");

  const historyBucket = [...existing.data.historyBucket];
  const lastIndex = historyBucket.length - 1;
  if (lastIndex < 0) throw new Error("No active session.");

  const lastSession = historyBucket[lastIndex];
  historyBucket[lastIndex] = {
    ...lastSession,
    winners: [...lastSession.winners, { name, at: new Date().toISOString() }],
  };

  return updateWheelData(id, { ...existing.data, historyBucket });
}
