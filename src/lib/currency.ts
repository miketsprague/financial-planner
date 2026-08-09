import type { Currency } from "@/types";

/**
 * Normalise a monetary amount: non-finite or negative values become zero
 * (spec: "Monetary inputs that are non-finite or negative are treated as
 * zero by calculations").
 */
export function normalizeAmount(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return value;
}

/**
 * Normalise a nominal annual rate (return, inflation, growth) to a bounded,
 * finite fraction so that compounding can never produce non-finite output.
 * Floors at -100% (a total account wipeout) and caps at +100% by default.
 */
export function normalizeRate(value: number, min = -1, max = 1): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(max, Math.max(min, value));
}

/**
 * Normalise the user-supplied GBP-per-USD conversion rate. A missing or
 * non-positive rate falls back to 1 rather than producing non-finite output.
 */
export function normalizeGbpPerUsd(rate: number): number {
  if (!Number.isFinite(rate) || rate <= 0) return 1;
  return rate;
}

/**
 * Convert a monetary amount into the reporting currency using the
 * user-supplied GBP-per-USD rate. When USD is the reporting currency the
 * inverse conversion is used. Changing the reporting currency never
 * mutates the stored source value — this is a pure, display-time transform
 * (acceptance criterion 5).
 */
export function convertToReportingCurrency(
  amount: number,
  currency: Currency,
  reportingCurrency: Currency,
  gbpPerUsd: number,
): number {
  const safeAmount = normalizeAmount(amount);
  if (currency === reportingCurrency) return safeAmount;

  const rate = normalizeGbpPerUsd(gbpPerUsd);
  if (currency === "USD" && reportingCurrency === "GBP")
    return safeAmount * rate;
  if (currency === "GBP" && reportingCurrency === "USD")
    return safeAmount / rate;
  return safeAmount;
}
