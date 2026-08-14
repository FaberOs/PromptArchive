"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLibrary } from "@/hooks/useLibrary";
import { useSelection } from "@/hooks/useSelection";
import FolderGrid from "@/components/FolderGrid";
import { FolderGridSkeleton } from "@/components/skeletons/FolderGridSkeleton";
import { PageHeader } from "@/components/library/PageHeader";
import { PromptGrid } from "@/components/library/PromptGrid";
import { EmptyState } from "@/components/library/EmptyState";
import { SelectionToolbar } from "@/components/library/SelectionToolbar";
import { useSecurity } from "@/components/SecurityProvider";
import { Button } from "@/components/ui/Button";
import { HiddenModeBanner } from "@/components/HiddenModeBanner";
import { LibraryTemplate } from "@/components/templates/LibraryTemplate";
import { LibraryHeaderActions } from "@/components/templates/LibraryHeaderActions";
import { PrivateLibraryLockedTemplate } from "@/components/templates/PrivateLibraryLockedTemplate";
import { SelectionModeHint } from "@/components/templates/SelectionModeHint";
import { LibrarySectionHeader } from "@/components/library/LibrarySectionHeader";
import { ShieldAlert, Lock, KeyRound, Sparkles } from "lucide-react";
import { useHiddenItems } from "@/components/HiddenItemsProvider";
import PinModal from "@/components/PinModal";

export default function NsfwLibrary() {
  const router = useRouter();
  const { isNsfwUnlocked, lockNsfw } = useSecurity();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [isPinResetOpen, setIsPinResetOpen] = useState(false);
  const { showHidden, setShowHidden, toggleShowHidden } = useHiddenItems();

  const {
    search,
    setSearch,
    debouncedSearch,
    folders,
    prompts,
    total,
    loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    handleCreateFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    invalidateAll,
  } = useLibrary({
    isNsfw: true,
    currentFolderId,
    enabled: isNsfwUnlocked,
    showHidden,
  });

  const selection = useSelection(invalidateAll);

  if (!isNsfwUnlocked) {
    return (
      <PrivateLibraryLockedTemplate
        onBack={() => router.push("/")}
        onUnlockSuccess={() => {}}
        onClose={() => router.push("/")}
      />
    );
  }

  return (
    <>
      <LibraryTemplate
        header={
          <PageHeader
            variant="private"
            title="Private Library"
            subtitle="Your local private vault"
            icon={
              <div className="rounded-pa-lg bg-pa-private-soft p-2">
                <ShieldAlert className="h-6 w-6 text-pa-private" />
              </div>
            }
            actions={
              <LibraryHeaderActions
                search={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search private prompts..."
                newPromptHref="/create?nsfw=1"
                showHidden={showHidden}
                onToggleShowHidden={toggleShowHidden}
                selectionMode={selection.selectionMode}
                onToggleSelectionMode={() =>
                  selection.selectionMode ? selection.clearSelection() : selection.enterSelectionMode()
                }
                extraActions={
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsPinResetOpen(true)}
                      title="Reset PIN"
                      aria-label="Reset PIN"
                      className="h-10 w-10 p-0"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsPinResetOpen(false);
                        lockNsfw();
                      }}
                      title="Lock Library"
                      aria-label="Lock Library"
                      className="h-10 w-10 p-0"
                    >
                      <Lock className="h-4 w-4" />
                    </Button>
                  </>
                }
              />
            }
          />
        }
        banners={
          <>
            {showHidden && <HiddenModeBanner onExit={() => setShowHidden(false)} />}
            {selection.selectionMode && selection.totalSelected === 0 && <SelectionModeHint />}
          </>
        }
        folders={
          !debouncedSearch &&
          (loading ? (
            <FolderGridSkeleton />
          ) : (
            <div>
              <LibrarySectionHeader title="Collections" badge={folders.length} />
              <FolderGrid
                folders={folders}
                currentFolderId={currentFolderId}
                onSelectFolder={(id) => {
                  selection.clearSelection();
                  setCurrentFolderId(id);
                }}
                onCreateFolder={handleCreateFolder}
                onUpdateFolder={handleUpdateFolder}
                onDeleteFolder={handleDeleteFolder}
                selectionMode={selection.selectionMode}
                selectedFolderIds={selection.selectedFolderIds}
                onToggleFolderSelect={selection.toggleFolder}
                onRefresh={invalidateAll}
                isPrivateLibrary
              />
            </div>
          ))
        }
        prompts={
          <div>
            <LibrarySectionHeader title="Prompts" badge={total} />
            <PromptGrid
              prompts={prompts}
              folders={folders}
              loading={loading}
              total={total}
              debouncedSearch={debouncedSearch}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              error={error ? "Unable to load the private library." : null}
              onRetry={invalidateAll}
              onMove={invalidateAll}
              selectionMode={selection.selectionMode}
              selectedPromptIds={selection.selectedPromptIds}
              onTogglePromptSelect={selection.togglePrompt}
              emptyState={
                <EmptyState
                  icon={<Sparkles className="h-7 w-7 text-pa-private" />}
                  title="No private prompts"
                  description="Create your first private prompt to get started."
                  iconClassName="bg-pa-private-soft"
                />
              }
            />
          </div>
        }
        toolbar={<SelectionToolbar selection={selection} folders={folders} showHidden={showHidden} />}
      />
      <PinModal
        isOpen={isPinResetOpen}
        mode="reset"
        onClose={() => setIsPinResetOpen(false)}
        onSuccess={() => setIsPinResetOpen(false)}
      />
    </>
  );
}
