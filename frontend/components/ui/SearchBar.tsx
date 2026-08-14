import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  trailing?: React.ReactNode;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  inputClassName,
  trailing,
}: SearchBarProps) {
  return (
    <div className={cn("relative flex items-center gap-2", className)}>
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-pa-muted-soft"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <Input
          variant="search"
          placeholder={placeholder}
          className={cn("pr-10", inputClassName)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={placeholder}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className={cn(
              "absolute right-3 top-1/2 -translate-y-1/2 rounded-pa-sm p-0.5",
              "text-pa-muted-soft transition-colors hover:bg-pa-surface hover:text-pa-text",
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {trailing}
    </div>
  );
}
