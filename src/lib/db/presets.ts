import { and, asc, desc, eq, ilike, ne, sql, type SQL } from "drizzle-orm";
import { db } from "./index";
import { presets, type Preset } from "./schema";

export type PresetSortKey = "category" | "name" | "created" | "count";
export type SortDirection = "asc" | "desc";

export type ListPresetsOptions = {
  categoryFilter?: string | null;
  nameFilter?: string;
  sort: PresetSortKey;
  direction: SortDirection;
  offset: number;
  limit: number;
};

export type PresetListResult = { items: Preset[]; total: number };

const nameCountExpr = sql`jsonb_array_length(${presets.data}->'names')`;

function sortColumn(sort: PresetSortKey) {
  switch (sort) {
    case "category":
      return presets.category;
    case "name":
      return presets.name;
    case "created":
      return presets.createdAt;
    case "count":
      return nameCountExpr;
  }
}

function orderBy(sort: PresetSortKey, direction: SortDirection) {
  const column = sortColumn(sort);
  return direction === "asc" ? asc(column) : desc(column);
}

async function listPresets(baseCondition: SQL, options: ListPresetsOptions): Promise<PresetListResult> {
  const conditions = [baseCondition];
  if (options.categoryFilter) conditions.push(eq(presets.category, options.categoryFilter));
  if (options.nameFilter) conditions.push(ilike(presets.name, `%${options.nameFilter}%`));
  const where = and(...conditions);

  const [items, countRows] = await Promise.all([
    db
      .select()
      .from(presets)
      .where(where)
      .orderBy(orderBy(options.sort, options.direction))
      .limit(options.limit)
      .offset(options.offset),
    db.select({ count: sql<number>`count(*)::int` }).from(presets).where(where),
  ]);

  return { items, total: countRows[0]?.count ?? 0 };
}

/** Every preset owned by this dashboard, private or public. */
export function listPrivatePresets(dashboardId: number, options: ListPresetsOptions): Promise<PresetListResult> {
  return listPresets(eq(presets.dashboardId, dashboardId), options);
}

/** Public presets owned by other dashboards — the caller's own public presets show in the private list instead. */
export function listPublicPresets(excludeDashboardId: number, options: ListPresetsOptions): Promise<PresetListResult> {
  return listPresets(and(eq(presets.public, true), ne(presets.dashboardId, excludeDashboardId))!, options);
}

export function findPresetById(id: number): Promise<Preset | undefined> {
  return db.query.presets.findFirst({ where: eq(presets.id, id) });
}

type CreatePresetInput = {
  dashboardId: number;
  name: string;
  category: string;
  names: string[];
  public: boolean;
};

export async function createPreset(input: CreatePresetInput): Promise<Preset> {
  const [preset] = await db
    .insert(presets)
    .values({
      dashboardId: input.dashboardId,
      name: input.name,
      category: input.category,
      public: input.public,
      data: { names: input.names },
    })
    .returning();
  return preset;
}

type UpdatePresetInput = {
  id: number;
  name: string;
  category: string;
  names: string[];
  public: boolean;
};

export async function updatePreset(input: UpdatePresetInput): Promise<Preset> {
  const [updated] = await db
    .update(presets)
    .set({
      name: input.name,
      category: input.category,
      public: input.public,
      data: { names: input.names },
    })
    .where(eq(presets.id, input.id))
    .returning();
  return updated;
}

export async function removePreset(id: number): Promise<void> {
  await db.delete(presets).where(eq(presets.id, id));
}

/**
 * Duplicates a preset into `targetDashboardId`, always as a new private preset
 * regardless of the source's visibility or owner — this is how copying someone
 * else's public preset ends up owned by the dashboard that copied it.
 */
export async function copyPreset(id: number, targetDashboardId: number): Promise<Preset> {
  const source = await findPresetById(id);
  if (!source) throw new Error("Preset not found.");

  const [copy] = await db
    .insert(presets)
    .values({
      dashboardId: targetDashboardId,
      name: `${source.name} - copy`,
      category: source.category,
      public: false,
      data: source.data,
    })
    .returning();
  return copy;
}
