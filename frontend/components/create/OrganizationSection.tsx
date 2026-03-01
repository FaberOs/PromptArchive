"use client";

import { UseFormReturn } from 'react-hook-form';
import type { CreateFormData } from '@/hooks/useCreatePrompt';
import type { Folder } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { FieldLabel } from '@/components/ui/FieldLabel';
import CategorySelector from '@/components/CategorySelector';
import { Tag as TagIcon, Lock, Database, Folder as FolderIcon, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrganizationSectionProps {
  form: UseFormReturn<CreateFormData>;
  isNsfw: string;
  folders: Folder[];
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export function OrganizationSection({
  form,
  isNsfw,
  folders,
  selectedCategories,
  onCategoriesChange,
}: OrganizationSectionProps) {
  const { register } = form;

  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <TagIcon className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Organization</span>
      </div>

      {/* Library toggle */}
      <div>
        <FieldLabel tip="Standard is visible always. NSFW requires a PIN to access.">Library</FieldLabel>
        <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-700/50 rounded-lg w-full">
          <label
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer',
              isNsfw === 'false'
                ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <input type="radio" value="false" {...register('is_nsfw')} className="sr-only" />
            <Database className="w-3.5 h-3.5" /> Standard
          </label>
          <label
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all cursor-pointer',
              isNsfw === 'true'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <input type="radio" value="true" {...register('is_nsfw')} className="sr-only" />
            <Lock className="w-3.5 h-3.5" /> NSFW
          </label>
        </div>
      </div>

      {/* Folder */}
      <div>
        <FieldLabel tip="Optional folder to keep related prompts grouped.">Folder</FieldLabel>
        <div className="relative">
          <FolderIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            {...register('folder_id')}
            className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 dark:border-slate-600/60 bg-white dark:bg-slate-800/60 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 appearance-none cursor-pointer transition-colors"
          >
            <option value="">Root (no folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories */}
      <div>
        <FieldLabel tip="High-level groupings (e.g. Landscape, Character, Abstract).">Categories</FieldLabel>
        <CategorySelector selected={selectedCategories} onChange={onCategoriesChange} />
      </div>

      {/* Tags */}
      <div>
        <FieldLabel tip="Comma-separated keywords for fine-grained filtering.">Tags</FieldLabel>
        <Input {...register('tags')} placeholder="cinematic, 8k, octane render" className="text-sm" />
      </div>
    </div>
  );
}
