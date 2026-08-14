import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import PinModal from "@/components/PinModal";

const securityMock = vi.hoisted(() => ({
  isPinSet: true,
  unlockNsfw: vi.fn(),
  setPin: vi.fn(),
  resetPin: vi.fn(),
}));

vi.mock("@/components/SecurityProvider", () => ({
  useSecurity: () => securityMock,
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("PinModal reset flow", () => {
  beforeEach(() => {
    securityMock.resetPin.mockReset();
    securityMock.resetPin.mockResolvedValue(true);
  });

  it("does not expose a hidden reset gesture while locked", () => {
    render(<PinModal isOpen onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(screen.queryByText("Forgot your PIN?")).toBeNull();
    expect(screen.queryByRole("button", { name: "Reset PIN" })).toBeNull();
  });

  it("exposes reset from an authenticated reset modal", async () => {
    const onClose = vi.fn();

    render(<PinModal isOpen mode="reset" onClose={onClose} onSuccess={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Reset PIN" }));

    await waitFor(() => {
      expect(securityMock.resetPin).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    });
  });
});
