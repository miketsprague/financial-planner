import type {
  Assumptions,
  EmploymentIncome,
  IncomeStream,
  Plan,
  QuickStartInput,
  StatePensionConfig,
} from "@/types";
import { DEFAULT_STATE_PENSION_CONFIG, UK_DEFAULTS } from "./defaults";

function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Create a new Plan with a generated id and ISO 8601 timestamps.
 *
 * @param name - Display name for the plan.
 * @param assumptions - Planning assumptions; defaults to UK defaults.
 * @param input - Optional Quick Start input values.
 * @returns A fully formed Plan ready to persist.
 */
export function createPlan(
  name: string,
  assumptions: Assumptions = { ...UK_DEFAULTS },
  input: QuickStartInput | null = null,
): Plan {
  const ts = now();
  return {
    id: generateId(),
    name,
    createdAt: ts,
    updatedAt: ts,
    input,
    assumptions,
    employmentIncomes: [],
    statePensionConfig: { ...DEFAULT_STATE_PENSION_CONFIG },
    incomeStreams: [],
  };
}

/**
 * Apply partial changes to a Plan, bumping `updatedAt` to the current time.
 * `id` and `createdAt` are immutable and cannot be overwritten via `changes`.
 *
 * @param plan - The existing plan to update.
 * @param changes - Partial fields to overwrite (excluding `id` and `createdAt`).
 * @returns A new Plan object with the changes applied.
 */
export function updatePlan(plan: Plan, changes: Partial<Omit<Plan, "id" | "createdAt">>): Plan {
  return {
    ...plan,
    ...changes,
    updatedAt: now(),
  };
}

/**
 * Duplicate a Plan under a new name, generating a new id and fresh timestamps.
 *
 * @param plan - The plan to copy.
 * @param newName - Display name for the duplicate.
 * @returns A new Plan with the same input and assumptions as the original.
 */
export function duplicatePlan(plan: Plan, newName: string): Plan {
  const ts = now();
  return {
    ...plan,
    id: generateId(),
    name: newName,
    createdAt: ts,
    updatedAt: ts,
  };
}

/**
 * Serialise an array of plans to a JSON string for `localStorage` persistence.
 *
 * @param plans - Plans to serialise.
 * @returns JSON string.
 */
export function serializePlans(plans: Plan[]): string {
  return JSON.stringify(plans);
}

/**
 * Deserialise plans from a `localStorage` JSON string.
 *
 * Unknown or malformed entries are silently filtered out. Each valid plan's
 * assumptions are merged over `UK_DEFAULTS` so that plans saved before a new
 * `Assumptions` field was introduced automatically receive the correct default
 * value (forward-compatible migration pattern).
 *
 * Epic 2 migration: plans saved before income stream support was added will
 * receive empty employment/stream arrays and the default State Pension config.
 *
 * @param raw - Raw JSON string from storage.
 * @returns Array of valid Plans, or an empty array on any parse failure.
 */
export function deserializePlans(raw: string): Plan[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPlan).map((plan) => {
      // plan passed isPlan which only verifies minimal shape.
      // Cast so we can safely read Epic 2 fields that may be absent
      // in plans serialised before this feature was deployed.
      const p = plan as unknown as {
        employmentIncomes?: EmploymentIncome[];
        statePensionConfig?: StatePensionConfig;
        incomeStreams?: IncomeStream[];
      };

      return {
        ...plan,
        assumptions: { ...UK_DEFAULTS, ...plan.assumptions },
        employmentIncomes: Array.isArray(p.employmentIncomes)
          ? p.employmentIncomes
          : [],
        statePensionConfig: {
          ...DEFAULT_STATE_PENSION_CONFIG,
          ...(p.statePensionConfig ?? {}),
        },
        incomeStreams: Array.isArray(p.incomeStreams) ? p.incomeStreams : [],
      };
    });
  } catch {
    return [];
  }
}

/**
 * Type guard — returns `true` if `value` has the minimum shape of a `Plan`.
 *
 * @param value - Any unknown value.
 * @returns `true` if `value` is a `Plan`.
 */
export function isPlan(value: unknown): value is Plan {
  if (typeof value !== "object" || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj["id"] === "string" &&
    typeof obj["name"] === "string" &&
    typeof obj["createdAt"] === "string" &&
    typeof obj["updatedAt"] === "string" &&
    typeof obj["assumptions"] === "object" &&
    obj["assumptions"] !== null
  );
}
