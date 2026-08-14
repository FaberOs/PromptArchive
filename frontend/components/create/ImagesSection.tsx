"use client";

import { ImageIcon } from "lucide-react";
import { ImageDropzone } from "@/components/ui/ImageDropzone";
import { FormSectionHeader } from "./FormSectionHeader";

interface ImagesSectionProps {
  previews: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilesAdd?: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export function ImagesSection({ previews, onFileChange, onFilesAdd, onRemove }: ImagesSectionProps) {
  return (
    <div className="space-y-5 rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
      <FormSectionHeader
        icon={ImageIcon}
        title="Images"
        description="Attach up to four references or results. The first image becomes the library thumbnail."
        aside={<span className="text-[10px] font-semibold text-pa-muted-soft">{previews.length}/4</span>}
      />

      <ImageDropzone previews={previews} onFileChange={onFileChange} onFilesAdd={onFilesAdd} onRemove={onRemove} />
    </div>
  );
}
