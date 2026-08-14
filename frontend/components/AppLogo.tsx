import { cn } from "@/lib/utils";

interface AppLogoProps {
  size?: number;
  className?: string;
  label?: string;
}

/**
 * Solid archive isotipo — tints via `currentColor` (ink in light, brand cream in dark).
 */
export function AppLogo({ size = 40, className, label = "Prompt Archive" }: AppLogoProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn("inline-block shrink-0 bg-current text-pa-ink dark:text-pa-brand-cream", className)}
      style={{
        width: size,
        height: size,
        maskImage: "url(/peekr-logo.svg)",
        WebkitMaskImage: "url(/peekr-logo.svg)",
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      }}
    />
  );
}
