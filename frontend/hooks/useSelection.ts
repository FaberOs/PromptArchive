import { useState, useCallback, useMemo } from 'react';
import { bulkHide, bulkDelete, bulkMove } from '@/lib/api';
import { toast } from 'sonner';

export interface SelectionState {
  selectedPromptIds: Set<number>;
  selectedFolderIds: Set<number>;
}

export function useSelection(onComplete: () => void) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<number>>(new Set());
  const [selectedFolderIds, setSelectedFolderIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const totalSelected = selectedPromptIds.size + selectedFolderIds.size;

  const togglePrompt = useCallback((id: number) => {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleFolder = useCallback((id: number) => {
    setSelectedFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedPromptIds(new Set());
    setSelectedFolderIds(new Set());
    setSelectionMode(false);
  }, []);

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true);
  }, []);

  // Select all visible prompts
  const selectAllPrompts = useCallback((ids: number[]) => {
    setSelectedPromptIds(new Set(ids));
  }, []);

  const handleBulkHide = useCallback(async (hidden: boolean) => {
    if (totalSelected === 0) return;
    setLoading(true);
    try {
      await bulkHide({
        prompt_ids: Array.from(selectedPromptIds),
        folder_ids: Array.from(selectedFolderIds),
        hidden,
      });
      toast.success(hidden ? 'Items hidden' : 'Items restored');
      clearSelection();
      onComplete();
    } catch {
      toast.error('Failed to update visibility');
    } finally {
      setLoading(false);
    }
  }, [selectedPromptIds, selectedFolderIds, totalSelected, clearSelection, onComplete]);

  const handleBulkDelete = useCallback(async () => {
    if (totalSelected === 0) return;
    setLoading(true);
    try {
      await bulkDelete({
        prompt_ids: Array.from(selectedPromptIds),
        folder_ids: Array.from(selectedFolderIds),
      });
      toast.success('Items deleted');
      clearSelection();
      onComplete();
    } catch {
      toast.error('Failed to delete items');
    } finally {
      setLoading(false);
    }
  }, [selectedPromptIds, selectedFolderIds, totalSelected, clearSelection, onComplete]);

  const handleBulkMove = useCallback(async (folderId: number | null) => {
    if (selectedPromptIds.size === 0) return;
    setLoading(true);
    try {
      await bulkMove({
        prompt_ids: Array.from(selectedPromptIds),
        folder_id: folderId,
      });
      toast.success('Prompts moved');
      clearSelection();
      onComplete();
    } catch {
      toast.error('Failed to move prompts');
    } finally {
      setLoading(false);
    }
  }, [selectedPromptIds, clearSelection, onComplete]);

  return useMemo(() => ({
    selectionMode,
    selectedPromptIds,
    selectedFolderIds,
    totalSelected,
    loading,
    togglePrompt,
    toggleFolder,
    clearSelection,
    enterSelectionMode,
    selectAllPrompts,
    handleBulkHide,
    handleBulkDelete,
    handleBulkMove,
  }), [
    selectionMode, selectedPromptIds, selectedFolderIds, totalSelected, loading,
    togglePrompt, toggleFolder, clearSelection, enterSelectionMode, selectAllPrompts,
    handleBulkHide, handleBulkDelete, handleBulkMove,
  ]);
}

export type UseSelectionReturn = ReturnType<typeof useSelection>;
