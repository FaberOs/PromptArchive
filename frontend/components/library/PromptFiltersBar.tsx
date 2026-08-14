"use client";

import { Braces, ChevronDown, EyeOff, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptSort, PromptTypeFilter } from "@/lib/libraryFilters";

const FILTERS: Array<{
  id: PromptTypeFilter;
  label: string;
  icon?: React.ReactNode;
}> = [
  { id: "all", label: "All" },
  { id: "standard", label: "Standard" },
  {
    id: "json",
    label: "JSON",
    icon: <Braces className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />,
  },
  {
    id: "hidden",
    label: "Hidden",
    icon: <EyeOff className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: <Star className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />,
  },
];

const SORT_OPTIONS: Array<{ value: PromptSort; label: string }> = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "title_asc", label: "Title A–Z" },
  { value: "title_desc", label: "Title Z–A" },
];

interface PromptFiltersBarProps {
  activeFilter: PromptTypeFilter;
  onFilterChange: (filter: PromptTypeFilter) => void;
  sort: PromptSort;
  onSortChange: (sort: PromptSort) => void;
}

export function PromptFiltersBar({ activeFilter, onFilterChange, sort, onSortChange }: PromptFiltersBarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <h2 className="shrink-0 text-base font-bold text-pa-text">Prompts</h2>

      <div className="flex min-w-0 flex-1 justify-center xl:px-2">
        <div
          className="inline-flex max-w-full flex-wrap items-center gap-0.5 rounded-full bg-pa-surface p-1 ring-1 ring-pa-border"
          role="tablist"
          aria-label="Filter prompts"
        >
          {FILTERS.map(({ id, label, icon }) => {
            const active = activeFilter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFilterChange(id)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-[background-color,border-color,color,opacity,transform,box-shadow]",
                  active
                    ? "bg-pa-paper text-pa-text shadow-[0_1px_3px_rgba(11,20,43,0.08)]"
                    : "text-pa-muted hover:text-pa-text",
                )}
              >
                {icon}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <span className="text-xs text-pa-muted-soft">Sort by</span>
        <div className="relative">
          <select
            id="library-prompt-sort"
            value={sort}
            onChange={(e) => onSortChange(e.target.value as PromptSort)}
            aria-label="Sort prompts"
            className="h-8 cursor-pointer appearance-none rounded-lg border border-pa-border bg-pa-paper py-0 pl-2.5 pr-7 text-xs font-semibold text-pa-text focus:border-pa-ink focus:outline-none focus:ring-2 focus:ring-pa-primary/10"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pa-muted-soft"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
