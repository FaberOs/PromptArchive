import { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getFolders, createFolder, updateFolder, deleteFolder } from '@/lib/api';
import type { Prompt, PaginatedResponse } from '@/lib/types';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface UseLibraryOptions {
  isNsfw: boolean;
  currentFolderId: number | null;
  enabled?: boolean;
  showHidden?: boolean;
}

export function useLibrary({ isNsfw, currentFolderId, enabled = true, showHidden = false }: UseLibraryOptions) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // ── Folders ──
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ['folders', isNsfw, showHidden],
    queryFn: () => getFolders(isNsfw, showHidden).then(res => res.data),
    enabled,
  });

  // ── Prompts (infinite) ──
  const buildParams = (pageParam: number) => {
    const params: Record<string, string | number | boolean> = {
      nsfw: isNsfw,
      skip: pageParam,
      limit: PAGE_SIZE,
      show_hidden: showHidden,
    };
    if (debouncedSearch) {
      params.search = debouncedSearch;
    } else {
      params.folder_id = currentFolderId === null ? 0 : currentFolderId;
    }
    return params;
  };

  const {
    data: promptsData,
    isLoading: promptsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['prompts', { nsfw: isNsfw, search: debouncedSearch, folderId: currentFolderId, showHidden }],
    queryFn: ({ pageParam = 0 }) =>
      api.get<PaginatedResponse<Prompt>>('/prompts/', { params: buildParams(pageParam) }).then(res => res.data),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled,
  });

  const prompts = promptsData?.pages.flatMap(p => p.items) ?? [];
  const total = promptsData?.pages[0]?.total ?? 0;
  const loading = foldersLoading || promptsLoading;

  // ── Mutations ──
  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
    queryClient.invalidateQueries({ queryKey: ['folders'] });
  };

  const handleCreateFolder = async (name: string, color: string) => {
    try {
      await createFolder({ name, color, is_nsfw: isNsfw });
      invalidateAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFolder = async (id: number, name: string, color: string) => {
    try {
      await updateFolder(id, { name, color, is_nsfw: isNsfw });
      invalidateAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (id: number) => {
    toast('Delete this folder?', {
      description: 'Prompts inside will be moved to root.',
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await deleteFolder(id);
            invalidateAll();
            toast.success('Folder deleted');
          } catch {
            toast.error('Failed to delete folder');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
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
    // Folder actions
    handleCreateFolder,
    handleUpdateFolder,
    handleDeleteFolder,
    invalidateAll,
  };
}
