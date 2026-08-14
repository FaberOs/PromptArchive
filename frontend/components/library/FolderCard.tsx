import { FolderPreviewPocket } from "./FolderPreviewPocket";
import { FolderTab } from "./FolderTab";
import { EyeOff, MoreVertical, Edit2, Trash2, Eye, Lock } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
import { handleActivationKey } from "@/lib/a11y";
import { resolveFolderAccent } from "@/lib/folderAccent";

interface FolderCardProps {
  id: number;
  name: string;
  promptCount: number;
  previewImages?: string[];
  color: string;
  state?: {
    isHidden?: boolean;
    isPrivate?: boolean;
    isSelected?: boolean;
    selectionMode?: boolean;
    isEditing?: boolean;
  };
  onSelect?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
}

export function FolderCard({
  name,
  promptCount,
  previewImages,
  color,
  state,
  onSelect,
  onEdit,
  onDelete,
  onToggleVisibility,
}: FolderCardProps) {
  const {
    isHidden = false,
    isPrivate = false,
    isSelected = false,
    selectionMode = false,
    isEditing = false,
  } = state ?? {};
  const { accent } = resolveFolderAccent(color, { isHidden, isPrivate });

  return (
    <article
      role={isEditing ? undefined : "button"}
      tabIndex={isEditing ? undefined : 0}
      aria-pressed={selectionMode ? isSelected : undefined}
      onKeyDown={(e) => {
        if (isEditing || !onSelect) return;
        handleActivationKey(e, onSelect);
      }}
      onClick={() => {
        if (!isEditing && onSelect) onSelect();
      }}
      className={cn(
        "group relative isolate h-[214px] w-full cursor-pointer overflow-visible",
        isHidden && "opacity-90",
      )}
    >
      <FolderTab
        accent={accent}
        frontClassName={cn(
          "border-x border-b border-pa-border",
          isEditing && "ring-2 ring-pa-primary/20",
          selectionMode && isSelected && "border-pa-primary ring-2 ring-pa-primary/15",
        )}
      >
        {!selectionMode && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-2.5 top-2.5 z-50 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Popover.Root>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-pa-border bg-pa-paper/90 text-pa-muted shadow-sm backdrop-blur-sm hover:text-pa-text"
                  aria-label="Folder actions"
                >
                  <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content
                  sideOffset={6}
                  align="end"
                  className="z-50 flex w-32 flex-col gap-0.5 rounded-xl border border-pa-border bg-pa-paper p-1 shadow-lg"
                >
                  {onEdit && (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-pa-text hover:bg-pa-surface"
                    >
                      <Edit2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Edit
                    </button>
                  )}

                  {onToggleVisibility && (
                    <button
                      type="button"
                      onClick={onToggleVisibility}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-pa-text hover:bg-pa-surface"
                    >
                      {isHidden ? (
                        <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
                      )}
                      {isHidden ? "Show" : "Hide"}
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      onClick={onDelete}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-pa-danger hover:bg-pa-danger-soft"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Delete
                    </button>
                  )}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        )}

        {isPrivate && !selectionMode && (
          <div className="absolute left-3 top-3 z-30 flex items-center gap-1 rounded-md bg-pa-private/95 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
            <Lock className="h-3 w-3" strokeWidth={2} />
            Private
          </div>
        )}

        {isHidden && !selectionMode && (
          <div
            className={cn(
              "absolute z-30 flex items-center gap-1 rounded-md bg-pa-warning/95 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm",
              isPrivate ? "left-3 top-8" : "left-3 top-3",
            )}
          >
            <EyeOff className="h-3 w-3" strokeWidth={2} />
            Hidden
          </div>
        )}

        {selectionMode && (
          <div className="absolute left-3 top-3 z-30">
            <div
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border-2 bg-pa-paper",
                isSelected ? "border-pa-primary bg-pa-primary text-pa-paper" : "border-pa-border-strong",
              )}
            >
              {isSelected && (
                <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" fill="none">
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

        <div className="relative flex min-h-0 flex-1 bg-pa-surface/80 px-3 pb-3 pt-3">
          {isHidden && <div className="pointer-events-none absolute inset-0 z-10 bg-pa-paper/35" />}

          <FolderPreviewPocket images={previewImages} isHidden={isHidden} accentColor={accent} />
        </div>

        <div className="min-h-[64px] shrink-0 border-t border-pa-border/70 bg-pa-paper px-4 pb-4 pt-3">
          <h3 className="truncate text-[13px] font-semibold text-pa-text" title={name}>
            {name}
          </h3>

          <p className="mt-1 text-[11px] leading-4 text-pa-muted">
            {promptCount} {promptCount === 1 ? "prompt" : "prompts"}
          </p>
        </div>
      </FolderTab>
    </article>
  );
}
