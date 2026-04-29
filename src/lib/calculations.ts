import type { Assumptions, ProjectionDataPoint, QuickStartInput } from "@/types";

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
 * Approximates take-home by assuming income target is 2/3 of pre-retirement income
 * minus any state pension received.
 */
export function computeAnnualWithdrawal(
  annualIncome: number,
  statePension: number,
): number {
  if (!isFinite(annualIncome) || annualIncome <= 0) return 0;
  const target = annualIncome * (2 / 3);
  const fromPortfolio = Math.max(0, target - Math.max(0, statePension));
  return fromPortfolio;
}

export function computeIndexedStatePension(
  annualStatePension: number,
  indexRate: number,
  yearsSinceStatePensionAge: number,
): number {
  if (!isFinite(annualStatePension) || annualStatePension <= 0) return 0;
  if (!isFinite(yearsSinceStatePensionAge) || yearsSinceStatePensionAge < 0) {
    return 0;
  }

  const safeIndexRate = isFinite(indexRate) ? indexRate : 0;
  return (
    annualStatePension * Math.pow(1 + safeIndexRate, yearsSinceStatePensionAge)
  );
}

/**
 * Project year-by-year balance from `input.currentAge` to `assumptions.lifeExpectancy`.
 *
 * Accumulation phase: balance grows at `investmentReturn` and receives annual contributions.
 * Drawdown phase: balance shrinks by annual withdrawals (state pension reduces withdrawal need).
 */
export function projectSavings(
  input: QuickStartInput,
  assumptions: Assumptions,
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
  const annualContribution = computeAnnualContribution(
    annualIncome,
    annualContributionRate,
  );

  const results: ProjectionDataPoint[] = [];
  let balance = Math.max(0, currentSavings);

  for (let age = currentAge; age <= endAge; age++) {
    const isRetired = age >= retirementAge;
    const hasStatePension = age >= statePensionAge;

    if (!isRetired) {
      // Accumulation: grow by return then add contribution
      balance = balance * (1 + investmentReturn) + annualContribution;
    } else {
      // Drawdown: calculate withdrawal needed from portfolio
      const pension = hasStatePension
        ? computeIndexedStatePension(
            annualStatePension,
            inflationRate,
            age - statePensionAge,
          )
        : 0;
      const withdrawal = computeAnnualWithdrawal(annualIncome, pension);
      balance = balance * (1 + investmentReturn) - withdrawal;
      balance = Math.max(0, balance);
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
