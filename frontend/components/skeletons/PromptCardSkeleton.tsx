import { Skeleton } from "@/components/ui/Skeleton"

export function PromptCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-lg overflow-hidden h-full flex flex-col">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-3 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <div className="flex gap-1 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
