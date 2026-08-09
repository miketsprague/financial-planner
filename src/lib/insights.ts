import type { Account, Insight, MonteCarloResult, Plan } from "@/types";
import {
  computeAnnualSavings,
  computeNetWorth,
  computePlannedContributions,
} from "./calculations";

/** Below this success probability, the plan is flagged as high-risk. */
const LOW_SUCCESS_PROBABILITY_THRESHOLD = 0.7;

/** Above this share of net worth sitting in cash, concentration is flagged. */
const CASH_CONCENTRATION_THRESHOLD = 0.5;

/** Common UK private-pension minimum access age (rising to 57 from 2028). */
const UK_PENSION_MINIMUM_ACCESS_AGE = 55;

/** Common US retirement-account minimum access age before early-withdrawal penalties apply. */
const US_RETIREMENT_MINIMUM_ACCESS_AGE = 59.5;

const UK_PENSION_TYPES: Account["type"][] = ["uk-workplace-pension", "uk-sipp"];
const US_RETIREMENT_TYPES: Account["type"][] = [
  "us-401k",
  "us-traditional-ira",
  "us-roth-ira",
];
const PFIC_RELEVANT_TYPES: Account["type"][] = ["uk-isa", "uk-taxable"];
const TREATY_RELEVANT_TYPES: Account["type"][] = [
  "uk-workplace-pension",
  "uk-sipp",
  "us-401k",
  "us-traditional-ira",
  "us-roth-ira",
];

/**
 * A neutral, educational per-account consideration for cross-border wrappers
 * (acceptance criterion 17). The app never decides whether a holding is a PFIC.
 */
export function getAccountConsideration(account: Account): string | null {
  if (PFIC_RELEVANT_TYPES.includes(account.type)) {
    return "Non-US-domiciled pooled investments held in this wrapper may be treated as PFICs for US tax purposes — a question for a cross-border professional.";
  }
  if (TREATY_RELEVANT_TYPES.includes(account.type)) {
    return "Pension treatment differs between US and UK tax treaty rules and reporting requirements — a question for a cross-border professional.";
  }
  return null;
}

/**
 * Deterministic, factual observations about the current plan
 * (acceptance criterion 16). These are not recommendations: they identify a
 * fact in the entered plan, why it may matter, and a question to investigate.
 */
export function computeInsights(
  plan: Plan,
  monteCarlo: MonteCarloResult | null,
): Insight[] {
  const insights: Insight[] = [];
  const netWorth = computeNetWorth(plan);
  const annualSavings = computeAnnualSavings(plan);
  const plannedContributions = computePlannedContributions(plan);

  if (
    monteCarlo &&
    monteCarlo.runs > 0 &&
    monteCarlo.successProbability < LOW_SUCCESS_PROBABILITY_THRESHOLD
  ) {
    insights.push({
      id: "low-success-probability",
      severity: "warning",
      title: "Plan success probability is low",
      detail:
        "The simulation shows a meaningful chance of the plan running out of money before the planning age. Consider whether spending, contributions, or the retirement age need review.",
    });
  }

  if (annualSavings < 0) {
    insights.push({
      id: "negative-current-cash-flow",
      severity: "warning",
      title: "Current spending exceeds take-home income",
      detail:
        "Living costs are currently higher than take-home income, before any account contributions. Check whether this reflects reality or an input error.",
    });
  }

  if (plannedContributions > Math.max(0, annualSavings)) {
    insights.push({
      id: "contributions-above-surplus",
      severity: "warning",
      title: "Planned contributions exceed available surplus",
      detail:
        "Total planned annual contributions are higher than the surplus left after living costs. The projection caps contributions proportionally to what is actually affordable.",
    });
  }

  const cashBalance = plan.accounts
    .filter((account) => account.type === "cash")
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);
  if (netWorth > 0 && cashBalance / netWorth > CASH_CONCENTRATION_THRESHOLD) {
    insights.push({
      id: "concentrated-cash",
      severity: "info",
      title: "A large share of net worth is held in cash",
      detail:
        "More than half of net worth sits in cash accounts, which may lag inflation over a long planning horizon. Consider whether this level of cash is intentional.",
    });
  }

  const hasEarlyUkPensionAccess =
    plan.profile.retirementAge < UK_PENSION_MINIMUM_ACCESS_AGE &&
    plan.accounts.some((account) => UK_PENSION_TYPES.includes(account.type));
  if (hasEarlyUkPensionAccess) {
    insights.push({
      id: "early-uk-pension-access",
      severity: "warning",
      title: "Planned retirement is before common UK pension access ages",
      detail:
        "UK workplace pensions and SIPPs typically cannot be accessed before age 55 (rising to 57 from 2028). Check the scheme rules for the exact minimum age.",
    });
  }

  const hasEarlyUsRetirementAccess =
    plan.profile.retirementAge < US_RETIREMENT_MINIMUM_ACCESS_AGE &&
    plan.accounts.some((account) => US_RETIREMENT_TYPES.includes(account.type));
  if (hasEarlyUsRetirementAccess) {
    insights.push({
      id: "early-us-retirement-access",
      severity: "warning",
      title: "Planned retirement is before common US retirement-account ages",
      detail:
        "401(k) and IRA withdrawals before age 59½ can trigger an early-withdrawal penalty in addition to income tax. Check whether an exception applies.",
    });
  }

  const hasUkStatePension = plan.benefits.some(
    (benefit) => benefit.kind === "uk-state-pension" && benefit.enabled,
  );
  const hasUsSocialSecurity = plan.benefits.some(
    (benefit) => benefit.kind === "us-social-security" && benefit.enabled,
  );
  if (!hasUkStatePension || !hasUsSocialSecurity) {
    insights.push({
      id: "missing-benefit-estimate",
      severity: "info",
      title: "A government benefit estimate may be missing",
      detail:
        "Add a UK State Pension and/or US Social Security estimate to see how they change the plan. Forecasts are available from GOV.UK and the SSA.",
    });
  }

  const hasUkWrapper = plan.accounts.some(
    (account) =>
      PFIC_RELEVANT_TYPES.includes(account.type) ||
      UK_PENSION_TYPES.includes(account.type),
  );
  const hasUsWrapper = plan.accounts.some((account) =>
    US_RETIREMENT_TYPES.includes(account.type),
  );
  if (hasUkWrapper && hasUsWrapper) {
    insights.push({
      id: "cross-border-wrappers",
      severity: "info",
      title: "This plan mixes UK and US account wrappers",
      detail:
        "Holding both UK and US wrappers raises PFIC, FBAR/FATCA, and pension-treaty questions. See the cross-border guide for sourced starting points.",
    });
  }

  return insights;
}
