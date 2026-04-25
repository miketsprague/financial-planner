"use client";

import { useMemo } from "react";
import type { Assumptions, ProjectionDataPoint, QuickStartInput } from "@/types";
import { projectSavings } from "@/lib/calculations";

export function useProjection(
  input: QuickStartInput | null,
  assumptions: Assumptions,
): ProjectionDataPoint[] {
  return useMemo(() => {
    if (!input) return [];
    return projectSavings(input, assumptions);
  }, [input, assumptions]);
}
