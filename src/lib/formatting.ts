import type { Locale } from "@/types";

/**
 * Format a monetary value using the given locale and currency.
 * Never hardcodes "£" or "$" — always delegates to Intl.
 */
export function formatCurrency(
  value: number,
  locale: Locale = "en-GB",
  currency = locale === "en-GB" ? "GBP" : "USD",
): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format a monetary value in compact notation (e.g. £1.2M, £340K).
 */
export function formatCurrencyCompact(
  value: number,
  locale: Locale = "en-GB",
  currency = locale === "en-GB" ? "GBP" : "USD",
): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(value);
}

/**
 * Format a decimal as a percentage string (e.g. 0.025 → "2.5%").
 */
export function formatPercentage(
  value: number,
  locale: Locale = "en-GB",
  decimalPlaces = 1,
): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/**
 * Format a plain integer or decimal number.
 */
export function formatNumber(
  value: number,
  locale: Locale = "en-GB",
  maximumFractionDigits = 0,
): string {
  if (!isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
}
