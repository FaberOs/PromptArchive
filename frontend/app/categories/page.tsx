"use client";

import { useCategories } from '@/hooks/useCategories';
import { ManageTab } from '@/components/categories/ManageTab';
import { BrowseTab } from '@/components/categories/BrowseTab';
import CategoryModal from '@/components/CategoryModal';
import { cn } from '@/lib/utils';
import { LayoutGrid, ListFilter } from 'lucide-react';

export default function CategoriesPage() {
  const {
    activeTab, setActiveTab,
    catSearch, setCatSearch,
    categories, loadingCats,
    isCreateOpen, setIsCreateOpen,
    editingCategory, setEditingCategory,
    handleCreate, handleUpdate, handleDelete,
    selectedFilters, setSelectedFilters,
    promptSearch, setPromptSearch,
    prompts, browseTotal, loadingPrompts,
    fetchNextPage, hasNextPage, isFetchingNextPage,
    invalidateAll,
  } = useCategories();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Categories</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Organize and explore your prompt library.</p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
            <button
              onClick={() => setActiveTab('manage')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                activeTab === 'manage'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <LayoutGrid className="w-4 h-4" /> Manage
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2',
                activeTab === 'browse'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              )}
            >
              <ListFilter className="w-4 h-4" /> Browse Prompts
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'manage' && (
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

      {activeTab === 'browse' && (
        <BrowseTab
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

      {/* Modals */}
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
    </div>
  );
}