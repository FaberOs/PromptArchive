import { Skeleton } from "@/components/ui/Skeleton";

export function PromptCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-pa-xl border border-pa-border bg-pa-paper">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="flex-1 space-y-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-1 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}
