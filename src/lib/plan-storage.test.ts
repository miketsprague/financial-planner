import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CURRENT_SCHEMA_VERSION,
  PLAN_STORAGE_KEY,
  clearStoredPlan,
  createPlanEnvelope,
  isValidPlan,
  isValidPlanEnvelope,
  loadStoredPlan,
  parsePlanEnvelope,
  saveStoredPlan,
  serializePlanEnvelope,
} from "./plan-storage";
import { createExamplePlan } from "./example-plan";
import type { Plan } from "@/types";

const validPlan: Plan = createExamplePlan();

function makeStore() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
    _store: store,
  };
}

describe("isValidPlan", () => {
  it("accepts a well-formed plan", () => {
    expect(isValidPlan(validPlan)).toBe(true);
  });

  it("rejects a non-object value", () => {
    expect(isValidPlan("not a plan")).toBe(false);
    expect(isValidPlan(null)).toBe(false);
  });

  it("rejects a plan missing the profile", () => {
    const rest: Record<string, unknown> = { ...validPlan };
    delete rest.profile;
    expect(isValidPlan(rest)).toBe(false);
  });

  it("rejects a plan with an invalid account type", () => {
    const invalid = {
      ...validPlan,
      accounts: [{ ...validPlan.accounts[0], type: "bitcoin-wallet" }],
    };
    expect(isValidPlan(invalid)).toBe(false);
  });

  it("rejects a plan with a malformed goal", () => {
    const invalid = { ...validPlan, goals: [{ id: "g1", name: "x" }] };
    expect(isValidPlan(invalid)).toBe(false);
  });

  it("rejects a plan with a malformed benefit", () => {
    const invalid = { ...validPlan, benefits: [{ id: "b1" }] };
    expect(isValidPlan(invalid)).toBe(false);
  });

  it("rejects a plan with malformed assumptions", () => {
    const invalid = { ...validPlan, assumptions: { inflationRate: "high" } };
    expect(isValidPlan(invalid)).toBe(false);
  });

  it("rejects a plan with a non-array accounts field", () => {
    const invalid = { ...validPlan, accounts: "not-an-array" };
    expect(isValidPlan(invalid)).toBe(false);
  });

  it("rejects a plan with an invalid currency", () => {
    const invalid = {
      ...validPlan,
      cashFlow: {
        ...validPlan.cashFlow,
        takeHomeIncome: { amount: 1000, currency: "EUR" },
      },
    };
    expect(isValidPlan(invalid)).toBe(false);
  });
});

describe("isValidPlanEnvelope", () => {
  it("accepts a well-formed envelope", () => {
    expect(isValidPlanEnvelope(createPlanEnvelope(validPlan))).toBe(true);
  });

  it("rejects an unsupported schema version", () => {
    const envelope = { ...createPlanEnvelope(validPlan), schemaVersion: 999 };
    expect(isValidPlanEnvelope(envelope)).toBe(false);
  });

  it("rejects a non-object value", () => {
    expect(isValidPlanEnvelope(42)).toBe(false);
  });

  it("rejects an envelope with an invalid plan", () => {
    const envelope = { ...createPlanEnvelope(validPlan), plan: {} };
    expect(isValidPlanEnvelope(envelope)).toBe(false);
  });
});

describe("createPlanEnvelope / serializePlanEnvelope", () => {
  it("stamps the current schema version and an ISO timestamp", () => {
    const envelope = createPlanEnvelope(validPlan);
    expect(envelope.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(() => new Date(envelope.updatedAt).toISOString()).not.toThrow();
  });

  it("round-trips through JSON", () => {
    const json = serializePlanEnvelope(validPlan);
    const parsed = JSON.parse(json);
    expect(parsed.plan).toEqual(validPlan);
  });
});

describe("parsePlanEnvelope", () => {
  it("parses a valid envelope", () => {
    const json = serializePlanEnvelope(validPlan);
    const result = parsePlanEnvelope(json);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.plan).toEqual(validPlan);
  });

  it("rejects invalid JSON without throwing", () => {
    const result = parsePlanEnvelope("{not json");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/JSON/);
  });

  it("rejects well-formed JSON that is not a valid plan envelope", () => {
    const result = parsePlanEnvelope(JSON.stringify({ hello: "world" }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/not a supported plan export/);
  });

  it("rejects an envelope with an unsupported schema version", () => {
    const envelope = { ...createPlanEnvelope(validPlan), schemaVersion: 2 };
    const result = parsePlanEnvelope(JSON.stringify(envelope));
    expect(result.ok).toBe(false);
  });
});

describe("localStorage persistence", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", makeStore());
  });

  it("returns null when nothing is stored", () => {
    expect(loadStoredPlan()).toBeNull();
  });

  it("saves and loads a plan round-trip", () => {
    saveStoredPlan(validPlan);
    const loaded = loadStoredPlan();
    expect(loaded).toEqual(validPlan);
  });

  it("stores the plan under the dedicated versioned key", () => {
    saveStoredPlan(validPlan);
    expect(window.localStorage.getItem(PLAN_STORAGE_KEY)).not.toBeNull();
  });

  it("returns null for corrupted stored data instead of throwing", () => {
    window.localStorage.setItem(PLAN_STORAGE_KEY, "not json at all");
    expect(loadStoredPlan()).toBeNull();
  });

  it("clears the stored plan", () => {
    saveStoredPlan(validPlan);
    clearStoredPlan();
    expect(loadStoredPlan()).toBeNull();
  });

  it("does not throw when localStorage.setItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(() => {
        throw new Error("quota exceeded");
      }),
      removeItem: vi.fn(),
    });
    expect(() => saveStoredPlan(validPlan)).not.toThrow();
  });

  it("does not throw when localStorage.getItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => {
        throw new Error("blocked");
      }),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    expect(() => loadStoredPlan()).not.toThrow();
    expect(loadStoredPlan()).toBeNull();
  });

  it("does not throw when localStorage.removeItem throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(() => {
        throw new Error("blocked");
      }),
    });
    expect(() => clearStoredPlan()).not.toThrow();
  });
});
