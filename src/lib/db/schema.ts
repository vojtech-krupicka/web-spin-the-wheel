import { boolean, integer, jsonb, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

// ---------- dashboards ----------
export type DashboardSettings = Record<string, never>; // parity placeholder, no fields yet

export const dashboards = pgTable("dashboards", {
  id: serial("id").primaryKey(),
  hash: varchar("hash", { length: 5 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  settings: jsonb("settings").$type<DashboardSettings>().notNull().default({}),
});

// ---------- presets ----------
export type PresetData = { names: string[] };

export const presets = pgTable("presets", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id")
    .notNull()
    .references(() => dashboards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  category: text("category").notNull(), // validated against PRESET_CATEGORIES ids at app layer
  data: jsonb("data").$type<PresetData>().notNull().default({ names: [] }),
  public: boolean("public").notNull().default(false),
});

// ---------- wheels ----------
export type WheelSession = { startedAt: string; winners: { name: string; at: string }[] };
export type WheelVisualization = "bowl" | "carousel" | "cylinder" | "wheel";
export type WheelMode = "fair" | "force-affects-odds";

export type WheelData = {
  templateBucket: string[];
  currentBucket: string[];
  historyBucket: WheelSession[];
  visualization: WheelVisualization;
  mode: WheelMode;
};

export const wheels = pgTable("wheels", {
  id: serial("id").primaryKey(),
  dashboardId: integer("dashboard_id")
    .notNull()
    .references(() => dashboards.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  category: text("category").notNull(), // validated against WHEEL_CATEGORIES ids at app layer
  data: jsonb("data")
    .$type<WheelData>()
    .notNull()
    .default({
      templateBucket: [],
      currentBucket: [],
      historyBucket: [],
      visualization: "wheel",
      mode: "fair",
    }),
});

export type Dashboard = typeof dashboards.$inferSelect;
export type NewDashboard = typeof dashboards.$inferInsert;
export type Preset = typeof presets.$inferSelect;
export type NewPreset = typeof presets.$inferInsert;
export type Wheel = typeof wheels.$inferSelect;
export type NewWheel = typeof wheels.$inferInsert;
