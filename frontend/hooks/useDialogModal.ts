import { useEffect, type RefObject } from "react";

export function useDialogModal(dialogRef: RefObject<HTMLDialogElement | null>, isOpen: boolean) {
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || !isOpen) return;

    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }

    return () => {
      if (dialog.open) dialog.close();
    };
  }, [dialogRef, isOpen]);
}
