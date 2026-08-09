import { describe, it, expect } from "vitest";
import { createExamplePlan, generateId } from "./example-plan";
import { isValidPlan } from "./plan-storage";
import { isValidProjectionProfile } from "./calculations";

describe("createExamplePlan", () => {
  it("produces a structurally valid plan", () => {
    expect(isValidPlan(createExamplePlan())).toBe(true);
  });

  it("produces a valid projection profile", () => {
    expect(isValidProjectionProfile(createExamplePlan().profile)).toBe(true);
  });

  it("represents a mid-thirties US citizen who has lived in the UK for eight years", () => {
    const plan = createExamplePlan();
    expect(plan.profile.currentAge).toBeGreaterThanOrEqual(30);
    expect(plan.profile.currentAge).toBeLessThanOrEqual(39);
    expect(plan.profile.yearsUKResident).toBe(8);
  });

  it("includes both UK and US account wrappers", () => {
    const plan = createExamplePlan();
    expect(plan.accounts.some((a) => a.type.startsWith("uk-"))).toBe(true);
    expect(plan.accounts.some((a) => a.type.startsWith("us-"))).toBe(true);
  });

  it("includes both UK State Pension and US Social Security benefits", () => {
    const plan = createExamplePlan();
    expect(plan.benefits.some((b) => b.kind === "uk-state-pension")).toBe(true);
    expect(plan.benefits.some((b) => b.kind === "us-social-security")).toBe(
      true,
    );
  });

  it("returns a fresh object on every call", () => {
    const a = createExamplePlan();
    const b = createExamplePlan();
    expect(a).not.toBe(b);
    expect(a.accounts).not.toBe(b.accounts);
  });
});

describe("generateId", () => {
  it("includes the supplied prefix", () => {
    expect(generateId("account")).toMatch(/^account-/);
  });

  it("generates different ids on successive calls", () => {
    expect(generateId("x")).not.toBe(generateId("x"));
  });
});
