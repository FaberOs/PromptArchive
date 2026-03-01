"use client";

import type { CategoryItem } from '@/hooks/useCategories';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/library/SearchInput';
import { Tag, Plus, Edit2, Trash2 } from 'lucide-react';

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
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex gap-3 w-full md:w-auto justify-between">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder="Search categories..."
          className="flex-1 md:max-w-sm"
        />
        <Button
          onClick={onCreateOpen}
          className="bg-slate-900 dark:bg-white text-white dark:text-slate-900"
        >
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-slate-100 dark:bg-slate-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-700/50 rounded-xl">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">No categories found</h3>
          <p className="text-slate-500">Try creating one or adjusting your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div
              key={c.id}
              className="group bg-white dark:bg-slate-800/60 p-5 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-40 relative overflow-hidden"
            >
              <Tag className="absolute -right-4 -bottom-4 w-24 h-24 text-slate-50 dark:text-slate-700/30 rotate-[-15deg]" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <h3
                    className="text-lg font-bold text-slate-900 dark:text-slate-100 line-clamp-1"
                    title={c.name}
                  >
                    {c.name}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300"
                  >
                    {c.prompt_count} Prompts
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {c.description || 'No description provided.'}
                </p>
              </div>
              <div className="relative z-10 flex justify-end gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => onEdit(c)}>
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onDelete(c.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
