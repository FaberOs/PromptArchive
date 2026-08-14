"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLibrary } from "@/hooks/useLibrary";
import { useSelection } from "@/hooks/useSelection";
import FolderGrid from "@/components/FolderGrid";
import { FolderGridSkeleton } from "@/components/skeletons/FolderGridSkeleton";
import { PromptGrid } from "@/components/library/PromptGrid";
import { EmptyState } from "@/components/library/EmptyState";
import { SelectionToolbar } from "@/components/library/SelectionToolbar";
import { HiddenModeBanner } from "@/components/HiddenModeBanner";
import { LibraryTemplate } from "@/components/templates/LibraryTemplate";
import { LibrarySectionHeader } from "@/components/library/LibrarySectionHeader";
import { LibraryPageHeader } from "@/components/library/LibraryPageHeader";
import { PromptFiltersBar } from "@/components/library/PromptFiltersBar";
import { SelectionModeHint } from "@/components/templates/SelectionModeHint";
import { type PromptSort, type PromptTypeFilter } from "@/lib/libraryFilters";
import { Sparkles, ArrowRight, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useHiddenItems } from "@/components/HiddenItemsProvider";
import { useSecurity } from "@/components/SecurityProvider";
import { toast } from "sonner";

export default function HomePage() {
  return (
    <Suspense>
      <Home />
    </Suspense>
  );
}

function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderIdParam = searchParams.get("folder_id");
  const currentFolderId = folderIdParam ? parseInt(folderIdParam) : null;
  const artifactId = searchParams.get("artifactId")?.trim() ?? "";
  const { showHidden, toggleShowHidden } = useHiddenItems();
  const { isNsfwUnlocked } = useSecurity();
  const visibleShowHidden = showHidden && isNsfwUnlocked;

  const [promptFilter, setPromptFilter] = useState<PromptTypeFilter>("all");
  const [promptSort, setPromptSort] = useState<PromptSort>("newest");

  const handleToggleShowHidden = () => {
    if (!isNsfwUnlocked) {
      toast.error("Unlock the private library before viewing hidden items");
      return;
    }
    toggleShowHidden();
  };

  const handleImportArtifact = () => {
    if (!artifactId) return;
    const params = new URLSearchParams();
    params.set("artifactId", artifactId);
    if (currentFolderId !== null) {
      params.set("folder_id", String(currentFolderId));
    }
    router.push(`/create?${params.toString()}`);
  };

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
    isNsfw: false,
    currentFolderId,
    showHidden: visibleShowHidden,
    promptFilter: promptFilter === "hidden" && !isNsfwUnlocked ? "all" : promptFilter,
    promptSort,
  });

  const selection = useSelection(invalidateAll);

  const displayedPrompts = promptFilter === "hidden" && !isNsfwUnlocked ? [] : prompts;

  const handleSelectFolder = (id: number | null) => {
    selection.clearSelection();
    if (id === null) {
      router.push("/");
    } else {
      const params = new URLSearchParams();
      params.set("folder_id", String(id));
      router.push(`/?${params.toString()}`);
    }
  };

  return (
    <LibraryTemplate
      header={
        <LibraryPageHeader
          search={search}
          onSearchChange={setSearch}
          showHidden={visibleShowHidden}
          onToggleShowHidden={handleToggleShowHidden}
          selectionMode={selection.selectionMode}
          onToggleSelectionMode={() =>
            selection.selectionMode ? selection.clearSelection() : selection.enterSelectionMode()
          }
        />
      }
      banners={
        <>
          {visibleShowHidden && <HiddenModeBanner onExit={handleToggleShowHidden} />}

          {artifactId && (
            <div className="flex items-center justify-between gap-3 rounded-pa-lg border border-pa-primary/20 bg-pa-soft-blue px-3 py-2.5">
              <div className="flex min-w-0 items-center gap-2 text-pa-text">
                <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="truncate text-sm">Artifact received from another app.</span>
              </div>
              <Button size="sm" onClick={handleImportArtifact} rightIcon={<ArrowRight className="h-3 w-3" />}>
                Import
              </Button>
            </div>
          )}

          {selection.selectionMode && selection.totalSelected === 0 && <SelectionModeHint />}
        </>
      }
      folders={
        !debouncedSearch &&
        (loading ? (
          <FolderGridSkeleton />
        ) : (
          <section>
            <LibrarySectionHeader title="Collections" className="mb-4" />
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
          </section>
        ))
      }
      prompts={
        <section>
          <PromptFiltersBar
            activeFilter={promptFilter}
            onFilterChange={setPromptFilter}
            sort={promptSort}
            onSortChange={setPromptSort}
          />
          <PromptGrid
            prompts={displayedPrompts}
            folders={folders}
            loading={loading}
            total={total}
            debouncedSearch={debouncedSearch}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            error={error ? "Unable to load the library." : null}
            onRetry={invalidateAll}
            onMove={invalidateAll}
            selectionMode={selection.selectionMode}
            selectedPromptIds={selection.selectedPromptIds}
            onTogglePromptSelect={selection.togglePrompt}
            emptyState={
              <EmptyState
                icon={<Sparkles className="h-7 w-7 text-pa-muted-soft" />}
                title={promptFilter === "all" ? "Your archive is empty" : "No prompts match this filter"}
                description={
                  promptFilter === "all"
                    ? "Save your first visual prompt and start building your local collection."
                    : "Try another filter or create a new prompt."
                }
              />
            }
          />
        </section>
      }
      toolbar={<SelectionToolbar selection={selection} folders={folders} showHidden={visibleShowHidden} />}
    />
  );
}
