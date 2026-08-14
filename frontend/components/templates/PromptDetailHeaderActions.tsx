"use client";

import * as Popover from "@radix-ui/react-popover";

import { Edit2, Eye, EyeOff, GitBranch, MoreHorizontal, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/Button";

import { cn } from "@/lib/utils";

interface PromptDetailHeaderActionsProps {
  onVariant: () => void;

  onEdit: () => void;

  onToggleHide: () => void;

  onDelete: () => void;

  isHidden: boolean;
}

export function PromptDetailHeaderActions({
  onVariant,

  onEdit,

  onToggleHide,

  onDelete,

  isHidden,
}: PromptDetailHeaderActionsProps) {
  return (
    <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
      <Button
        variant="secondary"

        size="sm"

        onClick={onVariant}

        aria-label="Create variant"

        className="px-2.5 sm:px-3"
      >
        <GitBranch className="h-4 w-4 sm:mr-2" />

        <span className="hidden sm:inline">Variant</span>
      </Button>

      <Button
        variant="secondary"

        size="sm"

        onClick={onEdit}

        aria-label="Edit prompt"

        className="px-2.5 sm:px-3"
      >
        <Edit2 className="h-4 w-4 sm:mr-2" />

        <span className="hidden sm:inline">Edit</span>
      </Button>

      <Popover.Root>
        <Popover.Trigger asChild>
          <Button variant="ghost" size="sm" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            sideOffset={4}

            align="end"

            className="z-50 flex w-44 max-w-[calc(100vw-2rem)] flex-col gap-0.5 rounded-pa-lg border border-pa-border bg-pa-paper p-1 shadow-pa-float"
          >
            <button
              type="button"

              onClick={onToggleHide}

              className="flex w-full items-center gap-2 rounded-pa-md px-3 py-2 text-left text-sm text-pa-text transition-colors hover:bg-pa-surface"
            >
              {isHidden ? <Eye className="h-4 w-4 text-pa-muted" /> : <EyeOff className="h-4 w-4 text-pa-muted" />}

              {isHidden ? "Show prompt" : "Hide prompt"}
            </button>

            <button
              type="button"

              onClick={onDelete}

              className={cn(
                "flex w-full items-center gap-2 rounded-pa-md px-3 py-2 text-left text-sm text-pa-danger transition-colors hover:bg-pa-danger-soft",
              )}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
