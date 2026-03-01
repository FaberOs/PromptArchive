"use client";

import { useMemo } from "react";
import clsx from "clsx";

interface JsonViewerProps {
  json: string;
  className?: string;
}

export default function JsonViewer({ json, className }: JsonViewerProps) {
  const highlightedHtml = useMemo(() => {
    if (!json) return "";

    try {
      const obj = JSON.parse(json);
      const formatted = JSON.stringify(obj, null, 2);

      const regex = /(\"(\\u[a-zA-Z0-9]{4}|\\ medzi[^u]|[^\\"])*\"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g;

      return formatted.replace(regex, (match) => {
        let cls = "text-slate-500 dark:text-slate-500"; // Default secondary

        if (/^\"/.test(match)) {
          if (/:$/.test(match)) {
            // Keys: Muted Terracotta (Light) / Dusty Periwinkle (Dark)
            cls = "text-rose-900/70 dark:text-indigo-300/80 font-semibold"; 
          } else {
            // Strings: Soft Stone (Light) / Muted Slate (Dark) - Very easy on eyes
            cls = "text-stone-600 dark:text-slate-400"; 
          }
        } else if (/true|false/.test(match)) {
          // Booleans: Muted Sage (Light) / Muted Teal (Dark)
          cls = "text-emerald-800/70 dark:text-teal-400/70 font-medium"; 
        } else if (/null/.test(match)) {
          cls = "text-stone-400 dark:text-slate-600 italic"; 
        } else {
          // Numbers: Neutral Gray
          cls = "text-stone-500 dark:text-slate-500"; 
        }

        return `<span class=\"${cls}\">${match}</span>`;
      });
    } catch (e) {
      return json.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [json]);

  return (
    <pre
      className={clsx(
        "font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-slate-200 dark:selection:bg-slate-800",
        className
      )}
      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
    />
  );
}
