"use client";

import NextImage from 'next/image';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import { InfoTip } from '@/components/ui/InfoTip';
import { cn } from '@/lib/utils';

interface ImagesSectionProps {
  previews: string[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

export function ImagesSection({ previews, onFileChange, onRemove }: ImagesSectionProps) {
  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <ImageIcon className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">Images</span>
        <InfoTip text="Attach up to 4 reference or result images. The first image will be used as the card thumbnail." />
        <span className="ml-auto text-[10px] text-slate-400">{previews.length}/4</span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {previews.map((url, i) => (
          <div
            key={url}
            className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700/50 group"
          >
            <NextImage src={url} alt="Preview" fill unoptimized className="object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 bg-black/60 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}

        {previews.length < 4 && (
          <label
            className={cn(
              'relative rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600/50 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500 hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-all cursor-pointer',
              previews.length === 0 ? 'aspect-video col-span-2' : 'aspect-square'
            )}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={onFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-5 h-5" />
            <span className="text-[11px] font-medium">Add Image</span>
          </label>
        )}
      </div>
    </div>
  );
}
