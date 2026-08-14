import { Layout, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Prompt } from "@/lib/types";

interface PromptBreadcrumbsProps {
  prompt: Prompt;
  parentPrompt: Prompt | null;
}

export default function PromptBreadcrumbs({ prompt, parentPrompt }: PromptBreadcrumbsProps) {
  const router = useRouter();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center overflow-hidden whitespace-nowrap text-sm text-pa-muted">
      <button
        type="button"
        onClick={() => router.push(prompt.is_nsfw ? "/nsfw" : "/")}
        aria-label={prompt.is_nsfw ? "Go to Private library" : "Go to Library"}
        className="flex items-center gap-1 transition-colors hover:text-pa-text"
      >
        <Layout className="h-4 w-4" aria-hidden="true" />
        {prompt.is_nsfw ? "Private" : "Library"}
      </button>

      {prompt.folder && (
        <>
          <span className="mx-2 text-pa-border-strong">/</span>
          <button
            type="button"
            onClick={() => {
              const base = prompt.is_nsfw ? "/nsfw" : "/";
              const params = new URLSearchParams({
                folder_id: String(prompt.folder!.id),
              });
              if (prompt.folder!.is_hidden) params.set("show_hidden", "1");
              router.push(`${base}?${params.toString()}`);
            }}
            aria-label={`Go to folder ${prompt.folder!.name}`}
            className="flex items-center gap-1 transition-colors hover:text-pa-text"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: prompt.folder!.color }}
              aria-hidden="true"
            />
            {prompt.folder!.name}
            {prompt.folder!.is_hidden && <EyeOff className="ml-0.5 h-3 w-3 text-pa-warning" aria-hidden="true" />}
          </button>
        </>
      )}

      {parentPrompt && (
        <>
          <span className="mx-2 text-pa-border-strong">/</span>
          <button
            type="button"
            onClick={() => router.push(`/prompts/${parentPrompt.id}`)}
            className="flex max-w-[150px] items-center gap-1 truncate transition-colors hover:text-pa-text"
            title={parentPrompt.title}
          >
            {parentPrompt.title}
            {parentPrompt.is_hidden && <EyeOff className="h-3 w-3 shrink-0 text-pa-warning" />}
          </button>
        </>
      )}

      <span className="mx-2 text-pa-border-strong">/</span>
      <span
        className="flex max-w-[200px] items-center gap-1 truncate font-medium text-pa-text"
        title={prompt.title}
        aria-current="page"
      >
        {prompt.title}
        {prompt.is_hidden && <EyeOff className="h-3 w-3 shrink-0 text-pa-warning" aria-hidden="true" />}
      </span>
    </nav>
  );
}
