"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: "ghost" | "outline" | "secondary";
  label?: string;
}

export function CopyButton({ text, className, variant = "ghost", label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Failed to copy text: ", err);
      setFailed(true);
      setTimeout(() => setFailed(false), 1500);
    }
  };

  const displayLabel = copied ? "Copied" : failed ? "Failed" : label;

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleCopy}
      className={cn(
        "min-w-[5.5rem] transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-[var(--pa-motion-base)]",
        className,
      )}
      title="Copy to clipboard"
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
    >
      {copied ? (
        <>
          <Check className="mr-1 h-3 w-3 shrink-0 text-pa-success" aria-hidden />
          <span className="font-medium text-pa-success">{displayLabel}</span>
        </>
      ) : failed ? (
        <>
          <Copy className="mr-1 h-3 w-3 shrink-0 text-pa-danger" aria-hidden />
          <span className="font-medium text-pa-danger">{displayLabel}</span>
        </>
      ) : (
        <>
          <Copy className="mr-1 h-3 w-3 shrink-0 text-pa-muted" aria-hidden />
          <span className="text-pa-muted">{displayLabel}</span>
        </>
      )}
    </Button>
  );
}
