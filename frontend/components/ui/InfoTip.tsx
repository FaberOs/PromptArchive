"use client";

import { useId, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoTipProps {
  text: string;
  className?: string;
}

export function InfoTip({ text, className }: InfoTipProps) {
  const [open, setOpen] = useState(false);
  const tooltipId = useId();

  return (
    <span className={cn("relative inline-flex", className)}>
      {open && <span className="fixed inset-0 z-pa-tooltip" onClick={() => setOpen(false)} aria-hidden />}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        aria-label="More information"
        aria-expanded={open}
        aria-describedby={open ? tooltipId : undefined}
        className={cn(
          "group relative ml-1 rounded-sm text-pa-muted-soft transition-colors",
          open && "z-pa-tooltip",
          "hover:text-pa-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pa-primary/30",
        )}
      >
        <Info className="h-3.5 w-3.5" strokeWidth={1.8} />
      </button>

      {open && (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "pointer-events-none absolute bottom-full left-1/2 z-pa-tooltip mb-2 w-56 -translate-x-1/2",
            "rounded-pa-sm border border-pa-border bg-pa-ink px-3 py-2 text-[11px] leading-relaxed text-pa-paper shadow-pa-float",
            "dark:border-pa-border-strong dark:bg-pa-surface dark:text-pa-text",
          )}
        >
          {text}
          <span className="absolute left-1/2 top-full -mt-px -translate-x-1/2 border-4 border-transparent border-t-pa-ink dark:border-t-pa-surface" />
        </span>
      )}
    </span>
  );
}
