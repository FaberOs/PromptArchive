"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "prompt-archive:show-hidden-items";
const listeners = new Set<() => void>();

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setShowHidden(next: boolean) {
  localStorage.setItem(STORAGE_KEY, String(next));
  listeners.forEach((listener) => listener());
}

const HiddenItemsContext = createContext({
  showHidden: false,
  setShowHidden: (_next: boolean) => {
    void _next;
  },
  toggleShowHidden: () => {},
});

export function HiddenItemsProvider({ children }: { children: React.ReactNode }) {
  const showHidden = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const toggleShowHidden = useCallback(() => setShowHidden(!showHidden), [showHidden]);
  const contextValue = useMemo(() => ({ showHidden, setShowHidden, toggleShowHidden }), [showHidden, toggleShowHidden]);
  return <HiddenItemsContext.Provider value={contextValue}>{children}</HiddenItemsContext.Provider>;
}

export const useHiddenItems = () => useContext(HiddenItemsContext);
