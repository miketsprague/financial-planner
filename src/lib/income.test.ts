import { describe, it, expect } from "vitest";
import {
  computeStatePensionAnnual,
  computeEmploymentSalaryAtAge,
  computeEmploymentContributionsAtAge,
  computeIncomeStreamsAtAge,
  FULL_STATE_PENSION_ANNUAL,
  FULL_NI_YEARS,
  MIN_NI_YEARS,
  DEFERRAL_RATE_PER_YEAR,
} from "./income";
import type { EmploymentIncome, IncomeStream } from "@/types";

// ─── computeStatePensionAnnual ────────────────────────────────────────────────

describe("computeStatePensionAnnual", () => {
  it("returns 0 for 0 qualifying NI years", () => {
    expect(computeStatePensionAnnual(0)).toBe(0);
  });

  it("returns 0 for qualifying years below minimum (< 10)", () => {
    expect(computeStatePensionAnnual(9)).toBe(0);
    expect(computeStatePensionAnnual(1)).toBe(0);
  });

  it("returns proportional amount for exactly the minimum qualifying years (10)", () => {
    const expected = (MIN_NI_YEARS / FULL_NI_YEARS) * FULL_STATE_PENSION_ANNUAL;
    expect(computeStatePensionAnnual(10)).toBeCloseTo(expected, 2);
  });

  it("returns proportional amount for mid-range qualifying years (20)", () => {
    const expected = (20 / FULL_NI_YEARS) * FULL_STATE_PENSION_ANNUAL;
    expect(computeStatePensionAnnual(20)).toBeCloseTo(expected, 2);
  });

  it("returns full State Pension for exactly 35 qualifying years", () => {
    expect(computeStatePensionAnnual(35)).toBeCloseTo(FULL_STATE_PENSION_ANNUAL, 2);
  });

  it("caps at the full State Pension for more than 35 qualifying years", () => {
    expect(computeStatePensionAnnual(40)).toBeCloseTo(FULL_STATE_PENSION_ANNUAL, 2);
    expect(computeStatePensionAnnual(50)).toBeCloseTo(FULL_STATE_PENSION_ANNUAL, 2);
  });

  it("applies no deferral multiplier when deferralYears is 0", () => {
    expect(computeStatePensionAnnual(35, 0)).toBeCloseTo(FULL_STATE_PENSION_ANNUAL, 2);
  });

  it("applies no deferral multiplier when deferralYears defaults", () => {
    expect(computeStatePensionAnnual(35)).toBeCloseTo(FULL_STATE_PENSION_ANNUAL, 2);
  });

  it("increases by DEFERRAL_RATE_PER_YEAR for 1 year of deferral", () => {
    const base = computeStatePensionAnnual(35, 0);
    const deferred = computeStatePensionAnnual(35, 1);
    expect(deferred).toBeCloseTo(base * (1 + DEFERRAL_RATE_PER_YEAR), 5);
  });

  it("applies linear deferral multiplier for multiple deferral years", () => {
    const base = computeStatePensionAnnual(35, 0);
    const deferred = computeStatePensionAnnual(35, 3);
    expect(deferred).toBeCloseTo(base * (1 + 3 * DEFERRAL_RATE_PER_YEAR), 5);
  });

  it("combines proportional NI years with deferral correctly", () => {
    const base = (20 / FULL_NI_YEARS) * FULL_STATE_PENSION_ANNUAL;
    const deferred = computeStatePensionAnnual(20, 2);
    expect(deferred).toBeCloseTo(base * (1 + 2 * DEFERRAL_RATE_PER_YEAR), 5);
  });

  it("returns 0 for NaN qualifying years", () => {
    expect(computeStatePensionAnnual(NaN)).toBe(0);
  });

  it("returns 0 for Infinity qualifying years", () => {
    expect(computeStatePensionAnnual(Infinity)).toBe(0);
  });

  it("returns 0 for negative qualifying years", () => {
    expect(computeStatePensionAnnual(-5)).toBe(0);
  });

  it("returns 0 for NaN deferral years", () => {
    expect(computeStatePensionAnnual(35, NaN)).toBe(0);
  });

  it("returns 0 for negative deferral years", () => {
    expect(computeStatePensionAnnual(35, -1)).toBe(0);
  });
});

// ─── computeEmploymentSalaryAtAge ─────────────────────────────────────────────

describe("computeEmploymentSalaryAtAge", () => {
  it("returns starting salary when targetAge equals startAge (zero years elapsed)", () => {
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, 30, 30)).toBeCloseTo(50_000);
  });

  it("applies compound annual raise over multiple years", () => {
    const expected = 50_000 * 1.03 ** 10;
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, 30, 40)).toBeCloseTo(expected, 2);
  });

  it("returns flat starting salary with 0% raise rate", () => {
    expect(computeEmploymentSalaryAtAge(50_000, 0, 30, 40)).toBeCloseTo(50_000, 2);
    expect(computeEmploymentSalaryAtAge(50_000, 0, 30, 30)).toBeCloseTo(50_000, 2);
  });

  it("returns 0 when targetAge is before startAge", () => {
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, 30, 25)).toBe(0);
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, 30, 29)).toBe(0);
  });

  it("returns 0 for zero starting salary", () => {
    expect(computeEmploymentSalaryAtAge(0, 0.03, 30, 35)).toBe(0);
  });

  it("returns 0 for negative starting salary", () => {
    expect(computeEmploymentSalaryAtAge(-1_000, 0.03, 30, 35)).toBe(0);
  });

  it("returns 0 for negative annual raise rate", () => {
    expect(computeEmploymentSalaryAtAge(50_000, -0.01, 30, 35)).toBe(0);
  });

  it("returns 0 for NaN starting salary", () => {
    expect(computeEmploymentSalaryAtAge(NaN, 0.03, 30, 35)).toBe(0);
  });

  it("returns 0 for NaN raise rate", () => {
    expect(computeEmploymentSalaryAtAge(50_000, NaN, 30, 35)).toBe(0);
  });

  it("returns 0 for NaN startAge", () => {
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, NaN, 35)).toBe(0);
  });

  it("returns 0 for NaN targetAge", () => {
    expect(computeEmploymentSalaryAtAge(50_000, 0.03, 30, NaN)).toBe(0);
  });

  it("returns 0 for Infinity raise rate", () => {
    expect(computeEmploymentSalaryAtAge(50_000, Infinity, 30, 35)).toBe(0);
  });
});

// ─── computeEmploymentContributionsAtAge ─────────────────────────────────────

const JOB_A: EmploymentIncome = {
  id: "a",
  name: "Job A",
  annualGrossSalary: 50_000,
  annualRaiseRate: 0,
  startAge: 25,
  endAge: 65,
  isPreTax: true,
  enabled: true,
};

const JOB_B: EmploymentIncome = {
  id: "b",
  name: "Job B",
  annualGrossSalary: 20_000,
  annualRaiseRate: 0,
  startAge: 30,
  endAge: 60,
  isPreTax: true,
  enabled: true,
};

const JOB_DISABLED: EmploymentIncome = {
  id: "c",
  name: "Disabled",
  annualGrossSalary: 30_000,
  annualRaiseRate: 0,
  startAge: 25,
  endAge: 65,
  isPreTax: true,
  enabled: false,
};

describe("computeEmploymentContributionsAtAge", () => {
  it("computes contribution from a single active job", () => {
    // 50,000 × 0.1 = 5,000
    expect(computeEmploymentContributionsAtAge([JOB_A], 30, 0.1)).toBeCloseTo(5_000);
  });

  it("sums contributions from multiple active jobs", () => {
    // (50,000 + 20,000) × 0.1 = 7,000 at age 35 (both jobs active)
    expect(
      computeEmploymentContributionsAtAge([JOB_A, JOB_B], 35, 0.1),
    ).toBeCloseTo(7_000);
  });

  it("excludes disabled jobs", () => {
    expect(
      computeEmploymentContributionsAtAge([JOB_A, JOB_DISABLED], 30, 0.1),
    ).toBeCloseTo(5_000);
  });

  it("excludes jobs where age is before startAge", () => {
    // JOB_B.startAge = 30; age 25 is outside range
    expect(computeEmploymentContributionsAtAge([JOB_B], 25, 0.1)).toBe(0);
  });

  it("excludes jobs where age is after endAge", () => {
    // JOB_B.endAge = 60; age 65 is outside range
    expect(computeEmploymentContributionsAtAge([JOB_B], 65, 0.1)).toBe(0);
  });

  it("includes job at exactly startAge boundary", () => {
    // 20,000 × 0.1 = 2,000
    expect(computeEmploymentContributionsAtAge([JOB_B], 30, 0.1)).toBeCloseTo(2_000);
  });

  it("includes job at exactly endAge boundary", () => {
    // 20,000 × 0.1 = 2,000
    expect(computeEmploymentContributionsAtAge([JOB_B], 60, 0.1)).toBeCloseTo(2_000);
  });

  it("returns 0 for an empty employment income list", () => {
    expect(computeEmploymentContributionsAtAge([], 30, 0.1)).toBe(0);
  });

  it("returns 0 for a negative contribution rate", () => {
    expect(computeEmploymentContributionsAtAge([JOB_A], 30, -0.1)).toBe(0);
  });

  it("returns 0 for a NaN contribution rate", () => {
    expect(computeEmploymentContributionsAtAge([JOB_A], 30, NaN)).toBe(0);
  });

  it("returns 0 for a NaN age", () => {
    expect(computeEmploymentContributionsAtAge([JOB_A], NaN, 0.1)).toBe(0);
  });

  it("returns 0 when contribution rate is 0", () => {
    expect(computeEmploymentContributionsAtAge([JOB_A], 30, 0)).toBe(0);
  });

  it("applies annual raise rate when computing salary at target age", () => {
    const jobWithRaise: EmploymentIncome = { ...JOB_A, annualRaiseRate: 0.1, startAge: 30 };
    // salary at 40 = 50,000 × 1.1^10; contribution = salary × 0.1
    const expectedSalary = 50_000 * 1.1 ** 10;
    expect(
      computeEmploymentContributionsAtAge([jobWithRaise], 40, 0.1),
    ).toBeCloseTo(expectedSalary * 0.1, 2);
  });
});

// ─── computeIncomeStreamsAtAge ────────────────────────────────────────────────

const RENTAL_STREAM: IncomeStream = {
  id: "s1",
  name: "Rental",
  type: "rental",
  annualAmount: 12_000,
  startAge: 60,
  endAge: 85,
  growthRate: 0.02,
  enabled: true,
};

const ANNUITY_STREAM: IncomeStream = {
  id: "s2",
  name: "Annuity",
  type: "annuity",
  annualAmount: 5_000,
  startAge: 65,
  endAge: null,
  growthRate: 0,
  enabled: true,
};

const DISABLED_STREAM: IncomeStream = {
  id: "s3",
  name: "Pension",
  type: "private-pension",
  annualAmount: 8_000,
  startAge: 65,
  endAge: null,
  growthRate: 0.01,
  enabled: false,
};

describe("computeIncomeStreamsAtAge", () => {
  it("returns stream amount at startAge (0 years elapsed — no growth yet)", () => {
    expect(computeIncomeStreamsAtAge([RENTAL_STREAM], 60)).toBeCloseTo(12_000);
  });

  it("applies growth rate over years since startAge", () => {
    // 5 years after startAge=60
    const expected = 12_000 * 1.02 ** 5;
    expect(computeIncomeStreamsAtAge([RENTAL_STREAM], 65)).toBeCloseTo(expected, 2);
  });

  it("returns 0 for age before startAge", () => {
    expect(computeIncomeStreamsAtAge([RENTAL_STREAM], 55)).toBe(0);
  });

  it("returns 0 for age after endAge", () => {
    expect(computeIncomeStreamsAtAge([RENTAL_STREAM], 86)).toBe(0);
  });

  it("includes stream at exactly endAge boundary", () => {
    const atEndAge = 12_000 * 1.02 ** (85 - 60);
    expect(computeIncomeStreamsAtAge([RENTAL_STREAM], 85)).toBeCloseTo(atEndAge, 2);
  });

  it("stream with null endAge continues indefinitely beyond any expected lifespan", () => {
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], 100)).toBeCloseTo(5_000);
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], 120)).toBeCloseTo(5_000);
  });

  it("stream with 0% growth rate returns flat annualAmount at every active age", () => {
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], 65)).toBeCloseTo(5_000);
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], 80)).toBeCloseTo(5_000);
  });

  it("excludes disabled streams", () => {
    expect(computeIncomeStreamsAtAge([DISABLED_STREAM], 70)).toBe(0);
  });

  it("sums multiple active streams at the same age", () => {
    // Both RENTAL_STREAM and ANNUITY_STREAM are active at age 65
    const rentalAtAge65 = 12_000 * 1.02 ** 5;
    const annuityAtAge65 = 5_000;
    expect(
      computeIncomeStreamsAtAge([RENTAL_STREAM, ANNUITY_STREAM], 65),
    ).toBeCloseTo(rentalAtAge65 + annuityAtAge65, 2);
  });

  it("returns 0 for an empty stream list", () => {
    expect(computeIncomeStreamsAtAge([], 65)).toBe(0);
  });

  it("returns 0 for NaN age", () => {
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], NaN)).toBe(0);
  });

  it("returns 0 for Infinity age", () => {
    expect(computeIncomeStreamsAtAge([ANNUITY_STREAM], Infinity)).toBe(0);
  });

  it("only sums enabled streams from a mixed enabled/disabled list", () => {
    const streams = [RENTAL_STREAM, DISABLED_STREAM, ANNUITY_STREAM];
    const expected = 12_000 * 1.02 ** 5 + 5_000;
    expect(computeIncomeStreamsAtAge(streams, 65)).toBeCloseTo(expected, 2);
  });
});
