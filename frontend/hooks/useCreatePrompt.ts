import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useRouter, useSearchParams } from 'next/navigation';
import api, { getFolders } from '@/lib/api';
import type { Folder, PromptCreatePayload, Prompt, Category, Tag, PositivePrompt } from '@/lib/types';
import { toast } from 'sonner';

export interface CreateFormData {
  title: string;
  description: string;
  negative_prompt: string;
  positive_prompts: { value: string }[];
  tags: string;
  is_nsfw: string;
  prompt_type: 'structured' | 'json';
  folder_id: string;
}

export function useCreatePrompt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parent_id');

  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const form = useForm<CreateFormData>({
    defaultValues: {
      positive_prompts: [{ value: '' }],
      is_nsfw: 'false',
      prompt_type: 'structured',
      folder_id: '',
    },
  });

  const { control, watch, setValue } = form;
  const promptType = watch('prompt_type');
  const isNsfw = watch('is_nsfw');
  const folderIdParam = searchParams.get('folder_id');

  const fieldArray = useFieldArray({ control, name: 'positive_prompts', rules: { maxLength: 3 } });

  // Sync folder from URL
  useEffect(() => {
    if (folderIdParam) setValue('folder_id', folderIdParam);
  }, [folderIdParam, setValue]);

  // Fetch folders when library changes
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const res = await getFolders(isNsfw === 'true');
        setFolders(res.data);
      } catch (e) {
        console.error('Failed to fetch folders', e);
      }
    };
    fetchFolders();
  }, [isNsfw]);

  // Load parent data if creating variant
  useEffect(() => {
    if (parentId) {
      api
        .get<Prompt>(`/prompts/${parentId}`)
        .then((res) => {
          const d = res.data;
          setValue('title', `${d.title} (Variant)`);
          setValue('description', d.description || '');
          setValue('negative_prompt', d.negative_prompt || '');
          setSelectedCategories(d.categories.map((c: Category) => c.name));
          setValue('tags', d.tags.map((t: Tag) => t.name).join(', '));
          setValue('is_nsfw', String(d.is_nsfw));
          setValue('prompt_type', d.prompt_type);
          setValue('folder_id', d.folder_id ? String(d.folder_id) : '');
          if (d.positive_prompts?.length)
            setValue(
              'positive_prompts',
              d.positive_prompts.map((p: PositivePrompt) => ({ value: p.content }))
            );
        })
        .catch((err) => console.error('Failed to load parent', err));
    }
  }, [parentId, setValue]);

  // Cleanup blob URLs
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (selectedFiles.length + files.length > 4) {
      toast.warning('Max 4 images allowed');
      return;
    }
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (i: number) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[i]);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // Submit
  const onSubmit = async (data: CreateFormData) => {
    setLoading(true);
    try {
      let finalPositivePrompts: string[] = [];
      if (data.prompt_type === 'json') {
        try {
          finalPositivePrompts = [JSON.stringify(JSON.parse(data.positive_prompts[0].value), null, 2)];
        } catch {
          finalPositivePrompts = [data.positive_prompts[0].value];
        }
      } else {
        finalPositivePrompts = data.positive_prompts.map((p) => p.value).filter((v) => v.trim() !== '');
      }
      const payload: PromptCreatePayload = {
        title: data.title,
        description: data.description,
        negative_prompt: data.prompt_type === 'json' ? '' : data.negative_prompt,
        positive_prompts: finalPositivePrompts,
        categories: selectedCategories,
        tags: data.tags
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        is_nsfw: data.is_nsfw === 'true',
        prompt_type: data.prompt_type,
        parent_id: parentId ? parseInt(parentId) : undefined,
        folder_id: data.folder_id ? parseInt(data.folder_id) : undefined,
      };
      const res = await api.post<Prompt>('/prompts/', payload);
      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map((f) => {
            const fd = new FormData();
            fd.append('file', f);
            return api.post(`/prompts/${res.data.id}/images`, fd);
          })
        );
      }
      toast.success('Prompt created!');
      router.push(`/prompts/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    fieldArray,
    parentId,
    loading,
    folders,
    selectedFiles,
    previews,
    selectedCategories,
    setSelectedCategories,
    promptType,
    isNsfw,
    handleFileChange,
    removeImage,
    onSubmit,
    router,
  };
}
