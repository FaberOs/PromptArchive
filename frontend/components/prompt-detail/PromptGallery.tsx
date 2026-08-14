import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Prompt } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { ImageIcon, ArrowLeft, GitBranch, ChevronUp, ChevronDown } from "lucide-react";
import ImageViewer from "@/components/ImageViewer";
import { useScrollBounds } from "@/hooks/useScrollBounds";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";

interface PromptGalleryProps {
  prompt: Prompt;
  variants: Prompt[];
  previewVariant: Prompt | null;
  setPreviewVariant: (variant: Prompt | null) => void;
}

export default function PromptGallery({ prompt, variants, previewVariant, setPreviewVariant }: PromptGalleryProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { canScrollUp, canScrollDown } = useScrollBounds(scrollContainerRef);

  const hasImages = prompt.images && prompt.images.length > 0;
  const activeImage = hasImages ? prompt.images[activeImageIndex] : null;

  const displayImage = previewVariant
    ? previewVariant.images && previewVariant.images.length > 0
      ? previewVariant.images[0]
      : null
    : activeImage;

  const viewerImages = previewVariant ? previewVariant.images || [] : prompt.images;

  const scroll = (direction: "up" | "down") => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: direction === "up" ? -100 : 100,
        behavior: "smooth",
      });
    }
  };

  const heroImageSrc = displayImage
    ? displayImage.url || `/static/${previewVariant?.id ?? prompt.id}/${displayImage.filename}`
    : null;

  if (!hasImages && (!variants.length || prompt.parent_id)) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-pa-xl border-2 border-dashed border-pa-border bg-pa-surface text-pa-muted sm:h-48">
        <ImageIcon className="mb-2 h-10 w-10 opacity-20" />
        <span>No images attached</span>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-pa-2xl border border-pa-border bg-pa-paper p-2 shadow-pa-card sm:p-3 md:p-4">
      <div className="flex min-h-0 flex-col gap-4 lg:min-h-128 lg:flex-row">
        {!prompt.parent_id && variants.length > 0 && (
          <div className="relative flex w-full shrink-0 flex-col lg:h-full lg:max-h-112 lg:w-28">
            <button
              type="button"
              onClick={() => scroll("up")}
              aria-label="Scroll variants up"
              className={cn(
                "absolute -top-3 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-pa-border bg-pa-paper p-1 shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:scale-110 lg:inline-flex",
                canScrollUp ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              <ChevronUp className="h-4 w-4 text-pa-muted" />
            </button>

            <div className="hidden py-1 text-center text-[10px] font-bold uppercase tracking-widest text-pa-muted-soft lg:block">
              Variants
            </div>

            <div
              ref={scrollContainerRef}
              className="scrollbar-none flex w-full gap-3 overflow-x-auto rounded-pa-lg border border-pa-border bg-pa-surface p-2 scroll-smooth lg:h-full lg:flex-col lg:items-center lg:overflow-y-auto lg:overflow-x-hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => setPreviewVariant(null)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setPreviewVariant(null);
                  }
                }}
                aria-label="Preview original prompt image"
                aria-pressed={previewVariant === null}
                className={cn(
                  "relative h-20 w-20 shrink-0 cursor-pointer overflow-hidden rounded-pa-md transition-[background-color,border-color,color,opacity,transform,box-shadow]",
                  previewVariant === null
                    ? "z-10 scale-105 border-2 border-pa-primary shadow-pa-subtle ring-2 ring-pa-primary/15"
                    : "border border-pa-border opacity-60 hover:opacity-100",
                )}
                title="Original"
              >
                {prompt.images && prompt.images.length > 0 ? (
                  <AuthenticatedImage
                    src={prompt.images[0].url}
                    alt="Original"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-pa-surface text-pa-muted-soft">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-center text-[9px] font-bold text-white">
                  ORIGINAL
                </div>
              </div>

              {variants.map((v, idx) => (
                <div key={v.id} className="group relative h-20 w-20 shrink-0">
                  <button
                    type="button"
                    onClick={() => setPreviewVariant(v)}
                    aria-label={`Preview variant ${idx + 1}: ${v.title}`}
                    aria-pressed={previewVariant?.id === v.id}
                    className={cn(
                      "relative h-full w-full cursor-pointer overflow-hidden rounded-pa-md transition-[background-color,border-color,color,opacity,transform,box-shadow]",
                      previewVariant?.id === v.id
                        ? "z-10 scale-105 border-2 border-pa-success shadow-pa-subtle ring-2 ring-pa-success/20"
                        : "border border-pa-border opacity-60 hover:opacity-100",
                    )}
                    title={v.title}
                  >
                    {v.images && v.images.length > 0 ? (
                      <AuthenticatedImage
                        src={v.images[0].url || `/static/${v.id}/${v.images[0].filename}`}
                        alt={v.title}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-pa-surface text-pa-muted-soft">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-center text-[9px] font-bold text-white">
                      V{idx + 1}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push(`/prompts/${v.id}`)}
                    className="absolute right-1 top-1 z-10 rounded-full bg-pa-paper/90 p-1 text-pa-text opacity-0 shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:bg-pa-success hover:text-white group-hover:opacity-100 dark:bg-pa-surface/90 dark:text-pa-text"
                    title="Open Details"
                    aria-label={`Open variant ${idx + 1}`}
                  >
                    <ArrowLeft className="h-3 w-3 rotate-180" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => scroll("down")}
              aria-label="Scroll variants down"
              className={cn(
                "absolute -bottom-3 left-1/2 z-20 hidden -translate-x-1/2 rounded-full border border-pa-border bg-pa-paper p-1 shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:scale-110 lg:inline-flex",
                canScrollDown ? "visible opacity-100" : "invisible opacity-0",
              )}
            >
              <ChevronDown className="h-4 w-4 text-pa-muted" />
            </button>
          </div>
        )}

        <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-4">
          <div className="group relative flex min-h-48 flex-1 items-center justify-center overflow-hidden rounded-pa-lg border border-pa-border bg-pa-surface sm:min-h-75">
            {displayImage && heroImageSrc ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsViewerOpen(true)}
                  aria-label="Open fullscreen image view"
                  className="relative flex h-full max-h-[50vh] w-full max-w-full cursor-zoom-in items-center justify-center sm:max-h-[60vh] lg:max-h-[70vh]"
                >
                  <AuthenticatedImage
                    src={heroImageSrc}
                    alt={`Preview image for ${previewVariant?.title ?? prompt.title}`}
                    width={1200}
                    height={900}
                    sizes="100vw"
                    className="h-auto max-h-[50vh] w-auto max-w-full object-contain sm:max-h-[60vh] lg:max-h-[70vh]"
                  />
                </button>

                {previewVariant && (
                  <div className="pointer-events-none absolute left-3 right-3 top-3 flex items-start justify-between sm:left-4 sm:right-4 sm:top-4">
                    <div className="flex items-center gap-2 rounded-pa-lg bg-pa-success/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-pa-float backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs">
                      <GitBranch className="h-3 w-3" />
                      Previewing Variant
                    </div>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/5 dark:group-hover:bg-black/20">
                  <div className="rounded-full bg-pa-paper/90 px-3 py-1.5 text-xs font-medium text-pa-text opacity-0 shadow-pa-subtle backdrop-blur-sm transition-opacity group-hover:opacity-100 sm:px-4 sm:py-2 sm:text-sm dark:bg-pa-ink/50 dark:text-pa-paper">
                    Fullscreen View
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-pa-muted-soft">
                <ImageIcon className="mb-2 h-12 w-12 opacity-20" />
                <span>No image available</span>
              </div>
            )}
          </div>

          {previewVariant ? (
            <div className="pa-section-in flex shrink-0 flex-col gap-3 rounded-pa-xl border border-pa-border bg-pa-surface p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
              <div className="min-w-0">
                <h4 className="truncate text-sm font-bold text-pa-text">{previewVariant.title}</h4>
                {previewVariant.description ? (
                  <p className="line-clamp-2 wrap-break-word text-xs text-pa-muted">{previewVariant.description}</p>
                ) : null}
              </div>
              <Button
                size="sm"
                onClick={() => router.push(`/prompts/${previewVariant.id}`)}
                className="w-full shrink-0 bg-pa-success text-white hover:opacity-90 sm:w-auto"
              >
                View Full Details <ArrowLeft className="ml-2 h-3 w-3 rotate-180" />
              </Button>
            </div>
          ) : (
            prompt.images.length > 1 && (
              <div className="flex max-w-full shrink-0 justify-start gap-2 overflow-x-auto py-1 sm:justify-center sm:gap-3 sm:py-2">
                {prompt.images.map((img, idx) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={cn(
                      "relative h-14 w-20 shrink-0 overflow-hidden rounded-pa-md border-2 transition-[background-color,border-color,color,opacity,transform,box-shadow] sm:h-16 sm:w-24",
                      activeImageIndex === idx
                        ? "border-pa-success opacity-100 ring-2 ring-pa-success/20"
                        : "border-transparent opacity-50 hover:opacity-80",
                    )}
                  >
                    <AuthenticatedImage
                      src={img.url}
                      alt="Thumbnail"
                      fill
                      sizes="(max-width: 640px) 80px, 96px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {(hasImages || (previewVariant && previewVariant.images && previewVariant.images.length > 0)) && (
        <ImageViewer
          images={viewerImages}
          imageOwnerId={previewVariant?.id ?? prompt.id}
          initialIndex={previewVariant ? 0 : activeImageIndex}
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
        />
      )}
    </div>
  );
}
