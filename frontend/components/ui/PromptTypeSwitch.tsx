"use client";

import { TerminalSquare, Braces } from "lucide-react";
import { cn } from "@/lib/utils";

export type PromptTypeValue = "structured" | "json";

interface PromptTypeSwitchProps {
  value: PromptTypeValue;
  onChange: (value: PromptTypeValue) => void;
  showHint?: boolean;
  layout?: "inline" | "block";
  className?: string;
}

export function PromptTypeSwitch({
  value,
  onChange,
  showHint = true,
  layout = "inline",
  className,
}: PromptTypeSwitchProps) {
  const isBlock = layout === "block";

  return (
    <div
      className={cn("flex flex-col gap-2", !isBlock && "sm:flex-row sm:items-center", isBlock && "gap-3", className)}
    >
      <span className="text-xs font-bold uppercase tracking-[0.06em] text-pa-muted">Prompt Type</span>
      <div
        className={cn(
          "relative inline-flex w-full rounded-pa-md border border-pa-border bg-pa-surface p-0.5",
          isBlock ? "max-w-md" : "sm:w-64",
        )}
        role="radiogroup"
        aria-label="Prompt type"
      >
        <div
          className={cn(
            "absolute bottom-0.5 top-0.5 w-[calc(50%-2px)] rounded-pa-sm transition-transform duration-300 ease-[var(--pa-ease-emphasized)] shadow-pa-subtle",
            value === "structured" ? "translate-x-0 bg-pa-primary" : "translate-x-[calc(100%+4px)] bg-pa-json",
          )}
          aria-hidden="true"
        />
        <button
          type="button"
          role="radio"
          aria-checked={value === "structured"}
          onClick={() => onChange("structured")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-pa-sm px-3 py-1.5 text-xs font-medium transition-colors",
            value === "structured" ? "text-pa-paper" : "text-pa-muted hover:text-pa-text",
          )}
        >
          <TerminalSquare className="h-3.5 w-3.5" strokeWidth={1.8} />
          Standard
        </button>
        <button
          type="button"
          role="radio"
          aria-checked={value === "json"}
          onClick={() => onChange("json")}
          className={cn(
            "relative z-10 flex flex-1 items-center justify-center gap-1.5 rounded-pa-sm px-3 py-1.5 text-xs font-medium transition-colors",
            value === "json" ? "text-white" : "text-pa-muted hover:text-pa-text",
          )}
        >
          <Braces className="h-3.5 w-3.5" strokeWidth={1.8} />
          JSON Workflow
        </button>
      </div>
      {showHint && (
        <p className={cn("text-[11px] text-pa-muted-soft", !isBlock && "sm:ml-auto")}>
          Switching types will preserve text but might need reformatting.
        </p>
      )}
    </div>
  );
}
