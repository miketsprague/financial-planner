import type {
  Account,
  Benefit,
  Goal,
  Plan,
  Profile,
  ProjectionPoint,
} from "@/types";
import { convertToReportingCurrency, normalizeRate } from "./currency";

/** Ages spanning more than this many years are rejected as invalid (acceptance criterion 8/12). */
const MAX_PROJECTION_YEARS = 100;

/** Nominal rates (returns, growth) are bounded to +/-100% to keep compounding finite. */
const RATE_MIN = -1;
const RATE_MAX = 1;

/** Inflation is bounded slightly more conservatively to avoid runaway deflation. */
const INFLATION_MIN = -0.5;
const INFLATION_MAX = 1;

/**
 * A projection is invalid when ages are non-finite, non-integers, not ordered as
 * `currentAge < retirementAge <= planningAge`, or span more than 100 years
 * (spec: "Normalisation and validation").
 */
export function isValidProjectionProfile(
  profile: Pick<Profile, "currentAge" | "retirementAge" | "planningAge">,
): boolean {
  const { currentAge, retirementAge, planningAge } = profile;
  const ages = [currentAge, retirementAge, planningAge];
  if (!ages.every((age) => Number.isFinite(age))) return false;
  if (!ages.every((age) => Number.isInteger(age))) return false;
  if (!(currentAge < retirementAge && retirementAge <= planningAge))
    return false;
  if (planningAge - currentAge > MAX_PROJECTION_YEARS) return false;
  return true;
}

/** Compound growth factor for `years` at `inflationRate`, bounded to stay finite. */
export function inflationFactor(inflationRate: number, years: number): number {
  const rate = normalizeRate(inflationRate, INFLATION_MIN, INFLATION_MAX);
  const safeYears = Math.max(0, years);
  return Math.pow(1 + rate, safeYears);
}

/**
 * Convert a nominal projected value into today's money by dividing out
 * cumulative inflation from the current age (spec: "Real and nominal values").
 * The selected view changes presentation only; projection arithmetic stays nominal.
 */
export function todaysMoneyValue(
  nominalValue: number,
  inflationRate: number,
  years: number,
): number {
  const factor = inflationFactor(inflationRate, years);
  if (!Number.isFinite(factor) || factor <= 0) return nominalValue;
  return nominalValue / factor;
}

export type CashFlowAllocation = {
  /** Balance delta applied to each account, in the same order as the input arrays. */
  deltas: number[];
  /** Total contribution actually credited (after proportional capping), pre-retirement only. */
  contributionApplied: number;
  /** Portion of a cash-flow deficit that could not be funded by any account balance. */
  shortfall: number;
};

/**
 * Allocate one year's net cash flow across accounts (spec: "Annual cash-flow order",
 * steps 4–6).
 *
 * - When `netCashFlow` is non-negative, planned contributions are credited up to that
 *   surplus (scaled down proportionally if their total would exceed it) and any
 *   remaining surplus is swept into the first cash account, or spread proportionally
 *   by post-growth balance when there is no cash account.
 * - When `netCashFlow` is negative, the deficit is funded by withdrawing proportionally
 *   from every account with a positive balance. Any amount that cannot be funded is
 *   returned as `shortfall` rather than allowed to go negative or infinite.
 */
export function allocateCashFlow(params: {
  postGrowthBalances: number[];
  isCashAccount: boolean[];
  requestedContributions: number[];
  netCashFlow: number;
  allowContributions: boolean;
}): CashFlowAllocation {
  const {
    postGrowthBalances,
    isCashAccount,
    requestedContributions,
    netCashFlow,
    allowContributions,
  } = params;
  const n = postGrowthBalances.length;
  const deltas = new Array<number>(n).fill(0);
  let contributionApplied = 0;
  let shortfall = 0;

  if (!Number.isFinite(netCashFlow)) {
    return { deltas, contributionApplied, shortfall };
  }

  if (netCashFlow >= 0) {
    let surplus = netCashFlow;

    if (allowContributions) {
      const totalRequested = requestedContributions.reduce(
        (sum, v) => sum + Math.max(0, v),
        0,
      );
      if (totalRequested > 0) {
        const scale = totalRequested > surplus ? surplus / totalRequested : 1;
        for (let i = 0; i < n; i++) {
          const applied = Math.max(0, requestedContributions[i]) * scale;
          deltas[i] += applied;
          contributionApplied += applied;
        }
        surplus = Math.max(0, surplus - contributionApplied);
      }
    }

    if (surplus > 0 && n > 0) {
      const cashIndex = isCashAccount.findIndex(Boolean);
      if (cashIndex !== -1) {
        deltas[cashIndex] += surplus;
      } else {
        const totalBalance = postGrowthBalances.reduce(
          (sum, b) => sum + Math.max(0, b),
          0,
        );
        if (totalBalance > 0) {
          for (let i = 0; i < n; i++) {
            const weight = Math.max(0, postGrowthBalances[i]) / totalBalance;
            deltas[i] += surplus * weight;
          }
        } else {
          // No cash account and no positive balance anywhere to weight by: split evenly
          // so surplus is never silently dropped.
          const even = surplus / n;
          for (let i = 0; i < n; i++) deltas[i] += even;
        }
      }
    }
  } else {
    const deficit = -netCashFlow;
    const totalPositive = postGrowthBalances.reduce(
      (sum, b) => sum + Math.max(0, b),
      0,
    );
    if (totalPositive <= 0) {
      shortfall = deficit;
    } else {
      const withdrawable = Math.min(deficit, totalPositive);
      for (let i = 0; i < n; i++) {
        const bal = Math.max(0, postGrowthBalances[i]);
        if (bal <= 0) continue;
        deltas[i] -= withdrawable * (bal / totalPositive);
      }
      shortfall = deficit - withdrawable;
    }
  }

  return { deltas, contributionApplied, shortfall };
}

type ConvertedGoalsByAge = Map<number, { income: number; expense: number }>;

function groupGoalsByAge(
  goals: Goal[],
  convert: (amount: number, currency: Goal["currency"]) => number,
): ConvertedGoalsByAge {
  const byAge: ConvertedGoalsByAge = new Map();
  for (const goal of goals) {
    if (!Number.isFinite(goal.age) || !Number.isInteger(goal.age)) continue;
    const amount = convert(goal.amount, goal.currency);
    const entry = byAge.get(goal.age) ?? { income: 0, expense: 0 };
    if (goal.kind === "income") entry.income += amount;
    else entry.expense += amount;
    byAge.set(goal.age, entry);
  }
  return byAge;
}

function benefitIncomeAtAge(
  benefits: Benefit[],
  age: number,
  convert: (amount: number, currency: Benefit["currency"]) => number,
): number {
  let total = 0;
  for (const benefit of benefits) {
    if (!benefit.enabled) continue;
    if (!Number.isFinite(benefit.startAge) || age < benefit.startAge) continue;
    const amount = convert(benefit.annualAmount, benefit.currency);
    const growth = normalizeRate(benefit.growthRate, RATE_MIN, RATE_MAX);
    const years = Math.max(0, age - benefit.startAge);
    total += amount * Math.pow(1 + growth, years);
  }
  return total;
}

/**
 * Core annual projection loop shared by the deterministic projection and the
 * Monte Carlo simulation. `shockForAge` returns an additional return shock
 * (e.g. from a seeded random generator) applied to every account's expected
 * return for that age; it defaults to zero for the deterministic case.
 * Returns an empty array for an invalid plan rather than `NaN` or an
 * infinite loop (acceptance criterion 12).
 */
export function projectPlanWithReturnShock(
  plan: Plan,
  shockForAge: (age: number) => number = () => 0,
): ProjectionPoint[] {
  const { profile, cashFlow, accounts, goals, benefits, assumptions } = plan;
  if (!isValidProjectionProfile(profile)) return [];

  const reportingCurrency = profile.reportingCurrency;
  const gbpPerUsd = assumptions.gbpPerUsd;
  const inflationRate = assumptions.inflationRate;

  const convert = (amount: number, currency: Account["currency"]) =>
    convertToReportingCurrency(amount, currency, reportingCurrency, gbpPerUsd);

  const takeHomeIncomeBase = convert(
    cashFlow.takeHomeIncome.amount,
    cashFlow.takeHomeIncome.currency,
  );
  const currentSpendingBase = convert(
    cashFlow.currentSpending.amount,
    cashFlow.currentSpending.currency,
  );
  const retirementSpendingBase = convert(
    cashFlow.retirementSpending.amount,
    cashFlow.retirementSpending.currency,
  );

  const accountState = accounts.map((account) => ({
    isCash: account.type === "cash",
    annualContribution: convert(account.annualContribution, account.currency),
    expectedReturn: normalizeRate(account.expectedReturn, RATE_MIN, RATE_MAX),
  }));

  let balances = accounts.map((account) =>
    convert(account.balance, account.currency),
  );

  const goalsByAge = groupGoalsByAge(goals, convert);

  const points: ProjectionPoint[] = [];

  for (let age = profile.currentAge; age <= profile.planningAge; age++) {
    const isRetired = age >= profile.retirementAge;
    const openingBalances = balances;
    const openingAggregate = openingBalances.reduce((sum, b) => sum + b, 0);

    const shock = shockForAge(age);
    const growths = openingBalances.map((balance, i) => {
      const effectiveReturn = Math.max(
        RATE_MIN,
        accountState[i].expectedReturn + shock,
      );
      return balance * effectiveReturn;
    });
    const postGrowthBalances = openingBalances.map(
      (balance, i) => balance + growths[i],
    );
    const investmentGrowth = growths.reduce((sum, g) => sum + g, 0);

    const yearsFromNow = age - profile.currentAge;
    const inflationIndex = inflationFactor(inflationRate, yearsFromNow);
    const spendingAmt =
      (isRetired ? retirementSpendingBase : currentSpendingBase) *
      inflationIndex;

    const earnedIncome = isRetired ? 0 : takeHomeIncomeBase;
    const benefitIncome = benefitIncomeAtAge(benefits, age, convert);
    const goalEntry = goalsByAge.get(age) ?? { income: 0, expense: 0 };
    const goalNet = goalEntry.income - goalEntry.expense;

    const netCashFlow = earnedIncome - spendingAmt + benefitIncome + goalNet;

    const { deltas, contributionApplied, shortfall } = allocateCashFlow({
      postGrowthBalances,
      isCashAccount: accountState.map((a) => a.isCash),
      requestedContributions: accountState.map((a) =>
        isRetired ? 0 : a.annualContribution,
      ),
      netCashFlow,
      allowContributions: !isRetired,
    });

    const closingBalances = postGrowthBalances.map((balance, i) =>
      Math.max(0, balance + deltas[i]),
    );
    const closingAggregate = closingBalances.reduce((sum, b) => sum + b, 0);

    points.push({
      age,
      phase: isRetired ? "retirement" : "accumulation",
      openingBalance: openingAggregate,
      contribution: contributionApplied,
      earnedIncome,
      spending: spendingAmt,
      benefits: benefitIncome,
      goals: goalNet,
      investmentGrowth,
      closingBalance: closingAggregate,
      shortfall,
    });

    balances = closingBalances;
  }

  return points;
}

/**
 * Produce the deterministic year-by-year projection for a plan
 * (acceptance criteria 8–10).
 */
export function projectPlan(plan: Plan): ProjectionPoint[] {
  return projectPlanWithReturnShock(plan);
}

/** Convenience lookup for the projection point at a given age, if present. */
export function getProjectionAtAge(
  points: ProjectionPoint[],
  age: number,
): ProjectionPoint | undefined {
  return points.find((point) => point.age === age);
}

/** Current aggregate net worth in the reporting currency. */
export function computeNetWorth(plan: Plan): number {
  const { accounts, profile, assumptions } = plan;
  return accounts.reduce(
    (sum, account) =>
      sum +
      convertToReportingCurrency(
        account.balance,
        account.currency,
        profile.reportingCurrency,
        assumptions.gbpPerUsd,
      ),
    0,
  );
}

/** Current annual surplus (take-home income minus living costs) in the reporting currency. */
export function computeAnnualSavings(plan: Plan): number {
  const { cashFlow, profile, assumptions } = plan;
  const income = convertToReportingCurrency(
    cashFlow.takeHomeIncome.amount,
    cashFlow.takeHomeIncome.currency,
    profile.reportingCurrency,
    assumptions.gbpPerUsd,
  );
  const spending = convertToReportingCurrency(
    cashFlow.currentSpending.amount,
    cashFlow.currentSpending.currency,
    profile.reportingCurrency,
    assumptions.gbpPerUsd,
  );
  return income - spending;
}

/** Total planned annual contributions across all accounts, in the reporting currency. */
export function computePlannedContributions(plan: Plan): number {
  const { accounts, profile, assumptions } = plan;
  return accounts.reduce(
    (sum, account) =>
      sum +
      convertToReportingCurrency(
        account.annualContribution,
        account.currency,
        profile.reportingCurrency,
        assumptions.gbpPerUsd,
      ),
    0,
  );
}
