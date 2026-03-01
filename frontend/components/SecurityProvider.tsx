"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import api from '@/lib/api';

interface SecurityContextType {
  isNsfwUnlocked: boolean;
  unlockNsfw: (pin: string) => Promise<boolean>;
  lockNsfw: () => void;
  isPinSet: boolean | null; // null = loading
  checkPinStatus: () => Promise<void>;
  setPin: (pin: string) => Promise<boolean>;
  resetPin: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType>({
  isNsfwUnlocked: false,
  unlockNsfw: async () => false,
  lockNsfw: () => {},
  isPinSet: null,
  checkPinStatus: async () => {},
  setPin: async () => false,
  resetPin: async () => false,
});

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  const [isNsfwUnlocked, setIsNsfwUnlocked] = useState(false);
  const [isPinSet, setIsPinSet] = useState<boolean | null>(null);

  const checkPinStatus = async () => {
    try {
      const res = await api.get('/settings/pin-status');
      setIsPinSet(res.data.is_set);
    } catch (error) {
      console.error("Failed to check PIN status", error);
    }
  };

  useEffect(() => {
    checkPinStatus();
  }, []);

  const unlockNsfw = async (pin: string) => {
    try {
      await api.post('/settings/pin-verify', { pin });
      setIsNsfwUnlocked(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const setPin = async (pin: string) => {
    try {
      await api.post('/settings/pin-set', { pin });
      setIsPinSet(true);
      return true;
    } catch (error) {
      return false;
    }
  };

  const lockNsfw = () => {
    setIsNsfwUnlocked(false);
  };

  const resetPin = async () => {
    try {
      await api.delete('/settings/pin-reset');
      setIsPinSet(false);
      setIsNsfwUnlocked(false);
      return true;
    } catch (error) {
      console.error("Failed to reset PIN", error);
      return false;
    }
  };

  return (
    <SecurityContext.Provider value={{ isNsfwUnlocked, unlockNsfw, lockNsfw, isPinSet, checkPinStatus, setPin, resetPin }}>
      {children}
    </SecurityContext.Provider>
  );
}

export const useSecurity = () => useContext(SecurityContext);
