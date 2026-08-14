import React from "react";
import { cn } from "@/lib/utils";

type InputVariant = "default" | "search" | "code" | "error" | "private";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
  error?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", error, ...props }, ref) => {
    const isError = error || variant === "error";
    const isPrivate = variant === "private";
    const isCode = variant === "code";

    return (
      <input
        ref={ref}
        className={cn(
          "flex h-[42px] w-full rounded-pa-md border bg-pa-paper px-3 py-2 text-sm text-pa-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
          "placeholder:text-pa-muted-soft",
          "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-200 ease-[var(--pa-ease-standard)]",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "focus-visible:outline-none focus-visible:border-pa-ink focus-visible:ring-[4px] focus-visible:ring-pa-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          isCode && "font-mono text-[13px]",
          isError
            ? "border-pa-danger focus-visible:border-pa-danger focus-visible:ring-pa-danger/10"
            : isPrivate
              ? "border-pa-private/30 focus-visible:border-pa-private focus-visible:ring-pa-private/10"
              : "border-pa-border",
          variant === "search" && "pl-10",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
