"use client";

import { useRef, useState, useCallback } from "react";
import { useSecurity } from "./SecurityProvider";
import { Button } from "./ui/Button";
import { Lock, KeyRound, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { focusInitialElement, trapFocus } from "@/lib/a11y";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode?: "unlock" | "reset";
}

function PinInput({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.split("");
    chars[index] = digit;
    onChange(chars.join("").slice(0, 4));
    if (digit && index < 3) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  return (
    <div
      className="flex justify-center gap-2"
      role="group"
      aria-label="PIN digits"
      onPaste={(e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        onChange(pasted);
        inputsRef.current[Math.min(pasted.length, 3)]?.focus();
      }}
    >
      {[0, 1, 2, 3].map((index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          type="password"
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && index === 0}
          maxLength={1}
          value={value[index] ?? ""}
          aria-label={`PIN digit ${index + 1} of 4`}
          onChange={(e) => {
            const digit = e.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, digit);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !value[index] && index > 0) {
              inputsRef.current[index - 1]?.focus();
            }
          }}
          className={cn(
            "h-12 w-11 rounded-pa-md border border-pa-border bg-pa-paper text-center text-xl font-mono text-pa-text shadow-[inset_0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] transition-[background-color,border-color,color,opacity,transform,box-shadow]",
            "focus-visible:border-pa-private focus-visible:outline-none focus-visible:ring-[4px] focus-visible:ring-pa-private/15",
          )}
        />
      ))}
    </div>
  );
}

export default function PinModal({ isOpen, onClose, onSuccess, mode = "unlock" }: PinModalProps) {
  const { isPinSet, unlockNsfw, setPin, resetPin } = useSecurity();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(mode === "reset");
  const [resetting, setResetting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const handleReset = async () => {
    setResetting(true);
    const success = await resetPin();
    if (success) {
      toast.success("PIN has been reset. Set a new one.");
      setShowResetConfirm(false);
      setPinValue("");
      setConfirmPin("");
      setError("");
      onClose();
    } else {
      setError("Failed to reset PIN");
    }
    setResetting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    if (!isPinSet) {
      if (!confirmPin) return;
      if (pin !== confirmPin) {
        setError("PINs do not match");
        return;
      }

      const success = await setPin(pin);
      if (success) {
        await unlockNsfw(pin);
        onSuccess();
        onClose();
      } else {
        setError("Failed to set PIN");
      }
    } else {
      const success = await unlockNsfw(pin);
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError("Incorrect PIN. Try again.");
        setPinValue("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-pa-modal flex items-center justify-center bg-pa-ink/75 p-4 backdrop-blur-lg"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={setDialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="private-lock-title"
        aria-describedby={error ? "private-lock-error" : "private-lock-description"}
        tabIndex={-1}
        onKeyDown={handleDialogKeyDown}
        className="pa-modal-in w-full max-w-sm rounded-pa-2xl border border-pa-border bg-pa-paper p-6 shadow-pa-modal outline-none"
      >
        {showResetConfirm ? (
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pa-warning-soft text-pa-warning">
                <AlertTriangle className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="text-center">
                <h2 id="private-lock-title" className="text-xl font-bold text-pa-text">
                  Forgot your PIN?
                </h2>
                <p id="private-lock-description" className="mt-1 text-sm text-pa-muted">
                  This will reset your current PIN. You&apos;ll need to set a new one to access this library.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowResetConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={handleReset} isLoading={resetting} className="flex-1">
                Reset PIN
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-col items-center gap-4">
              <div className="flex h-12 w-12 select-none items-center justify-center rounded-full bg-pa-private-soft text-pa-private">
                {isPinSet ? (
                  <Lock className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <KeyRound className="h-6 w-6" strokeWidth={1.8} aria-hidden="true" />
                )}
              </div>
              <div className="text-center">
                <h2 id="private-lock-title" className="text-xl font-bold text-pa-text">
                  {isPinSet ? "Private Library Locked" : "Set Private Library PIN"}
                </h2>
                <p id="private-lock-description" className="mt-1 text-sm text-pa-muted">
                  {isPinSet
                    ? "Enter your 4-digit PIN to access this local vault."
                    : "Create a 4-digit PIN to secure this library."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className={cn("space-y-4", error && "animate-[shake_0.4s_ease-in-out]")}>
              <PinInput value={pin} onChange={setPinValue} autoFocus />

              {!isPinSet && pin.length === 4 && (
                <div className="animate-in fade-in slide-in-from-top-2 space-y-2">
                  <p className="text-center text-xs text-pa-muted-soft">Confirm PIN</p>
                  <PinInput value={confirmPin} onChange={setConfirmPin} />
                </div>
              )}

              {error && (
                <div
                  id="private-lock-error"
                  role="alert"
                  className="flex items-center justify-center gap-2 text-sm text-pa-danger"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" variant="private" className="flex-1">
                  {isPinSet ? "Unlock" : !confirmPin ? "Next" : "Set PIN"}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
