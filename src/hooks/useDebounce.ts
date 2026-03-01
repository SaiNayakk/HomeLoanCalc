import { useEffect, useState } from 'react';

/**
 * Hook to debounce a value with a specified delay
 * Useful for triggering calculations after user stops typing
 */
export function useDebounce<T>(value: T, delayMs: number = 2000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(handler);
  }, [value, delayMs]);

  return debouncedValue;
}
