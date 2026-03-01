"use client";

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/useLibrary';
import { useSelection } from '@/hooks/useSelection';
import FolderGrid from '@/components/FolderGrid';
import { FolderGridSkeleton } from '@/components/skeletons/FolderGridSkeleton';
import { PageHeader } from '@/components/library/PageHeader';
import { SearchInput } from '@/components/library/SearchInput';
import { PromptGrid } from '@/components/library/PromptGrid';
import { EmptyState } from '@/components/library/EmptyState';
import { SelectionToolbar } from '@/components/library/SelectionToolbar';
import { Sparkles, CheckSquare, EyeOff, Eye } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdParam = searchParams.get('folder_id');
  const currentFolderId = folderIdParam ? parseInt(folderIdParam) : null;
  const showHiddenParam = searchParams.get('show_hidden') === '1';
  const [showHidden, setShowHidden] = useState(showHiddenParam);

  // Sync showHidden when navigating back from a hidden folder breadcrumb
  useEffect(() => {
    if (showHiddenParam && !showHidden) setShowHidden(true);
  }, [showHiddenParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    search, setSearch, debouncedSearch,
    folders, prompts, total, loading,
    fetchNextPage, hasNextPage, isFetchingNextPage,
    handleCreateFolder, handleUpdateFolder, handleDeleteFolder, invalidateAll,
  } = useLibrary({ isNsfw: false, currentFolderId, showHidden });

  const selection = useSelection(invalidateAll);

  const handleSelectFolder = (id: number | null) => {
    selection.clearSelection();
    if (id === null) {
      router.push('/');
    } else {
      const params = new URLSearchParams();
      params.set('folder_id', String(id));
      if (showHidden) params.set('show_hidden', '1');
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library"
        subtitle="Manage and organize your generation prompts."
        actions={
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search prompts..."
              className="w-full md:w-96"
            />
            <button
              onClick={() => setShowHidden(!showHidden)}
              className={`p-2.5 rounded-lg border transition-colors ${
                showHidden
                  ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                  : 'border-slate-200 dark:border-slate-600/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              title={showHidden ? 'Showing hidden items' : 'Show hidden items'}
            >
              {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              onClick={() => selection.selectionMode ? selection.clearSelection() : selection.enterSelectionMode()}
              className={`p-2.5 rounded-lg border transition-colors ${
                selection.selectionMode
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-600/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
              title={selection.selectionMode ? 'Exit selection mode' : 'Select multiple items'}
            >
              <CheckSquare className="w-4 h-4" />
            </button>
          </div>
        }
      />

      {showHidden && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/50 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
          <EyeOff className="w-4 h-4 flex-shrink-0" />
          <span>Showing hidden items. These are normally invisible in the library.</span>
        </div>
      )}

      {selection.selectionMode && selection.totalSelected === 0 && (
        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/15 border border-blue-200 dark:border-blue-800/50 rounded-lg text-blue-700 dark:text-blue-400 text-sm">
          <CheckSquare className="w-4 h-4 flex-shrink-0" />
          <span>Click on prompts or folders to select them. Use the toolbar to perform bulk actions.</span>
        </div>
      )}

      {!debouncedSearch &&
        (loading ? (
          <FolderGridSkeleton />
        ) : (
          <FolderGrid
            folders={folders}
            currentFolderId={currentFolderId}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={handleCreateFolder}
            onUpdateFolder={handleUpdateFolder}
            onDeleteFolder={handleDeleteFolder}
            selectionMode={selection.selectionMode}
            selectedFolderIds={selection.selectedFolderIds}
            onToggleFolderSelect={selection.toggleFolder}
            onRefresh={invalidateAll}
          />
        ))}

      <PromptGrid
        prompts={prompts}
        folders={folders}
        loading={loading}
        total={total}
        debouncedSearch={debouncedSearch}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        onMove={invalidateAll}
        selectionMode={selection.selectionMode}
        selectedPromptIds={selection.selectedPromptIds}
        onTogglePromptSelect={selection.togglePrompt}
        emptyState={
          <EmptyState
            icon={<Sparkles className="w-7 h-7 text-slate-400" />}
            title="No prompts yet"
            description="Create your first prompt or move existing ones into this folder."
          />
        }
      />

      <SelectionToolbar selection={selection} folders={folders} showHidden={showHidden} />
    </div>
  );
}
