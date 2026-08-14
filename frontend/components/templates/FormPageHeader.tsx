import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";

interface FormPageHeaderProps {
  title: string;

  subtitle?: string;

  onBack: () => void;

  actions: React.ReactNode;

  sticky?: boolean;

  className?: string;
}

export function FormPageHeader({
  title,

  subtitle,

  onBack,

  actions,

  sticky = false,

  className,
}: FormPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4",

        sticky &&
          "sticky top-0 z-pa-sticky -mx-4 border-b border-pa-border bg-pa-cream/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 sm:py-4 lg:-mx-8 lg:px-8",

        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <button
          type="button"

          onClick={onBack}

          aria-label="Go back"

          className="-ml-1 shrink-0 rounded-pa-lg p-2 text-pa-muted-soft transition-colors hover:bg-pa-surface hover:text-pa-text sm:-ml-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold leading-tight text-pa-text sm:text-xl">{title}</h2>

          {subtitle && <p className="truncate text-xs text-pa-muted-soft">{subtitle}</p>}
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 self-end sm:self-auto">{actions}</div>
    </div>
  );
}
