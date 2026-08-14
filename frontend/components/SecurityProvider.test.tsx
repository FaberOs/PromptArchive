import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import api from "@/lib/api";
import { clearPrivateSessionToken, getPrivateSessionToken, setPrivateSessionToken } from "@/lib/security-session";
import { SecurityProvider, useSecurity } from "@/components/SecurityProvider";

describe("SecurityProvider private cache lifecycle", () => {
  const adapter = api.defaults.adapter;

  beforeEach(() => {
    clearPrivateSessionToken();
    api.defaults.adapter = async (config) => ({
      config,
      data: config.url?.endsWith("pin-status") ? { is_set: true } : { ok: true },
      headers: {},
      status: 200,
      statusText: "OK",
    });
  });

  afterEach(() => {
    api.defaults.adapter = adapter;
    clearPrivateSessionToken();
  });

  function createWrapper(queryClient: QueryClient) {
    return function Wrapper({ children }: PropsWithChildren) {
      return (
        <QueryClientProvider client={queryClient}>
          <SecurityProvider>{children}</SecurityProvider>
        </QueryClientProvider>
      );
    };
  }

  it("clears the token and private queries when resetting the PIN", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    setPrivateSessionToken("private-reset-session");
    queryClient.setQueryData(["private-data"], { secret: true });

    const { result } = renderHook(() => useSecurity(), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isPinSet).toBe(true));

    await act(async () => {
      expect(await result.current.resetPin()).toBe(true);
    });

    expect(getPrivateSessionToken()).toBeNull();
    expect(result.current.isNsfwUnlocked).toBe(false);
    expect(queryClient.getQueryData(["private-data"])).toBeUndefined();
    expect(queryClient.getQueryData(["settings", "pin-status"])).toBe(false);
  });

  it("clears the old session and private queries when replacing the PIN", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    setPrivateSessionToken("private-change-session");
    queryClient.setQueryData(["private-data"], { secret: true });

    const { result } = renderHook(() => useSecurity(), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => expect(result.current.isPinSet).toBe(true));

    await act(async () => {
      expect(await result.current.setPin("5678")).toBe(true);
    });

    expect(getPrivateSessionToken()).toBeNull();
    expect(result.current.isNsfwUnlocked).toBe(false);
    expect(queryClient.getQueryData(["private-data"])).toBeUndefined();
    expect(queryClient.getQueryData(["settings", "pin-status"])).toBe(true);
  });
});
