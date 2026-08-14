"use client";

import { Suspense, useId, useMemo } from "react";
import { useParams, usePathname } from "next/navigation";
import { useEditPrompt } from "@/hooks/useEditPrompt";
import { usePromptDetail } from "@/hooks/usePromptDetail";
import type { Prompt, PromptUpdatePayload } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FieldGroup } from "@/components/ui/FieldGroup";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PromptContentSection } from "@/components/create/PromptContentSection";
import { EditImagesSection } from "@/components/create/EditImagesSection";
import { OrganizationSection } from "@/components/create/OrganizationSection";
import { CreatePromptTemplate } from "@/components/templates/CreatePromptTemplate";
import { FormPageHeader } from "@/components/templates/FormPageHeader";
import { FormSectionHeader } from "@/components/create/FormSectionHeader";
import { PromptDetailSkeleton } from "@/components/skeletons/PromptDetailSkeleton";
import { FileText } from "lucide-react";

export function EditPromptPage() {
  return (
    <Suspense>
      <EditPrompt />
    </Suspense>
  );
}

function EditPrompt() {
  const params = useParams();
  const pathname = usePathname();
  const routeId = Array.isArray(params.id) ? params.id[0] : params.id;

  const pathnameId = useMemo(() => {
    const match = pathname.match(/^\/prompts\/([^/?#]+)/);
    if (!match) return "";
    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  }, [pathname]);

  const idFromParams = typeof routeId === "string" ? routeId : "";
  const id = pathnameId || idFromParams;
  const detail = usePromptDetail(id);

  if (detail.loading) return <PromptDetailSkeleton />;
  if (detail.error || !detail.prompt) {
    return <div className="p-10 text-center text-pa-muted">{detail.error || "Prompt not found"}</div>;
  }

  return (
    <EditPromptEditor
      key={detail.prompt.id}
      prompt={detail.prompt}
      updatePrompt={detail.updatePrompt}
      uploadImages={detail.uploadImages}
      deleteImage={detail.deleteImage}
      refresh={detail.refresh}
    />
  );
}

interface EditPromptEditorProps {
  prompt: Prompt;
  updatePrompt: (payload: PromptUpdatePayload) => Promise<Prompt>;
  uploadImages: (files: File[]) => Promise<void>;
  deleteImage: (imageId: number) => Promise<void>;
  refresh: () => void;
}

function EditPromptEditor(props: EditPromptEditorProps) {
  const {
    form,
    fieldArray,
    prompt,
    saving,
    folders,
    selectedCategories,
    setSelectedCategories,
    promptType,
    isNsfw,
    existingImages,
    pendingUploads,
    pendingDeletes,
    totalImageCount,
    handleFileChange,
    handleFilesAdd,
    removePendingUpload,
    toggleDeleteExisting,
    onSubmit,
    router,
  } = useEditPrompt(props);

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
            title="Edit Prompt"
            subtitle={prompt.title}
            onBack={() => router.push(`/prompts/${prompt.id}`)}
            actions={
              <>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push(`/prompts/${prompt.id}`)}
                  className="hidden text-sm sm:inline-flex"
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={saving}>
                  Save Changes
                </Button>
              </>
            }
          />
        }
        identity={
          <div className="space-y-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
            <FormSectionHeader
              icon={FileText}
              title="Basic Information"
              description="Update the name and context for this archived prompt."
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
            <EditImagesSection
              allImages={existingImages}
              pendingUploads={pendingUploads}
              pendingDeletes={pendingDeletes}
              totalCount={totalImageCount}
              onFileChange={handleFileChange}
              onFilesAdd={handleFilesAdd}
              onRemovePending={removePendingUpload}
              onToggleDeleteExisting={toggleDeleteExisting}
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push(`/prompts/${prompt.id}`)}
              className="flex-1 text-sm"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={saving} className="flex-1 text-sm">
              Save
            </Button>
          </div>
        }
      />
    </form>
  );
}
