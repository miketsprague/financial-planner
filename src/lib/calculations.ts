import type {
  Assumptions,
  EmploymentIncome,
  IncomeStream,
  ProjectionDataPoint,
  QuickStartInput,
  StatePensionConfig,
} from "@/types";
import {
  computeEmploymentContributionsAtAge,
  computeIncomeStreamsAtAge,
  computeStatePensionAnnual,
} from "./income";

/**
 * Optional income configuration for richer projections (Epic 2).
 * When provided to `projectSavings`, overrides/augments the simple
 * income fields in `QuickStartInput`.
 */
export type IncomeConfig = {
  employmentIncomes: EmploymentIncome[];
  statePensionConfig: StatePensionConfig;
  incomeStreams: IncomeStream[];
};

/**
 * Compute annual pension/savings contribution from gross income.
 * Returns 0 for invalid or non-positive income.
 */
export function computeAnnualContribution(
  annualIncome: number,
  contributionRate: number,
): number {
  if (!isFinite(annualIncome) || annualIncome <= 0) return 0;
  if (!isFinite(contributionRate) || contributionRate < 0) return 0;
  return annualIncome * contributionRate;
}

/**
 * Compute annual withdrawal needed during retirement.
 * Approximates take-home by applying the configured income replacement ratio
 * minus any state pension received.
 */
export function computeAnnualWithdrawal(
  annualIncome: number,
  statePension: number,
  incomeReplacementRatio: number,
): number {
  if (!isFinite(annualIncome) || annualIncome <= 0) return 0;
  if (!isFinite(incomeReplacementRatio) || incomeReplacementRatio < 0) return 0;
  const target = annualIncome * incomeReplacementRatio;
  const pensionOffset = isFinite(statePension) ? Math.max(0, statePension) : 0;
  const fromPortfolio = Math.max(0, target - pensionOffset);
  return fromPortfolio;
}

/**
 * Project year-by-year balance from `input.currentAge` to `assumptions.lifeExpectancy`.
 *
 * Accumulation phase: balance grows at `investmentReturn` and receives annual contributions.
 * Drawdown phase: balance shrinks by inflation-adjusted annual withdrawals
 * (state pension reduces withdrawal need).
 *
 * When `incomeConfig` is provided:
 * - Employment incomes replace the simple contribution when a job is active at a given age.
 *   Falls back to `computeAnnualContribution(annualIncome, contributionRate)` for ages
 *   where no enabled job is active.
 * - `statePensionConfig.enabled` overrides `annualStatePension` using NI qualifying years
 *   and deferral rules; `statePensionConfig.deferralYears` shifts the effective pension age.
 * - `incomeStreams` reduce portfolio withdrawals during drawdown (in addition to State Pension).
 */
export function projectSavings(
  input: QuickStartInput,
  assumptions: Assumptions,
  incomeConfig?: IncomeConfig,
): ProjectionDataPoint[] {
  const {
    currentAge,
    retirementAge,
    currentSavings,
    annualIncome,
  } = input;

  const {
    inflationRate,
    investmentReturn,
    lifeExpectancy,
    statePensionAge,
    annualStatePension,
    annualContributionRate,
    incomeReplacementRatio,
  } = assumptions;

  if (
    !isFinite(currentAge) ||
    !isFinite(retirementAge) ||
    !isFinite(lifeExpectancy) ||
    currentAge < 0 ||
    retirementAge <= currentAge ||
    lifeExpectancy <= currentAge
  ) {
    return [];
  }

  const endAge = Math.max(retirementAge, lifeExpectancy);

  // Base contribution — used when no income config, or no active job at a given age
  const baseAnnualContribution = computeAnnualContribution(
    annualIncome,
    annualContributionRate,
  );

  // Resolve effective State Pension amount (overridden by statePensionConfig when enabled)
  const effectiveStatePension =
    incomeConfig?.statePensionConfig.enabled === true
      ? computeStatePensionAnnual(
          incomeConfig.statePensionConfig.niQualifyingYears,
          incomeConfig.statePensionConfig.deferralYears,
        )
      : annualStatePension;

  // Resolve effective State Pension age (shifted by deferral years)
  const effectiveStatePensionAge =
    incomeConfig?.statePensionConfig.enabled === true
      ? statePensionAge + (incomeConfig.statePensionConfig.deferralYears ?? 0)
      : statePensionAge;

  const results: ProjectionDataPoint[] = [];
  let balance = Math.max(0, currentSavings);

  for (let age = currentAge; age <= endAge; age++) {
    const isRetired = age >= retirementAge;
    const hasStatePension = age >= effectiveStatePensionAge;

    if (age > currentAge) {
      if (!isRetired) {
        // ── Accumulation phase ──────────────────────────────────────────────
        let contribution = baseAnnualContribution;

        if (incomeConfig && incomeConfig.employmentIncomes.length > 0) {
          // Only use employment contributions if a job is active at this age;
          // otherwise fall back to the simple income-based contribution.
          const hasActiveJob = incomeConfig.employmentIncomes.some(
            (job) => job.enabled && age >= job.startAge && age <= job.endAge,
          );
          if (hasActiveJob) {
            contribution = computeEmploymentContributionsAtAge(
              incomeConfig.employmentIncomes,
              age,
              annualContributionRate,
            );
          }
        }

        balance = balance * (1 + investmentReturn) + contribution;
      } else {
        // ── Drawdown phase ──────────────────────────────────────────────────
        const inflationMultiplier = (1 + inflationRate) ** (age - currentAge);
        const inflatedAnnualIncome = annualIncome * inflationMultiplier;

        // State pension is inflation-adjusted
        const pension = hasStatePension
          ? effectiveStatePension * inflationMultiplier
          : 0;

        // Other income streams use their own growth rate (set per-stream)
        const otherIncome = incomeConfig
          ? computeIncomeStreamsAtAge(incomeConfig.incomeStreams, age)
          : 0;

        const withdrawal = computeAnnualWithdrawal(
          inflatedAnnualIncome,
          pension + otherIncome,
          incomeReplacementRatio,
        );

        balance = balance * (1 + investmentReturn) - withdrawal;
        balance = Math.max(0, balance);
      }
    }

    results.push({ age, balance, isRetired, hasStatePension });
  }

  return results;
}

/**
 * Return the projected balance at retirement age, or 0 if not reached.
 */
export function getBalanceAtRetirement(
  input: QuickStartInput,
  assumptions: Assumptions,
): number {
  const points = projectSavings(input, assumptions);
  const retirementPoint = points.find((p) => p.age === input.retirementAge);
  return retirementPoint?.balance ?? 0;
}

/**
 * Return true if projected balance never hits zero before lifeExpectancy.
 */
export function isFundingSufficient(
  input: QuickStartInput,
  assumptions: Assumptions,
): boolean {
  const points = projectSavings(input, assumptions);
  if (points.length === 0) return false;
  const lastPoint = points[points.length - 1];
  return lastPoint.balance > 0;
}
