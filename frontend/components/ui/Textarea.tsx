import React from "react";
import { cn } from "@/lib/utils";

type TextareaVariant = "default" | "prompt" | "json" | "code";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: TextareaVariant;
  error?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", error, ...props }, ref) => {
    const isJson = variant === "json" || variant === "code";

    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full rounded-pa-md border bg-pa-paper px-3 py-2 text-sm text-pa-text resize-y shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]",
          "placeholder:text-pa-muted-soft",
          "transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-200 ease-[var(--pa-ease-standard)]",
          "focus-visible:outline-none focus-visible:border-pa-ink focus-visible:ring-[4px] focus-visible:ring-pa-primary/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          variant === "default" && "min-h-[80px]",
          variant === "prompt" && "min-h-[160px]",
          isJson && [
            "min-h-[360px] font-mono text-[13px] leading-relaxed",
            "bg-pa-json-soft/40 dark:bg-pa-json-soft/20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px]",
            "border-pa-json/30 focus-visible:border-pa-json focus-visible:ring-pa-json/15",
          ],
          !isJson && "border-pa-border",
          error && "border-pa-danger focus-visible:border-pa-danger focus-visible:ring-pa-danger/10",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
