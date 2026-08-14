import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FolderTabProps {
  accent: string;
  dashed?: boolean;
  className?: string;
  frontClassName?: string;
  frontTabClassName?: string;
  showSheets?: boolean;
  children?: ReactNode;
}

/**
 * 3D folder shell made with pure HTML + Tailwind.
 *
 * - Back colored folder layer.
 * - Optional inner sheets.
 * - Animated front folder layer.
 * - Children render inside the animated front layer.
 */
export function FolderTab({
  accent,
  dashed = false,
  className,
  frontClassName,
  frontTabClassName,
  showSheets = true,
  children,
}: FolderTabProps) {
  const accentStyle = {
    "--folder-accent": accent,
  } as CSSProperties & Record<"--folder-accent", string>;

  const backSurface = dashed ? "bg-pa-border-strong" : "bg-[color:var(--folder-accent)]";

  const frontSurface = cn("bg-pa-paper", frontTabClassName);

  return (
    <div className={cn("relative h-full w-full origin-bottom [perspective:1500px]", className)} style={accentStyle}>
      {/* Back folder layer */}
      <div
        className={cn(
          "absolute bottom-[1px] left-px right-px top-[16px] z-0 rounded-2xl rounded-tl-none transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out",
          "group-hover:shadow-[0_18px_38px_rgba(11,20,43,0.14)]",
          backSurface,
        )}
        aria-hidden="true"
      >
        <span className={cn("absolute bottom-[99%] left-0 h-4 w-[92px] rounded-t-2xl", backSurface)} />

        <span
          className={cn(
            "absolute -top-[15px] left-[86px] h-4 w-4",
            "[clip-path:polygon(0_35%,0_100%,52%_100%)]",
            backSurface,
          )}
        />
      </div>

      {/* Inner sheets. Hidden at rest behind the front layer, visible only during open hover. */}
      {showSheets && (
        <>
          <div
            className={cn(
              "absolute inset-x-[5px] bottom-[5px] top-[22px] z-10 rounded-2xl bg-pa-border transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out",
              "origin-bottom select-none group-hover:[transform:rotateX(-18deg)]",
            )}
            aria-hidden="true"
          />

          <div
            className={cn(
              "absolute inset-x-[6px] bottom-[4px] top-[22px] z-20 rounded-2xl bg-pa-border-strong transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out",
              "origin-bottom select-none group-hover:[transform:rotateX(-27deg)]",
            )}
            aria-hidden="true"
          />

          <div
            className={cn(
              "absolute inset-x-[7px] bottom-[3px] top-[22px] z-30 rounded-2xl bg-pa-surface transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out",
              "origin-bottom select-none group-hover:[transform:rotateX(-34deg)]",
            )}
            aria-hidden="true"
          />
        </>
      )}

      {/* Front folder layer */}
      <div
        className={cn(
          "absolute inset-x-[-1px] bottom-0 top-[22px] z-40 origin-bottom transition-[background-color,border-color,color,opacity,transform,box-shadow] duration-300 ease-out",
          "group-hover:[transform:rotateX(-40deg)_translateY(2px)]",
        )}
      >
        {/* Right front tab: no border, no upper separator */}
        <span
          className={cn("absolute bottom-[calc(100%-1px)] right-0 h-4 w-[46%] rounded-t-2xl", frontSurface)}
          aria-hidden="true"
        />

        <span
          className={cn(
            "absolute -top-[10px] right-[calc(46%-4px)] size-3",
            "[clip-path:polygon(100%_14%,50%_100%,100%_100%)]",
            frontSurface,
          )}
          aria-hidden="true"
        />

        <div
          className={cn(
            "relative z-10 flex h-full flex-col overflow-hidden rounded-2xl rounded-tr-none bg-pa-paper",
            "transition-shadow duration-300 ease-out",
            "group-hover:shadow-[0_12px_30px_rgba(11,20,43,0.10)] dark:group-hover:shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
            frontClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
