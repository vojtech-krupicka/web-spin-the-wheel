"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/lib/categories";

type ComboboxProps = {
  categories: Category[];
  value: string | null;
  onChange: (id: string) => void;
  placeholder?: string;
};

/** Single-select category picker — icon + color + name per option. */
export function Combobox({ categories, value, onChange, placeholder = "Category" }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const selected = categories.find((category) => category.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 rounded-xl border border-border bg-panel-inset px-4 py-3 text-left text-[15px] outline-none focus:border-border-strong"
      >
        {selected ? (
          <>
            <selected.icon size={16} style={{ color: selected.color }} aria-hidden="true" />
            <span className="flex-1 truncate">{selected.name}</span>
          </>
        ) : (
          <span className="flex-1 truncate text-faint">{placeholder}</span>
        )}
        <ChevronDown size={16} className="text-muted" aria-hidden="true" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 z-40 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-panel p-1.5 shadow-2xl">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  onChange(category.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-white/5 ${
                  category.id === value ? "font-bold text-white" : "text-muted"
                }`}
              >
                <category.icon size={16} style={{ color: category.color }} aria-hidden="true" />
                {category.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
