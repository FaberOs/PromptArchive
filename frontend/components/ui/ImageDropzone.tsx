"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Upload, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  previews: string[];
  maxCount?: number;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesAdd?: (files: File[]) => void;
  onRemove: (index: number) => void;
  className?: string;
}

export function ImageDropzone({
  previews,
  maxCount = 4,
  onFileChange,
  onFilesAdd,
  onRemove,
  className,
}: ImageDropzoneProps) {
  const [dragOver, setDragOver] = useState(false);
  const remaining = maxCount - previews.length;

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (remaining <= 0) return;

    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) return;

    const accepted = files.slice(0, remaining);
    if (onFilesAdd) {
      onFilesAdd(accepted);
    }
  };

  return (
    <div className={cn("grid grid-cols-2 gap-2.5", className)}>
      {previews.map((url, i) => (
        <div key={url} className="group relative aspect-square overflow-hidden rounded-pa-lg border border-pa-border">
          <NextImage
            src={url}
            alt="Preview"
            fill
            unoptimized
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label="Remove image"
            className={cn(
              "absolute right-1.5 top-1.5 rounded-full bg-pa-ink/70 p-1 text-pa-paper opacity-0 transition-opacity",
              "group-hover:opacity-100 hover:bg-pa-danger",
            )}
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
              ? "border-pa-primary bg-pa-soft-blue text-pa-text scale-[1.02] shadow-pa-subtle"
              : "border-pa-border text-pa-muted-soft hover:border-pa-border-strong hover:bg-pa-surface hover:text-pa-muted",
            previews.length === 0 ? "col-span-2 aspect-video" : "aspect-square",
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
              "h-5 w-5 transition-transform duration-300 ease-[var(--pa-ease-emphasized)]",
              dragOver ? "-translate-y-1 scale-110 text-pa-primary" : "group-hover:-translate-y-1",
            )}
            strokeWidth={1.8}
          />
          <span className="text-[11px] font-medium transition-colors">Add Image</span>
          <span className="text-[10px] text-pa-muted-soft">Drag image here or click to browse</span>
          <span className="text-[10px] font-semibold text-pa-muted">
            {previews.length}/{maxCount}
          </span>
        </label>
      )}
    </div>
  );
}
