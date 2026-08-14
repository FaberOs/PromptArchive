import { Skeleton } from "@/components/ui/Skeleton";
import { PageContainer } from "@/components/templates/PageContainer";

export function PromptDetailSkeleton() {
  return (
    <PageContainer variant="wide" className="pa-section-in space-y-8">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-10 w-2/3" />
        </div>

        <div className="flex flex-wrap items-center gap-6 border-b border-pa-border pb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>

        <Skeleton className="h-24 w-full rounded-pa-lg" />
      </div>

      <div className="rounded-pa-2xl border border-pa-border bg-pa-paper p-4">
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="flex gap-3 lg:w-28 lg:flex-col">
            <Skeleton className="h-20 w-20 shrink-0 rounded-pa-lg" />
            <Skeleton className="h-20 w-20 shrink-0 rounded-pa-lg" />
            <Skeleton className="h-20 w-20 shrink-0 rounded-pa-lg" />
          </div>
          <div className="flex-1 space-y-4">
            <Skeleton className="aspect-video w-full rounded-pa-xl" />
            <div className="flex justify-center gap-3">
              <Skeleton className="h-16 w-24 rounded-pa-lg" />
              <Skeleton className="h-16 w-24 rounded-pa-lg" />
              <Skeleton className="h-16 w-24 rounded-pa-lg" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-pa-lg" />
            <Skeleton className="h-32 w-full rounded-pa-lg" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full rounded-pa-lg" />
        </div>
      </div>
    </PageContainer>
  );
}
