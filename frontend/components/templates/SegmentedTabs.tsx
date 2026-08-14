"use client";

import { cn } from "@/lib/utils";
import { segmentedPanelId, segmentedTabId } from "@/lib/a11y";

export interface SegmentedTabItem<T extends string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

interface SegmentedTabsProps<T extends string> {
  items: SegmentedTabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  className,
  "aria-label": ariaLabel = "Sections",
}: SegmentedTabsProps<T>) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = items.findIndex((item) => item.id === value);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      event.preventDefault();
      nextIndex = (currentIndex + 1) % items.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      event.preventDefault();
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    } else if (event.key === "Home") {
      event.preventDefault();
      nextIndex = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      nextIndex = items.length - 1;
    } else {
      return;
    }

    onChange(items[nextIndex].id);
    document.getElementById(segmentedTabId(items[nextIndex].id))?.focus();
  };

  return (
    <div
      className={cn(
        "flex max-w-full gap-1 overflow-x-auto rounded-pa-lg border border-pa-border bg-pa-surface p-1",
        className,
      )}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            id={segmentedTabId(item.id)}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={segmentedPanelId(item.id)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-pa-md px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,opacity,transform,box-shadow]",
              active
                ? "border border-pa-border bg-pa-paper text-pa-text shadow-pa-subtle"
                : "text-pa-muted hover:text-pa-text",
            )}
          >
            {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
            {item.label}
            {item.badge}
          </button>
        );
      })}
    </div>
  );
}
