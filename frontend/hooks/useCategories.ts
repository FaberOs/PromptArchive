import { useMemo, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getCategories, privateSessionRequest, publicSessionRequest } from "@/lib/api";
import type { Prompt, PaginatedResponse } from "@/lib/types";
import { useDebounce } from "./useDebounce";
import { toast } from "sonner";
import { useSecurity } from "@/components/SecurityProvider";

export interface CategoryItem {
  id: number;
  name: string;
  description?: string;
  prompt_count: number;
  created_at?: string;
  updated_at?: string | null;
}

const PAGE_SIZE = 20;

function categoryMatchesSearch(category: CategoryItem, searchValue: string) {
  const normalized = searchValue.trim().toLowerCase();
  if (!normalized) return true;

  return (
    category.name.toLowerCase().includes(normalized) || (category.description ?? "").toLowerCase().includes(normalized)
  );
}

export function useCategories() {
  const queryClient = useQueryClient();
  const { isNsfwUnlocked } = useSecurity();

  const upsertCategoryInCache = (searchValue: string, category: CategoryItem) => {
    queryClient.setQueryData<CategoryItem[]>(["categories", searchValue], (prev = []) => {
      const withoutCurrent = prev.filter((item) => item.id !== category.id);
      if (!categoryMatchesSearch(category, searchValue)) {
        return withoutCurrent;
      }

      return [category, ...withoutCurrent];
    });
  };

  const removeCategoryFromCache = (searchValue: string, id: number) => {
    queryClient.setQueryData<CategoryItem[]>(["categories", searchValue], (prev = []) =>
      prev.filter((item) => item.id !== id),
    );
  };

  // Manage state
  const [catSearch, setCatSearch] = useState("");
  const debouncedCatSearch = useDebounce(catSearch, 500);
  const normalizedCatSearch = useMemo(() => debouncedCatSearch.trim(), [debouncedCatSearch]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Browse state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [promptSearch, setPromptSearch] = useState("");
  const debouncedPromptSearch = useDebounce(promptSearch, 500);
  const normalizedPromptSearch = useMemo(() => debouncedPromptSearch.trim(), [debouncedPromptSearch]);
  const normalizedFilters = useMemo(
    () => [...new Set(selectedFilters)].sort((a, b) => a.localeCompare(b)),
    [selectedFilters],
  );

  // Active tab
  const [activeTab, setActiveTab] = useState<"manage" | "browse">("manage");

  // ── Manage queries ──
  const { data: categories = [], isLoading: loadingCats } = useQuery({
    queryKey: ["categories", isNsfwUnlocked, normalizedCatSearch],
    queryFn: async () => {
      const response = await getCategories(isNsfwUnlocked);
      const data = response.data as CategoryItem[];
      if (!normalizedCatSearch) return data;
      const normalizedSearch = normalizedCatSearch.toLowerCase();
      return data.filter(
        (category) =>
          category.name.toLowerCase().includes(normalizedSearch) ||
          (category.description ?? "").toLowerCase().includes(normalizedSearch),
      );
    },
    staleTime: 30_000,
  });

  const invalidateCategories = () => {
    queryClient.invalidateQueries({
      queryKey: ["categories"],
      refetchType: "active",
    });
  };

  const refreshInactiveCategoryQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ["categories"],
      refetchType: "inactive",
    });
  };

  const categorySearchKeys = Array.from(new Set(["", normalizedCatSearch]));

  const handleCreate = async (name: string, description: string) => {
    try {
      const response = await api.post<CategoryItem>("/categories/", {
        name,
        description,
      });
      const createdCategory = response.data;

      categorySearchKeys.forEach((searchKey) => {
        upsertCategoryInCache(searchKey, createdCategory);
      });

      refreshInactiveCategoryQueries();
      toast.success("Category created");
    } catch {
      invalidateCategories();
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async (name: string, description: string) => {
    if (!editingCategory) return;

    const categoryId = editingCategory.id;

    try {
      const response = await api.put<CategoryItem>(`/categories/${categoryId}`, {
        name,
        description,
      });
      const updatedCategory = response.data;

      categorySearchKeys.forEach((searchKey) => {
        upsertCategoryInCache(searchKey, updatedCategory);
      });

      setEditingCategory(null);
      refreshInactiveCategoryQueries();
      toast.success("Category updated");
    } catch {
      invalidateCategories();
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async (id: number) => {
    toast("Delete this category?", {
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            await api.delete(`/categories/${id}`);

            categorySearchKeys.forEach((searchKey) => {
              removeCategoryFromCache(searchKey, id);
            });

            refreshInactiveCategoryQueries();
            toast.success("Category deleted");
          } catch {
            invalidateCategories();
            toast.error("Failed to delete category");
          }
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
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
    queryKey: ["prompts", "browse", isNsfwUnlocked, normalizedPromptSearch, normalizedFilters],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      params.append("skip", String(pageParam));
      params.append("limit", String(PAGE_SIZE));
      params.append("nsfw", String(isNsfwUnlocked));
      if (normalizedPromptSearch) params.append("search", normalizedPromptSearch);
      normalizedFilters.forEach((cat) => params.append("categories", cat));
      const res = await api.get<PaginatedResponse<Prompt>>(
        `/prompts/?${params.toString()}`,
        isNsfwUnlocked ? privateSessionRequest : publicSessionRequest,
      );
      return res.data;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, p) => sum + p.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    enabled: activeTab === "browse",
    staleTime: 15_000,
  });

  const prompts = promptsData?.pages.flatMap((p) => p.items) ?? [];
  const browseTotal = promptsData?.pages[0]?.total ?? 0;

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["prompts", "browse"] });
    queryClient.invalidateQueries({
      queryKey: ["categories"],
      refetchType: "active",
    });
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
