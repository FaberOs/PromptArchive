import { useId, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  isLoading?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  isLoading,
  icon,
  className,
}: ConfirmDialogProps) {
  const descriptionId = useId();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} describedById={descriptionId} className={className}>
      <div className="space-y-4">
        <div className="flex gap-3">
          {icon ?? (
            <div
              className={cn(
                "pa-section-icon-well h-10 w-10",
                destructive && "border-pa-danger/25 bg-pa-danger-soft text-pa-danger",
              )}
              aria-hidden="true"
            >
              <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
            </div>
          )}
          <div id={descriptionId} className="text-sm leading-relaxed text-pa-muted">
            {description}
          </div>
        </div>
        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="w-full sm:w-auto">
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? "danger" : "primary"}
            isLoading={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
