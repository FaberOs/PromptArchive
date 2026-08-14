"use client";

import { useId, useRef, useCallback, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { focusInitialElement, trapFocus } from "@/lib/a11y";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  describedById?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, description, describedById, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const setDialogRef = useCallback((node: HTMLDivElement | null) => {
    dialogRef.current = node;
    if (node) focusInitialElement(node);
  }, []);

  const handleDialogKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }

    if (dialogRef.current) {
      trapFocus(event, dialogRef.current);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <>
      <style>{`body { overflow: hidden; }`}</style>

      <div
        className="fixed inset-0 z-pa-modal flex items-end justify-center bg-pa-ink/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={(event) => {
          if (event.target === overlayRef.current) onClose();
        }}
        ref={overlayRef}
        role="presentation"
      >
        <div
          ref={setDialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          aria-describedby={describedById ?? (description ? descriptionId : undefined)}
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          className={cn(
            "pa-modal-in flex max-h-[min(90dvh,100%)] w-full min-w-0 max-w-md flex-col outline-none",
            "rounded-t-pa-2xl border border-pa-border bg-pa-paper shadow-pa-modal sm:max-h-[90vh] sm:rounded-pa-2xl",
            className,
          )}
        >
          <div className="flex items-center justify-between p-6 pb-0">
            {title && (
              <h2 id={titleId} className="text-xl font-bold text-pa-text">
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className={cn(
                "ml-auto rounded-full p-2 text-pa-muted-soft transition-colors",
                "hover:bg-pa-surface hover:text-pa-text",
              )}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {description ? (
            <p id={descriptionId} className="sr-only">
              {description}
            </p>
          ) : null}

          <div className="overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>,
    document.body,
  );
}
