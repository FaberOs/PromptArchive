import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import api, {
  getFolders,
  createFolder,
  updateFolder,
  deleteFolder,
  privateSessionRequest,
  publicSessionRequest,
} from "@/lib/api";
import type { Prompt, PaginatedResponse } from "@/lib/types";
import { buildLibraryQueryParams, type PromptSort, type PromptTypeFilter } from "@/lib/libraryFilters";
import { useSecurity } from "@/components/SecurityProvider";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";

const FOLDER_SHOW_HIDDEN_KEYS = [false, true] as const;

interface UseLibraryOptions {
  isNsfw: boolean;
  currentFolderId: number | null;
  enabled?: boolean;
  showHidden?: boolean;
  promptFilter?: PromptTypeFilter;
  promptSort?: PromptSort;
}

export function useLibrary({
  isNsfw,
  currentFolderId,
  enabled = true,
  showHidden = false,
  promptFilter = "all",
  promptSort = "newest",
}: UseLibraryOptions) {
  const queryClient = useQueryClient();
  const { isNsfwUnlocked } = useSecurity();
  const effectiveShowHidden = showHidden && isNsfwUnlocked;
  const queryFilter = promptFilter === "hidden" && !isNsfwUnlocked ? "all" : promptFilter;

  const upsertFolderInCache = (showHiddenKey: boolean, folder: Awaited<ReturnType<typeof createFolder>>["data"]) => {
    queryClient.setQueryData(
      ["folders", "library", isNsfw, showHiddenKey],
      (prev: Awaited<ReturnType<typeof getFolders>>["data"] = []) => {
        const withoutCurrent = prev.filter((item) => item.id !== folder.id);
        return [folder, ...withoutCurrent];
      },
    );
  };

  const removeFolderFromCache = (showHiddenKey: boolean, folderId: number) => {
    queryClient.setQueryData(
      ["folders", "library", isNsfw, showHiddenKey],
      (prev: Awaited<ReturnType<typeof getFolders>>["data"] = []) => prev.filter((item) => item.id !== folderId),
    );
  };

  const refreshInactiveFolderQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["folders", "library", isNsfw],
      refetchType: "inactive",
    });
  };
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const normalizedSearch = useMemo(() => debouncedSearch.trim(), [debouncedSearch]);
  const effectiveFolderId = normalizedSearch ? null : currentFolderId === null ? 0 : currentFolderId;

  // ── Folders ──
  const {
    data: folders = [],
    isLoading: foldersLoading,
    isError: foldersError,
  } = useQuery({
    queryKey: ["folders", "library", isNsfw, effectiveShowHidden],
    queryFn: () => getFolders(isNsfw, effectiveShowHidden).then((res) => res.data),
    enabled,
    staleTime: 30_000,
  });

  // ── Prompts (infinite) ──
  const baseParams = useMemo(
    () =>
      buildLibraryQueryParams({
        isNsfw,
        showHidden: effectiveShowHidden,
        promptFilter: queryFilter,
        promptSort,
        normalizedSearch,
        folderId: effectiveFolderId,
      }),
    [effectiveFolderId, effectiveShowHidden, isNsfw, promptSort, queryFilter, normalizedSearch],
  );

  const promptsQueryKey = useMemo(
    () => [
      "prompts",
      "library",
      isNsfw,
      effectiveShowHidden,
      normalizedSearch,
      effectiveFolderId,
      queryFilter,
      promptSort,
    ],
    [effectiveFolderId, effectiveShowHidden, isNsfw, promptSort, queryFilter, normalizedSearch],
  );

  const {
    data: promptsData,
    isLoading: promptsLoading,
    isError: promptsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: promptsQueryKey,
    queryFn: ({ pageParam = 0 }) => {
      const params = {
        ...baseParams,
        skip: pageParam,
      };
      return api
        .get<PaginatedResponse<Prompt>>("/prompts/", {
          params,
          ...(isNsfw || effectiveShowHidden || queryFilter === "hidden" ? privateSessionRequest : publicSessionRequest),
        })
        .then((res) => res.data);
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled,
    staleTime: 15_000,
  });

  const prompts = promptsData?.pages.flatMap((p) => p.items) ?? [];
  const total = promptsData?.pages[0]?.total ?? 0;
  const loading = foldersLoading || promptsLoading;
  const error = foldersError || promptsError;

  // ── Mutations ──
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["prompts", "library", isNsfw] });
    queryClient.invalidateQueries({ queryKey: ["folders", "library", isNsfw] });
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      const response = await createFolder({ name, color, is_nsfw: isNsfw });
      const createdFolder = response.data;

      FOLDER_SHOW_HIDDEN_KEYS.forEach((showHiddenKey) => {
        upsertFolderInCache(showHiddenKey, createdFolder);
      });

      refreshInactiveFolderQueries();
    } catch (e) {
      console.error(e);
      queryClient.invalidateQueries({
        queryKey: ["folders", "library", isNsfw],
        refetchType: "active",
      });
      toast.error("Failed to create folder");
    }
  };

  const handleUpdateFolder = async (id: number, name: string, color: string) => {
    try {
      const response = await updateFolder(id, { name, color, is_nsfw: isNsfw });
      const updatedFolder = response.data;

      FOLDER_SHOW_HIDDEN_KEYS.forEach((showHiddenKey) => {
        upsertFolderInCache(showHiddenKey, updatedFolder);
      });

      refreshInactiveFolderQueries();
    } catch (e) {
      console.error(e);
      queryClient.invalidateQueries({
        queryKey: ["folders", "library", isNsfw],
        refetchType: "active",
      });
      toast.error("Failed to update folder");
    }
  };

  const handleDeleteFolder = async (id: number) => {
    toast("Delete this folder?", {
      description: "Prompts inside will be moved to root.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await deleteFolder(id);

            FOLDER_SHOW_HIDDEN_KEYS.forEach((showHiddenKey) => {
              removeFolderFromCache(showHiddenKey, id);
            });

            queryClient.invalidateQueries({
              queryKey: ["prompts", "library", isNsfw],
              refetchType: "active",
            });
            refreshInactiveFolderQueries();
            toast.success("Folder deleted");
          } catch {
            queryClient.invalidateQueries({
              queryKey: ["folders", "library", isNsfw],
              refetchType: "active",
            });
            toast.error("Failed to delete folder");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  return {
    // State
    search,
    setSearch,
    debouncedSearch,
    folders,
    prompts,
    total,
    loading,
    // Pagination
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
    // Folder actions
    handleCreateFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    invalidateAll,
  };
}
