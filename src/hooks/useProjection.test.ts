import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useProjection } from "./useProjection";
import { createExamplePlan } from "@/lib/example-plan";
import { projectPlan } from "@/lib/calculations";

describe("useProjection", () => {
  it("returns a deterministic projection matching projectPlan", () => {
    const plan = createExamplePlan();
    const { result } = renderHook(() => useProjection(plan));
    expect(result.current.projection).toEqual(projectPlan(plan));
  });

  it("returns a Monte Carlo result with a matching run count", () => {
    const plan = createExamplePlan();
    const { result } = renderHook(() => useProjection(plan));
    expect(result.current.monteCarlo.runs).toBe(
      plan.assumptions.simulationRuns,
    );
  });
});
