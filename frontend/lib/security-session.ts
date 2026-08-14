const STORAGE_KEY = "prompt-archive:private-session";

let memoryToken: string | null = null;
const listeners = new Set<() => void>();

function readStoredToken(): string | null {
  if (typeof window === "undefined") return memoryToken;
  return window.sessionStorage.getItem(STORAGE_KEY);
}

export function getPrivateSessionToken(): string | null {
  return readStoredToken();
}

export function setPrivateSessionToken(token: string): void {
  memoryToken = token;
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, token);
  }
  listeners.forEach((listener) => listener());
}

export function clearPrivateSessionToken(): void {
  memoryToken = null;
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem(STORAGE_KEY);
  }
  listeners.forEach((listener) => listener());
}

export function subscribePrivateSession(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
