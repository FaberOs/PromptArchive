"use client";

import { useState, useMemo, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, X, Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { handleActivationKey } from "@/lib/a11y";
import { getCategories } from "@/lib/api";
import type { Category } from "@/lib/types";
import { useSecurity } from "@/components/SecurityProvider";

interface CategorySelectorProps {
  selected: string[];
  onChange: (categories: string[]) => void;
  triggerId?: string;
}

const VISIBLE_CHIP_LIMIT = 2;

export default function CategorySelector({ selected, onChange, triggerId: triggerIdProp }: CategorySelectorProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const generatedTriggerId = useId();
  const listboxId = useId();
  const triggerId = triggerIdProp ?? generatedTriggerId;
  const { isNsfwUnlocked } = useSecurity();

  const { data: categories = [], isLoading: loading } = useQuery<Category[]>({
    queryKey: ["categories", isNsfwUnlocked, ""],
    queryFn: () => getCategories(isNsfwUnlocked).then((res) => res.data),
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!query) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));
  }, [categories, query]);

  const visibleSelected = selected.slice(0, VISIBLE_CHIP_LIMIT);
  const hiddenCount = Math.max(0, selected.length - VISIBLE_CHIP_LIMIT);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const handleSelect = (name: string) => {
    if (selectedSet.has(name)) {
      onChange(selected.filter((s) => s !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  const handleRemove = (name: string) => {
    onChange(selected.filter((s) => s !== name));
  };

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5" aria-label="Selected categories">
          {visibleSelected.map((cat) => (
            <Badge key={cat} variant="variant" size="sm" className="pr-1">
              {cat}
              <button
                type="button"
                onClick={() => handleRemove(cat)}
                aria-label={`Remove ${cat}`}
                className="ml-1 rounded-full p-0.5 hover:bg-pa-border"
              >
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            </Badge>
          ))}
          {hiddenCount > 0 && (
            <Badge variant="default" size="sm">
              +{hiddenCount}
            </Badge>
          )}
        </div>
      )}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            id={triggerId}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listboxId}
            className={cn(
              "flex min-h-[42px] w-full cursor-pointer items-center justify-between gap-2",
              "rounded-pa-md border border-pa-border bg-pa-paper px-3 py-2 text-left text-sm",
              "transition-colors hover:border-pa-border-strong focus-visible:border-pa-ink focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-pa-primary/10",
            )}
          >
            <span className={selected.length === 0 ? "text-pa-muted-soft" : "text-pa-text"}>
              {selected.length === 0
                ? "Select categories..."
                : `${selected.length} categor${selected.length === 1 ? "y" : "ies"} selected`}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-pa-muted-soft" aria-hidden="true" />
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            style={{ width: "var(--radix-popover-trigger-width)" }}
            className="z-pa-popover flex max-h-75 flex-col rounded-pa-md border border-pa-border bg-pa-paper p-0 shadow-pa-float pa-modal-in origin-top"
            align="start"
            sideOffset={5}
          >
            <div className="sticky top-0 z-10 border-b border-pa-border bg-pa-paper p-2">
              <div className="relative">
                <Search
                  className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-pa-muted-soft"
                  aria-hidden="true"
                />
                <input
                  className="w-full bg-transparent py-1 pl-8 pr-2 text-sm text-pa-text outline-none placeholder:text-pa-muted-soft"
                  placeholder="Search category..."
                  aria-label="Search categories"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
            </div>

            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              aria-label="Categories"
              className="flex-1 overflow-y-auto p-1"
            >
              {loading ? (
                <div
                  className="flex items-center justify-center gap-2 p-2 text-center text-xs text-pa-muted"
                  role="status"
                >
                  <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" /> Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-2 text-center text-xs text-pa-muted-soft" role="status">
                  No categories found.
                </div>
              ) : (
                filtered.map((cat) => {
                  const isSelected = selectedSet.has(cat.name);

                  return (
                    <div
                      key={cat.id}
                      role="option"
                      aria-selected={isSelected}
                      tabIndex={0}
                      onClick={() => handleSelect(cat.name)}
                      onKeyDown={(event) => handleActivationKey(event, () => handleSelect(cat.name))}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center rounded-pa-sm px-2 py-1.5 text-sm outline-none",
                        "hover:bg-pa-surface focus-visible:bg-pa-surface",
                        isSelected ? "bg-pa-soft-blue font-medium text-pa-text" : "text-pa-muted",
                      )}
                    >
                      <div
                        className={cn(
                          "mr-2 flex h-4 w-4 items-center justify-center rounded-pa-xs border border-pa-border",
                          isSelected ? "border-transparent bg-pa-primary text-pa-paper" : "opacity-60",
                        )}
                        aria-hidden="true"
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
                      {cat.name}
                    </div>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
