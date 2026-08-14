import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "private" | "outline" | "destructive";

type ButtonSize = "sm" | "md" | "lg" | "icon" | "default";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading,
      loading,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isOutline = variant === "outline";
    const resolvedVariant = variant === "destructive" ? "danger" : isOutline ? "secondary" : variant;
    const resolvedSize = size === "default" ? "md" : size;
    const showLoading = isLoading ?? loading;

    return (
      <button
        ref={ref}
        disabled={disabled || showLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-pa-md text-sm font-medium",
          "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-[var(--pa-motion-base)] ease-[var(--pa-ease-standard)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pa-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-pa-cream",
          "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer active:scale-[0.99] active:translate-y-[1px]",
          {
            "bg-pa-primary text-pa-paper shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_2px_rgba(11,20,43,0.08)] hover:bg-pa-primary-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_2px_4px_rgba(11,20,43,0.1)]":
              resolvedVariant === "primary",
            "border border-pa-border bg-pa-soft-blue text-pa-text shadow-[0_1px_2px_rgba(11,20,43,0.02)] hover:border-pa-border-strong hover:bg-pa-paper dark:hover:bg-pa-surface":
              resolvedVariant === "secondary" && !isOutline,
            "border border-pa-border-strong bg-pa-paper text-pa-text hover:bg-pa-surface": isOutline,
            "bg-transparent text-pa-muted hover:bg-pa-surface hover:text-pa-text": resolvedVariant === "ghost",
            "bg-pa-danger text-pa-paper shadow-pa-subtle hover:brightness-95": resolvedVariant === "danger",
            "bg-pa-private text-pa-paper shadow-pa-subtle hover:brightness-95": resolvedVariant === "private",
          },
          {
            "h-8 gap-1.5 px-2.5 text-[13px]": resolvedSize === "sm",
            "h-10 gap-2 px-3.5": resolvedSize === "md",
            "h-[46px] gap-2 px-[18px] text-[15px]": resolvedSize === "lg",
            "h-10 w-10 p-0": resolvedSize === "icon",
          },
          className,
        )}
        {...props}
      >
        {showLoading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" /> : leftIcon}
        {children}
        {!showLoading && rightIcon}
      </button>
    );
  },
);
Button.displayName = "Button";
