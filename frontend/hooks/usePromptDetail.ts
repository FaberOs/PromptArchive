import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api, { getPromptVariants, privateSessionRequest, publicSessionRequest } from "@/lib/api";
import type { Prompt, PromptUpdatePayload } from "@/lib/types";
import { useSecurity } from "@/components/SecurityProvider";

function parsePromptId(id: string): string | null {
  const normalized = id.trim();
  if (!normalized || normalized === "__placeholder__") return null;

  const match = normalized.match(/^(\d+)(?:\.txt)?$/);
  return match ? match[1] : null;
}

function normalizePrompt(prompt: Prompt): Prompt {
  const candidate = prompt as Partial<Prompt>;

  return {
    ...prompt,
    title:
      typeof candidate.title === "string" && candidate.title.trim().length > 0 ? candidate.title : "Untitled prompt",
    description: typeof candidate.description === "string" ? candidate.description : null,
    negative_prompt: typeof candidate.negative_prompt === "string" ? candidate.negative_prompt : "",
    prompt_type: candidate.prompt_type === "json" ? "json" : "structured",
    positive_prompts: Array.isArray(candidate.positive_prompts)
      ? candidate.positive_prompts.filter(
          (item): item is Prompt["positive_prompts"][number] => !!item && typeof item.content === "string",
        )
      : [],
    categories: Array.isArray(candidate.categories)
      ? candidate.categories.filter(
          (item): item is Prompt["categories"][number] => !!item && typeof item.name === "string",
        )
      : [],
    tags: Array.isArray(candidate.tags)
      ? candidate.tags.filter((item): item is Prompt["tags"][number] => !!item && typeof item.name === "string")
      : [],
    images: Array.isArray(candidate.images)
      ? candidate.images.filter((item): item is Prompt["images"][number] => !!item && typeof item.filename === "string")
      : [],
    folder: candidate.folder ?? null,
    parent_id: typeof candidate.parent_id === "number" ? candidate.parent_id : null,
    folder_id: typeof candidate.folder_id === "number" ? candidate.folder_id : null,
    variant_count:
      typeof candidate.variant_count === "number" && Number.isFinite(candidate.variant_count)
        ? candidate.variant_count
        : 0,
    created_at: typeof candidate.created_at === "string" ? candidate.created_at : new Date(0).toISOString(),
    updated_at: typeof candidate.updated_at === "string" ? candidate.updated_at : null,
  };
}

export function usePromptDetail(id: string) {
  const queryClient = useQueryClient();
  const promptId = parsePromptId(id);
  const { isNsfwUnlocked } = useSecurity();

  const fetchPromptData = useCallback(async () => {
    if (!promptId) {
      throw new Error("Invalid prompt id");
    }

    const res = await api.get<Prompt>(`/prompts/${promptId}`, {
      params: { show_hidden: isNsfwUnlocked },
      ...(isNsfwUnlocked ? privateSessionRequest : publicSessionRequest),
    });
    const currentPrompt = normalizePrompt(res.data);

    // Fetch Variants
    const rootId = currentPrompt.parent_id || currentPrompt.id;
    let variants: Prompt[] = [];
    try {
      const variantsRes = await getPromptVariants(rootId, isNsfwUnlocked);
      variants = Array.isArray(variantsRes.data) ? variantsRes.data.map(normalizePrompt) : [];
    } catch {
      variants = [];
    }

    // Fetch Parent if exists
    let parent: Prompt | null = null;
    if (currentPrompt.parent_id) {
      try {
        const parentRes = await api.get<Prompt>(`/prompts/${currentPrompt.parent_id}`, {
          params: { show_hidden: isNsfwUnlocked },
          ...(isNsfwUnlocked ? privateSessionRequest : publicSessionRequest),
        });
        parent = normalizePrompt(parentRes.data);
      } catch {
        parent = null;
      }
    }

    return {
      prompt: currentPrompt,
      parentPrompt: parent,
      variants,
    };
  }, [isNsfwUnlocked, promptId]);

  const {
    data,
    isLoading: loading,
    error: queryError,
  } = useQuery({
    queryKey: ["prompt", promptId, isNsfwUnlocked],
    queryFn: fetchPromptData,
    enabled: !!promptId,
  });

  const prompt = data?.prompt ?? null;
  const parentPrompt = data?.parentPrompt ?? null;
  const variants = data?.variants ?? [];
  const error = queryError
    ? (queryError as { response?: { status?: number } }).response?.status === 404
      ? "Prompt not found"
      : "An error occurred"
    : null;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["prompt", promptId] });
  };

  const updatePrompt = async (updateData: PromptUpdatePayload): Promise<Prompt> => {
    if (!promptId) {
      throw new Error("Invalid prompt id");
    }

    const res = await api.put<Prompt>(`/prompts/${promptId}`, updateData, {
      ...(prompt?.is_nsfw || prompt?.is_hidden || updateData.is_nsfw ? privateSessionRequest : publicSessionRequest),
    });
    const normalizedPrompt = normalizePrompt(res.data);
    queryClient.setQueryData(["prompt", promptId, isNsfwUnlocked], (old: typeof data) =>
      old ? { ...old, prompt: normalizedPrompt } : old,
    );
    return normalizedPrompt;
  };

  const deletePrompt = async () => {
    if (!promptId) {
      throw new Error("Invalid prompt id");
    }

    await api.delete(
      `/prompts/${promptId}`,
      prompt?.is_nsfw || prompt?.is_hidden ? privateSessionRequest : publicSessionRequest,
    );
  };

  const uploadImages = async (files: File[]) => {
    if (!promptId) {
      throw new Error("Invalid prompt id");
    }

    await Promise.all(
      files.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        return api.post(`/prompts/${promptId}/images`, formData, {
          ...(prompt?.is_nsfw || prompt?.is_hidden ? privateSessionRequest : publicSessionRequest),
        });
      }),
    );
    refresh();
  };

  const deleteImage = async (imageId: number) => {
    if (!promptId) {
      throw new Error("Invalid prompt id");
    }

    await api.delete(`/prompts/${promptId}/images/${imageId}`, {
      ...(prompt?.is_nsfw || prompt?.is_hidden ? privateSessionRequest : publicSessionRequest),
    });
    refresh();
  };

  return {
    prompt,
    parentPrompt,
    variants,
    loading,
    error,
    refresh,
    updatePrompt,
    deletePrompt,
    uploadImages,
    deleteImage,
  };
}
