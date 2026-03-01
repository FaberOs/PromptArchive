"use client";

import { useCreatePrompt } from '@/hooks/useCreatePrompt';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { PromptContentSection } from '@/components/create/PromptContentSection';
import { ImagesSection } from '@/components/create/ImagesSection';
import { OrganizationSection } from '@/components/create/OrganizationSection';
import { ArrowLeft } from 'lucide-react';

export default function CreatePrompt() {
  const {
    form, fieldArray, parentId, loading,
    folders, previews, selectedCategories, setSelectedCategories,
    promptType, isNsfw,
    handleFileChange, removeImage, onSubmit, router,
  } = useCreatePrompt();

  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-10">
      {/* ── Top bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {parentId ? 'New Variant' : 'New Prompt'}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {parentId ? 'Branch off an existing prompt.' : 'Fill in the details to archive a generation idea.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="text-slate-400 text-sm hidden sm:inline-flex">
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={loading}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 px-6 text-sm"
          >
            {parentId ? 'Create Variant' : 'Create Prompt'}
          </Button>
        </div>
      </div>

      {/* ── Two-column body (stacks on mobile) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left column: Content */}
        <div className="lg:col-span-3 flex flex-col gap-5">
          {/* Identity card */}
          <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
            <div className="space-y-4">
              <div>
                <FieldLabel required tip="A short, memorable name for this prompt.">Title</FieldLabel>
                <Input {...register('title', { required: true })} placeholder="e.g. Cyberpunk City at Night" className="text-sm" />
                {errors.title && <span className="text-red-500 text-[11px] mt-1 block">Title is required</span>}
              </div>
              <div>
                <FieldLabel tip="Optional notes about parameters, model, or intent.">Description</FieldLabel>
                <Textarea {...register('description')} placeholder="Notes, parameters, model name…" className="min-h-[60px] text-sm resize-none" />
              </div>
            </div>
          </div>

          {/* Prompt content card */}
          <PromptContentSection form={form} fieldArray={fieldArray} promptType={promptType} />
        </div>

        {/* Right column: Media & Meta */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <ImagesSection previews={previews} onFileChange={handleFileChange} onRemove={removeImage} />
          <OrganizationSection
            form={form}
            isNsfw={isNsfw}
            folders={folders}
            selectedCategories={selectedCategories}
            onCategoriesChange={setSelectedCategories}
          />

          {/* Mobile-only submit */}
          <div className="flex sm:hidden gap-2">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1 text-slate-400 text-sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm">
              {parentId ? 'Create Variant' : 'Create'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
