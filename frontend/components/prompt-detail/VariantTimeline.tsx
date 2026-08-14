import { useRouter } from "next/navigation";
import type { Prompt } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";
import { Clock, ImageIcon, GitBranch, Plus } from "lucide-react";

interface VariantTimelineProps {
  prompt: Prompt;
  rootItem: Prompt | null;
  variants: Prompt[];
}

function VariantCard({
  item,
  label,
  badgeVariant,
  isActive,
  onClick,
}: {
  item: Prompt;
  label: string;
  badgeVariant: "original" | "variant" | "active";
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div className="relative">
      <div
        className={cn(
          "absolute -left-[41px] top-12 z-10 h-5 w-5 rounded-full border-4 shadow-sm",
          isActive
            ? "border-pa-paper bg-pa-success ring-2 ring-pa-success/30 dark:border-pa-paper"
            : "border-pa-paper bg-pa-border dark:border-pa-paper",
        )}
      />

      <button
        type="button"
        onClick={onClick}
        className={cn(
          "group relative flex w-full max-w-2xl cursor-pointer flex-col gap-4 overflow-hidden rounded-pa-xl border p-4 text-left shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:-translate-y-0.5 hover:shadow-pa-card-hover md:flex-row",
          isActive
            ? "border-pa-success bg-pa-success-soft/40 ring-2 ring-pa-success/15"
            : "border-pa-border bg-pa-paper hover:border-pa-border-strong",
        )}
      >
        {isActive && (
          <Badge variant="active" size="sm" className="absolute right-3 top-3">
            Active
          </Badge>
        )}

        <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-pa-lg bg-pa-surface md:w-32">
          {item.images && item.images.length > 0 ? (
            <AuthenticatedImage
              src={item.images[0].url || `/static/${item.id}/${item.images[0].filename}`}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, 128px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-pa-muted-soft">
              <ImageIcon className="h-6 w-6 opacity-40" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <Badge variant={badgeVariant} size="sm">
              {label}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-pa-muted">
              <Clock className="h-3 w-3" />
              {new Date(item.created_at).toLocaleDateString()}
            </span>
          </div>
          <h3 className="truncate pr-16 text-lg font-bold text-pa-text">{item.title}</h3>
          <div className="mt-2 flex gap-2">
            <span className="text-[11px] font-medium text-pa-muted-soft">
              {item.prompt_type === "json" ? "JSON Workflow" : "Standard"}
            </span>
            <span className="text-[11px] text-pa-border">•</span>
            <span className="text-[11px] font-medium text-pa-muted-soft">{item.images?.length || 0} Images</span>
          </div>
        </div>
      </button>
    </div>
  );
}

export function VariantTimeline({ prompt, rootItem, variants }: VariantTimelineProps) {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-3xl space-y-8 pa-section-in">
      <div className="relative ml-4 space-y-10 border-l-2 border-pa-border py-4 pl-8">
        {rootItem && (
          <VariantCard
            item={rootItem}
            label="Original"
            badgeVariant="original"
            isActive={rootItem.id === prompt.id}
            onClick={() => router.push(`/prompts/${rootItem.id}`)}
          />
        )}

        {variants.map((variant, index) => (
          <VariantCard
            key={variant.id}
            item={variant}
            label={`V${index + 1}`}
            badgeVariant={variant.id === prompt.id ? "active" : "variant"}
            isActive={variant.id === prompt.id}
            onClick={() => router.push(`/prompts/${variant.id}`)}
          />
        ))}

        <div className="relative pt-4 max-w-2xl">
          <div className="absolute -left-[41px] top-7 z-10 h-5 w-5 rounded-full border-4 border-pa-paper bg-pa-border" />
          <button
            type="button"
            onClick={() => router.push(`/create?parent_id=${rootItem?.id || prompt.id}`)}
            className="group flex w-full items-center gap-4 rounded-pa-xl border-2 border-dashed border-pa-border p-4 text-left transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:border-pa-primary hover:bg-pa-soft-blue/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pa-soft-blue transition-colors group-hover:bg-pa-paper">
              <Plus className="h-5 w-5 text-pa-primary" />
            </div>
            <div>
              <span className="flex items-center gap-1.5 font-bold text-pa-text group-hover:text-pa-primary">
                <GitBranch className="h-4 w-4" />
                Branch new variant
              </span>
              <span className="text-xs text-pa-muted">Continue the creative evolution from this prompt.</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
