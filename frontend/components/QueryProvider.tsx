"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000, // 30 seconds
            // Re-fetch when window regains focus so data loads even if the
            // Python backend was slow to start on the first attempt.
            refetchOnWindowFocus: true,
            // Retry up to 6 times with exponential backoff capped at 15s.
            // This covers the ~30s cold-start of uvicorn in dev mode.
            retry: 6,
            retryDelay: (attemptIndex) => Math.min(1500 * 1.8 ** attemptIndex, 15_000),
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
