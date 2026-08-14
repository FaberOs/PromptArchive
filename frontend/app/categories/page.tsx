"use client";

import { useCategories } from "@/hooks/useCategories";
import { ManageTab } from "@/components/categories/ManageTab";
import { BrowseTab } from "@/components/categories/BrowseTab";
import CategoryModal from "@/components/CategoryModal";
import { CategoriesTemplate } from "@/components/templates/CategoriesTemplate";
import { LayoutGrid, ListFilter } from "lucide-react";

export default function CategoriesPage() {
  const {
    activeTab,
    setActiveTab,
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
  } = useCategories();

  return (
    <CategoriesTemplate
      tabs={[
        {
          id: "manage" as const,
          label: "Manage",
          icon: <LayoutGrid className="h-4 w-4" />,
        },
        {
          id: "browse" as const,
          label: "Browse Prompts",
          icon: <ListFilter className="h-4 w-4" />,
        },
      ]}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      modals={
        <>
          <CategoryModal
            isOpen={isCreateOpen}
            onClose={() => setIsCreateOpen(false)}
            onSubmit={handleCreate}
            title="Create New Category"
          />
          <CategoryModal
            isOpen={!!editingCategory}
            onClose={() => setEditingCategory(null)}
            onSubmit={handleUpdate}
            initialData={editingCategory}
            title="Edit Category"
          />
        </>
      }
    >
      {activeTab === "manage" && (
        <ManageTab
          categories={categories}
          loading={loadingCats}
          search={catSearch}
          onSearchChange={setCatSearch}
          onCreateOpen={() => setIsCreateOpen(true)}
          onEdit={setEditingCategory}
          onDelete={handleDelete}
        />
      )}

      {activeTab === "browse" && (
        <BrowseTab
          categories={categories}
          selectedFilters={selectedFilters}
          onFiltersChange={setSelectedFilters}
          search={promptSearch}
          onSearchChange={setPromptSearch}
          prompts={prompts}
          total={browseTotal}
          loading={loadingPrompts}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          onMove={invalidateAll}
        />
      )}
    </CategoriesTemplate>
  );
}
