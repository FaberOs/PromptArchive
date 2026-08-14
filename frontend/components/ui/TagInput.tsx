import React from "react";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type TagInputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ className, placeholder = "cinematic, 8k, octane render", ...props }, ref) => {
    return <Input ref={ref} placeholder={placeholder} className={cn("text-sm", className)} {...props} />;
  },
);
TagInput.displayName = "TagInput";
