"use client";

import Link from "next/link";
import { Badge } from "./ui/Badge";
import { AuthenticatedImage } from "./ui/AuthenticatedImage";
import {
  Calendar,
  MoreVertical,
  FolderInput,
  Edit2,
  Trash2,
  Folder as FolderIcon,
  GitBranch,
  EyeOff,
  Eye,
  Image as ImageIcon,
  TerminalSquare,
} from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import api, { bulkHide, privateSessionRequest } from "@/lib/api";
import { Modal } from "./ui/Modal";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { Button } from "./ui/Button";
import type { Prompt, Folder, Category } from "@/lib/types";
import { cn } from "@/lib/utils";
import { handleActivationKey } from "@/lib/a11y";
import { toast } from "sonner";

interface PromptCardProps {
  prompt: Prompt;
  folders?: Folder[];
  onMove?: () => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
}

function formatMetaDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PromptCard(props: PromptCardProps) {
  return usePromptCardView(props);
}

function usePromptCardView({
  prompt,
  folders = [],
  onMove,
  selectionMode,
  isSelected,
  onToggleSelect,
}: PromptCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const thumbnail = prompt.images?.[0]?.url ?? null;
  const visibleCategories = prompt.categories.slice(0, 2);
  const hiddenCategoryCount = Math.max(0, prompt.categories.length - 2);

  const handleMove = async (folderId: number | null) => {
    try {
      await api.put(
        `/prompts/${prompt.id}`,
        {
          title: prompt.title,
          description: prompt.description,
          negative_prompt: prompt.negative_prompt,
          positive_prompts: prompt.positive_prompts.map((p) => p.content),
          categories: prompt.categories.map((c) => c.name),
          tags: prompt.tags.map((t) => t.name),
          is_nsfw: prompt.is_nsfw,
          prompt_type: prompt.prompt_type,
          folder_id: folderId,
        },
        privateSessionRequest,
      );
      onMove?.();
      setShowMoveModal(false);
    } catch (e) {
      console.error("Failed to move prompt", e);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/prompts/${prompt.id}`, privateSessionRequest);
      onMove?.();
      setShowDeleteModal(false);
    } catch (e) {
      console.error("Failed to delete", e);
    }
  };

  const handleToggleHidden = async () => {
    try {
      await bulkHide({
        prompt_ids: [prompt.id],
        folder_ids: [],
        hidden: !prompt.is_hidden,
      });
      toast.success(prompt.is_hidden ? "Prompt restored" : "Prompt hidden");
      onMove?.();
    } catch {
      toast.error("Failed to update visibility");
    }
    setIsOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelect) {
      e.preventDefault();
      e.stopPropagation();
      onToggleSelect(prompt.id);
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (!selectionMode || !onToggleSelect) return;
    handleActivationKey(e, () => onToggleSelect(prompt.id));
  };

  const selectionLabel = `${isSelected ? "Deselect" : "Select"} ${prompt.title}`;

  return (
    <>
      <div
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role={selectionMode ? "button" : undefined}
        tabIndex={selectionMode ? 0 : undefined}
        aria-pressed={selectionMode ? !!isSelected : undefined}
        aria-label={selectionMode ? selectionLabel : undefined}
        className={cn(
          "group relative block overflow-hidden rounded-2xl border border-pa-border bg-pa-paper shadow-[0_1px_2px_rgba(11,20,43,0.04)] transition-[border-color,box-shadow,opacity,transform] duration-(--pa-motion-base) ease-(--pa-ease-standard) hover:-translate-y-0.5 hover:border-pa-border-strong hover:shadow-pa-card-hover",
          selectionMode && "cursor-pointer",
          isSelected && "border-pa-primary ring-2 ring-pa-primary/15",
          prompt.is_hidden && "opacity-85",
        )}
      >
        {selectionMode && (
          <div className="absolute left-2.5 top-2.5 z-20">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-pa-sm border-2 transition-[background-color,border-color,color,box-shadow]",
                isSelected
                  ? "border-pa-primary bg-pa-primary text-pa-paper shadow-pa-subtle"
                  : "border-pa-border-strong bg-pa-surface/90 backdrop-blur-sm dark:border-pa-text/30 dark:bg-pa-text/10",
              )}
            >
              {isSelected && (
                <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
        )}

        {prompt.is_hidden && !selectionMode && (
          <div className="absolute left-2.5 top-2.5 z-10">
            <Badge variant="hidden" size="sm">
              <EyeOff className="mr-1 h-3 w-3" />
              Hidden
            </Badge>
          </div>
        )}

        {prompt.is_hidden && selectionMode && (
          <div className="absolute left-9 top-2.5 z-10 rounded-pa-sm bg-pa-warning p-0.5" title="Hidden">
            <EyeOff className="h-3 w-3 text-white" />
          </div>
        )}

        {prompt.is_hidden && (
          <div className="pointer-events-none absolute inset-0 z-1 bg-pa-paper/45 backdrop-blur-[1px] dark:bg-pa-cream/30" />
        )}

        {!selectionMode && (
          <div
            className="absolute right-2.5 top-2.5 z-10 translate-y-2 scale-95 opacity-0 transition-[opacity,transform] duration-300 ease-(--pa-ease-emphasized) group-hover:translate-y-0 group-hover:scale-100 group-hover:opacity-100"
            onClick={(e) => e.preventDefault()}
          >
            <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
              <Popover.Trigger asChild>
                <button
                  aria-label="Prompt actions"
                  type="button"
                  className="cursor-pointer rounded-pa-sm border border-pa-border/80 bg-pa-paper/95 p-1.5 text-pa-muted shadow-pa-subtle backdrop-blur-md transition-transform hover:scale-105 hover:text-pa-text"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content
                  className="z-50 w-44 rounded-pa-lg border border-pa-border bg-pa-paper p-1.5 shadow-pa-float"
                  align="end"
                  sideOffset={4}
                >
                  <div className="flex flex-col gap-0.5">
                    <Link
                      href={`/prompts/${prompt.id}`}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-3 py-2 text-left text-sm text-pa-muted transition-colors hover:bg-pa-surface hover:text-pa-text"
                    >
                      <Edit2 className="h-3.5 w-3.5" /> Edit / View
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setShowMoveModal(true);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-3 py-2 text-left text-sm text-pa-muted transition-colors hover:bg-pa-surface hover:text-pa-text"
                    >
                      <FolderInput className="h-3.5 w-3.5" /> Move to folder
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleHidden}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-3 py-2 text-left text-sm text-pa-muted transition-colors hover:bg-pa-surface hover:text-pa-text"
                    >
                      {prompt.is_hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      {prompt.is_hidden ? "Show" : "Hide"}
                    </button>
                    <div className="mx-2 my-1 h-px bg-pa-border" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setShowDeleteModal(true);
                      }}
                      className="flex w-full cursor-pointer items-center gap-2.5 rounded-pa-sm px-3 py-2 text-left text-sm text-pa-danger transition-colors hover:bg-pa-danger-soft"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}

        <Link href={`/prompts/${prompt.id}`} className={cn("block", selectionMode && "pointer-events-none")}>
          <div className="relative aspect-4/3 overflow-hidden bg-pa-surface">
            {thumbnail ? (
              <AuthenticatedImage
                src={thumbnail}
                alt={prompt.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-pa-muted-soft">
                <TerminalSquare className="h-7 w-7 opacity-50" strokeWidth={1.5} />
              </div>
            )}
          </div>

          <div className="space-y-2 p-3.5">
            <div className="flex items-start gap-2">
              <h3 className="line-clamp-2 flex-1 text-[13px] font-semibold leading-snug text-pa-text">
                {prompt.title}
              </h3>
              <Badge
                variant={prompt.prompt_type === "json" ? "json" : "standard"}
                size="sm"
                className="shrink-0 rounded-md px-1.5"
              >
                {prompt.prompt_type === "json" ? "JSON" : "Std"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-x-1.5 text-[11px] text-pa-muted-soft">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatMetaDate(prompt.created_at)}
              </span>
              <span className="text-pa-muted-soft">·</span>
              <span className="inline-flex items-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {prompt.images?.length ?? 0} {(prompt.images?.length ?? 0) === 1 ? "image" : "images"}
              </span>
              {prompt.variant_count > 0 && (
                <>
                  <span className="text-pa-muted-soft">·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <GitBranch className="h-3 w-3" />
                    {prompt.variant_count} variants
                  </span>
                </>
              )}
            </div>

            {visibleCategories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {visibleCategories.map((cat: Category) => (
                  <span
                    key={cat.id}
                    className="rounded-md bg-pa-soft-blue px-1.5 py-0.5 text-[10px] font-medium text-pa-muted"
                  >
                    {cat.name}
                  </span>
                ))}
                {hiddenCategoryCount > 0 && (
                  <Badge variant="default" size="sm">
                    +{hiddenCategoryCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Link>
      </div>

      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Prompt">
        <div className="space-y-4">
          <p className="text-sm text-pa-muted">
            Select a destination folder for <strong>{prompt.title}</strong>.
          </p>
          <div className="max-h-75 space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleMove(null)}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-pa-lg border border-pa-border p-3 text-left transition-[background-color,border-color] hover:border-pa-border-strong hover:bg-pa-surface"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pa-soft-blue text-pa-muted group-hover:text-pa-text">
                <FolderIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-pa-text">Root Library (No Folder)</span>
            </button>

            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={() => handleMove(folder.id)}
                className="flex w-full cursor-pointer items-center gap-3 rounded-pa-lg border border-pa-border p-3 text-left transition-[background-color,border-color] hover:border-pa-border-strong hover:bg-pa-surface"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: folder.color }}
                >
                  <FolderIcon className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-pa-text">{folder.name}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowMoveModal(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Prompt"
        description={
          <>
            Are you sure you want to delete <strong>{prompt.title}</strong>? This action cannot be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
      />
    </>
  );
}
