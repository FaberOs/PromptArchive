import { EyeOff } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HiddenModeBannerProps {
  onExit: () => void;
}

export function HiddenModeBanner({ onExit }: HiddenModeBannerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col gap-3 rounded-pa-lg border border-pa-warning/30 bg-pa-warning-soft px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-2 text-sm text-pa-warning">
        <EyeOff className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
        <span>Showing hidden items. These are normally invisible in the library.</span>
      </div>
      <Button variant="secondary" size="sm" onClick={onExit} className="shrink-0">
        Exit hidden view
      </Button>
    </div>
  );
}
