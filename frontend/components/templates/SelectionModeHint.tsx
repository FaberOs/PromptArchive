import { CheckSquare } from "lucide-react";

export function SelectionModeHint() {
  return (
    <div className="flex items-center gap-2 rounded-pa-lg border border-pa-primary/20 bg-pa-soft-blue px-3 py-2 text-sm text-pa-text">
      <CheckSquare className="h-4 w-4 shrink-0" />
      <span>Click on prompts or folders to select them. Use the toolbar to perform bulk actions.</span>
    </div>
  );
}
