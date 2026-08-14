import type { Prompt } from "@/lib/types";
import JsonViewer from "@/components/JsonViewer";
import { CopyButton } from "@/components/ui/CopyButton";
import { Terminal, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface PromptTextContentProps {
  prompt: Prompt;
  isPreviewingVariant: boolean;
  variantLabel: string;
}

export default function PromptTextContent({ prompt, isPreviewingVariant, variantLabel }: PromptTextContentProps) {
  return (
    <div className="pa-section-in grid grid-cols-1 gap-8">
      {prompt.prompt_type === "json" ? (
        <div className="space-y-3">
          <JsonViewer json={prompt.positive_prompts[0]?.content ?? ""} variantLabel={variantLabel} />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-pa-border pb-2">
              <h3 className="flex items-center gap-2 text-lg font-bold text-pa-text">
                <Terminal className="h-5 w-5 text-pa-success" />
                Positive Prompts
              </h3>
              <Badge
                className={cn(
                  "ml-auto",
                  isPreviewingVariant
                    ? "bg-pa-success text-white hover:opacity-90"
                    : "bg-pa-primary text-pa-paper hover:bg-pa-primary-hover",
                )}
              >
                {variantLabel}
              </Badge>
            </div>

            <div className="space-y-3">
              {prompt.positive_prompts.map((pp) => (
                <div
                  key={pp.id}
                  className="group relative rounded-pa-lg border border-pa-border bg-pa-paper p-6 shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:border-pa-success/30 hover:shadow-pa-card"
                >
                  <p className="wrap-break-word whitespace-pre-wrap pr-10 font-mono text-base leading-relaxed text-pa-text">
                    {pp.content}
                  </p>
                  <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <CopyButton text={pp.content} variant="outline" label="Copy" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="flex items-center gap-2 border-b border-pa-border pb-2 text-lg font-bold text-pa-text">
              <AlertOctagon className="h-5 w-5 text-pa-danger" />
              Negative Prompt
            </h3>

            <div className="group relative rounded-pa-lg border border-pa-danger/20 bg-pa-danger-soft/40 p-6 shadow-pa-subtle transition-[background-color,border-color,color,opacity,transform,box-shadow] hover:border-pa-danger/30 hover:shadow-pa-card">
              <p className="wrap-break-word whitespace-pre-wrap pr-10 font-mono text-base leading-relaxed text-pa-text">
                {prompt.negative_prompt}
              </p>
              <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                <CopyButton text={prompt.negative_prompt} variant="outline" label="Copy" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
