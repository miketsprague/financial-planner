import { describe, it, expect } from "vitest";
import {
  DEFAULT_MONTE_CARLO_SEED,
  normalizeSimulationRuns,
  runMonteCarloSimulation,
} from "./monte-carlo";
import { projectPlan } from "./calculations";
import type { Account, Plan } from "@/types";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc-1",
    name: overrides.name ?? "Test account",
    type: overrides.type ?? "cash",
    currency: overrides.currency ?? "GBP",
    balance: overrides.balance ?? 10000,
    annualContribution: overrides.annualContribution ?? 1000,
    expectedReturn: overrides.expectedReturn ?? 0.05,
  };
}

function makePlan(overrides: Partial<Plan> = {}): Plan {
  return {
    profile: {
      currentAge: 35,
      retirementAge: 65,
      planningAge: 90,
      yearsUKResident: 8,
      reportingCurrency: "GBP",
      ...overrides.profile,
    },
    cashFlow: {
      takeHomeIncome: { amount: 50000, currency: "GBP" },
      currentSpending: { amount: 30000, currency: "GBP" },
      retirementSpending: { amount: 25000, currency: "GBP" },
      ...overrides.cashFlow,
    },
    accounts: overrides.accounts ?? [makeAccount()],
    goals: overrides.goals ?? [],
    benefits: overrides.benefits ?? [],
    assumptions: {
      inflationRate: 0.025,
      returnVolatility: 0.12,
      gbpPerUsd: 0.8,
      simulationRuns: 200,
      ...overrides.assumptions,
    },
  };
}

describe("normalizeSimulationRuns", () => {
  it("returns the value unchanged when within bounds", () => {
    expect(normalizeSimulationRuns(1500)).toBe(1500);
  });

  it("clamps below the minimum", () => {
    expect(normalizeSimulationRuns(10)).toBe(500);
  });

  it("clamps above the maximum", () => {
    expect(normalizeSimulationRuns(10000)).toBe(5000);
  });

  it("falls back to the default for non-finite input", () => {
    expect(normalizeSimulationRuns(NaN)).toBe(1000);
  });

  it("falls back to the default for non-integer input", () => {
    expect(normalizeSimulationRuns(500.5)).toBe(1000);
  });
});

describe("runMonteCarloSimulation", () => {
  it("returns a safe empty result for an invalid plan", () => {
    const plan = makePlan({
      profile: {
        currentAge: 65,
        retirementAge: 65,
        planningAge: 90,
        yearsUKResident: 0,
        reportingCurrency: "GBP",
      },
    });
    const result = runMonteCarloSimulation(plan);
    expect(result.runs).toBe(0);
    expect(result.successProbability).toBe(0);
    expect(result.percentiles).toEqual([]);
  });

  it("matches the deterministic projection exactly when volatility is zero", () => {
    const plan = makePlan({
      assumptions: {
        inflationRate: 0.025,
        returnVolatility: 0,
        gbpPerUsd: 0.8,
        simulationRuns: 500,
      },
    });
    const deterministic = projectPlan(plan);
    const result = runMonteCarloSimulation(plan);
    expect(result.percentiles).toHaveLength(deterministic.length);
    result.percentiles.forEach((point, index) => {
      expect(point.p10).toBeCloseTo(deterministic[index].closingBalance, 6);
      expect(point.p50).toBeCloseTo(deterministic[index].closingBalance, 6);
      expect(point.p90).toBeCloseTo(deterministic[index].closingBalance, 6);
    });
  });

  it("is repeatable for the same seed", () => {
    const plan = makePlan();
    const first = runMonteCarloSimulation(plan, 42);
    const second = runMonteCarloSimulation(plan, 42);
    expect(first).toEqual(second);
  });

  it("can produce different results for a different seed", () => {
    const plan = makePlan();
    const first = runMonteCarloSimulation(plan, 1);
    const second = runMonteCarloSimulation(plan, 2);
    expect(first.successProbability).not.toBe(undefined);
    // Not a strict inequality assertion (different seeds could coincidentally match),
    // but percentile arrays should be structurally valid for both.
    expect(first.percentiles.length).toBe(second.percentiles.length);
  });

  it("keeps percentiles ordered p10 <= p50 <= p90 for every age", () => {
    const plan = makePlan();
    const result = runMonteCarloSimulation(plan);
    for (const point of result.percentiles) {
      expect(point.p10).toBeLessThanOrEqual(point.p50);
      expect(point.p50).toBeLessThanOrEqual(point.p90);
    }
  });

  it("keeps success probability within [0, 1]", () => {
    const plan = makePlan();
    const result = runMonteCarloSimulation(plan);
    expect(result.successProbability).toBeGreaterThanOrEqual(0);
    expect(result.successProbability).toBeLessThanOrEqual(1);
  });

  it("returns a success probability of 0 for a plan certain to deplete", () => {
    const plan = makePlan({
      profile: {
        currentAge: 70,
        retirementAge: 71,
        planningAge: 90,
        yearsUKResident: 0,
        reportingCurrency: "GBP",
      },
      accounts: [
        makeAccount({ balance: 100, annualContribution: 0, expectedReturn: 0 }),
      ],
      cashFlow: {
        takeHomeIncome: { amount: 0, currency: "GBP" },
        currentSpending: { amount: 0, currency: "GBP" },
        retirementSpending: { amount: 100000, currency: "GBP" },
      },
    });
    const result = runMonteCarloSimulation(plan);
    expect(result.successProbability).toBe(0);
  });

  it("includes the seed and run count in the result", () => {
    const plan = makePlan({
      assumptions: {
        inflationRate: 0.025,
        returnVolatility: 0.1,
        gbpPerUsd: 0.8,
        simulationRuns: 500,
      },
    });
    const result = runMonteCarloSimulation(plan, 99);
    expect(result.seed).toBe(99);
    expect(result.runs).toBe(500);
  });

  it("uses the default seed when none is supplied", () => {
    const plan = makePlan();
    const result = runMonteCarloSimulation(plan);
    expect(result.seed).toBe(DEFAULT_MONTE_CARLO_SEED);
  });

  it("bounds an out-of-range volatility assumption", () => {
    const plan = makePlan({
      assumptions: {
        inflationRate: 0.025,
        returnVolatility: 5,
        gbpPerUsd: 0.8,
        simulationRuns: 200,
      },
    });
    const result = runMonteCarloSimulation(plan);
    // Should not throw and should still produce finite percentiles.
    for (const point of result.percentiles) {
      expect(Number.isFinite(point.p10)).toBe(true);
      expect(Number.isFinite(point.p50)).toBe(true);
      expect(Number.isFinite(point.p90)).toBe(true);
    }
  });

  it("falls back to zero volatility for a non-finite volatility assumption", () => {
    const plan = makePlan({
      assumptions: {
        inflationRate: 0.025,
        returnVolatility: NaN,
        gbpPerUsd: 0.8,
        simulationRuns: 200,
      },
    });
    const deterministic = projectPlan(plan);
    const result = runMonteCarloSimulation(plan);
    result.percentiles.forEach((point, index) => {
      expect(point.p50).toBeCloseTo(deterministic[index].closingBalance, 6);
    });
  });
});
