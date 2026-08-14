import type { Prompt } from "@/lib/types";

import { GitBranch } from "lucide-react";

interface PromptMetaProps {
  prompt: Prompt;
}

export default function PromptMeta({ prompt }: PromptMetaProps) {
  return (
    <div className="pa-section-in space-y-4">
      <div className="space-y-2">
        {prompt.parent_id && (
          <div className="inline-flex items-center gap-1 rounded-pa-sm bg-pa-surface px-2 py-1 text-xs font-medium text-pa-muted">
            <GitBranch className="h-3 w-3" /> Variant
          </div>
        )}

        <h1 className="wrap-break-word text-2xl font-bold leading-tight text-pa-text sm:text-4xl">{prompt.title}</h1>
      </div>

      {prompt.description && (
        <div className="rounded-pa-lg border border-pa-border bg-pa-paper p-6 shadow-pa-subtle">
          <p className="text-base leading-relaxed text-pa-text">{prompt.description}</p>
        </div>
      )}
    </div>
  );
}
