"use client";

import { useState, useEffect, useRef } from 'react';
import { useSecurity } from './SecurityProvider';
import { Button } from './ui/Button';
import { Lock, KeyRound, AlertTriangle } from 'lucide-react';
import { Input } from './ui/Input';
import { toast } from 'sonner';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PinModal({ isOpen, onClose, onSuccess }: PinModalProps) {
  const { isPinSet, unlockNsfw, setPin, resetPin } = useSecurity();
  const [pin, setPinValue] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPinValue("");
      setConfirmPin("");
      setError("");
      setShowResetConfirm(false);
      setResetting(false);
      tapCountRef.current = 0;
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleIconTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current);
    if (tapCountRef.current >= 3) {
      tapCountRef.current = 0;
      setShowResetConfirm(true);
    } else {
      tapTimerRef.current = setTimeout(() => {
        tapCountRef.current = 0;
      }, 600);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    const success = await resetPin();
    if (success) {
      toast.success('PIN has been reset. Set a new one.');
      setShowResetConfirm(false);
      setPinValue("");
      setConfirmPin("");
      setError("");
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
      // Setup Mode
      if (!confirmPin) {
        return;
      }
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
      // Verify Mode
      const success = await unlockNsfw(pin);
      if (success) {
        onSuccess();
        onClose();
      } else {
        setError("Incorrect PIN");
        setPinValue("");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e293b] w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/50 transform transition-all scale-100">
        
        {showResetConfirm ? (
          /* Reset Confirmation View */
          <div className="space-y-5">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Forgot your PIN?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  This will reset your current PIN. You&apos;ll need to set a new one to access this library.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setShowResetConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="button" onClick={handleReset} isLoading={resetting} className="flex-1 bg-amber-600 text-white hover:bg-amber-700">
                Reset PIN
              </Button>
            </div>
          </div>
        ) : (
          /* Normal PIN Entry View */
          <>
            <div className="flex flex-col items-center gap-4 mb-6">
              <div
                onClick={isPinSet ? handleIconTap : undefined}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-700/60 rounded-full flex items-center justify-center text-slate-900 dark:text-slate-50 select-none"
              >
                {isPinSet ? <Lock className="w-6 h-6" /> : <KeyRound className="w-6 h-6" />}
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                  {isPinSet ? "NSFW Library Locked" : "Setup NSFW PIN"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {isPinSet 
                    ? "Enter your 4-digit PIN to access." 
                    : "Create a 4-digit PIN to secure this library."}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  type="password"
                  placeholder="0000"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                />
              </div>

              {!isPinSet && pin.length === 4 && (
                <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
                    <p className="text-xs text-center text-slate-500">Confirm PIN</p>
                    <Input
                      type="password"
                      placeholder="Confirm"
                      maxLength={4}
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    />
                </div>
              )}

              {error && (
                <div className="text-red-500 text-sm text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                  {isPinSet ? "Unlock" : (!confirmPin ? "Next" : "Set PIN")}
                </Button>
              </div>
            </form>


          </>
        )}

      </div>
    </div>
  );
}
