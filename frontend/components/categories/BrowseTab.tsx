"use client";

import type { Prompt } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/library/SearchInput';
import CategorySelector from '@/components/CategorySelector';
import PromptCard from '@/components/PromptCard';
import { PromptCardSkeleton } from '@/components/skeletons/PromptCardSkeleton';
import { Filter } from 'lucide-react';

interface BrowseTabProps {
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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Filters */}
      <div className="bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100 pb-2 border-b border-slate-100 dark:border-slate-700/40">
          <Filter className="w-4 h-4" /> Filter by Category
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Categories (Combine to refine)</label>
            <CategorySelector selected={selectedFilters} onChange={onFiltersChange} />
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Search Prompts</label>
            <SearchInput value={search} onChange={onSearchChange} placeholder="Search by title or text..." />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <PromptCardSkeleton key={i} />
          ))}
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700/60 mb-4">
            <Filter className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
            No prompts found matching criteria
          </h3>
          <p className="text-slate-500">Try removing some filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {prompts.map((p) => (
              <PromptCard key={p.id} prompt={p} onMove={onMove} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} isLoading={isFetchingNextPage}>
                {isFetchingNextPage ? 'Loading...' : `Load More (${prompts.length} of ${total})`}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
