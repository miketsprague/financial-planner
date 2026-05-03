"use client";

import { useMemo } from "react";
import type { Assumptions, ProjectionDataPoint, QuickStartInput } from "@/types";
import { projectSavings, type IncomeConfig } from "@/lib/calculations";

export function useProjection(
  input: QuickStartInput | null,
  assumptions: Assumptions,
  incomeConfig?: IncomeConfig,
): ProjectionDataPoint[] {
  return useMemo(() => {
    if (!input) return [];
    return projectSavings(input, assumptions, incomeConfig);
  }, [input, assumptions, incomeConfig]);
}
