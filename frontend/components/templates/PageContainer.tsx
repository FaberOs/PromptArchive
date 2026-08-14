import { cn } from "@/lib/utils";

type PageContainerVariant = "default" | "wide" | "full";

interface PageContainerProps {
  children: React.ReactNode;
  variant?: PageContainerVariant;
  className?: string;
}

export function PageContainer({ children, variant = "default", className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "page-container",
        variant === "default" && "max-w-[1280px]",
        variant === "wide" && "max-w-[1360px]",
        variant === "full" && "max-w-none",
        className,
      )}
    >
      {children}
    </div>
  );
}
