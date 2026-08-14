import { cn } from "@/lib/utils";

type BadgeVariant =
  | "default"
  | "standard"
  | "json"
  | "original"
  | "variant"
  | "active"
  | "hidden"
  | "private"
  | "danger"
  | "outline"
  | "secondary";

type BadgeSize = "sm" | "md";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
}

const variantStyles: Record<Exclude<BadgeVariant, "outline" | "secondary">, string> = {
  default: "bg-pa-soft-blue text-pa-text",
  standard: "bg-pa-success-soft text-pa-success",
  json: "bg-pa-json-soft text-pa-json",
  original: "bg-pa-primary text-pa-paper",
  variant: "bg-pa-soft-blue text-pa-muted",
  active: "bg-pa-success-soft text-pa-success",
  hidden: "bg-pa-warning-soft text-pa-warning",
  private: "bg-pa-private-soft text-pa-private",
  danger: "bg-pa-danger-soft text-pa-danger",
};

export function Badge({ children, variant = "default", size = "md", className }: BadgeProps) {
  const resolvedVariant: keyof typeof variantStyles =
    variant === "secondary" ? "variant" : variant === "outline" ? "default" : variant;

  const hasDot = resolvedVariant === "standard" || resolvedVariant === "active";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold transition-colors",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-xs",
        variantStyles[resolvedVariant],
        variant === "outline" && "border border-pa-border bg-transparent text-pa-muted",
        className,
      )}
    >
      {hasDot && (
        <span
          className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-80 shadow-[0_0_4px_currentColor]"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
