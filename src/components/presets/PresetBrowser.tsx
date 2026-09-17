"use client";

import { useEffect, useState } from "react";
import { Foldout } from "@/components/ui/Foldout";
import { PresetFilterSortBar } from "./PresetFilterSortBar";
import { PresetListRow } from "./PresetListRow";
import { listPresetsAction } from "@/app/d/[hash]/actions";
import type { PresetSortKey, SortDirection } from "@/lib/db/presets";
import type { Preset } from "@/lib/db/schema";

const PAGE_SIZE = 10;

type PresetBrowserProps = {
  hash: string;
  mode: "manage" | "picker";
  onEdit?: (preset: Preset) => void;
  /** Bump to force a refetch after a mutation made outside this component (e.g. a create dialog). */
  refreshToken?: number;
  selectedIds?: Set<number>;
  onToggleSelect?: (preset: Preset) => void;
};

/**
 * Shared preset list UI: two foldouts (private/public), filter+sort, and
 * per-list "Load more" pagination. Reused as-is by the standalone Presets
 * screen (mode="manage") and the wheel edit dialog's "Load from preset"
 * picker (mode="picker").
 */
export function PresetBrowser({ hash, mode, onEdit, refreshToken = 0, selectedIds, onToggleSelect }: PresetBrowserProps) {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [nameFilter, setNameFilter] = useState("");
  const [sort, setSort] = useState<PresetSortKey>("name");
  const [direction, setDirection] = useState<SortDirection>("asc");

  const [privateOpen, setPrivateOpen] = useState(true);
  const [publicOpen, setPublicOpen] = useState(true);

  const [privateItems, setPrivateItems] = useState<Preset[]>([]);
  const [privateTotal, setPrivateTotal] = useState(0);
  const [privateLimit, setPrivateLimit] = useState(PAGE_SIZE);

  const [publicItems, setPublicItems] = useState<Preset[]>([]);
  const [publicTotal, setPublicTotal] = useState(0);
  const [publicLimit, setPublicLimit] = useState(PAGE_SIZE);

  const [version, setVersion] = useState(0);
  const refresh = () => setVersion((v) => v + 1);

  // A filter/sort change resets pagination on both lists. Adjusted during
  // render (React's documented pattern for "reset state when a prop/derived
  // value changes") rather than in an effect, since it's plain derived state,
  // not a sync with anything external.
  const filterKey = `${categoryFilter ?? ""}|${nameFilter}|${sort}|${direction}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPrivateLimit(PAGE_SIZE);
    setPublicLimit(PAGE_SIZE);
  }

  useEffect(() => {
    let cancelled = false;
    listPresetsAction(hash, "private", { categoryFilter, nameFilter, sort, direction, offset: 0, limit: privateLimit }).then(
      (result) => {
        if (cancelled || !result.ok) return;
        setPrivateItems(result.data.items);
        setPrivateTotal(result.data.total);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [hash, categoryFilter, nameFilter, sort, direction, privateLimit, version, refreshToken]);

  useEffect(() => {
    let cancelled = false;
    listPresetsAction(hash, "public", { categoryFilter, nameFilter, sort, direction, offset: 0, limit: publicLimit }).then(
      (result) => {
        if (cancelled || !result.ok) return;
        setPublicItems(result.data.items);
        setPublicTotal(result.data.total);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [hash, categoryFilter, nameFilter, sort, direction, publicLimit, version, refreshToken]);

  return (
    <div>
      <PresetFilterSortBar
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        nameFilter={nameFilter}
        onNameFilterChange={setNameFilter}
        sort={sort}
        onSortChange={setSort}
        direction={direction}
        onDirectionChange={setDirection}
      />

      <Foldout
        title={`Private presets (${privateItems.length}/${privateTotal})`}
        open={privateOpen}
        onToggle={() => setPrivateOpen((v) => !v)}
      >
        {privateItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {privateItems.map((preset) => (
              <PresetListRow
                key={preset.id}
                hash={hash}
                preset={preset}
                listType="private"
                mode={mode}
                selected={selectedIds?.has(preset.id)}
                onToggleSelect={onToggleSelect}
                onEdit={onEdit}
                onChanged={refresh}
              />
            ))}
            {privateItems.length < privateTotal && <LoadMoreButton onClick={() => setPrivateLimit((l) => l + PAGE_SIZE)} />}
          </>
        )}
      </Foldout>

      <Foldout
        title={`Public presets (${publicItems.length}/${publicTotal})`}
        open={publicOpen}
        onToggle={() => setPublicOpen((v) => !v)}
      >
        {publicItems.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {publicItems.map((preset) => (
              <PresetListRow
                key={preset.id}
                hash={hash}
                preset={preset}
                listType="public"
                mode={mode}
                selected={selectedIds?.has(preset.id)}
                onToggleSelect={onToggleSelect}
                onChanged={refresh}
              />
            ))}
            {publicItems.length < publicTotal && <LoadMoreButton onClick={() => setPublicLimit((l) => l + PAGE_SIZE)} />}
          </>
        )}
      </Foldout>
    </div>
  );
}

function EmptyState() {
  return <p className="px-1 py-4 text-center text-xs text-faint">No presets found.</p>;
}

function LoadMoreButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-1 w-full rounded-lg border border-border py-2 text-xs font-bold text-muted transition hover:border-border-strong hover:text-white"
    >
      Load more
    </button>
  );
}
