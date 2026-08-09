import type {
  Account,
  AccountType,
  Assumptions,
  Benefit,
  BenefitKind,
  CashFlow,
  Currency,
  Goal,
  GoalKind,
  MonetaryAmount,
  Plan,
  PlanEnvelope,
  Profile,
} from "@/types";

/** Current schema version for the versioned single-plan envelope (acceptance criterion 21). */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * New, distinct `localStorage` key for the rebuilt plan model. Legacy
 * `financial-planner:plans` / `financial-planner:activePlanId` arrays are
 * left untouched on disk but are never read by this module (spec:
 * "Migration and Supersession").
 */
export const PLAN_STORAGE_KEY = "financial-planner:us-uk-plan:v1";

const ACCOUNT_TYPES: AccountType[] = [
  "cash",
  "uk-workplace-pension",
  "uk-sipp",
  "uk-isa",
  "uk-taxable",
  "us-401k",
  "us-traditional-ira",
  "us-roth-ira",
  "us-taxable-brokerage",
  "property",
  "other",
];

const GOAL_KINDS: GoalKind[] = ["expense", "income"];
const BENEFIT_KINDS: BenefitKind[] = [
  "uk-state-pension",
  "us-social-security",
  "other",
];
const CURRENCIES: Currency[] = ["GBP", "USD"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && CURRENCIES.includes(value as Currency);
}

function isMonetaryAmount(value: unknown): value is MonetaryAmount {
  return (
    isRecord(value) &&
    isFiniteNumber(value.amount) &&
    isCurrency(value.currency)
  );
}

function isProfile(value: unknown): value is Profile {
  return (
    isRecord(value) &&
    isFiniteNumber(value.currentAge) &&
    isFiniteNumber(value.retirementAge) &&
    isFiniteNumber(value.planningAge) &&
    isFiniteNumber(value.yearsUKResident) &&
    isCurrency(value.reportingCurrency)
  );
}

function isCashFlow(value: unknown): value is CashFlow {
  return (
    isRecord(value) &&
    isMonetaryAmount(value.takeHomeIncome) &&
    isMonetaryAmount(value.currentSpending) &&
    isMonetaryAmount(value.retirementSpending)
  );
}

function isAccount(value: unknown): value is Account {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.type === "string" &&
    ACCOUNT_TYPES.includes(value.type as AccountType) &&
    isCurrency(value.currency) &&
    isFiniteNumber(value.balance) &&
    isFiniteNumber(value.annualContribution) &&
    isFiniteNumber(value.expectedReturn)
  );
}

function isGoal(value: unknown): value is Goal {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isFiniteNumber(value.age) &&
    isFiniteNumber(value.amount) &&
    isCurrency(value.currency) &&
    typeof value.kind === "string" &&
    GOAL_KINDS.includes(value.kind as GoalKind)
  );
}

function isBenefit(value: unknown): value is Benefit {
  return (
    isRecord(value) &&
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.kind === "string" &&
    BENEFIT_KINDS.includes(value.kind as BenefitKind) &&
    typeof value.enabled === "boolean" &&
    isFiniteNumber(value.startAge) &&
    isFiniteNumber(value.annualAmount) &&
    isCurrency(value.currency) &&
    isFiniteNumber(value.growthRate)
  );
}

function isAssumptions(value: unknown): value is Assumptions {
  return (
    isRecord(value) &&
    isFiniteNumber(value.inflationRate) &&
    isFiniteNumber(value.returnVolatility) &&
    isFiniteNumber(value.gbpPerUsd) &&
    isFiniteNumber(value.simulationRuns)
  );
}

/**
 * Defensive, fully-structural validation of an unknown value as a `Plan`
 * (acceptance criterion 22). Every field is checked; nothing is assumed.
 */
export function isValidPlan(value: unknown): value is Plan {
  if (!isRecord(value)) return false;
  if (!isProfile(value.profile)) return false;
  if (!isCashFlow(value.cashFlow)) return false;
  if (!Array.isArray(value.accounts) || !value.accounts.every(isAccount))
    return false;
  if (!Array.isArray(value.goals) || !value.goals.every(isGoal)) return false;
  if (!Array.isArray(value.benefits) || !value.benefits.every(isBenefit))
    return false;
  if (!isAssumptions(value.assumptions)) return false;
  return true;
}

/**
 * Defensive validation of an unknown value as a full `PlanEnvelope`.
 * Unknown or unsupported schema versions are rejected rather than guessed at.
 */
export function isValidPlanEnvelope(value: unknown): value is PlanEnvelope {
  return (
    isRecord(value) &&
    typeof value.schemaVersion === "number" &&
    value.schemaVersion === CURRENT_SCHEMA_VERSION &&
    typeof value.updatedAt === "string" &&
    isValidPlan(value.plan)
  );
}

export function createPlanEnvelope(plan: Plan): PlanEnvelope {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    plan,
  };
}

/** Serialise a plan into a pretty-printed, human-inspectable JSON envelope for export. */
export function serializePlanEnvelope(plan: Plan): string {
  return JSON.stringify(createPlanEnvelope(plan), null, 2);
}

export type ParseResult =
  | { ok: true; plan: Plan }
  | { ok: false; error: string };

/**
 * Parse and validate a JSON string as a plan envelope. Invalid or
 * unsupported files are rejected with an explanatory error rather than
 * throwing or destroying the current plan (acceptance criterion 22).
 */
export function parsePlanEnvelope(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "That file is not valid JSON." };
  }

  if (!isValidPlanEnvelope(parsed)) {
    return {
      ok: false,
      error:
        "That file is not a supported plan export. It may be from a different app, a different schema version, or corrupted.",
    };
  }

  return { ok: true, plan: parsed.plan };
}

function hasLocalStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

/** Load the saved plan from `localStorage`, or `null` if absent or invalid. */
export function loadStoredPlan(): Plan | null {
  if (!hasLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(PLAN_STORAGE_KEY);
    if (raw === null) return null;
    const result = parsePlanEnvelope(raw);
    return result.ok ? result.plan : null;
  } catch {
    return null;
  }
}

/** Persist a plan to `localStorage` as a versioned envelope (acceptance criterion 21). */
export function saveStoredPlan(plan: Plan): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(PLAN_STORAGE_KEY, serializePlanEnvelope(plan));
  } catch {
    // localStorage may be unavailable (private browsing quota exceeded, etc.) — fail silently.
  }
}

/** Remove the saved plan from `localStorage`, used by the reset action. */
export function clearStoredPlan(): void {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.removeItem(PLAN_STORAGE_KEY);
  } catch {
    // ignore
  }
}
