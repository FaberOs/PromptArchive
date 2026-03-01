"use client";

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import clsx from 'clsx';

interface CopyButtonProps {
  text: string;
  className?: string;
  variant?: 'ghost' | 'outline' | 'secondary';
  label?: string;
}

export function CopyButton({ text, className, variant = 'ghost', label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleCopy}
      className={clsx("transition-all duration-200", className)}
      title="Copy to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1 text-green-600" />
          <span className="text-green-600 font-medium">Copied</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1 text-slate-500" />
          {label && <span className="text-slate-500">{label}</span>}
        </>
      )}
    </Button>
  );
}
