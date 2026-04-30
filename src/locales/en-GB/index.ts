const enGB = {
  appTitle: "Financial Planner",
  appSubtitle: "UK-first retirement planning — private, client-side, free.",

  quickStart: {
    title: "Quick-Start Projection",
    subtitle: "Enter a few details and see your retirement projection in seconds.",
    currentAge: "Current Age",
    retirementAge: "Target Retirement Age",
    lifeExpectancy: "Life Expectancy",
    currentSavings: "Current Savings / Pension Pot",
    annualIncome: "Annual Gross Income",
    currentAgeHint: "Your age today",
    retirementAgeHint: "Age at which you plan to stop working",
    lifeExpectancyHint: "How long your money needs to last",
    currentSavingsHint: "Total across all pensions, ISAs and savings",
    annualIncomeHint: "Your total gross income before tax",
    currencyPrefix: "£",
    submit: "Show My Projection",
    editInputs: "Edit Inputs",
    makeMoreAccurate: "Make this more accurate",
    errors: {
      required: "Required",
      minAge: "Must be at least 18",
      maxAge: "Must be under 100",
      retirementAfterCurrent: "Must be after your current age",
      lifeExpectancyAfterRetirement: "Must be after your retirement age",
      minSavings: "Cannot be negative",
      minIncome: "Must be greater than 0",
    },
  },

  assumptions: {
    title: "Assumptions",
    inflationRate: "Inflation Rate",
    inflationRateTooltip:
      "General price inflation used to calculate real returns. UK CPI target is 2.5%.",
    investmentReturn: "Investment Return",
    investmentReturnTooltip:
      "Expected annual real return (after inflation) on your portfolio. A diversified global index typically returns 5–7% real over the long run.",
    incomeReplacementRatio: "Income Replacement",
    incomeReplacementRatioTooltip:
      "Share of pre-retirement income you expect to need each year in retirement. A common planning range is 50–80%.",
    lifeExpectancy: "Life Expectancy",
    lifeExpectancyTooltip:
      "The age to which your plan projects. Planning to 90 gives a safety buffer against living longer than average.",
    resetToDefaults: "Reset to defaults",
    locale: "Locale",
    localeTooltip: "Currency and date format. UK uses GBP (£); US uses USD ($).",
  },

  plans: {
    title: "My Plans",
    newPlan: "New Plan",
    rename: "Rename",
    duplicate: "Duplicate",
    delete: "Delete",
    confirmDelete: "Confirm Delete",
    cancelDelete: "Cancel",
    defaultName: "My Plan",
    duplicateSuffix: "(copy)",
    renamePlaceholder: "Plan name",
  },

  chart: {
    balance: "Portfolio Balance",
    retirementLine: "Retirement",
    statePensionLine: "State Pension",
    fundingSufficient: "On track — your savings should last to",
    fundingInsufficient: "At risk — your savings may run out before",
    ageLabel: "Age",
  },
} as const;

export default enGB;
export type LocaleStrings = typeof enGB;
