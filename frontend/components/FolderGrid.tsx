"use client";

import { useState } from "react";
import { ArrowLeft, FolderOpen, FilePlus, X, Check } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { cn } from "@/lib/utils";
import { Modal } from "./ui/Modal";
import { useRouter } from "next/navigation";
import type { Folder as FolderType } from "@/lib/types";
import { bulkHide } from "@/lib/api";
import { toast } from "sonner";
import { ARCHIVE_FOLDER_COLORS } from "@/lib/folderColors";
import { FieldGroup } from "./ui/FieldGroup";
import { FolderCard } from "./library/FolderCard";
import { NewFolderCard } from "./library/NewFolderCard";

const FOLDER_COLORS = [...ARCHIVE_FOLDER_COLORS];

interface FolderGridProps {
  folders: FolderType[];
  currentFolderId: number | null;
  onSelectFolder: (id: number | null) => void;
  onCreateFolder: (name: string, color: string) => void;
  onUpdateFolder: (id: number, name: string, color: string) => void;
  onDeleteFolder: (id: number) => void;
  selectionMode?: boolean;
  selectedFolderIds?: Set<number>;
  onToggleFolderSelect?: (id: number) => void;
  onRefresh?: () => void;
  isPrivateLibrary?: boolean;
}

export default function FolderGrid({
  folders,
  currentFolderId,
  onSelectFolder,
  onCreateFolder,
  onUpdateFolder,
  onDeleteFolder,
  selectionMode,
  selectedFolderIds = new Set(),
  onToggleFolderSelect,
  onRefresh,
  isPrivateLibrary = false,
}: FolderGridProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState<string>(ARCHIVE_FOLDER_COLORS[0]);
  const [editingFolder, setEditingFolder] = useState<FolderType | null>(null);

  const colors = FOLDER_COLORS;

  const handleCreate = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName, newFolderColor);
    setNewFolderName("");
    setNewFolderColor(ARCHIVE_FOLDER_COLORS[0]);
    setIsCreating(false);
  };

  const handleUpdate = () => {
    if (!editingFolder || !editingFolder.name.trim()) return;
    onUpdateFolder(editingFolder.id, editingFolder.name, editingFolder.color);
    setEditingFolder(null);
  };

  if (currentFolderId !== null) {
    const currentFolder = folders.find((f) => f.id === currentFolderId);
    return (
      <div
        className={cn(
          "mb-6 flex flex-col gap-3 rounded-pa-xl border border-pa-border bg-pa-paper p-4 shadow-pa-subtle sm:flex-row sm:items-center sm:justify-between",
          currentFolder?.is_hidden && "border-pa-warning/30",
          isPrivateLibrary && "border-pa-private/20",
        )}
      >
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSelectFolder(null)}
            className="self-start text-pa-muted hover:text-pa-text"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <div className="hidden h-6 w-px bg-pa-border sm:block" />
          <div className="flex min-w-0 items-center gap-2 text-lg font-bold text-pa-text">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-pa-md"
              style={{ backgroundColor: `${currentFolder?.color}20` }}
            >
              <FolderOpen className="h-4 w-4" style={{ color: currentFolder?.color }} />
            </div>
            <span className="truncate">{currentFolder?.name}</span>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => router.push(`/create?folder_id=${currentFolderId}${isPrivateLibrary ? "&nsfw=1" : ""}`)}
          className="w-full sm:w-auto"
        >
          <FilePlus className="mr-2 h-4 w-4" /> New Prompt
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <NewFolderCard onClick={() => setIsCreating(true)} />

        {folders.map((folder) => {
          const isFolderSelected = selectedFolderIds.has(folder.id);

          const activateFolder = () => {
            if (selectionMode && onToggleFolderSelect) {
              onToggleFolderSelect(folder.id);
            } else if (!editingFolder) {
              onSelectFolder(folder.id);
            }
          };

          return (
            <div className="relative" key={folder.id}>
              <FolderCard
                id={folder.id}
                name={folder.name}
                promptCount={folder.prompt_count ?? 0}
                previewImages={folder.preview_images}
                color={folder.color}
                state={{
                  isHidden: folder.is_hidden,
                  isPrivate: isPrivateLibrary || folder.is_nsfw,
                  isSelected: isFolderSelected,
                  selectionMode,
                  isEditing: editingFolder?.id === folder.id,
                }}
                onSelect={activateFolder}
                onEdit={() => setEditingFolder(folder)}
                onToggleVisibility={async () => {
                  try {
                    await bulkHide({
                      prompt_ids: [],
                      folder_ids: [folder.id],
                      hidden: !folder.is_hidden,
                    });
                    toast.success(folder.is_hidden ? "Folder restored" : "Folder hidden");
                    onRefresh?.();
                  } catch {
                    toast.error("Failed to update visibility");
                  }
                }}
                onDelete={() => onDeleteFolder(folder.id)}
              />

              {editingFolder?.id === folder.id && (
                <div
                  className="absolute inset-0 z-10 flex flex-col gap-2 rounded-2xl bg-pa-paper p-3 shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Input
                    value={editingFolder.name}
                    onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex gap-1">
                      {colors.slice(0, 6).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setEditingFolder({ ...editingFolder, color: c })}
                          className={cn(
                            "h-3.5 w-3.5 rounded-full",
                            editingFolder.color === c &&
                              "ring-1 ring-pa-border-strong ring-offset-1 ring-offset-pa-paper",
                          )}
                          style={{ backgroundColor: c }}
                          aria-label={`Set folder color ${c}`}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingFolder(null)}
                        className="rounded p-1 text-pa-muted hover:bg-pa-surface hover:text-pa-text"
                        aria-label="Cancel edit"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleUpdate}
                        className="rounded p-1 text-pa-success hover:bg-pa-success-soft"
                        aria-label="Save folder"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Create New Folder">
        <div className="space-y-6">
          <FieldGroup label="Folder Name" required htmlFor="new-folder-name">
            <Input
              id="new-folder-name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Character Portraits"
              autoFocus
            />
          </FieldGroup>
          <FieldGroup
            label="Color Tag"
            info="Pick a color to identify this folder in the library."
            htmlFor="new-folder-color"
          >
            <div id="new-folder-color" className="flex flex-wrap gap-3" role="radiogroup" aria-label="Folder color">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={newFolderColor === c}
                  onClick={() => setNewFolderColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform hover:scale-110",
                    newFolderColor === c && "scale-110 ring-2 ring-pa-border-strong ring-offset-2 ring-offset-pa-paper",
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </FieldGroup>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Folder</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
