import { Skeleton } from "@/components/ui/Skeleton";

export function FolderGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative h-[198px] pt-4">
          <Skeleton className="absolute left-[10px] right-[10px] top-[13px] h-[3px] rounded-full" />
          <Skeleton className="absolute left-[10px] top-0 h-4 w-24 rounded-t-[10px]" />
          <div className="flex h-full flex-col overflow-hidden rounded-b-2xl rounded-t-[14px] border border-pa-border bg-pa-paper">
            <Skeleton className="mx-3 mt-3 h-[88px] rounded-[10px]" />
            <div className="mt-auto min-h-[64px] shrink-0 space-y-1.5 border-t border-pa-border/70 px-4 pb-4 pt-3">
              <Skeleton className="h-3.5 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
