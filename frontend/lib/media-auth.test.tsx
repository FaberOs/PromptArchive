import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ImgHTMLAttributes, PropsWithChildren } from "react";
import { AuthenticatedImage } from "@/components/ui/AuthenticatedImage";
import { clearPrivateSessionToken, setPrivateSessionToken } from "@/lib/security-session";
import {
  fetchAuthenticatedMedia,
  resolvePromptArchiveMediaUrl,
  useAuthenticatedMediaUrl,
} from "@/hooks/useAuthenticatedMediaUrl";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => (
    <div role="img" aria-label={props.alt} data-src={props.src} />
  ),
}));

function responseFor(status: number, body = "image-bytes"): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    blob: async () => new Blob([body], { type: "image/png" }),
  } as Response;
}

describe("Prompt Archive authenticated media", () => {
  beforeEach(() => {
    clearPrivateSessionToken();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    clearPrivateSessionToken();
  });

  function createQueryWrapper() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    return function QueryWrapper({ children }: PropsWithChildren) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    };
  }

  it("does not put the session token in a media URL", () => {
    setPrivateSessionToken("read-session-token");

    expect(resolvePromptArchiveMediaUrl("/static/7/private.png")).toBe("http://127.0.0.1:8000/static/7/private.png");
    expect(resolvePromptArchiveMediaUrl("/static/7/private.png")).not.toContain("read-session-token");
  });

  it("sends the session header when the authenticated media loader fetches a preview", async () => {
    setPrivateSessionToken("read-session-token");
    const fetchMock = vi.mocked(fetch).mockResolvedValue(responseFor(200));

    await fetchAuthenticatedMedia("/static/7/private.png");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/static/7/private.png",
      expect.objectContaining({
        credentials: "omit",
        headers: { "X-Prompt-Archive-Session": "read-session-token" },
      }),
    );
  });

  it("renders a protected preview through the reusable image boundary", async () => {
    setPrivateSessionToken("read-session-token");
    vi.mocked(fetch).mockResolvedValue(responseFor(200));

    render(<AuthenticatedImage src="/static/7/private.png" alt="Private preview" />, { wrapper: createQueryWrapper() });

    await waitFor(() => {
      expect(screen.getByRole("img", { name: "Private preview" }).getAttribute("data-src")).toMatch(
        /^data:image\/png;base64,/,
      );
    });
  });

  it("never forwards the private session header to an external media origin", async () => {
    setPrivateSessionToken("read-session-token");
    const fetchMock = vi.mocked(fetch).mockResolvedValue(responseFor(200));

    await fetchAuthenticatedMedia("https://cdn.example.test/preview.png");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://cdn.example.test/preview.png",
      expect.objectContaining({ headers: undefined }),
    );
  });

  it("denies a public preview after session revocation", async () => {
    setPrivateSessionToken("read-session-token");
    const fetchMock = vi.mocked(fetch).mockImplementation(async (_input, init) => {
      const headers = new Headers(init?.headers);
      return headers.has("X-Prompt-Archive-Session") ? responseFor(200) : responseFor(404, "not found");
    });

    const { result } = renderHook(() => useAuthenticatedMediaUrl("/static/7/private.png"), {
      wrapper: createQueryWrapper(),
    });

    await waitFor(() => {
      expect(result.current.objectUrl).toMatch(/^data:image\/png;base64,/);
    });

    clearPrivateSessionToken();

    await waitFor(() => {
      expect(result.current.objectUrl).toBeNull();
      expect(result.current.error).toBeTruthy();
    });

    expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    const lastCall = fetchMock.mock.calls.at(-1);
    expect(new Headers(lastCall?.[1]?.headers).has("X-Prompt-Archive-Session")).toBe(false);
  });
});
