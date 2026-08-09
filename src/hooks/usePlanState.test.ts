import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePlanState } from "./usePlanState";
import { PLAN_STORAGE_KEY } from "@/lib/plan-storage";
import { serializePlanEnvelope } from "@/lib/plan-storage";
import { createExamplePlan } from "@/lib/example-plan";

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
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", makeStore());
});

describe("usePlanState", () => {
  it("initialises with the example plan when nothing is stored", () => {
    const { result } = renderHook(() => usePlanState());
    expect(result.current.plan.profile.yearsUKResident).toBe(8);
    expect(result.current.plan.accounts.length).toBeGreaterThan(0);
  });

  it("loads a previously stored valid plan", () => {
    const stored = createExamplePlan();
    stored.profile.currentAge = 50;
    window.localStorage.setItem(
      PLAN_STORAGE_KEY,
      serializePlanEnvelope(stored),
    );
    const { result } = renderHook(() => usePlanState());
    expect(result.current.plan.profile.currentAge).toBe(50);
  });

  it("persists changes to localStorage", () => {
    const { result } = renderHook(() => usePlanState());
    act(() => {
      result.current.updatePlan((prev) => ({
        ...prev,
        profile: { ...prev.profile, currentAge: 40 },
      }));
    });
    const stored = window.localStorage.getItem(PLAN_STORAGE_KEY);
    expect(stored).toContain('"currentAge": 40');
  });

  it("adds, updates, and removes an account", () => {
    const { result } = renderHook(() => usePlanState());
    const initialCount = result.current.plan.accounts.length;

    act(() => result.current.addAccount());
    expect(result.current.plan.accounts).toHaveLength(initialCount + 1);
    const newAccount =
      result.current.plan.accounts[result.current.plan.accounts.length - 1];

    act(() => result.current.updateAccount(newAccount.id, { name: "Renamed" }));
    expect(
      result.current.plan.accounts.find((a) => a.id === newAccount.id)?.name,
    ).toBe("Renamed");

    act(() => result.current.removeAccount(newAccount.id));
    expect(result.current.plan.accounts).toHaveLength(initialCount);
  });

  it("adds, updates, and removes a goal", () => {
    const { result } = renderHook(() => usePlanState());
    const initialCount = result.current.plan.goals.length;

    act(() => result.current.addGoal());
    expect(result.current.plan.goals).toHaveLength(initialCount + 1);
    const newGoal =
      result.current.plan.goals[result.current.plan.goals.length - 1];

    act(() => result.current.updateGoal(newGoal.id, { amount: 5000 }));
    expect(
      result.current.plan.goals.find((g) => g.id === newGoal.id)?.amount,
    ).toBe(5000);

    act(() => result.current.removeGoal(newGoal.id));
    expect(result.current.plan.goals).toHaveLength(initialCount);
  });

  it("adds, updates, and removes a benefit", () => {
    const { result } = renderHook(() => usePlanState());
    const initialCount = result.current.plan.benefits.length;

    act(() => result.current.addBenefit());
    expect(result.current.plan.benefits).toHaveLength(initialCount + 1);
    const newBenefit =
      result.current.plan.benefits[result.current.plan.benefits.length - 1];

    act(() =>
      result.current.updateBenefit(newBenefit.id, { annualAmount: 9000 }),
    );
    expect(
      result.current.plan.benefits.find((b) => b.id === newBenefit.id)
        ?.annualAmount,
    ).toBe(9000);

    act(() => result.current.removeBenefit(newBenefit.id));
    expect(result.current.plan.benefits).toHaveLength(initialCount);
  });

  it("exports the current plan as a parseable JSON envelope", () => {
    const { result } = renderHook(() => usePlanState());
    const json = result.current.exportPlanJson();
    const parsed = JSON.parse(json);
    expect(parsed.plan).toEqual(result.current.plan);
  });

  it("imports a valid plan and replaces the current plan", () => {
    const { result } = renderHook(() => usePlanState());
    const other = createExamplePlan();
    other.profile.currentAge = 44;
    const json = serializePlanEnvelope(other);

    let importResult: { ok: true } | { ok: false; error: string } = {
      ok: false,
      error: "",
    };
    act(() => {
      importResult = result.current.importPlanJson(json);
    });
    expect(importResult.ok).toBe(true);
    expect(result.current.plan.profile.currentAge).toBe(44);
  });

  it("rejects an invalid import without mutating the current plan", () => {
    const { result } = renderHook(() => usePlanState());
    const before = result.current.plan;

    let importResult: { ok: true } | { ok: false; error: string } = {
      ok: true,
    };
    act(() => {
      importResult = result.current.importPlanJson("not json");
    });
    expect(importResult.ok).toBe(false);
    expect(result.current.plan).toEqual(before);
  });

  it("resets to a fresh example plan and clears storage", () => {
    const { result } = renderHook(() => usePlanState());
    act(() =>
      result.current.updatePlan((prev) => ({
        ...prev,
        profile: { ...prev.profile, currentAge: 99 },
      })),
    );
    act(() => result.current.resetToExample());
    expect(result.current.plan.profile.currentAge).toBe(
      createExamplePlan().profile.currentAge,
    );
  });
});
