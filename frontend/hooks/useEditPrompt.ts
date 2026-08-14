import { useCallback, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { getFolders } from "@/lib/api";
import type { Folder, Prompt, PromptUpdatePayload } from "@/lib/types";
import { toast } from "sonner";
import type { CreateFormData } from "@/hooks/useCreatePrompt";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read image preview"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read image preview"));
    reader.readAsDataURL(file);
  });
}

interface LocalUpload {
  file: File;
  previewUrl: string;
}

interface UseEditPromptOptions {
  prompt: Prompt;
  updatePrompt: (payload: PromptUpdatePayload) => Promise<Prompt>;
  uploadImages: (files: File[]) => Promise<void>;
  deleteImage: (imageId: number) => Promise<void>;
  refresh: () => void;
}

function formValuesForPrompt(prompt: Prompt): CreateFormData {
  return {
    title: prompt.title,
    description: prompt.description || "",
    negative_prompt: prompt.negative_prompt || "",
    positive_prompts: prompt.positive_prompts?.length
      ? prompt.positive_prompts.map((positivePrompt) => ({
          value: positivePrompt.content,
        }))
      : [{ value: "" }],
    tags: prompt.tags.map((tag) => tag.name).join(", "),
    is_nsfw: String(prompt.is_nsfw),
    prompt_type: prompt.prompt_type,
    folder_id: prompt.folder_id === null ? "" : String(prompt.folder_id),
  };
}

export function useEditPrompt({ prompt, updatePrompt, uploadImages, deleteImage, refresh }: UseEditPromptOptions) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    prompt.categories.map((category) => category.name),
  );
  const [pendingUploads, setPendingUploads] = useState<LocalUpload[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<number[]>([]);

  const form = useForm<CreateFormData>({
    defaultValues: formValuesForPrompt(prompt),
  });

  const { control, watch } = form;
  const promptType = watch("prompt_type");
  const isNsfw = watch("is_nsfw");
  const isNsfwEnabled = isNsfw === "true";

  const fieldArray = useFieldArray({
    control,
    name: "positive_prompts",
    rules: { maxLength: 3 },
  });

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["edit-prompt-folders", isNsfwEnabled],
    queryFn: () => getFolders(isNsfwEnabled).then((res) => res.data),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const existingCount = useMemo(() => {
    if (!prompt.images) return 0;
    return prompt.images.length - pendingDeletes.length;
  }, [prompt.images, pendingDeletes.length]);

  const totalImageCount = existingCount + pendingUploads.length;

  const appendUploads = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const available = Math.max(0, 4 - existingCount - pendingUploads.length);
      if (available === 0) {
        toast.warning("Max 4 images allowed");
        return;
      }

      const accepted = files.slice(0, available);
      if (accepted.length < files.length) toast.warning("Max 4 images allowed");

      try {
        const nextUploads = await Promise.all(
          accepted.map(async (file) => ({
            file,
            previewUrl: await readFileAsDataUrl(file),
          })),
        );
        setPendingUploads((prev) => [...prev, ...nextUploads]);
      } catch {
        toast.error("Failed to prepare image preview");
      }
    },
    [existingCount, pendingUploads.length],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    appendUploads(Array.from(e.target.files));
    e.target.value = "";
  };

  const handleFilesAdd = (files: File[]) => {
    appendUploads(files);
  };

  const removePendingUpload = (index: number) => {
    setPendingUploads((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const toggleDeleteExisting = (imageId: number) => {
    setPendingDeletes((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]));
  };

  const onSubmit = async (data: CreateFormData) => {
    setSaving(true);

    try {
      let finalPositivePrompts: string[] = [];
      if (data.prompt_type === "json") {
        try {
          finalPositivePrompts = [JSON.stringify(JSON.parse(data.positive_prompts[0].value), null, 2)];
        } catch {
          finalPositivePrompts = [data.positive_prompts[0].value];
        }
      } else {
        finalPositivePrompts = data.positive_prompts.reduce<string[]>((values, prompt) => {
          if (prompt.value.trim() !== "") values.push(prompt.value);
          return values;
        }, []);
      }

      const payload: PromptUpdatePayload = {
        title: data.title,
        description: data.description,
        negative_prompt: data.prompt_type === "json" ? "" : data.negative_prompt,
        positive_prompts: finalPositivePrompts,
        categories: selectedCategories,
        tags: data.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        prompt_type: data.prompt_type,
        is_nsfw: data.is_nsfw === "true",
        folder_id: data.folder_id ? parseInt(data.folder_id) : null,
      };

      await updatePrompt(payload);

      if (pendingDeletes.length > 0) {
        await Promise.all(pendingDeletes.map((id) => deleteImage(id)));
      }

      if (pendingUploads.length > 0) {
        await uploadImages(pendingUploads.map((u) => u.file));
      }

      toast.success("Changes saved");
      router.push(`/prompts/${prompt.id}`);
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
      refresh();
    }
  };

  return {
    form,
    fieldArray,
    prompt,
    saving,
    folders,
    selectedCategories,
    setSelectedCategories,
    promptType,
    isNsfw,
    existingImages: prompt?.images ?? [],
    pendingUploads,
    pendingDeletes,
    totalImageCount,
    handleFileChange,
    handleFilesAdd,
    removePendingUpload,
    toggleDeleteExisting,
    onSubmit,
    router,
  };
}
