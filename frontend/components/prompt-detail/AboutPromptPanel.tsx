import type { Prompt } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

interface AboutPromptPanelProps {
  prompt: Prompt;
  variantCount: number;
}

export function AboutPromptPanel({ prompt, variantCount }: AboutPromptPanelProps) {
  return (
    <aside className="flex flex-col rounded-pa-xl border border-pa-border bg-pa-paper p-5 shadow-pa-subtle">
      <h3 className="mb-4 text-sm font-bold text-pa-text">About this prompt</h3>

      <dl className="space-y-3 text-sm">
        <div className="flex justify-between border-b border-pa-border pb-2">
          <dt className="text-pa-muted">Created</dt>
          <dd className="font-medium text-pa-text">
            {new Date(prompt.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </dd>
        </div>
        <div className="flex justify-between border-b border-pa-border pb-2">
          <dt className="text-pa-muted">Updated</dt>
          <dd className="font-medium text-pa-text">
            {new Date(prompt.updated_at ?? prompt.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </dd>
        </div>
        <div className="flex justify-between border-b border-pa-border pb-2">
          <dt className="text-pa-muted">Type</dt>
          <dd className="font-medium text-pa-text">
            {prompt.prompt_type === "json" ? "JSON Workflow" : "Standard Prompt"}
          </dd>
        </div>
        <div className="flex justify-between border-b border-pa-border pb-2">
          <dt className="text-pa-muted">Images</dt>
          <dd className="font-medium text-pa-text">{prompt.images?.length || 0}</dd>
        </div>
        <div className="flex justify-between border-b border-pa-border pb-2">
          <dt className="text-pa-muted">Variants</dt>
          <dd className="font-medium text-pa-text">{variantCount}</dd>
        </div>
      </dl>

      {prompt.categories.length > 0 && (
        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium text-pa-muted">Categories</span>
          <div className="flex flex-wrap gap-1.5">
            {prompt.categories.map((c) => (
              <Badge key={c.id} variant="default" size="sm">
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {prompt.tags.length > 0 && (
        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium text-pa-muted">Tags</span>
          <div className="flex flex-wrap gap-1.5">
            {prompt.tags.map((t) => (
              <Badge key={t.id} variant="secondary" size="sm">
                #{t.name}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
