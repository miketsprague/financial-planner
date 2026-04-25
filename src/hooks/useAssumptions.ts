"use client";

import { useState, useCallback } from "react";
import type { Assumptions } from "@/types";
import { UK_DEFAULTS } from "@/lib/defaults";

export type UseAssumptionsReturn = {
  assumptions: Assumptions;
  updateAssumption: <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => void;
  setAssumptions: (next: Assumptions) => void;
  resetToDefaults: () => void;
};

export function useAssumptions(
  initial: Assumptions = { ...UK_DEFAULTS },
): UseAssumptionsReturn {
  const [assumptions, setAssumptions] = useState<Assumptions>(initial);

  const updateAssumption = useCallback(
    <K extends keyof Assumptions>(key: K, value: Assumptions[K]) => {
      setAssumptions((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const resetToDefaults = useCallback(() => {
    setAssumptions({ ...UK_DEFAULTS });
  }, []);

  return { assumptions, updateAssumption, setAssumptions, resetToDefaults };
}
