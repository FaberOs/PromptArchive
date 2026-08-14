"use client";

import React, { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import api, { privateSessionRequest, publicSessionRequest, revokePrivateSession } from "@/lib/api";
import {
  clearPrivateSessionToken,
  getPrivateSessionToken,
  setPrivateSessionToken,
  subscribePrivateSession,
} from "@/lib/security-session";

const PIN_STATUS_QUERY_KEY = ["settings", "pin-status"] as const;

function isBackendUnavailable(error: unknown) {
  return axios.isAxiosError(error) && (!error.response || error.code === "ERR_NETWORK");
}

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
  const queryClient = useQueryClient();
  const sessionToken = useSyncExternalStore(subscribePrivateSession, getPrivateSessionToken, () => null);
  const isNsfwUnlocked = Boolean(sessionToken);

  const clearPrivateState = useCallback(
    (pinIsSet: boolean) => {
      clearPrivateSessionToken();
      queryClient.clear();
      queryClient.setQueryData(PIN_STATUS_QUERY_KEY, pinIsSet);
    },
    [queryClient],
  );

  const pinStatusQuery = useQuery<boolean>({
    queryKey: PIN_STATUS_QUERY_KEY,
    queryFn: async () => {
      try {
        const res = await api.get("/settings/pin-status", publicSessionRequest);
        return Boolean(res.data?.is_set);
      } catch (error) {
        // In standalone frontend/dev startup, backend may not be ready yet.
        if (isBackendUnavailable(error)) {
          return false;
        }
        console.error("Failed to check PIN status", error);
        throw error;
      }
    },
    retry: 0,
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
  });

  const isPinSet: boolean | null =
    pinStatusQuery.isPending || pinStatusQuery.isError ? null : (pinStatusQuery.data ?? false);

  const checkPinStatus = useCallback(async () => {
    await pinStatusQuery.refetch();
  }, [pinStatusQuery]);

  const unlockNsfw = useCallback(async (pin: string) => {
    try {
      const response = await api.post<{ session_token?: string }>(
        "/settings/pin-verify",
        { pin },
        publicSessionRequest,
      );
      const token = response.data.session_token;
      if (!token) return false;
      setPrivateSessionToken(token);
      return true;
    } catch {
      return false;
    }
  }, []);

  const setPin = useCallback(
    async (pin: string) => {
      const replacingExistingPin = isPinSet === true;
      try {
        await api.post(
          "/settings/pin-set",
          { pin },
          replacingExistingPin ? privateSessionRequest : publicSessionRequest,
        );
        if (replacingExistingPin) {
          clearPrivateState(true);
        } else {
          queryClient.setQueryData(PIN_STATUS_QUERY_KEY, true);
        }
        return true;
      } catch {
        return false;
      }
    },
    [clearPrivateState, isPinSet, queryClient],
  );

  const lockNsfw = useCallback(() => {
    const revoke = revokePrivateSession();
    clearPrivateState(true);
    void revoke.catch((error: unknown) => {
      console.error("Failed to revoke private session", error);
    });
  }, [clearPrivateState]);

  const resetPin = useCallback(async () => {
    try {
      await api.delete("/settings/pin-reset", privateSessionRequest);
      clearPrivateState(false);
      return true;
    } catch (error) {
      console.error("Failed to reset PIN", error);
      return false;
    }
  }, [clearPrivateState]);

  const contextValue = useMemo(
    () => ({
      isNsfwUnlocked,
      unlockNsfw,
      lockNsfw,
      isPinSet,
      checkPinStatus,
      setPin,
      resetPin,
    }),
    [isNsfwUnlocked, unlockNsfw, lockNsfw, isPinSet, checkPinStatus, setPin, resetPin],
  );

  return <SecurityContext.Provider value={contextValue}>{children}</SecurityContext.Provider>;
}

export const useSecurity = () => useContext(SecurityContext);
