import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCurrencyCompact,
  formatNumber,
  formatPercentage,
} from "./formatting";

describe("formatCurrency", () => {
  it("formats GBP by default", () => {
    expect(formatCurrency(1000)).toBe("£1,000");
  });

  it("formats USD for en-US locale", () => {
    const result = formatCurrency(1000, "en-US");
    expect(result).toContain("1,000");
    expect(result).toContain("$");
  });

  it("returns — for NaN", () => {
    expect(formatCurrency(NaN)).toBe("—");
  });

  it("returns — for Infinity", () => {
    expect(formatCurrency(Infinity)).toBe("—");
  });

  it("handles zero", () => {
    expect(formatCurrency(0)).toBe("£0");
  });
});

describe("formatCurrencyCompact", () => {
  it("formats large GBP values in compact notation", () => {
    const result = formatCurrencyCompact(1_200_000);
    expect(result).toMatch(/1\.2[mM]|1\.2 [mM]/);
    expect(result).toContain("£");
  });

  it("returns — for non-finite values", () => {
    expect(formatCurrencyCompact(NaN)).toBe("—");
  });
});

describe("formatPercentage", () => {
  it("formats 0.025 as 2.5%", () => {
    expect(formatPercentage(0.025)).toBe("2.5%");
  });

  it("formats 0 as 0.0%", () => {
    expect(formatPercentage(0)).toBe("0.0%");
  });

  it("returns — for NaN", () => {
    expect(formatPercentage(NaN)).toBe("—");
  });
});

describe("formatNumber", () => {
  it("formats large integers with commas", () => {
    expect(formatNumber(1_000_000)).toBe("1,000,000");
  });

  it("respects maximumFractionDigits", () => {
    expect(formatNumber(1.2345, "en-GB", 2)).toBe("1.23");
  });

  it("returns — for Infinity", () => {
    expect(formatNumber(Infinity)).toBe("—");
  });
});
