import { describe, it, expect } from "vitest";
import {
  convertToReportingCurrency,
  normalizeAmount,
  normalizeGbpPerUsd,
  normalizeRate,
} from "./currency";

describe("normalizeAmount", () => {
  it("returns the value unchanged when finite and non-negative", () => {
    expect(normalizeAmount(1234.5)).toBe(1234.5);
  });

  it("treats negative values as zero", () => {
    expect(normalizeAmount(-50)).toBe(0);
  });

  it("treats NaN as zero", () => {
    expect(normalizeAmount(NaN)).toBe(0);
  });

  it("treats Infinity as zero", () => {
    expect(normalizeAmount(Infinity)).toBe(0);
  });

  it("allows zero", () => {
    expect(normalizeAmount(0)).toBe(0);
  });
});

describe("normalizeRate", () => {
  it("returns the value unchanged when within bounds", () => {
    expect(normalizeRate(0.05)).toBe(0.05);
  });

  it("floors non-finite values to zero", () => {
    expect(normalizeRate(NaN)).toBe(0);
  });

  it("caps values above the maximum", () => {
    expect(normalizeRate(5, -1, 1)).toBe(1);
  });

  it("floors values below the minimum", () => {
    expect(normalizeRate(-5, -1, 1)).toBe(-1);
  });
});

describe("normalizeGbpPerUsd", () => {
  it("returns the rate unchanged when positive and finite", () => {
    expect(normalizeGbpPerUsd(0.79)).toBe(0.79);
  });

  it("falls back to 1 for zero", () => {
    expect(normalizeGbpPerUsd(0)).toBe(1);
  });

  it("falls back to 1 for negative values", () => {
    expect(normalizeGbpPerUsd(-0.5)).toBe(1);
  });

  it("falls back to 1 for non-finite values", () => {
    expect(normalizeGbpPerUsd(NaN)).toBe(1);
  });
});

describe("convertToReportingCurrency", () => {
  it("returns the amount unchanged when currencies match", () => {
    expect(convertToReportingCurrency(100, "GBP", "GBP", 0.79)).toBe(100);
  });

  it("converts USD to GBP using the supplied rate", () => {
    expect(convertToReportingCurrency(100, "USD", "GBP", 0.8)).toBeCloseTo(80);
  });

  it("converts GBP to USD using the inverse of the supplied rate", () => {
    expect(convertToReportingCurrency(80, "GBP", "USD", 0.8)).toBeCloseTo(100);
  });

  it("falls back to a rate of 1 when the supplied rate is invalid", () => {
    expect(convertToReportingCurrency(100, "USD", "GBP", -1)).toBe(100);
  });

  it("normalizes a negative source amount to zero before converting", () => {
    expect(convertToReportingCurrency(-50, "USD", "GBP", 0.8)).toBe(0);
  });
});
