export type Locale = "en-GB" | "en-US";

export type QuickStartInput = {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualIncome: number;
};

export type Assumptions = {
  inflationRate: number; // e.g. 0.025 for 2.5%
  investmentReturn: number; // e.g. 0.05 for 5%
  lifeExpectancy: number; // age
  statePensionAge: number; // age
  annualStatePension: number; // annual amount in locale currency
  annualContributionRate: number; // fraction of income e.g. 0.10
  incomeReplacementRatio: number; // fraction of pre-retirement income e.g. 0.667
  locale: Locale;
};

export type ProjectionDataPoint = {
  age: number;
  balance: number;
  isRetired: boolean;
  hasStatePension: boolean;
};

/** Preset income stream categories used as display hints. */
export type IncomeStreamType =
  | "private-pension"
  | "rental"
  | "side-business"
  | "annuity"
  | "part-time"
  | "other";

/** A single employment income source (one job / contract). */
export type EmploymentIncome = {
  id: string;
  name: string;
  annualGrossSalary: number;
  annualRaiseRate: number; // fraction e.g. 0.03 for 3%
  startAge: number;
  endAge: number;
  isPreTax: boolean;
  enabled: boolean;
};

/** UK State Pension configuration for a plan. */
export type StatePensionConfig = {
  niQualifyingYears: number; // 0–35+
  deferralYears: number;     // 0 = take at state pension age
  enabled: boolean;
};

/** A non-employment income stream (rental, annuity, private pension, etc.). */
export type IncomeStream = {
  id: string;
  name: string;
  type: IncomeStreamType;
  annualAmount: number;
  startAge: number;
  endAge: number | null; // null = no end age
  growthRate: number;    // fraction e.g. 0.02 for 2%
  enabled: boolean;
};

export type Plan = {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  input: QuickStartInput | null;
  assumptions: Assumptions;
  employmentIncomes: EmploymentIncome[];
  statePensionConfig: StatePensionConfig;
  incomeStreams: IncomeStream[];
};
