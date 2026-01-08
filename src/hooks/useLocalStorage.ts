import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing state that persists to localStorage
 * @param key - The localStorage key to use
 * @param initialValue - The initial value if nothing is stored
 * @returns A tuple of [storedValue, setValue, reset]
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Initialize state with value from localStorage or the initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        return JSON.parse(item) as T;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  // Persist to localStorage whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Wrapper to update state
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value;
      return nextValue;
    });
  }, []);

  // Reset to initial value
  const reset = useCallback(() => {
    setStoredValue(initialValue);
  }, [initialValue]);

  return [storedValue, setValue, reset];
}
