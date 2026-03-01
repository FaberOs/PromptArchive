"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLibrary } from '@/hooks/useLibrary';
import { useSelection } from '@/hooks/useSelection';
import FolderGrid from '@/components/FolderGrid';
import { FolderGridSkeleton } from '@/components/skeletons/FolderGridSkeleton';
import { PageHeader } from '@/components/library/PageHeader';
import { SearchInput } from '@/components/library/SearchInput';
import { PromptGrid } from '@/components/library/PromptGrid';
import { EmptyState } from '@/components/library/EmptyState';
import { SelectionToolbar } from '@/components/library/SelectionToolbar';
import { useSecurity } from '@/components/SecurityProvider';
import PinModal from '@/components/PinModal';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Lock, Sparkles, CheckSquare, EyeOff, Eye } from 'lucide-react';

export default function NsfwLibrary() {
  const router = useRouter();
  const { isNsfwUnlocked, lockNsfw } = useSecurity();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    if (!isNsfwUnlocked) setIsPinModalOpen(true);
  }, [isNsfwUnlocked]);

  const {
    search, setSearch, debouncedSearch,
    folders, prompts, total, loading,
    fetchNextPage, hasNextPage, isFetchingNextPage,
    handleCreateFolder, handleUpdateFolder, handleDeleteFolder, invalidateAll,
  } = useLibrary({ isNsfw: true, currentFolderId, enabled: isNsfwUnlocked, showHidden });

  const selection = useSelection(invalidateAll);

  // ── Locked state ──
  if (!isNsfwUnlocked) {
    return (
      <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">NSFW Library Locked</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          This content is protected. Please enter your PIN to access.
        </p>
        <Button onClick={() => setIsPinModalOpen(true)} className="mt-4">Enter PIN</Button>
        <PinModal
          isOpen={isPinModalOpen}
          onClose={() => { setIsPinModalOpen(false); router.push('/'); }}
          onSuccess={() => setIsPinModalOpen(false)}
        />
      </div>
    );
  }

  // ── Unlocked state ──
  return (
    <div className="space-y-6">
      <PageHeader
        title="NSFW Library"
        subtitle="Private collection."
        icon={
          <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
        }
        actions={
          <div className="flex gap-2 w-full md:w-auto">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search private prompts..."
              className="w-full md:w-96"
              inputClassName="border-red-200 dark:border-red-900 focus-visible:ring-red-500"
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
            <Button variant="ghost" onClick={lockNsfw} title="Lock Library">
              <Lock className="w-4 h-4" />
            </Button>
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
            onSelectFolder={(id) => { selection.clearSelection(); setCurrentFolderId(id); }}
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
            icon={<Sparkles className="w-7 h-7 text-red-400" />}
            title="No private prompts"
            description="Create your first private prompt to get started."
            iconClassName="bg-red-50 dark:bg-red-900/20"
          />
        }
      />

      <SelectionToolbar selection={selection} folders={folders} showHidden={showHidden} />
    </div>
  );
}
