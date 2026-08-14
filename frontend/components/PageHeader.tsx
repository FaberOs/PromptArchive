import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  icon?: ReactNode;
  actions?: ReactNode;
  search?: ReactNode;
  variant?: "default" | "private";
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumb,
  icon,
  actions,
  search,
  variant = "default",
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {breadcrumb}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex min-w-0 items-start gap-3">
          {icon}
          <div className="min-w-0 flex-1">
            <h2
              className={cn(
                "text-2xl font-bold leading-8 text-pa-text sm:text-[30px] sm:leading-[38px]",
                variant === "private" && "text-pa-private",
              )}
            >
              {title}
            </h2>
            {subtitle && <p className="mt-1 text-sm font-medium tracking-wide text-pa-muted-soft">{subtitle}</p>}
          </div>
        </div>
        {(actions || search) && (
          <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:max-w-[min(100%,42rem)] lg:shrink-0">
            {search}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
