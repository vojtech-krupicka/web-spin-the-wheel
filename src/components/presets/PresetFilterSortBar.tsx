"use client";

import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { PRESET_CATEGORIES } from "@/lib/categories";
import type { PresetSortKey, SortDirection } from "@/lib/db/presets";

type PresetFilterSortBarProps = {
  categoryFilter: string | null;
  onCategoryFilterChange: (id: string | null) => void;
  nameFilter: string;
  onNameFilterChange: (value: string) => void;
  sort: PresetSortKey;
  onSortChange: (sort: PresetSortKey) => void;
  direction: SortDirection;
  onDirectionChange: (direction: SortDirection) => void;
};

const selectClass =
  "rounded-lg border border-border bg-panel-inset px-2.5 py-2 text-xs font-semibold outline-none focus:border-border-strong";

export function PresetFilterSortBar({
  categoryFilter,
  onCategoryFilterChange,
  nameFilter,
  onNameFilterChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
}: PresetFilterSortBarProps) {
  return (
    <div className="mb-3 flex flex-col gap-2">
      <input
        value={nameFilter}
        onChange={(event) => onNameFilterChange(event.target.value)}
        placeholder="Filter by name"
        className="w-full rounded-lg border border-border bg-panel-inset px-3 py-2 text-xs outline-none focus:border-border-strong placeholder:text-faint"
      />

      <div className="flex items-center gap-2">
        <select
          value={categoryFilter ?? ""}
          onChange={(event) => onCategoryFilterChange(event.target.value || null)}
          className={`min-w-0 flex-1 ${selectClass}`}
        >
          <option value="">All categories</option>
          {PRESET_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as PresetSortKey)}
          className={`min-w-0 flex-1 ${selectClass}`}
        >
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="created">Created</option>
          <option value="count">Count</option>
        </select>

        <button
          type="button"
          onClick={() => onDirectionChange(direction === "asc" ? "desc" : "asc")}
          aria-label={direction === "asc" ? "Sort descending" : "Sort ascending"}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg border border-border bg-panel-inset text-muted transition hover:text-white"
        >
          {direction === "asc" ? <ArrowDownAZ size={15} aria-hidden="true" /> : <ArrowUpAZ size={15} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}
