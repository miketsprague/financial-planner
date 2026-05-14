import type { EmploymentIncome, IncomeStream } from "@/types";

/** Full new State Pension weekly rate (2025/26). Source: DWP. */
export const FULL_STATE_PENSION_WEEKLY_2025_26 = 221.20;

/**
 * Full new State Pension annual rate (2025/26).
 * 221.20 × 52 = 11,502.40
 */
export const FULL_STATE_PENSION_ANNUAL = FULL_STATE_PENSION_WEEKLY_2025_26 * 52;

/** Number of qualifying NI years for the full new State Pension. */
export const FULL_NI_YEARS = 35;

/** Minimum qualifying NI years to receive any State Pension entitlement. */
export const MIN_NI_YEARS = 10;

/** Annual percentage increase per year of State Pension deferral. */
export const DEFERRAL_RATE_PER_YEAR = 0.058;

/**
 * Compute annual State Pension based on NI qualifying years and optional deferral.
 *
 * - Returns 0 for invalid or non-finite inputs.
 * - Returns 0 for fewer than {@link MIN_NI_YEARS} qualifying NI years.
 * - Returns proportional amount for 10–34 years: `(niYears / 35) × FULL_ANNUAL`.
 * - Returns full pension for ≥ 35 years (capped at {@link FULL_NI_YEARS}).
 * - Deferral multiplier: `1 + (deferralYears × {@link DEFERRAL_RATE_PER_YEAR})`.
 */
export function computeStatePensionAnnual(
  niQualifyingYears: number,
  deferralYears = 0,
): number {
  if (!isFinite(niQualifyingYears) || niQualifyingYears < MIN_NI_YEARS) return 0;
  if (!isFinite(deferralYears) || deferralYears < 0) return 0;

  const clampedYears = Math.min(niQualifyingYears, FULL_NI_YEARS);
  const basePension = (clampedYears / FULL_NI_YEARS) * FULL_STATE_PENSION_ANNUAL;
  const deferralMultiplier = 1 + deferralYears * DEFERRAL_RATE_PER_YEAR;

  return basePension * deferralMultiplier;
}

/**
 * Compute gross employment salary at a target age, applying compound annual raise from startAge.
 *
 * Returns 0 if:
 * - `targetAge` is before `startAge`
 * - `startingSalary` is non-positive or non-finite
 * - `annualRaiseRate` is negative or non-finite
 * - Any age argument is non-finite
 */
export function computeEmploymentSalaryAtAge(
  startingSalary: number,
  annualRaiseRate: number,
  startAge: number,
  targetAge: number,
): number {
  if (!isFinite(startingSalary) || startingSalary <= 0) return 0;
  if (!isFinite(annualRaiseRate) || annualRaiseRate < 0) return 0;
  if (!isFinite(startAge) || !isFinite(targetAge)) return 0;
  if (targetAge < startAge) return 0;

  const yearsElapsed = targetAge - startAge;
  return startingSalary * (1 + annualRaiseRate) ** yearsElapsed;
}

/**
 * Compute total pension/savings contributions from all enabled employment incomes at a given age.
 *
 * Only sums enabled jobs where `age` is within `[job.startAge, job.endAge]`.
 * Each contribution = `salaryAtAge × contributionRate`.
 *
 * Returns 0 for invalid `age` or `contributionRate`.
 */
export function computeEmploymentContributionsAtAge(
  employmentIncomes: EmploymentIncome[],
  age: number,
  contributionRate: number,
): number {
  if (!isFinite(age) || !isFinite(contributionRate) || contributionRate < 0) return 0;

  return employmentIncomes
    .filter((job) => job.enabled && age >= job.startAge && age <= job.endAge)
    .reduce((total, job) => {
      const salary = computeEmploymentSalaryAtAge(
        job.annualGrossSalary,
        job.annualRaiseRate,
        job.startAge,
        age,
      );
      return total + salary * contributionRate;
    }, 0);
}

/**
 * Compute total income from all enabled income streams at a given age.
 *
 * Applies each stream's own `growthRate` compound from `stream.startAge`.
 * Only sums enabled streams where `age` is within `[stream.startAge, stream.endAge ?? Infinity]`.
 *
 * Returns 0 for non-finite `age`.
 */
export function computeIncomeStreamsAtAge(
  streams: IncomeStream[],
  age: number,
): number {
  if (!isFinite(age)) return 0;

  return streams
    .filter(
      (s) =>
        s.enabled &&
        age >= s.startAge &&
        (s.endAge === null || age <= s.endAge),
    )
    .reduce((total, s) => {
      const yearsElapsed = age - s.startAge;
      const amount = s.annualAmount * (1 + s.growthRate) ** yearsElapsed;
      return total + amount;
    }, 0);
}
