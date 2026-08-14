"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "@/components/ui/CopyButton";
import { Badge } from "@/components/ui/Badge";
import { TerminalSquare, ChevronDown, ChevronUp } from "lucide-react";

function getTokenClass(token: string) {
  if (/^"/.test(token)) {
    return /:$/.test(token) ? "font-semibold text-pa-json" : "text-pa-text/80";
  }
  if (/true|false/.test(token)) return "font-medium text-pa-success";
  if (/null/.test(token)) return "italic text-pa-muted-soft";
  return "text-pa-muted";
}

function highlightJson(value: string): ReactNode[] {
  const tokens: ReactNode[] = [];
  const regex =
    /(\"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;
  let lastIndex = 0;
  let tokenIndex = 0;

  for (const match of value.matchAll(regex)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > lastIndex) tokens.push(value.slice(lastIndex, index));
    tokens.push(
      <span key={`token-${tokenIndex++}`} className={getTokenClass(token)}>
        {token}
      </span>,
    );
    lastIndex = index + token.length;
  }

  if (lastIndex < value.length) tokens.push(value.slice(lastIndex));
  return tokens;
}

interface JsonViewerProps {
  json: string;
  className?: string;
  variantLabel?: string;
  collapsible?: boolean;
}

export default function JsonViewer({ json, className, variantLabel, collapsible = true }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();

  const highlightedContent = useMemo<ReactNode[]>(() => {
    if (!json) return [];

    try {
      const obj = JSON.parse(json);
      return highlightJson(JSON.stringify(obj, null, 2));
    } catch {
      return [json];
    }
  }, [json]);

  const isLong = json.length > 1200;

  return (
    <section
      aria-label="JSON workflow content"
      className={cn("overflow-hidden rounded-pa-lg border border-pa-json/20 bg-pa-json-soft/30", className)}
    >
      <div className="flex items-center justify-between gap-3 border-b border-pa-json/15 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <TerminalSquare className="h-4 w-4 shrink-0 text-pa-json" strokeWidth={1.8} aria-hidden="true" />
          <span className="truncate text-sm font-semibold text-pa-text">&gt;_ JSON Workflow</span>
          {variantLabel && (
            <Badge variant="original" size="sm" className="hidden sm:inline-flex">
              {variantLabel}
            </Badge>
          )}
        </div>
        <CopyButton text={json} variant="ghost" label="Copy" />
      </div>

      <div className="relative">
        <pre
          id={contentId}
          className={cn(
            "overflow-x-auto whitespace-pre-wrap p-4 font-mono text-[13px] leading-relaxed text-pa-text",
            collapsible && isLong && !expanded && "max-h-80 overflow-y-hidden",
          )}
        >
          {highlightedContent}
        </pre>
        {collapsible && isLong && !expanded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-pa-json-soft/80 to-transparent" />
        )}
      </div>

      {collapsible && isLong && (
        <div className="border-t border-pa-json/15 px-4 py-2">
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-controls={contentId}
            className="inline-flex items-center gap-1 text-xs font-medium text-pa-json hover:underline"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> Collapse JSON
              </>
            ) : (
              <>
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" /> Expand JSON
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}
