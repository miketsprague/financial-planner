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
  locale: Locale;
};

export type ProjectionDataPoint = {
  age: number;
  balance: number;
  isRetired: boolean;
  hasStatePension: boolean;
};

export type Plan = {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  input: QuickStartInput | null;
  assumptions: Assumptions;
};
