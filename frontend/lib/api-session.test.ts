import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import api, { privateSessionRequest, publicSessionRequest, revokePrivateSession } from "@/lib/api";
import { clearPrivateSessionToken, getPrivateSessionToken, setPrivateSessionToken } from "@/lib/security-session";

describe("Prompt Archive API session invalidation", () => {
  const adapter = api.defaults.adapter;

  beforeEach(() => {
    clearPrivateSessionToken();
    api.defaults.adapter = async (config) => {
      throw new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, undefined, {
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config,
        data: { detail: "Unauthorized" },
      });
    };
  });

  afterEach(() => {
    api.defaults.adapter = adapter;
    clearPrivateSessionToken();
  });

  it("keeps the session when a public endpoint is incorrectly called and returns 401", async () => {
    setPrivateSessionToken("session-that-must-survive");

    await expect(api.get("/settings/pin-status", publicSessionRequest)).rejects.toThrow();

    expect(getPrivateSessionToken()).toBe("session-that-must-survive");
  });

  it("revokes the session when a marked private endpoint returns 401", async () => {
    setPrivateSessionToken("expired-private-session");

    await expect(api.get("/prompts/", privateSessionRequest)).rejects.toThrow();

    expect(getPrivateSessionToken()).toBeNull();
  });

  it("locks locally before revoking the exact backend session", async () => {
    let sentSession: string | undefined;
    api.defaults.adapter = async (config) => {
      sentSession = config.headers.get("X-Prompt-Archive-Session")?.toString();
      return {
        config,
        data: { ok: true },
        headers: {},
        status: 200,
        statusText: "OK",
      };
    };
    setPrivateSessionToken("session-to-revoke");

    await revokePrivateSession();

    expect(getPrivateSessionToken()).toBeNull();
    expect(sentSession).toBe("session-to-revoke");
  });
});
