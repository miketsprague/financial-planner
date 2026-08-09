import type { Plan } from "@/types";

/**
 * Generate a short, stable-enough id for a new account/goal/benefit row.
 * Not cryptographically unique — good enough for in-browser list keys.
 */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * The example plan shown on first use (acceptance criterion 1): a mid-thirties
 * US citizen who has lived in the UK for eight years. Every value can be
 * changed by the user.
 */
export function createExamplePlan(): Plan {
  return {
    profile: {
      currentAge: 35,
      retirementAge: 65,
      planningAge: 95,
      yearsUKResident: 8,
      reportingCurrency: "GBP",
    },
    cashFlow: {
      takeHomeIncome: { amount: 58000, currency: "GBP" },
      currentSpending: { amount: 38000, currency: "GBP" },
      retirementSpending: { amount: 34000, currency: "GBP" },
    },
    accounts: [
      {
        id: "example-cash",
        name: "Joint cash savings",
        type: "cash",
        currency: "GBP",
        balance: 15000,
        annualContribution: 2000,
        expectedReturn: 0.02,
      },
      {
        id: "example-uk-workplace-pension",
        name: "UK workplace pension",
        type: "uk-workplace-pension",
        currency: "GBP",
        balance: 62000,
        annualContribution: 6000,
        expectedReturn: 0.05,
      },
      {
        id: "example-uk-isa",
        name: "Stocks & shares ISA",
        type: "uk-isa",
        currency: "GBP",
        balance: 24000,
        annualContribution: 4000,
        expectedReturn: 0.05,
      },
      {
        id: "example-us-401k",
        name: "US 401(k) from before relocating",
        type: "us-401k",
        currency: "USD",
        balance: 45000,
        annualContribution: 0,
        expectedReturn: 0.06,
      },
      {
        id: "example-us-roth-ira",
        name: "US Roth IRA",
        type: "us-roth-ira",
        currency: "USD",
        balance: 20000,
        annualContribution: 0,
        expectedReturn: 0.06,
      },
    ],
    goals: [
      {
        id: "example-goal-car",
        name: "Replace family car",
        age: 42,
        amount: 18000,
        currency: "GBP",
        kind: "expense",
      },
      {
        id: "example-goal-inheritance",
        name: "Expected small inheritance",
        age: 55,
        amount: 20000,
        currency: "GBP",
        kind: "income",
      },
    ],
    benefits: [
      {
        id: "example-uk-state-pension",
        name: "UK State Pension",
        kind: "uk-state-pension",
        enabled: true,
        startAge: 67,
        annualAmount: 11973,
        currency: "GBP",
        growthRate: 0.025,
      },
      {
        id: "example-us-social-security",
        name: "US Social Security",
        kind: "us-social-security",
        enabled: true,
        startAge: 67,
        annualAmount: 14000,
        currency: "USD",
        growthRate: 0.02,
      },
    ],
    assumptions: {
      inflationRate: 0.025,
      returnVolatility: 0.12,
      gbpPerUsd: 0.79,
      simulationRuns: 1000,
    },
  };
}
