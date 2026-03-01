import { useState } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Prompt, PaginatedResponse } from '@/lib/types';
import { useDebounce } from './useDebounce';
import { toast } from 'sonner';

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  prompt_count: number;
}

const PAGE_SIZE = 20;

export function useCategories() {
  const queryClient = useQueryClient();

  // Manage state
  const [catSearch, setCatSearch] = useState('');
  const debouncedCatSearch = useDebounce(catSearch, 500);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Browse state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [promptSearch, setPromptSearch] = useState('');
  const debouncedPromptSearch = useDebounce(promptSearch, 500);

  // Active tab
  const [activeTab, setActiveTab] = useState<'manage' | 'browse'>('manage');

  // ── Manage queries ──
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ['categories', debouncedCatSearch],
    queryFn: async () => {
      const params = debouncedCatSearch ? { search: debouncedCatSearch } : {};
      const res = await api.get<CategoryItem[]>('/categories/', { params });
      return res.data;
    },
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  const handleCreate = async (name: string, description: string) => {
    try {
      await api.post('/categories/', { name, description });
      invalidateCategories();
      toast.success('Category created');
    } catch {
      toast.error('Failed to create category');
    }
  };

  const handleUpdate = async (name: string, description: string) => {
    if (!editingCategory) return;
    try {
      await api.put(`/categories/${editingCategory.id}`, { name, description });
      setEditingCategory(null);
      invalidateCategories();
      toast.success('Category updated');
    } catch {
      toast.error('Failed to update category');
    }
  };

  const handleDelete = async (id: number) => {
    toast('Delete this category?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          try {
            await api.delete(`/categories/${id}`);
            invalidateCategories();
            toast.success('Category deleted');
          } catch {
            toast.error('Failed to delete category');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  // ── Browse queries ──
  const {
    data: promptsData,
    isLoading: loadingPrompts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['prompts', 'browse', debouncedPromptSearch, selectedFilters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append('skip', String(pageParam));
      params.append('limit', String(PAGE_SIZE));
      if (debouncedPromptSearch) params.append('search', debouncedPromptSearch);
      selectedFilters.forEach((cat) => params.append('categories', cat));
      const res = await api.get<PaginatedResponse<Prompt>>(`/prompts/?${params.toString()}`);
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: activeTab === 'browse',
  });

  const prompts = promptsData?.pages.flatMap((p) => p.items) ?? [];
  const browseTotal = promptsData?.pages[0]?.total ?? 0;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['prompts'] });
    queryClient.invalidateQueries({ queryKey: ['categories'] });
  };

  return {
    // Tab
    activeTab,
    setActiveTab,
    // Manage
    catSearch,
    setCatSearch,
    categories,
    loadingCats,
    isCreateOpen,
    setIsCreateOpen,
    editingCategory,
    setEditingCategory,
    handleCreate,
    handleUpdate,
    handleDelete,
    // Browse
    selectedFilters,
    setSelectedFilters,
    promptSearch,
    setPromptSearch,
    prompts,
    browseTotal,
    loadingPrompts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateAll,
  };
}
