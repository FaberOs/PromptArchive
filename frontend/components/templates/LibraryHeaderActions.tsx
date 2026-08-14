"use client";

import Link from "next/link";

import { EyeOff, LayoutGrid, Plus } from "lucide-react";
import { SearchInput } from "@/components/library/SearchInput";

import { LibraryIconButton } from "@/components/library/LibraryIconButton";

interface LibraryHeaderActionsProps {
  search: string;

  onSearchChange: (value: string) => void;

  searchPlaceholder?: string;

  searchInputClassName?: string;

  newPromptHref?: string;

  showHidden: boolean;

  onToggleShowHidden: () => void;

  selectionMode: boolean;

  onToggleSelectionMode: () => void;

  extraActions?: React.ReactNode;
}

export function LibraryHeaderActions({
  search,

  onSearchChange,

  searchPlaceholder = "Search prompts, folders, tags...",

  searchInputClassName,

  newPromptHref = "/create",

  showHidden,

  onToggleShowHidden,

  selectionMode,

  onToggleSelectionMode,

  extraActions,
}: LibraryHeaderActionsProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-2.5 sm:flex-row sm:items-center lg:justify-end">
      <SearchInput
        value={search}

        onChange={onSearchChange}

        placeholder={searchPlaceholder}

        className="w-full min-w-0 sm:flex-1 lg:max-w-[420px]"

        inputClassName={searchInputClassName}
      />

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Link
          href={newPromptHref}

          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-pa-primary px-4 text-sm font-semibold text-pa-paper shadow-[0_1px_2px_rgba(11,20,43,0.12)] transition-colors hover:bg-pa-primary-hover"
        >
          <Plus className="h-[17px] w-[17px]" strokeWidth={2.25} aria-hidden="true" />
          New Prompt
        </Link>

        <LibraryIconButton
          icon={LayoutGrid}

          label={selectionMode ? "Exit selection mode" : "Select items"}

          active={selectionMode}

          onClick={onToggleSelectionMode}
        />

        <LibraryIconButton
          icon={EyeOff}
          label={showHidden ? "Showing hidden items" : "Show hidden items"}

          active={showHidden}

          activeTone="warning"

          onClick={onToggleShowHidden}
        />

        {extraActions}
      </div>
    </div>
  );
}
