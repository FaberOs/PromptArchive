"use client";

import { useState } from "react";
import { ImageIcon, Trash2, Undo2, Upload } from "lucide-react";
import type { PromptImage } from "@/lib/types";
import { FormSectionHeader } from "./FormSectionHeader";
import { cn } from "@/lib/utils";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";

interface EditImagesSectionProps {
  allImages: PromptImage[];
  pendingUploads: { previewUrl: string }[];
  pendingDeletes: number[];
  totalCount: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesAdd?: (files: File[]) => void;
  onRemovePending: (index: number) => void;
  onToggleDeleteExisting: (imageId: number) => void;
}

export function EditImagesSection({
  allImages,
  pendingUploads,
  pendingDeletes,
  totalCount,
  onFileChange,
  onFilesAdd,
  onRemovePending,
  onToggleDeleteExisting,
}: EditImagesSectionProps) {
  const [dragOver, setDragOver] = useState(false);
  const remaining = Math.max(0, 4 - totalCount);
  const pendingDeleteSet = new Set(pendingDeletes);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (remaining <= 0 || !onFilesAdd) return;

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length > 0) onFilesAdd(files.slice(0, remaining));
  };

  return (
    <div className="space-y-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
      <FormSectionHeader
        icon={ImageIcon}
        title="Images"
        description="Attach up to four references or results. The first image becomes the library thumbnail."
        aside={<span className="text-[10px] font-semibold text-pa-muted-soft">{totalCount}/4</span>}
      />

      <div className="grid grid-cols-2 gap-2.5">
        {allImages.map((img) => {
          const markedForDelete = pendingDeleteSet.has(img.id);
          return (
            <div
              key={img.id}
              className={cn(
                "group relative aspect-square overflow-hidden rounded-pa-lg border border-pa-border",
                markedForDelete && "opacity-40 ring-2 ring-pa-danger/50",
              )}
            >
              <AuthenticatedImage
                src={img.url}
                alt="Existing image"
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => onToggleDeleteExisting(img.id)}
                aria-label={markedForDelete ? "Undo remove" : "Remove image"}
                className={cn(
                  "absolute right-1.5 top-1.5 rounded-full p-1 text-pa-paper opacity-0 transition-opacity group-hover:opacity-100",
                  markedForDelete ? "bg-pa-muted hover:bg-pa-text" : "bg-pa-ink/70 hover:bg-pa-danger",
                )}
              >
                {markedForDelete ? <Undo2 className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
              </button>
            </div>
          );
        })}

        {pendingUploads.map((upload, index) => (
          <div
            key={upload.previewUrl}
            className="group relative aspect-square overflow-hidden rounded-pa-lg border border-pa-border"
          >
            <AuthenticatedImage
              src={upload.previewUrl}
              alt="New upload preview"
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePending(index)}
              aria-label="Remove new image"
              className="absolute right-1.5 top-1.5 rounded-full bg-pa-ink/70 p-1 text-pa-paper opacity-0 transition-opacity group-hover:opacity-100 hover:bg-pa-danger"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        ))}

        {remaining > 0 && (
          <label
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "group relative flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-pa-lg border-2 border-dashed transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300",
              dragOver
                ? "scale-[1.02] border-pa-primary bg-pa-soft-blue text-pa-text shadow-pa-subtle"
                : "border-pa-border text-pa-muted-soft hover:border-pa-border-strong hover:bg-pa-surface hover:text-pa-muted",
              totalCount === 0 ? "col-span-2 aspect-video" : "aspect-square",
            )}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />
            <Upload
              className={cn(
                "h-5 w-5 transition-transform duration-300 ease-(--pa-ease-emphasized)",
                dragOver ? "-translate-y-1 scale-110 text-pa-primary" : "group-hover:-translate-y-1",
              )}
              strokeWidth={1.8}
            />
            <span className="text-[11px] font-medium">Add Image</span>
            <span className="text-[10px] text-pa-muted-soft">Drag here or click to browse</span>
          </label>
        )}
      </div>
    </div>
  );
}
