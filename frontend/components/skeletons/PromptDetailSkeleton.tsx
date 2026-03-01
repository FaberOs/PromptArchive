import { Skeleton } from "@/components/ui/Skeleton"

export function PromptDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* Top Nav */}
      <div className="flex items-center justify-between">
         <Skeleton className="h-9 w-32" />
         <div className="flex gap-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
         </div>
      </div>

      {/* Header Info */}
      <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-6 w-20" /> {/* Variant badge placeholder */}
                <Skeleton className="h-10 w-2/3" />
            </div>

            <div className="flex flex-wrap items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-700/50">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2 ml-auto">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>
            </div>

            <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Gallery */}
      <div className="bg-white dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/50">
          <div className="flex flex-col lg:flex-row gap-4">
              {/* Vertical Carousel Skeleton */}
              <div className="flex lg:flex-col gap-3 lg:w-28">
                  <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                  <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
                  <Skeleton className="w-20 h-20 rounded-lg shrink-0" />
              </div>
              {/* Main Image */}
              <div className="flex-1 space-y-4">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <div className="flex justify-center gap-3">
                      <Skeleton className="h-16 w-24 rounded-lg" />
                      <Skeleton className="h-16 w-24 rounded-lg" />
                      <Skeleton className="h-16 w-24 rounded-lg" />
                  </div>
              </div>
          </div>
      </div>

      {/* Prompts */}
      <div className="space-y-8">
          <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-lg" />
                  <Skeleton className="h-32 w-full rounded-lg" />
              </div>
          </div>
          <div className="space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24 w-full rounded-lg" />
          </div>
      </div>

    </div>
  )
}
