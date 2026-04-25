import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAssumptions } from "../useAssumptions";
import { UK_DEFAULTS } from "@/lib/defaults";

describe("useAssumptions", () => {
  it("initialises with UK defaults", () => {
    const { result } = renderHook(() => useAssumptions());
    expect(result.current.assumptions.inflationRate).toBe(UK_DEFAULTS.inflationRate);
    expect(result.current.assumptions.locale).toBe("en-GB");
  });

  it("updateAssumption changes a single key", () => {
    const { result } = renderHook(() => useAssumptions());
    act(() => result.current.updateAssumption("investmentReturn", 0.07));
    expect(result.current.assumptions.investmentReturn).toBe(0.07);
    expect(result.current.assumptions.inflationRate).toBe(UK_DEFAULTS.inflationRate);
  });

  it("setAssumptions replaces all assumptions", () => {
    const { result } = renderHook(() => useAssumptions());
    const custom = { ...UK_DEFAULTS, investmentReturn: 0.08, lifeExpectancy: 95 };
    act(() => result.current.setAssumptions(custom));
    expect(result.current.assumptions.investmentReturn).toBe(0.08);
    expect(result.current.assumptions.lifeExpectancy).toBe(95);
  });

  it("resetToDefaults restores UK defaults", () => {
    const { result } = renderHook(() => useAssumptions());
    act(() => result.current.updateAssumption("investmentReturn", 0.99));
    act(() => result.current.resetToDefaults());
    expect(result.current.assumptions.investmentReturn).toBe(UK_DEFAULTS.investmentReturn);
  });
});
