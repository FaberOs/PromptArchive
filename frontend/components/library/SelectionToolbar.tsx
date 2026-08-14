"use client";

import { useState } from "react";
import { Trash2, EyeOff, Eye, FolderInput, X, Folder as FolderIcon, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { UseSelectionReturn } from "@/hooks/useSelection";
import type { Folder } from "@/lib/types";

interface SelectionToolbarProps {
  selection: UseSelectionReturn;
  folders: Folder[];
  showHidden: boolean;
}

export function SelectionToolbar({ selection, folders, showHidden }: SelectionToolbarProps) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    totalSelected,
    selectedPromptIds,
    selectedFolderIds,
    loading,
    clearSelection,
    handleBulkHide,
    handleBulkDelete,
    handleBulkMove,
  } = selection;

  if (totalSelected === 0) return null;

  const promptCount = selectedPromptIds.size;
  const folderCount = selectedFolderIds.size;

  const label = [
    promptCount > 0 ? `${promptCount} prompt${promptCount > 1 ? "s" : ""}` : "",
    folderCount > 0 ? `${folderCount} folder${folderCount > 1 ? "s" : ""}` : "",
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <div className="fixed inset-x-3 bottom-4 z-pa-fixed-content sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2">
        <div className="mx-auto flex max-w-full items-center gap-1 overflow-x-auto rounded-pa-2xl border border-pa-ink/20 bg-pa-ink px-2.5 py-2 text-pa-cream shadow-pa-float sm:gap-2 sm:px-4 sm:py-2.5">
          <div className="flex shrink-0 items-center gap-1.5 border-r border-pa-cream/20 pr-2 sm:gap-2 sm:pr-3">
            <CheckSquare className="h-4 w-4 shrink-0" />
            <span className="max-w-[9rem] truncate text-xs font-medium sm:max-w-none sm:text-sm">{label}</span>
          </div>

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            {showHidden ? (
              <button
                type="button"
                onClick={() => handleBulkHide(false)}
                disabled={loading}
                className="flex cursor-pointer items-center gap-1.5 rounded-pa-md px-2 py-1.5 text-xs transition-colors hover:bg-pa-cream/10 disabled:opacity-50 sm:px-3 sm:text-sm"
                title="Restore selected"
                aria-label="Restore selected"
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Restore</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleBulkHide(true)}
                disabled={loading}
                className="flex cursor-pointer items-center gap-1.5 rounded-pa-md px-2 py-1.5 text-xs transition-colors hover:bg-pa-cream/10 disabled:opacity-50 sm:px-3 sm:text-sm"
                title="Hide selected"
                aria-label="Hide selected"
              >
                <EyeOff className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Hide</span>
              </button>
            )}

            {promptCount > 0 && (
              <button
                type="button"
                onClick={() => setShowMoveModal(true)}
                disabled={loading}
                className="flex cursor-pointer items-center gap-1.5 rounded-pa-md px-2 py-1.5 text-xs transition-colors hover:bg-pa-cream/10 disabled:opacity-50 sm:px-3 sm:text-sm"
                title="Move selected"
                aria-label="Move selected"
              >
                <FolderInput className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Move</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="flex cursor-pointer items-center gap-1.5 rounded-pa-md px-2 py-1.5 text-xs text-pa-danger-soft transition-colors hover:bg-pa-danger/20 disabled:opacity-50 sm:px-3 sm:text-sm"
              title="Delete selected"
              aria-label="Delete selected"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          <div className="shrink-0 border-l border-pa-cream/20 pl-1.5 sm:pl-2">
            <button
              type="button"
              onClick={clearSelection}
              className="cursor-pointer rounded-pa-md p-1.5 transition-colors hover:bg-pa-cream/10"
              title="Cancel selection"
              aria-label="Cancel selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Prompts">
        <div className="space-y-4">
          <p className="text-sm text-pa-muted">
            Move{" "}
            <strong className="text-pa-text">
              {promptCount} prompt{promptCount > 1 ? "s" : ""}
            </strong>{" "}
            to:
          </p>
          <div className="max-h-[min(300px,50dvh)] space-y-2 overflow-y-auto">
            <button
              type="button"
              onClick={async () => {
                setShowMoveModal(false);
                await handleBulkMove(null);
              }}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-pa-xl border border-pa-border p-3 text-left transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:border-pa-border-strong hover:bg-pa-surface"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pa-surface text-pa-muted-soft group-hover:text-pa-muted">
                <FolderIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-pa-text">Root Library (No Folder)</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                type="button"
                onClick={async () => {
                  setShowMoveModal(false);
                  await handleBulkMove(folder.id);
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-pa-xl border border-pa-border p-3 text-left transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:border-pa-border-strong hover:bg-pa-surface"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-white"
                  style={{ backgroundColor: folder.color }}
                >
                  <FolderIcon className="h-4 w-4" />
                </div>
                <span className="truncate text-sm font-medium text-pa-text">{folder.name}</span>
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
        onConfirm={async () => {
          setShowDeleteModal(false);
          await handleBulkDelete();
        }}
        title="Delete Selected Items"
        description={
          <>
            Are you sure you want to delete <strong>{label}</strong>?
            {folderCount > 0 && (
              <span className="mt-1 block text-sm text-pa-warning">
                Deleting folders will also delete all prompts inside them.
              </span>
            )}
            <span className="mt-1 block text-sm text-pa-danger">This action cannot be undone.</span>
          </>
        }
        confirmLabel="Delete"
        destructive
        isLoading={loading}
      />
    </>
  );
}
