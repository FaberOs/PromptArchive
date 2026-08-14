import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormSectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  aside?: React.ReactNode;
}

export function FormSectionHeader({ icon: Icon, title, description, aside }: FormSectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-pa-border pb-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] grid-rows-[auto_auto] gap-x-3 gap-y-1">
        <div className="row-span-2 flex items-center self-stretch">
          <div className="pa-section-icon-well h-9 w-9" aria-hidden="true">
            <Icon className="h-4 w-4" strokeWidth={1.8} />
          </div>
        </div>
        <h2 className="pt-0.5 text-sm font-semibold leading-5 text-pa-text">{title}</h2>
        <p className="text-xs leading-relaxed text-pa-muted">{description}</p>
      </div>
      {aside ? <div className={cn("shrink-0 sm:pt-0.5")}>{aside}</div> : null}
    </div>
  );
}
