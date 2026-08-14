"use client";

import { useId } from "react";
import { UseFormReturn } from "react-hook-form";
import type { CreateFormData } from "@/hooks/useCreatePrompt";
import type { Folder } from "@/lib/types";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { TagInput } from "@/components/ui/TagInput";
import CategorySelector from "@/components/CategorySelector";
import { Tag as TagIcon, Lock, Database, Folder as FolderIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormSectionHeader } from "./FormSectionHeader";

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
  const folderId = useId();
  const categoriesId = useId();
  const tagsId = useId();

  return (
    <div className="space-y-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
      <FormSectionHeader
        icon={TagIcon}
        title="Organization"
        description="Choose the library, folder, categories, and tags used to retrieve this prompt."
      />

      <FieldGroup label="Library" info="Standard is visible always. Private Library requires a PIN to access.">
        <div className="inline-flex w-full rounded-pa-md border border-pa-border bg-pa-surface p-0.5">
          <label
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-pa-sm px-3 py-2 text-xs font-medium transition-[background-color,border-color,color,opacity,transform,box-shadow]",
              isNsfw === "false" ? "bg-pa-paper text-pa-text shadow-pa-subtle" : "text-pa-muted",
            )}
          >
            <input type="radio" value="false" {...register("is_nsfw")} className="sr-only" />
            <Database className="h-3.5 w-3.5" /> Standard
          </label>
          <label
            className={cn(
              "flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-pa-sm px-3 py-2 text-xs font-medium transition-[background-color,border-color,color,opacity,transform,box-shadow]",
              isNsfw === "true" ? "bg-pa-private text-white shadow-pa-subtle" : "text-pa-muted",
            )}
          >
            <input type="radio" value="true" {...register("is_nsfw")} className="sr-only" />
            <Lock className="h-3.5 w-3.5" /> Private
          </label>
        </div>
      </FieldGroup>

      <FieldGroup label="Folder" info="Optional folder to keep related prompts grouped." htmlFor={folderId}>
        <div className="relative">
          <FolderIcon
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pa-muted-soft"
            aria-hidden="true"
          />
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pa-muted-soft"
            aria-hidden="true"
          />
          <select
            id={folderId}
            {...register("folder_id")}
            className={cn(
              "h-[42px] w-full cursor-pointer appearance-none rounded-pa-md border border-pa-border bg-pa-paper pl-9 pr-8 text-sm text-pa-text",
              "transition-colors focus-visible:border-pa-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-pa-primary/10",
            )}
          >
            <option value="">Root (no folder)</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </FieldGroup>

      <FieldGroup
        label="Categories"
        info="High-level groupings (e.g. Landscape, Character, Abstract)."
        htmlFor={categoriesId}
      >
        <CategorySelector selected={selectedCategories} onChange={onCategoriesChange} triggerId={categoriesId} />
      </FieldGroup>

      <FieldGroup label="Tags" info="Comma-separated keywords for fine-grained filtering." htmlFor={tagsId}>
        <TagInput id={tagsId} {...register("tags")} />
      </FieldGroup>
    </div>
  );
}
