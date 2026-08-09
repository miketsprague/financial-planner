"use client";

import { useMemo } from "react";
import type { MonteCarloResult, Plan, ProjectionPoint } from "@/types";
import { projectPlan } from "@/lib/calculations";
import { runMonteCarloSimulation } from "@/lib/monte-carlo";

export type UseProjectionReturn = {
  projection: ProjectionPoint[];
  monteCarlo: MonteCarloResult;
};

/** Memoised deterministic projection and Monte Carlo simulation for a plan. */
export function useProjection(plan: Plan): UseProjectionReturn {
  const projection = useMemo(() => projectPlan(plan), [plan]);
  const monteCarlo = useMemo(() => runMonteCarloSimulation(plan), [plan]);

  return { projection, monteCarlo };
}
