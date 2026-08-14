import { useCallback, useSyncExternalStore, type RefObject } from "react";

interface ScrollBounds {
  canScrollUp: boolean;
  canScrollDown: boolean;
}

const EMPTY_BOUNDS: ScrollBounds = {
  canScrollUp: false,
  canScrollDown: false,
};

const SCROLL_UP_ONLY: ScrollBounds = {
  canScrollUp: true,
  canScrollDown: false,
};

const SCROLL_DOWN_ONLY: ScrollBounds = {
  canScrollUp: false,
  canScrollDown: true,
};

const SCROLL_BOTH_DIRECTIONS: ScrollBounds = {
  canScrollUp: true,
  canScrollDown: true,
};

function toStableBounds(canScrollUp: boolean, canScrollDown: boolean): ScrollBounds {
  if (canScrollUp) {
    return canScrollDown ? SCROLL_BOTH_DIRECTIONS : SCROLL_UP_ONLY;
  }

  return canScrollDown ? SCROLL_DOWN_ONLY : EMPTY_BOUNDS;
}

function readScrollBounds(node: HTMLElement | null): ScrollBounds {
  if (!node) return EMPTY_BOUNDS;

  const { scrollTop, scrollHeight, clientHeight } = node;

  const canScrollUp = scrollTop > 0;
  const canScrollDown = scrollTop + clientHeight < scrollHeight - 1;

  // useSyncExternalStore requires stable snapshot identity.
  // Returning new object instances here can cause infinite update loops.
  return toStableBounds(canScrollUp, canScrollDown);
}

export function useScrollBounds(scrollContainerRef: RefObject<HTMLElement | null>): ScrollBounds {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const node = scrollContainerRef.current;
      const emitChange = () => onStoreChange();

      window.addEventListener("resize", emitChange);
      node?.addEventListener("scroll", emitChange, { passive: true });

      queueMicrotask(emitChange);

      return () => {
        window.removeEventListener("resize", emitChange);
        node?.removeEventListener("scroll", emitChange);
      };
    },
    [scrollContainerRef],
  );

  const getSnapshot = useCallback(() => readScrollBounds(scrollContainerRef.current), [scrollContainerRef]);

  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_BOUNDS);
}
