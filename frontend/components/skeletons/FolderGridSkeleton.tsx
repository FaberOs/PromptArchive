import { Skeleton } from "@/components/ui/Skeleton"

export function FolderGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {/* Fake New Folder Button */}
        <Skeleton className="h-40 w-full rounded-xl bg-slate-100 dark:bg-slate-700/50" />
        
        {/* Fake Folders */}
        {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 h-40 flex flex-col justify-between overflow-hidden relative">
                <Skeleton className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl" />
                <div className="pt-2 space-y-2">
                    <Skeleton className="w-8 h-8 rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-20 w-full rounded-lg" />
            </div>
        ))}
    </div>
  )
}
