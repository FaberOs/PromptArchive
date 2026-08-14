"use client";

import type { CategoryItem } from "@/hooks/useCategories";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/library/SearchInput";
import { EmptyStateBlock } from "@/components/ui/EmptyStateBlock";
import { Skeleton } from "@/components/ui/Skeleton";
import { CategoryHealthCards } from "@/components/categories/CategoryHealthCards";
import { CategoryTable } from "@/components/categories/CategoryTable";
import { Tag, Plus } from "lucide-react";
import { countDuplicateGroups, countStaleCategories } from "@/lib/categoryDuplicates";

interface ManageTabProps {
  categories: CategoryItem[];
  loading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onCreateOpen: () => void;
  onEdit: (category: CategoryItem) => void;
  onDelete: (id: number) => void;
}

export function ManageTab({
  categories,
  loading,
  search,
  onSearchChange,
  onCreateOpen,
  onEdit,
  onDelete,
}: ManageTabProps) {
  const metrics = {
    duplicates: countDuplicateGroups(categories),
    empty: categories.filter((c) => c.prompt_count === 0).length,
    stale: countStaleCategories(categories),
    totalPrompts: categories.reduce((sum, c) => sum + c.prompt_count, 0),
  };

  return (
    <div className="pa-section-in space-y-6">
      <CategoryHealthCards metrics={metrics} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search categories..."
          className="flex-1 md:max-w-sm"
        />
        <Button onClick={onCreateOpen} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> New Category
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-pa-lg" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <EmptyStateBlock
          icon={<Tag className="h-7 w-7 text-pa-muted-soft" strokeWidth={1.8} />}
          title={search ? "No categories found" : "No categories yet"}
          description={
            search
              ? "Try another keyword or create a new category."
              : "Create categories to group prompts by style, subject or workflow."
          }
          action={
            !search ? (
              <Button onClick={onCreateOpen}>
                <Plus className="mr-2 h-4 w-4" /> New Category
              </Button>
            ) : undefined
          }
        />
      ) : (
        <CategoryTable categories={categories} onEdit={onEdit} onDelete={onDelete} />
      )}
    </div>
  );
}
