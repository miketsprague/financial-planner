import { describe, it, expect } from "vitest";
import { computeInsights, getAccountConsideration } from "./insights";
import type { Account, MonteCarloResult, Plan } from "@/types";

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? "acc-1",
    name: overrides.name ?? "Test account",
    type: overrides.type ?? "cash",
    currency: overrides.currency ?? "GBP",
    balance: overrides.balance ?? 10000,
    annualContribution: overrides.annualContribution ?? 0,
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
    benefits: overrides.benefits ?? [
      {
        id: "b1",
        name: "UK State Pension",
        kind: "uk-state-pension",
        enabled: true,
        startAge: 67,
        annualAmount: 10000,
        currency: "GBP",
        growthRate: 0.02,
      },
      {
        id: "b2",
        name: "US Social Security",
        kind: "us-social-security",
        enabled: true,
        startAge: 67,
        annualAmount: 10000,
        currency: "USD",
        growthRate: 0.02,
      },
    ],
    assumptions: {
      inflationRate: 0.025,
      returnVolatility: 0.12,
      gbpPerUsd: 0.8,
      simulationRuns: 1000,
      ...overrides.assumptions,
    },
  };
}

const highSuccessMonteCarlo: MonteCarloResult = {
  successProbability: 0.95,
  percentiles: [],
  seed: 1,
  runs: 1000,
};

describe("getAccountConsideration", () => {
  it("flags ISA accounts with a neutral PFIC consideration", () => {
    const note = getAccountConsideration(makeAccount({ type: "uk-isa" }));
    expect(note).toMatch(/PFIC/);
  });

  it("flags UK taxable/GIA accounts with a neutral PFIC consideration", () => {
    const note = getAccountConsideration(makeAccount({ type: "uk-taxable" }));
    expect(note).toMatch(/PFIC/);
  });

  it("flags pension accounts with a treaty/reporting consideration", () => {
    const note = getAccountConsideration(makeAccount({ type: "uk-sipp" }));
    expect(note).toMatch(/treaty/i);
  });

  it("flags US retirement accounts with a treaty/reporting consideration", () => {
    const note = getAccountConsideration(makeAccount({ type: "us-401k" }));
    expect(note).toMatch(/treaty/i);
  });

  it("returns null for account types with no special consideration", () => {
    expect(getAccountConsideration(makeAccount({ type: "cash" }))).toBeNull();
    expect(
      getAccountConsideration(makeAccount({ type: "property" })),
    ).toBeNull();
    expect(getAccountConsideration(makeAccount({ type: "other" }))).toBeNull();
  });
});

describe("computeInsights", () => {
  it("flags a low Monte Carlo success probability", () => {
    const plan = makePlan();
    const lowSuccess: MonteCarloResult = {
      successProbability: 0.4,
      percentiles: [],
      seed: 1,
      runs: 1000,
    };
    const insights = computeInsights(plan, lowSuccess);
    expect(insights.some((i) => i.id === "low-success-probability")).toBe(true);
  });

  it("does not flag success probability when it is high", () => {
    const plan = makePlan();
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "low-success-probability")).toBe(
      false,
    );
  });

  it("does not evaluate success probability when Monte Carlo result is null", () => {
    const plan = makePlan();
    const insights = computeInsights(plan, null);
    expect(insights.some((i) => i.id === "low-success-probability")).toBe(
      false,
    );
  });

  it("flags negative current cash flow", () => {
    const plan = makePlan({
      cashFlow: {
        takeHomeIncome: { amount: 20000, currency: "GBP" },
        currentSpending: { amount: 30000, currency: "GBP" },
        retirementSpending: { amount: 25000, currency: "GBP" },
      },
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "negative-current-cash-flow")).toBe(
      true,
    );
  });

  it("flags contributions above available surplus", () => {
    const plan = makePlan({
      cashFlow: {
        takeHomeIncome: { amount: 30000, currency: "GBP" },
        currentSpending: { amount: 25000, currency: "GBP" },
        retirementSpending: { amount: 25000, currency: "GBP" },
      },
      accounts: [makeAccount({ annualContribution: 10000 })],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "contributions-above-surplus")).toBe(
      true,
    );
  });

  it("flags concentrated cash when cash exceeds half of net worth", () => {
    const plan = makePlan({
      accounts: [
        makeAccount({ id: "cash-1", type: "cash", balance: 60000 }),
        makeAccount({ id: "isa-1", type: "uk-isa", balance: 10000 }),
      ],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "concentrated-cash")).toBe(true);
  });

  it("does not flag concentrated cash when net worth is zero", () => {
    const plan = makePlan({ accounts: [makeAccount({ balance: 0 })] });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "concentrated-cash")).toBe(false);
  });

  it("flags early UK pension access before age 55", () => {
    const plan = makePlan({
      profile: {
        currentAge: 40,
        retirementAge: 50,
        planningAge: 90,
        yearsUKResident: 8,
        reportingCurrency: "GBP",
      },
      accounts: [makeAccount({ type: "uk-sipp" })],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "early-uk-pension-access")).toBe(true);
  });

  it("does not flag early UK pension access when there is no UK pension account", () => {
    const plan = makePlan({
      profile: {
        currentAge: 40,
        retirementAge: 50,
        planningAge: 90,
        yearsUKResident: 8,
        reportingCurrency: "GBP",
      },
      accounts: [makeAccount({ type: "cash" })],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "early-uk-pension-access")).toBe(
      false,
    );
  });

  it("flags early US retirement-account access before age 59.5", () => {
    const plan = makePlan({
      profile: {
        currentAge: 40,
        retirementAge: 55,
        planningAge: 90,
        yearsUKResident: 8,
        reportingCurrency: "GBP",
      },
      accounts: [makeAccount({ type: "us-401k" })],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "early-us-retirement-access")).toBe(
      true,
    );
  });

  it("flags a missing benefit estimate when one benefit kind is absent", () => {
    const plan = makePlan({
      benefits: [
        {
          id: "b1",
          name: "UK State Pension",
          kind: "uk-state-pension",
          enabled: true,
          startAge: 67,
          annualAmount: 10000,
          currency: "GBP",
          growthRate: 0.02,
        },
      ],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "missing-benefit-estimate")).toBe(
      true,
    );
  });

  it("does not flag a missing benefit estimate when both are present and enabled", () => {
    const plan = makePlan();
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "missing-benefit-estimate")).toBe(
      false,
    );
  });

  it("flags cross-border wrapper considerations when both UK and US wrappers exist", () => {
    const plan = makePlan({
      accounts: [
        makeAccount({ id: "a", type: "uk-isa" }),
        makeAccount({ id: "b", type: "us-401k" }),
      ],
    });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "cross-border-wrappers")).toBe(true);
  });

  it("does not flag cross-border wrappers when only one jurisdiction is present", () => {
    const plan = makePlan({ accounts: [makeAccount({ type: "uk-isa" })] });
    const insights = computeInsights(plan, highSuccessMonteCarlo);
    expect(insights.some((i) => i.id === "cross-border-wrappers")).toBe(false);
  });
});
