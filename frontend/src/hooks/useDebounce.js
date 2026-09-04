import { useState, useEffect } from "react";

/**
 * useDebounce Custom Hook
 * Delays updating a value until a specified delay (ms) has elapsed.
 * Reduces UI re-renders and search API/filter execution during fast typing.
 */
export function useDebounce(value, delayMs = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

export default useDebounce;
