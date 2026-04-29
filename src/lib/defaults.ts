import type { Assumptions } from "@/types";

/** UK-first default assumptions (2024/25 tax year values). */
export const UK_DEFAULTS = {
  inflationRate: 0.025, // Bank of England 2.5% CPI target
  investmentReturn: 0.05, // 5% real return (post-inflation)
  lifeExpectancy: 90,
  statePensionAge: 67,
  /** Full new State Pension 2024/25: £11,502/yr */
  annualStatePension: 11502,
  annualContributionRate: 0.1, // 10% of gross income default
  incomeReplacementRatio: 2 / 3, // 66.7% of pre-retirement income default
  locale: "en-GB" as const,
} satisfies Omit<Assumptions, never>;
