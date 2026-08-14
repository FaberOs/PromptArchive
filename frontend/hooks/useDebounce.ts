import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(
      () => {
        setDebouncedValue((prev) => (Object.is(prev, value) ? prev : value));
      },
      Math.max(0, delay),
    );
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
