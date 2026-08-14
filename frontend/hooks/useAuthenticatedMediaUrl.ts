"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/constants";
import { clearPrivateSessionToken, getPrivateSessionToken, subscribePrivateSession } from "@/lib/security-session";

export const PRIVATE_SESSION_HEADER = "X-Prompt-Archive-Session";

export interface AuthenticatedMediaState {
  objectUrl: string | null;
  isLoading: boolean;
  error: Error | null;
}

function isInlineMediaSource(source: string): boolean {
  return source.startsWith("blob:") || source.startsWith("data:");
}

export function resolvePromptArchiveMediaUrl(source: string): string {
  if (/^https?:\/\//i.test(source) || isInlineMediaSource(source)) {
    return source;
  }

  return `${API_BASE_URL.replace(/\/$/, "")}/${source.replace(/^\//, "")}`;
}

function belongsToPromptArchiveApi(url: string): boolean {
  if (url.startsWith("/")) return true;

  try {
    return new URL(url).origin === new URL(API_BASE_URL).origin;
  } catch {
    return false;
  }
}

export class AuthenticatedMediaError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "AuthenticatedMediaError";
  }
}

/**
 * Loads a Prompt Archive media resource using the same session header as the
 * API client. The token never becomes part of the resource URL.
 */
export async function fetchAuthenticatedMedia(source: string, signal?: AbortSignal): Promise<Blob | string> {
  if (isInlineMediaSource(source)) return source;

  const token = getPrivateSessionToken();
  const resolvedUrl = resolvePromptArchiveMediaUrl(source);
  const shouldSendSessionHeader = belongsToPromptArchiveApi(resolvedUrl);
  const sessionHeader = token && shouldSendSessionHeader ? { [PRIVATE_SESSION_HEADER]: token } : undefined;
  const response = await fetch(resolvedUrl, {
    signal,
    credentials: "omit",
    headers: sessionHeader,
  });

  if (!response.ok) {
    if (response.status === 401 && sessionHeader) {
      clearPrivateSessionToken();
    }
    throw new AuthenticatedMediaError(`Unable to load media (${response.status})`, response.status);
  }

  return response.blob();
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Unable to read media"));
    };
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read media"));
    reader.onabort = () => reject(new DOMException("Media read aborted", "AbortError"));
    reader.readAsDataURL(blob);
  });
}

export function useAuthenticatedMediaUrl(source: string | null | undefined): AuthenticatedMediaState {
  const sessionToken = useSyncExternalStore(subscribePrivateSession, getPrivateSessionToken, () => null);
  const resolvedSource = source ? resolvePromptArchiveMediaUrl(source) : null;
  const needsAuthenticatedFetch = Boolean(
    source && !isInlineMediaSource(source) && resolvedSource && belongsToPromptArchiveApi(resolvedSource),
  );
  const mediaQuery = useQuery<string>({
    queryKey: ["prompt-archive-media", source, sessionToken ?? "public"],
    enabled: needsAuthenticatedFetch,
    queryFn: async ({ signal }) => {
      const media = await fetchAuthenticatedMedia(source!, signal);
      return typeof media === "string" ? media : blobToDataUrl(media);
    },
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 0,
  });

  if (!source) {
    return { objectUrl: null, isLoading: false, error: null };
  }

  if (!needsAuthenticatedFetch) {
    return { objectUrl: resolvedSource, isLoading: false, error: null };
  }

  return {
    objectUrl: mediaQuery.data ?? null,
    isLoading: mediaQuery.isPending,
    error:
      mediaQuery.error instanceof Error
        ? mediaQuery.error
        : mediaQuery.error
          ? new Error("Unable to load media")
          : null,
  };
}
