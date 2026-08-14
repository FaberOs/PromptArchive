import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface LibraryIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  active?: boolean;
  activeTone?: "default" | "warning";
  label: string;
}

export function LibraryIconButton({
  icon: Icon,
  active = false,
  activeTone = "default",
  label,
  className,
  ...props
}: LibraryIconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-pa-border bg-pa-paper text-pa-muted shadow-[0_1px_2px_rgba(11,20,43,0.04)] transition-colors",
        "hover:border-pa-border-strong hover:bg-pa-surface hover:text-pa-text",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pa-primary/20",
        active && activeTone === "warning" && "border-pa-warning/35 bg-pa-warning-soft text-pa-warning",
        active && activeTone === "default" && "border-pa-border-strong bg-pa-surface text-pa-text",
        className,
      )}
      {...props}
    >
      <Icon className="h-[17px] w-[17px]" strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
