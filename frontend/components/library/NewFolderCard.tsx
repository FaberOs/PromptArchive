import { Plus } from "lucide-react";
import { FolderTab } from "./FolderTab";
import { cn } from "@/lib/utils";

interface NewFolderCardProps {
  onClick: () => void;
}

export function NewFolderCard({ onClick }: NewFolderCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Create new folder"
      className={cn("group relative isolate h-[214px] w-full overflow-visible text-left")}
    >
      <FolderTab
        accent="var(--pa-border-strong)"
        dashed
        showSheets={false}
        frontTabClassName="bg-pa-paper"
        frontClassName={cn(
          "items-center justify-center border-x border-b border-dashed border-pa-border bg-pa-paper",
          "transition-colors group-hover:border-pa-border-strong group-hover:bg-pa-surface",
        )}
      >
        <div className="flex flex-col items-center justify-center px-5 text-center">
          <div
            className={cn(
              "mb-3 flex h-10 w-10 items-center justify-center rounded-2xl",
              "border border-dashed border-pa-border bg-pa-surface text-pa-muted",
              "transition-colors group-hover:border-pa-primary/30 group-hover:bg-pa-icon-well group-hover:text-pa-icon-well-fg",
            )}
          >
            <Plus className="h-[18px] w-[18px]" strokeWidth={2} aria-hidden="true" />
          </div>

          <span className="text-[13px] font-semibold text-pa-text">New Folder</span>

          <span className="mt-0.5 text-[11px] text-pa-muted">Create collection</span>
        </div>
      </FolderTab>
    </button>
  );
}
