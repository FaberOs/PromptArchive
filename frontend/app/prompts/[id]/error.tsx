"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageContainer } from "@/components/templates/PageContainer";

interface PromptErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PromptError({ error, reset }: PromptErrorProps) {
  const router = useRouter();
  const errorMessage =
    typeof error?.message === "string" && error.message.length > 0 ? error.message : "Unknown runtime error";

  return (
    <PageContainer variant="wide" className="py-16">
      <div className="rounded-pa-2xl border border-pa-warning/30 bg-pa-warning-soft p-6">
        <div className="mb-3 flex items-center gap-2 text-pa-warning">
          <AlertTriangle className="h-5 w-5" />
          <h1 className="text-lg font-semibold text-pa-text">Could not render this prompt</h1>
        </div>
        <p className="text-sm text-pa-muted">
          This prompt contains data that could not be rendered safely. You can retry or return to the library.
        </p>
        <p className="mt-2 break-all rounded-pa-md bg-pa-paper/60 px-3 py-2 font-mono text-xs text-pa-text">
          {errorMessage}
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button onClick={() => reset()} leftIcon={<RefreshCw className="h-4 w-4" />}>
            Retry
          </Button>
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to library
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
