"use client";

import { useState, useCallback, useRef } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FolderOpen,
  FileImage,
  HardDrive,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PromptImage } from "@/lib/types";
import { API_BASE_URL } from "@/lib/constants";
import { useDialogModal } from "@/hooks/useDialogModal";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";

interface ImageViewerProps {
  images: PromptImage[];
  imageOwnerId?: number | null;
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

function normalizeMediaPath(mediaUrl: string | undefined): string {
  if (typeof mediaUrl !== "string" || mediaUrl.length === 0) return "";

  try {
    return new URL(mediaUrl).pathname;
  } catch {
    return mediaUrl.split("?")[0].split("#")[0];
  }
}

function toPromptArchiveStoragePath(mediaUrl: string | undefined): string | undefined {
  const pathname = normalizeMediaPath(mediaUrl);
  if (!pathname.startsWith("/static/")) return undefined;

  const relativePath = decodeURIComponent(pathname.slice("/static/".length));
  return `data/prompt-archive/images/${relativePath}`;
}

function resolveViewerImageSrc(image: PromptImage, imageOwnerId?: number | null): string | null {
  if (typeof image.url === "string" && image.url.length > 0) {
    if (/^https?:\/\//i.test(image.url)) {
      return image.url;
    }

    return `${API_BASE_URL}${image.url}`;
  }

  if (typeof image.filename === "string" && image.filename.length > 0 && typeof imageOwnerId === "number") {
    return `${API_BASE_URL}/static/${imageOwnerId}/${encodeURIComponent(image.filename)}`;
  }

  return null;
}

function inferMimeType(candidatePath: string | undefined, fallback = "image/jpeg"): string {
  if (!candidatePath) return fallback;
  const lower = candidatePath.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg";
  return fallback;
}

export default function ImageViewer(props: ImageViewerProps) {
  return useImageViewerView(props);
}

function useImageViewerView({ images, imageOwnerId, initialIndex, isOpen, onClose }: ImageViewerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [resolvedStoragePaths, setResolvedStoragePaths] = useState<Record<string, string>>({});
  const [sendingToNano, setSendingToNano] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useDialogModal(dialogRef, isOpen);

  const imageCount = images.length;
  const hasImages = imageCount > 0;
  const safeIndex = hasImages ? ((currentIndex % imageCount) + imageCount) % imageCount : -1;
  const currentImage = hasImages ? images[safeIndex] : null;
  const currentImageSrc = currentImage ? resolveViewerImageSrc(currentImage, imageOwnerId) : null;

  const nextImage = useCallback(() => {
    if (imageCount <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % imageCount);
  }, [imageCount]);

  const prevImage = useCallback(() => {
    if (imageCount <= 1) return;
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + imageCount) % imageCount);
  }, [imageCount]);

  const revealInFolder = useCallback(async (imageUrl: string) => {
    if (!imageUrl || typeof window === "undefined") return;

    const electronAPI = (
      window as Window & {
        electronAPI?: {
          revealMediaInFolder?: (payload: { appId: "prompt-archive"; mediaUrl: string }) => Promise<string | null>;
        };
      }
    ).electronAPI;

    const resolvedPath = await electronAPI
      ?.revealMediaInFolder?.({
        appId: "prompt-archive",
        mediaUrl: imageUrl,
      })
      .catch(() => null);

    if (!resolvedPath) return;

    setResolvedStoragePaths((prev) => ({
      ...prev,
      [imageUrl]: resolvedPath,
    }));
  }, []);

  const sendToNanobanana = useCallback(async () => {
    if (!currentImage || !currentImageSrc || sendingToNano) return;
    if (typeof window === "undefined") return;

    const electronAPI = (
      window as Window & {
        electronAPI?: {
          artifact?: {
            create: (payload: {
              artifact: {
                kind: "media";
                title?: string;
                source: {
                  appId: "prompt-archive";
                  entityType?: string;
                  entityId?: string;
                  route?: string;
                };
                file?: {
                  appId: "prompt-archive";
                  mediaUrl?: string;
                  localPath?: string;
                  mimeType?: string;
                };
                tags?: string[];
                metadata?: Record<string, string | number | boolean | null>;
              };
            }) => Promise<{ artifact: { id: string } }>;
            transfer: (payload: {
              artifactId: string;
              toAppId: "nanobanana";
              targetRoute: string;
              openAfterTransfer: boolean;
            }) => Promise<unknown>;
          };
        };
      }
    ).electronAPI;

    if (!electronAPI?.artifact) return;

    setSendError(null);
    setSendingToNano(true);
    try {
      const sourceUrl = currentImage.url || currentImageSrc;
      const resolvedPath =
        resolvedStoragePaths[currentImage.url || ""] ?? toPromptArchiveStoragePath(sourceUrl) ?? undefined;
      const fileLabel =
        currentImage.filename ||
        decodeURIComponent(normalizeMediaPath(sourceUrl).split("/").pop() ?? "") ||
        `prompt-${Date.now()}.jpg`;

      const createResult = await electronAPI.artifact.create({
        artifact: {
          kind: "media",
          title: `Prompt Archive · ${fileLabel}`,
          source: {
            appId: "prompt-archive",
            entityType: "prompt-image",
            entityId: typeof imageOwnerId === "number" ? String(imageOwnerId) : fileLabel,
            route: typeof imageOwnerId === "number" ? `/prompts/${imageOwnerId}` : undefined,
          },
          file: {
            appId: "prompt-archive",
            mediaUrl: sourceUrl,
            localPath: resolvedPath,
            mimeType: inferMimeType(fileLabel),
          },
          tags: ["prompt-archive", "image", "viewer"],
          metadata: {
            fileName: fileLabel,
            promptId: typeof imageOwnerId === "number" ? imageOwnerId : null,
          },
        },
      });

      const artifactId = createResult.artifact.id;
      await electronAPI.artifact.transfer({
        artifactId,
        toAppId: "nanobanana",
        targetRoute: `/?artifactId=${encodeURIComponent(artifactId)}`,
        openAfterTransfer: true,
      });
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not send to NanoBanana.");
    } finally {
      setSendingToNano(false);
    }
  }, [currentImage, currentImageSrc, imageOwnerId, resolvedStoragePaths, sendingToNano]);

  if (!isOpen) return null;

  if (!currentImage) {
    return (
      <dialog
        ref={dialogRef}
        className="m-0 h-screen w-screen max-h-none max-w-none fixed inset-0 z-pa-fixed-content items-center justify-center border-0 bg-pa-ink/90 p-0 backdrop:bg-pa-ink/90 backdrop:backdrop-blur-sm"
        aria-label="Image viewer"
        onCancel={(event) => {
          event.preventDefault();
          onClose();
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Close viewer"
        >
          <X className="h-8 w-8" aria-hidden="true" />
        </button>
        <div className="rounded-pa-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white/80">
          No image available to preview.
        </div>
      </dialog>
    );
  }

  const currentStoragePath =
    (typeof currentImage.url === "string" ? resolvedStoragePaths[currentImage.url] : undefined) ??
    toPromptArchiveStoragePath(currentImage.url) ??
    toPromptArchiveStoragePath(currentImageSrc ?? undefined);
  const filename =
    (typeof currentImage.filename === "string" && currentImage.filename) ||
    decodeURIComponent(
      normalizeMediaPath(currentImage.url || currentImageSrc || undefined)
        .split("/")
        .pop() ?? "",
    );

  return (
    <dialog
      ref={dialogRef}
      className="m-0 h-screen w-screen max-h-none max-w-none fixed inset-0 z-pa-fixed-content flex items-center justify-center border-0 bg-pa-ink/90 p-0 backdrop:bg-pa-ink/90 backdrop:backdrop-blur-sm"
      aria-label="Image viewer"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
        if (e.key === "ArrowRight") nextImage();
        if (e.key === "ArrowLeft") prevImage();
      }}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
        aria-label="Close viewer"
      >
        <X className="h-8 w-8" aria-hidden="true" />
      </button>

      {/* Navigation Buttons */}
      {imageCount > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 z-40 -translate-y-1/2 rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-8 w-8" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            aria-label="Next image"
            className="absolute right-4 top-1/2 z-40 -translate-y-1/2 rounded-full p-3 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ChevronRight className="h-8 w-8" aria-hidden="true" />
          </button>
        </>
      )}

      {/* Main Content */}
      <div
        role="presentation"
        className={cn(
          "relative w-full h-full flex p-4",
          isZoomed ? "overflow-auto items-start justify-start" : "items-center justify-center overflow-hidden",
        )}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="absolute left-4 top-4 z-40 max-w-[min(720px,calc(100vw-2rem))] rounded-xl bg-black/55 backdrop-blur-md text-white p-3 border border-white/10 shadow-lg">
          <div className="text-xs font-semibold flex items-center gap-1.5 truncate">
            <FileImage className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{filename}</span>
          </div>
          <div className="mt-1.5 text-[11px] text-white/85 flex items-start gap-1.5">
            <HardDrive className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span className="font-mono break-all leading-relaxed">
              {currentStoragePath ?? "Local path unavailable"}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void revealInFolder(currentImage.url || currentImageSrc || "");
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium bg-white/10 hover:bg-white/20 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Reveal in folder
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void sendToNanobanana();
            }}
            disabled={sendingToNano}
            className="mt-2 inline-flex items-center gap-1.5 rounded-pa-md bg-pa-warning/20 px-2.5 py-1.5 text-[11px] font-medium text-pa-warning-soft transition-colors hover:bg-pa-warning/30 disabled:opacity-50"
          >
            {sendingToNano ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {sendingToNano ? "Sending..." : "Send to NanoBanana"}
          </button>
          {sendError && (
            <p className="mt-2 text-[10px] text-pa-danger-soft" role="alert">
              {sendError}
            </p>
          )}
        </div>

        <div
          role="button"
          tabIndex={0}
          aria-label="Toggle image zoom"
          className={cn(
            "relative transition-transform duration-[var(--pa-motion-slow)] ease-out",
            isZoomed
              ? "cursor-zoom-out min-w-full min-h-full"
              : "cursor-zoom-in w-full h-full flex items-center justify-center",
          )}
          style={{
            width: isZoomed ? "auto" : "100%",
            height: isZoomed ? "auto" : "100%",
            maxWidth: isZoomed ? "none" : "100%",
            maxHeight: isZoomed ? "none" : "100%",
            aspectRatio: isZoomed ? "auto" : undefined,
            margin: isZoomed ? "auto" : "0",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsZoomed((value) => !value);
            }
          }}
        >
          {currentImageSrc ? (
            <AuthenticatedImage
              src={currentImageSrc}
              alt="Fullscreen view"
              fill={!isZoomed}
              width={isZoomed ? 0 : undefined}
              height={isZoomed ? 0 : undefined}
              sizes="100vw"
              style={isZoomed ? { width: "auto", height: "auto", minWidth: "100vw" } : { objectFit: "contain" }}
              className={cn("select-none", isZoomed ? "" : "max-w-full max-h-full")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-white/70">
              No preview available for this image.
            </div>
          )}
        </div>

        {/* Zoom Hint / Counter */}
        {!isZoomed && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/50 text-white rounded-full text-sm backdrop-blur-md pointer-events-none">
            <span>
              {safeIndex + 1} / {imageCount}
            </span>
            <div className="w-px h-4 bg-white/20"></div>
            <span className="flex items-center gap-1 text-white/70">
              {isZoomed ? <ZoomOut className="w-3 h-3" /> : <ZoomIn className="w-3 h-3" />}
              {isZoomed ? "Click to fit" : "Click to zoom"}
            </span>
          </div>
        )}
      </div>
    </dialog>
  );
}
