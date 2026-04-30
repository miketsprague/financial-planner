import type { Assumptions, Plan, QuickStartInput } from "@/types";
import { UK_DEFAULTS } from "./defaults";

function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

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
  };
}

export function updatePlan(plan: Plan, changes: Partial<Omit<Plan, "id" | "createdAt">>): Plan {
  return {
    ...plan,
    ...changes,
    updatedAt: now(),
  };
}

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

export function serializePlans(plans: Plan[]): string {
  return JSON.stringify(plans);
}

export function deserializePlans(raw: string): Plan[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isPlan).map((plan) => ({
      ...plan,
      assumptions: { ...UK_DEFAULTS, ...plan.assumptions },
    }));
  } catch {
    return [];
  }
}

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
