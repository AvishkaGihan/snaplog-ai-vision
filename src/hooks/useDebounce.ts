import { useEffect, useState } from "react";

import { SEARCH_DEBOUNCE_MS } from "@/constants/config";

export function useDebounce<T>(
  value: T,
  delay: number = SEARCH_DEBOUNCE_MS,
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
