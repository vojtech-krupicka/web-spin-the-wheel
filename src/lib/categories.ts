import {
  Clapperboard,
  BookOpen,
  Music,
  Tv,
  Gamepad2,
  Dices,
  Cpu,
  Landmark,
  MapPin,
  Shapes,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
};

// Shared base list — wheel and preset categories start identical but are
// deliberately separate arrays so either can diverge later without a migration.
const BASE_CATEGORIES: Category[] = [
  { id: "movies", name: "Movies", icon: Clapperboard, color: "#f97316" },
  { id: "books", name: "Books", icon: BookOpen, color: "#eab308" },
  { id: "music", name: "Music", icon: Music, color: "#ec4899" },
  { id: "series", name: "Series", icon: Tv, color: "#a855f7" },
  { id: "games", name: "Games", icon: Gamepad2, color: "#8b5cf6" },
  { id: "board-games", name: "Board games", icon: Dices, color: "#22c55e" },
  { id: "it", name: "IT", icon: Cpu, color: "#06b6d4" },
  { id: "landmarks", name: "Landmarks", icon: Landmark, color: "#f43f5e" },
  { id: "locations", name: "Locations", icon: MapPin, color: "#3b82f6" },
  { id: "general", name: "General", icon: Shapes, color: "#9296b3" },
];

export const WHEEL_CATEGORIES: Category[] = BASE_CATEGORIES;
export const PRESET_CATEGORIES: Category[] = BASE_CATEGORIES;

export function findCategory(categories: Category[], id: string): Category | undefined {
  return categories.find((category) => category.id === id);
}
