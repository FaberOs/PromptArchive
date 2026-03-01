import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api, { getPromptVariants } from '@/lib/api';
import type { Prompt, PromptUpdatePayload } from '@/lib/types';

export function usePromptDetail(id: string) {
  const queryClient = useQueryClient();

  const fetchPromptData = useCallback(async () => {
    const res = await api.get<Prompt>(`/prompts/${id}`);
    const currentPrompt = res.data;

    // Fetch Variants
    const rootId = currentPrompt.parent_id || currentPrompt.id;
    const variantsRes = await getPromptVariants(rootId);

    // Fetch Parent if exists
    let parent: Prompt | null = null;
    if (currentPrompt.parent_id) {
      const parentRes = await api.get<Prompt>(`/prompts/${currentPrompt.parent_id}`);
      parent = parentRes.data;
    }

    return {
      prompt: currentPrompt,
      parentPrompt: parent,
      variants: variantsRes.data,
    };
  }, [id]);

  const { data, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['prompt', id],
    queryFn: fetchPromptData,
    enabled: !!id,
  });

  const prompt = data?.prompt ?? null;
  const parentPrompt = data?.parentPrompt ?? null;
  const variants = data?.variants ?? [];
  const error = queryError
    ? ((queryError as { response?: { status?: number } }).response?.status === 404
      ? "Prompt not found"
      : "An error occurred")
    : null;

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['prompt', id] });
  };

  const updatePrompt = async (updateData: PromptUpdatePayload): Promise<Prompt> => {
    const res = await api.put<Prompt>(`/prompts/${id}`, updateData);
    queryClient.setQueryData(['prompt', id], (old: typeof data) =>
      old ? { ...old, prompt: res.data } : old
    );
    return res.data;
  };

  const deletePrompt = async () => {
     await api.delete(`/prompts/${id}`);
  };

  const uploadImages = async (files: File[]) => {
      await Promise.all(files.map(file => {
          const formData = new FormData();
          formData.append('file', file);
          return api.post(`/prompts/${id}/images`, formData);
      }));
      refresh();
  };

  const deleteImage = async (imageId: number) => {
      await api.delete(`/prompts/${id}/images/${imageId}`);
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
    deleteImage
  };
}
