import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import api, { getFolders, privateSessionRequest, publicSessionRequest } from "@/lib/api";
import type { Folder, PromptCreatePayload, Prompt, Category, Tag, PositivePrompt } from "@/lib/types";
import { toast } from "sonner";
import { useSecurity } from "@/components/SecurityProvider";

export interface CreateFormData {
  title: string;
  description: string;
  negative_prompt: string;
  positive_prompts: { value: string }[];
  tags: string;
  is_nsfw: string;
  prompt_type: "structured" | "json";
  folder_id: string;
}

interface LocalUpload {
  file: File;
  previewUrl: string;
}

interface ArtifactFileRefLike {
  mediaUrl?: string;
  mimeType?: string;
}

interface ArtifactRecordLike {
  id: string;
  kind: string;
  title?: string;
  text?: string;
  metadata?: Record<string, string | number | boolean | null>;
  source: {
    appId: string;
    entityType?: string;
  };
  file?: ArtifactFileRefLike;
}

interface ArtifactResolveResultLike {
  artifact: ArtifactRecordLike | null;
  filePath: string | null;
  exists: boolean;
}

interface RendererArtifactAPI {
  resolve: (payload: { artifactId: string }) => Promise<ArtifactResolveResultLike>;
}

interface RendererElectronAPI {
  artifact?: RendererArtifactAPI;
  readFile?: (payload: {
    filePath: string;
    encoding?: "utf8" | "utf-8" | "base64" | "binary" | "latin1" | "hex";
  }) => Promise<string>;
}

function getRendererElectronAPI(): RendererElectronAPI | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { electronAPI?: RendererElectronAPI }).electronAPI ?? null;
}

function inferMimeType(filePath: string, fallback = "application/octet-stream"): string {
  const dot = filePath.lastIndexOf(".");
  const ext = dot >= 0 ? filePath.slice(dot + 1).toLowerCase() : "";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  return fallback;
}

function fileNameFromPath(filePath: string, fallback: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const candidate = normalized.split("/").pop();
  if (!candidate || candidate.trim().length === 0) return fallback;
  return candidate;
}

function base64ToFile(base64: string, fileName: string, mimeType: string): File {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new File([bytes], fileName, { type: mimeType });
}

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

export function useCreatePrompt() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isNsfwUnlocked } = useSecurity();
  const parentId = searchParams.get("parent_id");
  const folderIdParam = searchParams.get("folder_id");
  const artifactId = searchParams.get("artifactId");

  const [loading, setLoading] = useState(false);
  const [uploads, setUploads] = useState<LocalUpload[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [artifactImporting, setArtifactImporting] = useState(false);

  const importedArtifactRef = useRef<string | null>(null);

  const form = useForm<CreateFormData>({
    defaultValues: {
      positive_prompts: [{ value: "" }],
      is_nsfw: "false",
      prompt_type: "structured",
      folder_id: folderIdParam ?? "",
    },
  });

  const { control, watch, setValue, reset } = form;
  const promptType = watch("prompt_type");
  const isNsfw = watch("is_nsfw");
  const isNsfwEnabled = isNsfw === "true";

  const selectedFiles = useMemo(() => uploads.map((u) => u.file), [uploads]);
  const previews = useMemo(() => uploads.map((u) => u.previewUrl), [uploads]);

  const fieldArray = useFieldArray({
    control,
    name: "positive_prompts",
    rules: { maxLength: 3 },
  });

  const { data: folders = [] } = useQuery<Folder[]>({
    queryKey: ["create-prompt-folders", isNsfwEnabled],
    queryFn: () => getFolders(isNsfwEnabled).then((res) => res.data),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const { data: parentPrompt } = useQuery<Prompt>({
    queryKey: ["create-prompt-parent", parentId, isNsfwUnlocked],
    queryFn: () =>
      api
        .get<Prompt>(`/prompts/${parentId}`, {
          params: { show_hidden: isNsfwUnlocked },
          ...(isNsfwUnlocked ? privateSessionRequest : publicSessionRequest),
        })
        .then((res) => res.data),
    enabled: !!parentId,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  // Sync folder from URL
  useEffect(() => {
    if (!parentId && folderIdParam) setValue("folder_id", folderIdParam);
  }, [parentId, folderIdParam, setValue]);

  // Load parent data if creating variant
  useEffect(() => {
    if (!parentPrompt) return;
    reset({
      title: `${parentPrompt.title} (Variant)`,
      description: parentPrompt.description || "",
      negative_prompt: parentPrompt.negative_prompt || "",
      positive_prompts: parentPrompt.positive_prompts?.length
        ? parentPrompt.positive_prompts.map((p: PositivePrompt) => ({
            value: p.content,
          }))
        : [{ value: "" }],
      tags: parentPrompt.tags.map((t: Tag) => t.name).join(", "),
      is_nsfw: String(parentPrompt.is_nsfw),
      prompt_type: parentPrompt.prompt_type,
      folder_id: parentPrompt.folder_id === null ? "" : String(parentPrompt.folder_id),
    });
    setSelectedCategories(parentPrompt.categories.map((c: Category) => c.name));
  }, [parentPrompt, reset]);

  const appendUploads = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;

      const available = Math.max(0, 4 - uploads.length);
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
        setUploads((prev) => [...prev, ...nextUploads]);
      } catch {
        toast.error("Failed to prepare image preview");
      }
    },
    [uploads.length],
  );

  // Import from cross-app artifact transfer
  useEffect(() => {
    if (!artifactId || parentId) return;
    const normalizedId = artifactId.trim();
    if (!normalizedId) return;
    if (importedArtifactRef.current === normalizedId) return;
    importedArtifactRef.current = normalizedId;

    const electronAPI = getRendererElectronAPI();
    if (!electronAPI?.artifact?.resolve) {
      toast.error("Artifact bridge not available in this environment");
      return;
    }
    const artifactAPI = electronAPI.artifact;

    let cancelled = false;
    setArtifactImporting(true);

    void (async () => {
      try {
        const resolved = await artifactAPI.resolve({
          artifactId: normalizedId,
        });
        if (cancelled) return;

        const artifact = resolved.artifact;
        if (!artifact) {
          toast.error("Artifact not found");
          return;
        }

        const sourceAppId = artifact.source.appId?.trim();
        const promptFromMetadata =
          typeof artifact.metadata?.sourcePrompt === "string" ? artifact.metadata.sourcePrompt.trim() : "";
        const suggestedText = promptFromMetadata || artifact.text?.trim() || "";

        // NanoBanana exports should only prefill the prompt field.
        if (sourceAppId === "nanobanana") {
          if (suggestedText) {
            setValue("positive_prompts.0.value", suggestedText, {
              shouldDirty: true,
            });
          }
        } else {
          const title = artifact.title?.trim();
          if (title) {
            setValue("title", title, { shouldDirty: true });
          }

          if (suggestedText) {
            setValue("description", suggestedText, { shouldDirty: true });
            setValue("positive_prompts.0.value", suggestedText, {
              shouldDirty: true,
            });
          }

          const entityTag = artifact.source.entityType?.trim();
          const importTags = ["artifact", `from:${artifact.source.appId}`];
          if (entityTag) importTags.push(entityTag);
          setValue("tags", importTags.join(", "), { shouldDirty: true });
        }

        if (resolved.exists && resolved.filePath && electronAPI.readFile) {
          const base64 = await electronAPI.readFile({
            filePath: resolved.filePath,
            encoding: "base64",
          });
          if (cancelled) return;

          const fileName = fileNameFromPath(resolved.filePath, `${artifact.id}.bin`);
          const mimeType = artifact.file?.mimeType ?? inferMimeType(resolved.filePath, "application/octet-stream");
          const file = base64ToFile(base64, fileName, mimeType);
          await appendUploads([file]);
        }

        toast.success("Artifact imported into New Prompt");
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Failed to import artifact";
        toast.error(message);
      } finally {
        if (!cancelled) {
          setArtifactImporting(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appendUploads, artifactId, parentId, setValue]);

  // File handling
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    appendUploads(Array.from(e.target.files));
  };

  const handleFilesAdd = (files: File[]) => {
    appendUploads(files);
  };

  const removeImage = (i: number) => {
    setUploads((prev) => {
      const next = [...prev];
      next.splice(i, 1);
      return next;
    });
  };

  // Submit
  const onSubmit = async (data: CreateFormData) => {
    setLoading(true);
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
      const payload: PromptCreatePayload = {
        title: data.title,
        description: data.description,
        negative_prompt: data.prompt_type === "json" ? "" : data.negative_prompt,
        positive_prompts: finalPositivePrompts,
        categories: selectedCategories,
        tags: data.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        is_nsfw: data.is_nsfw === "true",
        prompt_type: data.prompt_type,
        parent_id: parentId ? parseInt(parentId) : undefined,
        folder_id: data.folder_id ? parseInt(data.folder_id) : null,
      };
      const privatePayload = payload.is_nsfw || Boolean(payload.parent_id) || payload.folder_id !== null;
      const res = await api.post<Prompt>("/prompts/", payload, {
        ...(privatePayload ? privateSessionRequest : publicSessionRequest),
      });
      if (selectedFiles.length > 0) {
        await Promise.all(
          selectedFiles.map((f) => {
            const fd = new FormData();
            fd.append("file", f);
            return api.post(`/prompts/${res.data.id}/images`, fd, {
              ...(privatePayload ? privateSessionRequest : publicSessionRequest),
            });
          }),
        );
      }
      toast.success("Prompt created!");
      router.push(`/prompts/${res.data.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create prompt");
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    fieldArray,
    parentId,
    artifactId,
    artifactImporting,
    loading,
    folders,
    selectedFiles,
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
  };
}
