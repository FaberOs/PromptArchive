import { Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";

interface FolderPreviewPocketProps {
  images?: string[];
  isHidden?: boolean;
  accentColor?: string;
}

export function FolderPreviewPocket({ images, isHidden, accentColor = "#E7DFD2" }: FolderPreviewPocketProps) {
  const imageClass = cn(
    "object-cover transition-transform duration-300",
    isHidden && "opacity-55 grayscale-[35%] blur-[0.5px]",
  );

  if (images && images.length > 0) {
    const displayImages = images.slice(0, 4);

    if (displayImages.length === 1) {
      return (
        <div className="relative h-[88px] w-full overflow-hidden rounded-[10px] border border-pa-border/60 bg-pa-paper">
          <div className="relative h-full w-[68%]">
            <AuthenticatedImage src={displayImages[0]} fill sizes="68vw" className={imageClass} alt="" />
          </div>
        </div>
      );
    }

    if (displayImages.length === 2) {
      return (
        <div className="relative h-[88px] w-full overflow-hidden rounded-[10px] border border-pa-border/60 bg-pa-border/40">
          <div className="grid h-full w-full grid-cols-2 gap-px">
            {displayImages.map((url) => (
              <div key={url} className="relative h-full w-full bg-pa-paper">
                <AuthenticatedImage src={url} fill sizes="34vw" className={imageClass} alt="" />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="relative h-[88px] w-full overflow-hidden rounded-[10px] border border-pa-border/60 bg-pa-border/40">
        <div className="grid h-full w-full grid-cols-2 gap-px">
          {displayImages.map((url) => (
            <div key={url} className="relative h-full w-full bg-pa-paper">
              <AuthenticatedImage src={url} fill sizes="34vw" className={imageClass} alt="" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-[88px] w-full flex-col items-center justify-center gap-1 overflow-hidden rounded-[10px] border border-dashed border-pa-border bg-pa-surface"
      style={{
        backgroundColor: `color-mix(in srgb, ${accentColor} 8%, var(--pa-surface))`,
      }}
    >
      <Folder className="h-5 w-5" style={{ color: accentColor }} strokeWidth={1.6} aria-hidden="true" />
      <span className="text-[10px] font-medium text-pa-muted-soft">Empty</span>
    </div>
  );
}
