import { describe, it, expect } from "vitest";
import {
  createPlan,
  deserializePlans,
  duplicatePlan,
  isPlan,
  serializePlans,
  updatePlan,
} from "./plans";
import { DEFAULT_STATE_PENSION_CONFIG, UK_DEFAULTS } from "./defaults";

describe("createPlan", () => {
  it("creates a plan with the given name", () => {
    const plan = createPlan("Test Plan");
    expect(plan.name).toBe("Test Plan");
  });

  it("generates a unique id", () => {
    const a = createPlan("A");
    const b = createPlan("B");
    expect(a.id).not.toBe(b.id);
  });

  it("sets createdAt and updatedAt to ISO strings", () => {
    const plan = createPlan("C");
    expect(() => new Date(plan.createdAt)).not.toThrow();
    expect(() => new Date(plan.updatedAt)).not.toThrow();
  });

  it("uses UK defaults when no assumptions provided", () => {
    const plan = createPlan("D");
    expect(plan.assumptions.locale).toBe("en-GB");
    expect(plan.assumptions.inflationRate).toBe(UK_DEFAULTS.inflationRate);
  });

  it("accepts custom assumptions", () => {
    const plan = createPlan("E", { ...UK_DEFAULTS, investmentReturn: 0.07 });
    expect(plan.assumptions.investmentReturn).toBe(0.07);
  });

  it("initialises employmentIncomes as an empty array", () => {
    expect(createPlan("F").employmentIncomes).toEqual([]);
  });

  it("initialises incomeStreams as an empty array", () => {
    expect(createPlan("G").incomeStreams).toEqual([]);
  });

  it("initialises statePensionConfig with DEFAULT_STATE_PENSION_CONFIG", () => {
    expect(createPlan("H").statePensionConfig).toEqual(DEFAULT_STATE_PENSION_CONFIG);
  });
});

describe("updatePlan", () => {
  it("updates name and bumps updatedAt", async () => {
    const plan = createPlan("Original");
    const before = plan.updatedAt;
    await new Promise((r) => setTimeout(r, 5));
    const updated = updatePlan(plan, { name: "Renamed" });
    expect(updated.name).toBe("Renamed");
    expect(updated.updatedAt).not.toBe(before);
    expect(updated.id).toBe(plan.id);
    expect(updated.createdAt).toBe(plan.createdAt);
  });
});

describe("duplicatePlan", () => {
  it("creates a copy with a new id and new name", () => {
    const plan = createPlan("Original");
    const copy = duplicatePlan(plan, "Copy");
    expect(copy.id).not.toBe(plan.id);
    expect(copy.name).toBe("Copy");
    expect(copy.assumptions).toEqual(plan.assumptions);
  });

  it("copies income stream fields to the duplicate", () => {
    const plan = createPlan("Original");
    const copy = duplicatePlan(plan, "Copy");
    expect(copy.employmentIncomes).toEqual(plan.employmentIncomes);
    expect(copy.statePensionConfig).toEqual(plan.statePensionConfig);
    expect(copy.incomeStreams).toEqual(plan.incomeStreams);
  });
});

describe("serializePlans / deserializePlans", () => {
  it("round-trips an array of plans", () => {
    const plans = [createPlan("A"), createPlan("B")];
    const raw = serializePlans(plans);
    const restored = deserializePlans(raw);
    expect(restored).toHaveLength(2);
    expect(restored[0].name).toBe("A");
  });

  it("returns empty array for invalid JSON", () => {
    expect(deserializePlans("not-json")).toHaveLength(0);
  });

  it("returns empty array for non-array JSON", () => {
    expect(deserializePlans('"string"')).toHaveLength(0);
  });

  it("filters out malformed objects", () => {
    const raw = JSON.stringify([{ foo: "bar" }, createPlan("Valid")]);
    const result = deserializePlans(raw);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Valid");
  });

  it("restores default assumptions for saved plans missing newer fields", () => {
    const plan = createPlan("Legacy");
    const legacyAssumptions: Partial<typeof plan.assumptions> = {
      ...plan.assumptions,
    };
    delete legacyAssumptions.incomeReplacementRatio;
    const raw = JSON.stringify([
      {
        ...plan,
        assumptions: legacyAssumptions,
      },
    ]);

    const result = deserializePlans(raw);

    expect(result[0].assumptions.incomeReplacementRatio).toBe(
      UK_DEFAULTS.incomeReplacementRatio,
    );
  });

  it("migrates legacy plans that predate Epic 2 income stream fields", () => {
    // Simulate a plan saved before Epic 2 — no income stream fields
    const legacyPlan = {
      id: "legacy-1",
      name: "Legacy Plan",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
      input: null,
      assumptions: { ...UK_DEFAULTS },
    };

    const raw = JSON.stringify([legacyPlan]);
    const result = deserializePlans(raw);

    expect(result).toHaveLength(1);
    expect(result[0].employmentIncomes).toEqual([]);
    expect(result[0].incomeStreams).toEqual([]);
    expect(result[0].statePensionConfig).toEqual(DEFAULT_STATE_PENSION_CONFIG);
  });

  it("preserves existing Epic 2 fields when deserialising a modern plan", () => {
    const plan = createPlan("With Income");
    const modifiedPlan = {
      ...plan,
      statePensionConfig: { niQualifyingYears: 20, deferralYears: 2, enabled: true },
    };

    const raw = JSON.stringify([modifiedPlan]);
    const result = deserializePlans(raw);

    expect(result[0].statePensionConfig.niQualifyingYears).toBe(20);
    expect(result[0].statePensionConfig.deferralYears).toBe(2);
    expect(result[0].statePensionConfig.enabled).toBe(true);
  });
});

describe("isPlan", () => {
  it("returns true for a valid plan", () => {
    expect(isPlan(createPlan("X"))).toBe(true);
  });

  it("returns false for null", () => {
    expect(isPlan(null)).toBe(false);
  });

  it("returns false for a plain object missing required fields", () => {
    expect(isPlan({ id: 123 })).toBe(false);
  });
});
