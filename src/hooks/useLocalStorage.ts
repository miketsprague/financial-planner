"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * SSR-safe generic localStorage hook.
 * Falls back to `defaultValue` if localStorage is unavailable or the stored
 * value is invalid JSON.
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      if (stored === null) return defaultValue;
      return JSON.parse(stored) as T;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage may be unavailable (private browsing quota exceeded, etc.)
    }
  }, [key, state]);

  const set = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        return next;
      });
    },
    [],
  );

  return [state, set];
}
