"use client";

import { useInsertionEffect, useSyncExternalStore } from "react";
import { requestSuiteTheme, SUITE_THEME_CHANGE_EVENT, SUITE_THEME_STORAGE_KEY, type SuiteTheme } from "./theme";

type ThemeBridge = {
  onThemeChange?: (callback: (theme: SuiteTheme) => void) => () => void;
};

let bridgeTheme: SuiteTheme | null = null;
let clientThemeReady = false;

function mediaQuery(): MediaQueryList | null {
  return typeof window === "undefined" ? null : window.matchMedia("(prefers-color-scheme: dark)");
}

function currentMediaTheme(): SuiteTheme {
  return mediaQuery()?.matches ? "dark" : "light";
}

function storedTheme(): SuiteTheme | null {
  try {
    const value = window.localStorage.getItem(SUITE_THEME_STORAGE_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null;
  }
}

function resolveTheme(): SuiteTheme {
  return storedTheme() ?? currentMediaTheme();
}

function themeBridge(): ThemeBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { electronAPI?: ThemeBridge }).electronAPI;
}

function subscribe(listener: () => void): () => void {
  if (!clientThemeReady) {
    clientThemeReady = true;
    // The first render intentionally matches the server snapshot. Once the
    // subscription is mounted, read the stored/media theme instead of the
    // already-painted class, which may still contain the server's dark
    // fallback and otherwise pins newly mounted app views to dark mode.
    bridgeTheme = resolveTheme();
  }
  const query = mediaQuery();
  const handleMediaChange = (): void => {
    bridgeTheme = resolveTheme();
    listener();
  };
  const handleStorageChange = (): void => {
    bridgeTheme = resolveTheme();
    listener();
  };
  query?.addEventListener?.("change", handleMediaChange);
  if (query && !query.addEventListener) query.addListener(handleMediaChange);
  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(SUITE_THEME_CHANGE_EVENT, handleStorageChange);
  const unsubscribeBridge = themeBridge()?.onThemeChange?.((theme) => {
    bridgeTheme = theme;
    listener();
  });
  return () => {
    query?.removeEventListener?.("change", handleMediaChange);
    if (query && !query.removeEventListener) query.removeListener(handleMediaChange);
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(SUITE_THEME_CHANGE_EVENT, handleStorageChange);
    unsubscribeBridge?.();
  };
}

function getSnapshot(): SuiteTheme {
  // Keep the first client render identical to the server's stable snapshot.
  // The subscription promotes the real stored/media theme immediately after hydration.
  return clientThemeReady ? (bridgeTheme ?? resolveTheme()) : "dark";
}

function applyDocumentTheme(theme: SuiteTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function useSuiteTheme(): SuiteTheme {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark" as SuiteTheme);
  useInsertionEffect(() => {
    applyDocumentTheme(theme);
    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => applyDocumentTheme(theme));
    }
  }, [theme]);
  return theme;
}

export function toggleSuiteTheme(theme: SuiteTheme): void {
  requestSuiteTheme(theme === "dark" ? "light" : "dark");
}
