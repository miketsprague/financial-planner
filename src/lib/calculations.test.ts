import { describe, it, expect } from "vitest";
import {
  computeAnnualContribution,
  computeAnnualWithdrawal,
  getBalanceAtRetirement,
  isFundingSufficient,
  projectSavings,
} from "./calculations";
import { UK_DEFAULTS } from "./defaults";
import type { QuickStartInput, Assumptions } from "@/types";

const BASE_ASSUMPTIONS: Assumptions = { ...UK_DEFAULTS };

const BASE_INPUT: QuickStartInput = {
  currentAge: 30,
  retirementAge: 67,
  lifeExpectancy: 90,
  currentSavings: 50_000,
  annualIncome: 40_000,
};

describe("computeAnnualContribution", () => {
  it("returns income × rate for valid inputs", () => {
    expect(computeAnnualContribution(40_000, 0.1)).toBe(4_000);
  });

  it("returns 0 for zero income", () => {
    expect(computeAnnualContribution(0, 0.1)).toBe(0);
  });

  it("returns 0 for negative income", () => {
    expect(computeAnnualContribution(-1000, 0.1)).toBe(0);
  });

  it("returns 0 for negative rate", () => {
    expect(computeAnnualContribution(40_000, -0.1)).toBe(0);
  });

  it("returns 0 for non-finite income", () => {
    expect(computeAnnualContribution(NaN, 0.1)).toBe(0);
    expect(computeAnnualContribution(Infinity, 0.1)).toBe(0);
  });
});

describe("computeAnnualWithdrawal", () => {
  it("returns configured income replacement amount minus state pension", () => {
    const income = 60_000;
    const pension = 11_502;
    const expected = Math.max(0, 60_000 * 0.75 - 11_502);
    expect(computeAnnualWithdrawal(income, pension, 0.75)).toBeCloseTo(expected);
  });

  it("does not go negative when state pension exceeds target", () => {
    expect(computeAnnualWithdrawal(10_000, 100_000, 0.6)).toBe(0);
  });

  it("returns 0 for zero income", () => {
    expect(computeAnnualWithdrawal(0, 0, 0.6)).toBe(0);
  });

  it("returns 0 for invalid income replacement ratio", () => {
    expect(computeAnnualWithdrawal(40_000, 0, -0.1)).toBe(0);
    expect(computeAnnualWithdrawal(40_000, 0, NaN)).toBe(0);
  });

  it("ignores negative state pension", () => {
    const income = 30_000;
    const target = 30_000 * 0.5;
    expect(computeAnnualWithdrawal(income, -5000, 0.5)).toBeCloseTo(target);
  });

  it("ignores non-finite state pension", () => {
    expect(computeAnnualWithdrawal(30_000, NaN, 0.5)).toBeCloseTo(15_000);
  });
});

describe("projectSavings", () => {
  it("returns an array with one entry per year from currentAge to lifeExpectancy", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const expectedLength = BASE_ASSUMPTIONS.lifeExpectancy - BASE_INPUT.currentAge + 1;
    expect(points).toHaveLength(expectedLength);
  });

  it("starts at currentAge with the current savings before growth or contributions", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);

    expect(points[0]).toMatchObject({
      age: BASE_INPUT.currentAge,
      balance: BASE_INPUT.currentSavings,
      isRetired: false,
      hasStatePension: false,
    });
  });

  it("projects the next age after one year of growth and contributions", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const firstProjectedYear = BASE_INPUT.currentSavings * 1.05 + 4_000;

    expect(points[1]).toMatchObject({
      age: BASE_INPUT.currentAge + 1,
      balance: firstProjectedYear,
    });
  });

  it("marks ages before retirement as not retired", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const beforeRetirement = points.filter((p) => p.age < BASE_INPUT.retirementAge);
    expect(beforeRetirement.every((p) => !p.isRetired)).toBe(true);
  });

  it("marks retirement age and beyond as retired", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const atOrAfter = points.filter((p) => p.age >= BASE_INPUT.retirementAge);
    expect(atOrAfter.every((p) => p.isRetired)).toBe(true);
  });

  it("marks state pension age and beyond as having state pension", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const withPension = points.filter(
      (p) => p.age >= BASE_ASSUMPTIONS.statePensionAge,
    );
    expect(withPension.every((p) => p.hasStatePension)).toBe(true);
  });

  it("grows balance during accumulation phase", () => {
    const points = projectSavings(BASE_INPUT, BASE_ASSUMPTIONS);
    const atRetirement = points.find((p) => p.age === BASE_INPUT.retirementAge)!;
    expect(atRetirement.balance).toBeGreaterThan(BASE_INPUT.currentSavings);
  });

  it("balance does not go negative", () => {
    const input: QuickStartInput = { ...BASE_INPUT, currentSavings: 0 };
    const points = projectSavings(input, BASE_ASSUMPTIONS);
    expect(points.every((p) => p.balance >= 0)).toBe(true);
  });

  it("returns empty array for invalid ages", () => {
    const badInput: QuickStartInput = {
      ...BASE_INPUT,
      retirementAge: 25,
      currentAge: 30,
    };
    expect(projectSavings(badInput, BASE_ASSUMPTIONS)).toHaveLength(0);
  });

  it("handles zero current savings", () => {
    const input: QuickStartInput = { ...BASE_INPUT, currentSavings: 0 };
    const points = projectSavings(input, BASE_ASSUMPTIONS);
    expect(points[0].balance).toBeGreaterThanOrEqual(0);
  });

  it("uses the configured income replacement ratio during drawdown", () => {
    const input: QuickStartInput = {
      ...BASE_INPUT,
      currentAge: 66,
      retirementAge: 67,
      lifeExpectancy: 67,
      currentSavings: 100_000,
      annualIncome: 60_000,
    };
    const assumptions: Assumptions = {
      ...BASE_ASSUMPTIONS,
      investmentReturn: 0,
      annualContributionRate: 0,
      statePensionAge: 99,
      annualStatePension: 0,
      incomeReplacementRatio: 0.5,
    };

    const points = projectSavings(input, assumptions);

    expect(points.find((p) => p.age === 67)?.balance).toBeCloseTo(70_000);
  });
});

describe("getBalanceAtRetirement", () => {
  it("returns a positive balance for healthy inputs", () => {
    expect(getBalanceAtRetirement(BASE_INPUT, BASE_ASSUMPTIONS)).toBeGreaterThan(0);
  });

  it("returns 0 for invalid input", () => {
    const bad: QuickStartInput = { ...BASE_INPUT, retirementAge: 20, currentAge: 30 };
    expect(getBalanceAtRetirement(bad, BASE_ASSUMPTIONS)).toBe(0);
  });
});

describe("isFundingSufficient", () => {
  it("returns true for a well-funded plan", () => {
    const input: QuickStartInput = {
      ...BASE_INPUT,
      currentSavings: 500_000,
      retirementAge: 67,
    };
    expect(isFundingSufficient(input, BASE_ASSUMPTIONS)).toBe(true);
  });

  it("returns false for invalid input", () => {
    const bad: QuickStartInput = { ...BASE_INPUT, retirementAge: 20, currentAge: 30 };
    expect(isFundingSufficient(bad, BASE_ASSUMPTIONS)).toBe(false);
  });
});
