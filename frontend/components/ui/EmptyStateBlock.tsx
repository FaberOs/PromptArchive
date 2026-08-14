import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateBlockProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  iconClassName?: string;
  className?: string;
}

export function EmptyStateBlock({
  icon,
  title,
  description,
  action,
  secondaryAction,
  iconClassName,
  className,
}: EmptyStateBlockProps) {
  return (
    <div
      className={cn(
        "rounded-pa-xl border border-dashed border-pa-border bg-pa-surface/60 py-16 text-center",
        className,
      )}
    >
      {icon && (
        <div className="relative mb-4 inline-flex">
          <div
            className="absolute inset-0 scale-[2] rounded-full bg-[radial-gradient(circle_at_center,var(--color-pa-primary),transparent_60%)] opacity-5 dark:opacity-[0.08]"
            aria-hidden="true"
          />
          <div
            className={cn("pa-section-icon-well relative z-10 h-14 w-14 rounded-pa-xl shadow-pa-subtle", iconClassName)}
          >
            {icon}
          </div>
        </div>
      )}
      <h3 className="mb-1 text-lg font-semibold text-pa-text">{title}</h3>
      {description && <p className="mx-auto max-w-sm text-sm text-pa-muted">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-col items-center justify-center gap-2 sm:flex-row">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
