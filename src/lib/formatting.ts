import type { Currency, Locale } from "@/types";

/**
 * Format a monetary value using `Intl.NumberFormat`. Currency is always
 * explicit — never inferred or hardcoded as "£"/"$" (spec: "Use locale-aware
 * `Intl.NumberFormat` only through shared formatting helpers").
 */
export function formatCurrency(
  value: number,
  currency: Currency,
  locale: Locale = "en-GB",
  maximumFractionDigits = 0,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);
}

/** Format a monetary value in compact notation (e.g. £1.2M, $340K). */
export function formatCurrencyCompact(
  value: number,
  currency: Currency,
  locale: Locale = "en-GB",
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: "compact",
    maximumSignificantDigits: 3,
  }).format(value);
}

/** Format a decimal fraction as a percentage string (e.g. 0.025 -> "2.5%"). */
export function formatPercentage(
  value: number,
  locale: Locale = "en-GB",
  decimalPlaces = 1,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(value);
}

/** Format a plain integer or decimal number. */
export function formatNumber(
  value: number,
  locale: Locale = "en-GB",
  maximumFractionDigits = 0,
): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits,
  }).format(value);
}

/** Format an ISO 8601 date/time string for display (e.g. "09 Aug 2026"). */
export function formatDate(
  isoDateTime: string,
  locale: Locale = "en-GB",
): string {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}
