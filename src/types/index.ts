/**
 * Core domain types for the US–UK personal financial planner.
 * See `specs/us-uk-personal-planner.spec.md` for the authoritative data model.
 */

export type Locale = "en-GB" | "en-US";

/** The only two currencies the planner supports. */
export type Currency = "GBP" | "USD";

/** Account/wrapper types supported by the planner (acceptance criterion 4). */
export type AccountType =
  | "cash"
  | "uk-workplace-pension"
  | "uk-sipp"
  | "uk-isa"
  | "uk-taxable"
  | "us-401k"
  | "us-traditional-ira"
  | "us-roth-ira"
  | "us-taxable-brokerage"
  | "property"
  | "other";

export type GoalKind = "expense" | "income";

export type BenefitKind = "uk-state-pension" | "us-social-security" | "other";

export type ProjectionPhase = "accumulation" | "retirement";

/** A monetary value with its own explicit currency (acceptance criterion 2). */
export type MonetaryAmount = {
  amount: number;
  currency: Currency;
};

export type Profile = {
  currentAge: number;
  retirementAge: number;
  planningAge: number;
  /** Non-negative number used only for the UK long-term-residence educational milestone. */
  yearsUKResident: number;
  reportingCurrency: Currency;
};

export type CashFlow = {
  takeHomeIncome: MonetaryAmount;
  currentSpending: MonetaryAmount;
  retirementSpending: MonetaryAmount;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: Currency;
  balance: number;
  annualContribution: number;
  /** Nominal annual fraction, e.g. 0.05 for 5%. */
  expectedReturn: number;
};

export type Goal = {
  id: string;
  name: string;
  age: number;
  amount: number;
  currency: Currency;
  kind: GoalKind;
};

export type Benefit = {
  id: string;
  name: string;
  kind: BenefitKind;
  enabled: boolean;
  startAge: number;
  annualAmount: number;
  currency: Currency;
  /** Nominal annual growth fraction applied from `startAge`. */
  growthRate: number;
};

export type Assumptions = {
  /** Annual fraction, e.g. 0.025 for 2.5%. */
  inflationRate: number;
  /** Annual standard deviation used by the Monte Carlo simulation, 0–0.6. */
  returnVolatility: number;
  /** Positive GBP value of one USD, user-supplied. */
  gbpPerUsd: number;
  /** Bounded 500–5,000, defaulting to 1,000. */
  simulationRuns: number;
};

export type Plan = {
  profile: Profile;
  cashFlow: CashFlow;
  accounts: Account[];
  goals: Goal[];
  benefits: Benefit[];
  assumptions: Assumptions;
};

/** Versioned single-plan `localStorage` envelope (acceptance criterion 21). */
export type PlanEnvelope = {
  schemaVersion: number;
  updatedAt: string;
  plan: Plan;
};

/** One annual point in the reporting currency (acceptance criterion 8). */
export type ProjectionPoint = {
  age: number;
  phase: ProjectionPhase;
  openingBalance: number;
  contribution: number;
  earnedIncome: number;
  spending: number;
  benefits: number;
  goals: number;
  investmentGrowth: number;
  closingBalance: number;
  /** Amount of a cash-flow deficit that could not be funded by any account balance. */
  shortfall: number;
};

export type MonteCarloPercentilePoint = {
  age: number;
  p10: number;
  p50: number;
  p90: number;
};

export type MonteCarloResult = {
  /** Fraction of paths, 0–1, that never depleted (acceptance criteria 11–12). */
  successProbability: number;
  percentiles: MonteCarloPercentilePoint[];
  seed: number;
  runs: number;
};

export type InsightSeverity = "info" | "warning";

export type Insight = {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
};

/** How the dashboard chart presents projected values. */
export type ValueView = "nominal" | "today";
