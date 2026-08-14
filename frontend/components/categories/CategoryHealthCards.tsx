import { cn } from "@/lib/utils";

interface CategoryHealthCardsProps {
  metrics: {
    duplicates: number;
    empty: number;
    stale: number;
    totalPrompts: number;
  };
}

export function CategoryHealthCards({ metrics }: CategoryHealthCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6">
      <div
        className={cn(
          "rounded-pa-xl border bg-pa-paper p-4 shadow-pa-subtle transition-colors",
          metrics.duplicates > 0 ? "border-pa-warning/30 bg-pa-warning-soft/30" : "border-pa-border",
        )}
      >
        <div className="mb-1 text-2xl font-bold text-pa-text">{metrics.duplicates}</div>
        <div className="text-[13px] font-semibold text-pa-text">Possible duplicates</div>
        <div className="text-[11px] text-pa-muted-soft">Review and merge</div>
      </div>

      <div
        className={cn(
          "rounded-pa-xl border bg-pa-paper p-4 shadow-pa-subtle transition-colors",
          metrics.empty > 0 ? "border-pa-danger/20" : "border-pa-border",
        )}
      >
        <div className="mb-1 text-2xl font-bold text-pa-text">{metrics.empty}</div>
        <div className="text-[13px] font-semibold text-pa-text">Empty categories</div>
        <div className="text-[11px] text-pa-muted-soft">Add prompts</div>
      </div>

      <div
        className={cn(
          "rounded-pa-xl border bg-pa-paper p-4 shadow-pa-subtle transition-colors",
          metrics.stale > 0 ? "border-pa-primary/20" : "border-pa-border",
        )}
      >
        <div className="mb-1 text-2xl font-bold text-pa-text">{metrics.stale}</div>
        <div className="text-[13px] font-semibold text-pa-text">Not used recently</div>
        <div className="text-[11px] text-pa-muted-soft">Older than 30 days</div>
      </div>

      <div className="rounded-pa-xl border border-pa-border bg-pa-paper p-4 shadow-pa-subtle">
        <div className="mb-1 text-2xl font-bold text-pa-text">{metrics.totalPrompts}</div>
        <div className="text-[13px] font-semibold text-pa-text">Total prompts</div>
        <div className="text-[11px] text-pa-muted-soft">Across all categories</div>
      </div>
    </div>
  );
}
