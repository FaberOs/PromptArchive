"use client";

import { useMemo, useState } from "react";

import { useParams, usePathname, useRouter } from "next/navigation";

import { usePromptDetail } from "@/hooks/usePromptDetail";

import type { Prompt } from "@/lib/types";

import { PromptDetailSkeleton } from "@/components/skeletons/PromptDetailSkeleton";

import { GitBranch, Layout, EyeOff, Eye } from "lucide-react";

import { toast } from "sonner";

import { bulkHide } from "@/lib/api";

import { segmentedPanelId } from "@/lib/a11y";

import PromptBreadcrumbs from "@/components/prompt-detail/PromptBreadcrumbs";

import PromptMeta from "@/components/prompt-detail/PromptMeta";

import PromptGallery from "@/components/prompt-detail/PromptGallery";

import { AboutPromptPanel } from "@/components/prompt-detail/AboutPromptPanel";

import PromptTextContent from "@/components/prompt-detail/PromptTextContent";

import { VariantTimeline } from "@/components/prompt-detail/VariantTimeline";

import { PromptDetailTemplate } from "@/components/templates/PromptDetailTemplate";

import { PromptDetailHeaderActions } from "@/components/templates/PromptDetailHeaderActions";

export function PromptDetailPage() {
  return usePromptDetailPageView();
}

function usePromptDetailPageView() {
  const params = useParams();

  const pathname = usePathname();

  const router = useRouter();

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

  const {
    prompt,

    parentPrompt,

    variants,

    loading,

    error,

    deletePrompt,

    refresh,
  } = usePromptDetail(id);

  const [activeTab, setActiveTab] = useState<"details" | "thread">("details");

  const [previewVariant, setPreviewVariant] = useState<Prompt | null>(null);

  if (loading) return <PromptDetailSkeleton />;

  if (error || !prompt) {
    return <div className="p-10 text-center text-pa-muted">{error || "Prompt not found"}</div>;
  }

  const handleDelete = () => {
    toast("Delete this prompt and all its images?", {
      description: "This action cannot be undone.",

      action: {
        label: "Delete",

        onClick: async () => {
          try {
            await deletePrompt();

            toast.success("Prompt deleted");

            router.push("/");
          } catch {
            toast.error("Failed to delete prompt");
          }
        },
      },

      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleToggleHide = async () => {
    try {
      await bulkHide({
        prompt_ids: [prompt.id],

        folder_ids: [],

        hidden: !prompt.is_hidden,
      });

      toast.success(prompt.is_hidden ? "Prompt restored" : "Prompt hidden");

      refresh();
    } catch {
      toast.error("Failed to update visibility");
    }
  };

  const activeData = previewVariant || prompt;

  let variantLabel = "Original";

  if (previewVariant) {
    const idx = variants.findIndex((v) => v.id === previewVariant.id);

    if (idx !== -1) variantLabel = `V${idx + 1}`;
  } else if (prompt.parent_id) {
    const idx = variants.findIndex((v) => v.id === prompt.id);

    if (idx !== -1) variantLabel = `V${idx + 1}`;
  }

  return (
    <PromptDetailTemplate
      activeTab={activeTab}

      onTabChange={setActiveTab}

      tabs={[
        {
          id: "details" as const,

          label: "Details",

          icon: <Layout className="h-4 w-4" aria-hidden="true" />,
        },

        {
          id: "thread" as const,

          label: "Variants",

          icon: <GitBranch className="h-4 w-4" aria-hidden="true" />,

          badge:
            variants.length > 0 ? (
              <span className="rounded-full bg-pa-surface px-2 py-0.5 text-xs text-pa-muted">{variants.length}</span>
            ) : undefined,
        },
      ]}

      banners={
        <>
          {prompt.is_hidden && (
            <div className="flex items-center justify-between gap-3 rounded-pa-xl border border-pa-warning/30 bg-pa-warning-soft px-4 py-3 text-pa-warning">
              <div className="flex items-center gap-2 text-sm">
                <EyeOff className="h-4 w-4 shrink-0" />

                <span>This prompt is hidden and won&apos;t appear in the library.</span>
              </div>

              <button
                type="button"

                onClick={async () => {
                  try {
                    await bulkHide({
                      prompt_ids: [prompt.id],

                      folder_ids: [],

                      hidden: false,
                    });

                    toast.success("Prompt restored");

                    refresh();
                  } catch {
                    toast.error("Failed to restore");
                  }
                }}

                className="flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-pa-md bg-pa-warning/15 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-pa-warning/25"
              >
                <Eye className="h-3.5 w-3.5" /> Restore
              </button>
            </div>
          )}

          {prompt.folder?.is_hidden && !prompt.is_hidden && (
            <div className="flex items-center gap-2 rounded-pa-xl border border-pa-warning/30 bg-pa-warning-soft px-4 py-3 text-sm text-pa-warning">
              <EyeOff className="h-4 w-4 shrink-0" />

              <span>
                This prompt belongs to the hidden folder <strong>&ldquo;{prompt.folder.name}&rdquo;</strong>.
              </span>
            </div>
          )}
        </>
      }

      topBar={
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 overflow-hidden">
            <PromptBreadcrumbs prompt={prompt} parentPrompt={parentPrompt} />
          </div>

          <PromptDetailHeaderActions
            onVariant={() => router.push(`/create?parent_id=${prompt.parent_id || prompt.id}`)}

            onEdit={() => router.push(`/prompts/${prompt.id}/edit`)}

            onToggleHide={handleToggleHide}

            onDelete={handleDelete}

            isHidden={prompt.is_hidden}
          />
        </div>
      }
    >
      <div
        role="tabpanel"

        id={segmentedPanelId("details")}

        aria-labelledby="pa-tab-details"

        hidden={activeTab !== "details"}

        className="space-y-8 outline-none"
      >
        {activeTab === "details" && (
          <div className="space-y-8">
            <PromptMeta prompt={prompt} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 xl:grid-cols-4">
              <div className="lg:col-span-2 xl:col-span-3">
                <PromptGallery
                  prompt={prompt}

                  variants={variants}

                  previewVariant={previewVariant}

                  setPreviewVariant={setPreviewVariant}
                />
              </div>

              <div className="lg:col-span-1 xl:col-span-1">
                <AboutPromptPanel prompt={prompt} variantCount={variants.length} />
              </div>
            </div>

            <div className="w-full">
              <PromptTextContent
                prompt={activeData}

                isPreviewingVariant={!!previewVariant}

                variantLabel={variantLabel}
              />
            </div>
          </div>
        )}
      </div>

      <div
        role="tabpanel"

        id={segmentedPanelId("thread")}

        aria-labelledby="pa-tab-thread"

        hidden={activeTab !== "thread"}

        className="outline-none"
      >
        {activeTab === "thread" && (
          <VariantTimeline
            prompt={prompt}

            rootItem={parentPrompt || (prompt.parent_id ? null : prompt)}

            variants={variants}
          />
        )}
      </div>
    </PromptDetailTemplate>
  );
}
