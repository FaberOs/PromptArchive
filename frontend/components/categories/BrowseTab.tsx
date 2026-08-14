"use client";

import type { Prompt } from "@/lib/types";
import type { CategoryItem } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/library/SearchInput";
import PromptCard from "@/components/PromptCard";
import { PromptCardSkeleton } from "@/components/skeletons/PromptCardSkeleton";
import { EmptyStateBlock } from "@/components/ui/EmptyStateBlock";
import { Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface BrowseTabProps {
  categories: CategoryItem[];
  selectedFilters: string[];
  onFiltersChange: (filters: string[]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  prompts: Prompt[];
  total: number;
  loading: boolean;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  onMove: () => void;
}

export function BrowseTab({
  categories,
  selectedFilters,
  onFiltersChange,
  search,
  onSearchChange,
  prompts,
  total,
  loading,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  onMove,
}: BrowseTabProps) {
  const selectedFilterSet = new Set(selectedFilters);
  const toggleCategory = (name: string) => {
    if (name === "All") {
      onFiltersChange([]);
      return;
    }
    if (selectedFilterSet.has(name)) {
      onFiltersChange(selectedFilters.filter((f) => f !== name));
    } else {
      onFiltersChange([...selectedFilters, name]);
    }
  };

  const sortedCategories = [...categories].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="pa-section-in space-y-6">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder="Search prompts or categories..."
        className="max-w-xl"
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-pa-text">
          <Filter className="h-4 w-4 text-pa-muted-soft" />
          Category filter
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => toggleCategory("All")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              selectedFilters.length === 0
                ? "border-pa-primary bg-pa-primary text-pa-paper"
                : "border-pa-border bg-pa-paper text-pa-muted hover:border-pa-border-strong hover:text-pa-text",
            )}
          >
            All
          </button>
          {sortedCategories.map((category) => {
            const active = selectedFilterSet.has(category.name);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => toggleCategory(category.name)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-pa-primary bg-pa-primary text-pa-paper"
                    : "border-pa-border bg-pa-paper text-pa-muted hover:border-pa-border-strong hover:text-pa-text",
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <EmptyStateBlock
          icon={<Filter className="h-7 w-7 text-pa-muted-soft" strokeWidth={1.8} />}
          title="No prompts found matching criteria"
          description="Try removing some filters or broadening your search."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} onMove={onMove} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
                {isFetchingNextPage ? "Loading..." : `Load More (${prompts.length} of ${total})`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
