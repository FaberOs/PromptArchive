"use client";

import Image, { type ImageProps } from "next/image";
import type { ReactNode } from "react";
import { useAuthenticatedMediaUrl } from "@/hooks/useAuthenticatedMediaUrl";

export interface AuthenticatedImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallback?: ReactNode;
}

/**
 * Image boundary for Prompt Archive media. It fetches protected files with a
 * session header and gives Next Image a short-lived blob URL, so no auth token
 * is ever placed in an image URL.
 */
export function AuthenticatedImage({ src, fallback = null, ...imageProps }: AuthenticatedImageProps) {
  const { objectUrl } = useAuthenticatedMediaUrl(src);

  if (!objectUrl) return fallback;

  return <Image {...imageProps} alt={imageProps.alt} src={objectUrl} unoptimized />;
}
