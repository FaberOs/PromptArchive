"use client";

import { Suspense, useId } from "react";
import { useCreatePrompt } from "@/hooks/useCreatePrompt";
import { Button } from "@/components/ui/Button";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PromptContentSection } from "@/components/create/PromptContentSection";
import { ImagesSection } from "@/components/create/ImagesSection";
import { OrganizationSection } from "@/components/create/OrganizationSection";
import { CreatePromptTemplate } from "@/components/templates/CreatePromptTemplate";
import { FormPageHeader } from "@/components/templates/FormPageHeader";
import { FormSectionHeader } from "@/components/create/FormSectionHeader";
import { FileText, Link2, Loader2 } from "lucide-react";

export default function CreatePromptPage() {
  return (
    <Suspense>
      <CreatePrompt />
    </Suspense>
  );
}

function CreatePrompt() {
  const {
    form,
    fieldArray,
    parentId,
    artifactId,
    artifactImporting,
    loading,
    folders,
    previews,
    selectedCategories,
    setSelectedCategories,
    promptType,
    isNsfw,
    handleFileChange,
    handleFilesAdd,
    removeImage,
    onSubmit,
    router,
  } = useCreatePrompt();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const titleId = useId();
  const descriptionId = useId();
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <CreatePromptTemplate
        header={
          <FormPageHeader
            title={parentId ? "New Variant" : "New Prompt"}
            subtitle={parentId ? "Branch off an existing prompt." : "Fill in the details to archive a generation idea."}
            onBack={() => router.back()}
            actions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.back()}
                  className="hidden text-sm sm:inline-flex"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={loading}>
                  {parentId ? "Create Variant" : "Create Prompt"}
                </Button>
              </>
            }
          />
        }
        notice={
          artifactId ? (
            <div className="flex items-center gap-2 rounded-pa-xl border border-pa-primary/20 bg-pa-soft-blue px-3 py-2.5 text-sm text-pa-text">
              {artifactImporting ? (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
              ) : (
                <Link2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {artifactImporting
                  ? "Importing artifact content..."
                  : "Artifact imported. Review fields before saving."}
              </span>
            </div>
          ) : undefined
        }
        identity={
          <div className="space-y-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
            <FormSectionHeader
              icon={FileText}
              title="Basic Information"
              description="Name this archived prompt and add the context you will need later."
            />
            <div className="space-y-5">
              <FieldGroup
                label="Title"
                info="A short, memorable name for this prompt."
                required
                htmlFor={titleId}
                error={errors.title ? "Title is required" : undefined}
              >
                <Input
                  id={titleId}
                  {...register("title", { required: true })}
                  placeholder="e.g. Cyberpunk City at Night"
                />
              </FieldGroup>
              <FieldGroup
                label="Description"
                info="Optional notes about parameters, model, or intent."
                htmlFor={descriptionId}
              >
                <Textarea
                  id={descriptionId}
                  {...register("description")}
                  placeholder="Notes, parameters, model name…"
                  className="min-h-[84px] max-h-28 resize-none text-sm"
                />
              </FieldGroup>
            </div>
          </div>
        }
        editor={<PromptContentSection form={form} fieldArray={fieldArray} promptType={promptType} />}
        sidebar={
          <>
            <ImagesSection
              previews={previews}
              onFileChange={handleFileChange}
              onFilesAdd={handleFilesAdd}
              onRemove={removeImage}
            />
            <OrganizationSection
              form={form}
              isNsfw={isNsfw}
              folders={folders}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
            />
          </>
        }
        mobileActions={
          <div className="flex gap-2 sm:hidden">
            <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1 text-sm">
              Cancel
            </Button>
            <Button type="submit" isLoading={loading} className="flex-1 text-sm">
              {parentId ? "Create Variant" : "Create"}
            </Button>
          </div>
        }
      />
    </form>
  );
}
