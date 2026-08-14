export function isActivationKey(key: string): boolean {
  return key === "Enter" || key === " ";
}

export function getFocusableElements(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true");
}

export function focusInitialElement(container: HTMLElement): void {
  container.focus({ preventScroll: true });
  const focusable = getFocusableElements(container);
  (focusable[0] ?? container).focus({ preventScroll: true });
}

export function trapFocus(event: React.KeyboardEvent, container: HTMLElement): void {
  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

export function handleActivationKey(event: React.KeyboardEvent, action: () => void): void {
  if (!isActivationKey(event.key)) return;
  event.preventDefault();
  action();
}

export function segmentedTabId(id: string): string {
  return `pa-tab-${id}`;
}

export function segmentedPanelId(id: string): string {
  return `pa-panel-${id}`;
}
