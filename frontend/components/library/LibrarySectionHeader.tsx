import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LibrarySectionHeaderProps {
  title: string;
  badge?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function LibrarySectionHeader({ title, badge, actions, className }: LibrarySectionHeaderProps) {
  return (
    <div className={cn("mb-3 flex items-center justify-between gap-3", className)}>
      <h2 className="text-base font-bold text-pa-text">{title}</h2>
      {(badge || actions) && (
        <div className="flex items-center gap-2">
          {badge && <span className="text-xs font-semibold text-pa-muted-soft">{badge}</span>}
          {actions}
        </div>
      )}
    </div>
  );
}
