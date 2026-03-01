"use client";

import { useState } from 'react';
import { Trash2, EyeOff, Eye, FolderInput, X, Folder as FolderIcon, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import type { UseSelectionReturn } from '@/hooks/useSelection';
import type { Folder } from '@/lib/types';

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
    promptCount > 0 ? `${promptCount} prompt${promptCount > 1 ? 's' : ''}` : '',
    folderCount > 0 ? `${folderCount} folder${folderCount > 1 ? 's' : ''}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300">
          {/* Count */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-slate-700 dark:border-slate-300">
            <CheckSquare className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{label}</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            {/* Hide / Unhide */}
            {showHidden ? (
              <button
                onClick={() => handleBulkHide(false)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                title="Restore selected"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Restore</span>
              </button>
            ) : (
              <button
                onClick={() => handleBulkHide(true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                title="Hide selected"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hide</span>
              </button>
            )}

            {/* Move (only if prompts selected) */}
            {promptCount > 0 && (
              <button
                onClick={() => setShowMoveModal(true)}
                disabled={loading}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
                title="Move selected"
              >
                <FolderInput className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Move</span>
              </button>
            )}

            {/* Delete */}
            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={loading}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs sm:text-sm rounded-lg text-red-400 dark:text-red-600 hover:bg-red-900/40 dark:hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
              title="Delete selected"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Delete</span>
            </button>
          </div>

          {/* Close */}
          <div className="pl-1.5 sm:pl-2 border-l border-slate-700 dark:border-slate-300">
            <button
              onClick={clearSelection}
              className="p-1.5 rounded-lg hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors cursor-pointer"
              title="Cancel selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Move Modal */}
      <Modal isOpen={showMoveModal} onClose={() => setShowMoveModal(false)} title="Move Prompts">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-300">
            Move <strong>{promptCount} prompt{promptCount > 1 ? 's' : ''}</strong> to:
          </p>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            <button
              onClick={async () => { setShowMoveModal(false); await handleBulkMove(null); }}
              className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all text-left group cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-slate-400 dark:text-slate-300 group-hover:text-slate-600">
                <FolderIcon className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Root Library (No Folder)</span>
            </button>
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={async () => { setShowMoveModal(false); await handleBulkMove(folder.id); }}
                className="flex items-center gap-3 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-600/50 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-all text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: folder.color }}>
                  <FolderIcon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{folder.name}</span>
              </button>
            ))}
          </div>
          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowMoveModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Selected Items">
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-200">
            Are you sure you want to delete <strong>{label}</strong>?
            {folderCount > 0 && (
              <span className="block mt-1 text-sm text-amber-600 dark:text-amber-400">
                Deleting folders will also delete all prompts inside them.
              </span>
            )}
            <span className="block mt-1 text-sm text-red-500">This action cannot be undone.</span>
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button
              variant="destructive"
              isLoading={loading}
              onClick={async () => { setShowDeleteModal(false); await handleBulkDelete(); }}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
