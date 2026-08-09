/**
 * UK English interface copy (default locale). US product and filing names
 * (401(k), IRA, Social Security, PFIC, FBAR) are retained regardless of
 * interface language, per spec: "All default interface copy uses UK English
 * while retaining US product and filing names."
 */
const enGB = {
  appTitle: "Financial Planner",
  appSubtitle: "US–UK cross-border planning — private, client-side, free.",
  privacyBadge: "Stored only in this browser",
  educationalBadge: "Educational estimates, not advice",
  skipToContent: "Skip to main content",

  nav: {
    dashboard: "Dashboard",
    profile: "Profile",
    cashFlow: "Cash flow",
    accounts: "Accounts",
    goals: "Future goals",
    benefits: "Retirement benefits",
    assumptions: "Assumptions",
    guide: "Cross-border guide",
    data: "Import & export",
  },

  dashboard: {
    title: "Dashboard",
    netWorth: "Net worth",
    annualSavings: "Annual savings",
    retirementTargetAge: "Target retirement age",
    successProbability: "Plan success probability",
    balanceAtRetirement: "Projected balance at retirement",
    noAccounts: "Add an account below to see your plan take shape.",
  },

  chart: {
    title: "Balance over time",
    ageLabel: "Age",
    balanceLabel: "Balance",
    deterministic: "Deterministic balance",
    p10: "10th percentile",
    p50: "50th percentile (median)",
    p90: "90th percentile range",
    nominal: "Nominal terms",
    today: "Today's money",
    viewLabel: "Show values in",
    retirementLine: "Retirement",
    summaryHeading: "Text summary of the chart",
    summaryIntro:
      "For screen-reader and text-only reference, the same data shown in the chart above:",
  },

  insights: {
    title: "Things worth a closer look",
    empty: "No notable observations for this plan right now.",
    considerationsHeading: "Cross-border considerations",
  },

  profile: {
    title: "Profile",
    currentAge: "Current age",
    retirementAge: "Planned retirement age",
    planningAge: "Planning age",
    yearsUKResident: "Years resident in the UK",
    reportingCurrency: "Reporting currency",
    hints: {
      currentAge: "Your age today.",
      retirementAge:
        "The age you plan to stop earned income and contributions.",
      planningAge:
        "The age your plan should provide for — the projection runs to this age.",
      yearsUKResident:
        "Used only for the UK long-term-residence educational milestone in the cross-border guide.",
      reportingCurrency:
        "Changes display conversion only — it never rewrites stored account currencies.",
    },
    errors: {
      order:
        "Current age must be less than retirement age, which must be at or before planning age.",
      span: "The plan cannot span more than 100 years.",
    },
  },

  cashFlow: {
    title: "Cash flow",
    takeHomeIncome: "Take-home income",
    takeHomeIncomeHint: "Annual income after tax and payroll deductions.",
    currentSpending: "Current living costs",
    currentSpendingHint:
      "Annual living costs today, excluding account contributions.",
    retirementSpending: "Retirement spending",
    retirementSpendingHint:
      "Annual spending from retirement, in today's money.",
    amount: "Annual amount",
    currency: "Currency",
  },

  accounts: {
    title: "Accounts",
    add: "Add account",
    remove: "Remove account",
    removeConfirm: "Remove this account? This cannot be undone.",
    name: "Name",
    type: "Type",
    currency: "Currency",
    balance: "Current balance",
    annualContribution: "Annual contribution",
    expectedReturn: "Expected annual return",
    empty: "No accounts yet — add your first account to start projecting.",
    considerationLabel: "Cross-border consideration",
    types: {
      cash: "Cash",
      "uk-workplace-pension": "UK workplace pension",
      "uk-sipp": "SIPP",
      "uk-isa": "ISA",
      "uk-taxable": "UK taxable / GIA",
      "us-401k": "US 401(k)",
      "us-traditional-ira": "US traditional IRA",
      "us-roth-ira": "US Roth IRA",
      "us-taxable-brokerage": "US taxable brokerage",
      property: "Property",
      other: "Other",
    },
  },

  goals: {
    title: "Future goals",
    add: "Add goal",
    remove: "Remove goal",
    removeConfirm: "Remove this goal? This cannot be undone.",
    name: "Name",
    age: "Age",
    amount: "Amount",
    currency: "Currency",
    kind: "Direction",
    kinds: { expense: "Expense", income: "Income" },
    empty: "No one-off goals yet — add a future expense or windfall.",
  },

  benefits: {
    title: "Retirement benefits",
    name: "Name",
    kind: "Type",
    kinds: {
      "uk-state-pension": "UK State Pension",
      "us-social-security": "US Social Security",
      other: "Other benefit",
    },
    enabled: "Included in projection",
    startAge: "Start age",
    annualAmount: "Annual amount",
    currency: "Currency",
    growthRate: "Annual growth rate",
    add: "Add benefit",
    remove: "Remove benefit",
    removeConfirm: "Remove this benefit? This cannot be undone.",
    empty:
      "No benefits configured — add UK State Pension or US Social Security estimates.",
  },

  assumptions: {
    title: "Assumptions",
    inflationRate: "Inflation rate",
    inflationRateHint:
      "Annual price inflation used to index spending and benefits.",
    returnVolatility: "Return volatility",
    returnVolatilityHint:
      "Annual standard deviation used by the Monte Carlo simulation (0–60%).",
    gbpPerUsd: "GBP per USD",
    gbpPerUsdHint: "Your assumed exchange rate: how many GBP for one USD.",
    simulationRuns: "Simulation paths",
    simulationRunsHint: "Number of Monte Carlo paths to run (500–5,000).",
  },

  guide: {
    title: "Cross-border guide",
    intro:
      "Educational starting points for common US–UK cross-border questions, each with a primary source. This is not personalised advice — cross-border rules are fact-specific and change frequently.",
    milestoneHeading: "Your UK long-term-residence milestone",
    milestoneBody:
      "Under rules effective 6 April 2025, UK inheritance tax can apply based on UK residence in 10 of the prior 20 tax years, rather than domicile. This is an educational flag, not a determination of your status.",
    milestoneYearsLabel: "years UK-resident entered",
    milestoneReached:
      "You have entered 10 or more years of UK residence — this milestone may be relevant to you.",
    milestoneNotReached: "You have not yet entered 10 years of UK residence.",
    sections: [
      {
        id: "worldwide-filing",
        heading: "Worldwide US filing obligations",
        body: "US citizens and green card holders generally must file a US federal tax return on worldwide income, wherever they live, alongside any UK filing obligations.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "IRS — US citizens and resident aliens abroad",
            href: "https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad",
          },
          {
            label: "GOV.UK — Tax on foreign income and UK residence",
            href: "https://www.gov.uk/tax-foreign-income/residence",
          },
        ],
      },
      {
        id: "fbar-fatca",
        heading: "FBAR and FATCA reporting",
        body: "Foreign financial accounts above reporting thresholds may need to be disclosed via FinCEN's FBAR (FinCEN Form 114) and/or IRS Form 8938 under FATCA. The two regimes have different thresholds and forms.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "FinCEN — Report of Foreign Bank and Financial Accounts",
            href: "https://www.fincen.gov/report-foreign-bank-and-financial-accounts",
          },
          {
            label: "IRS — Form 8938 and FBAR comparison",
            href: "https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements",
          },
        ],
      },
      {
        id: "pfic",
        heading: "PFIC — Passive Foreign Investment Companies",
        body: "Many non-US-domiciled pooled funds (including many UK funds and ISAs) can be treated as PFICs for US tax purposes, with complex and often unfavourable reporting and taxation. This application never decides whether a specific holding is a PFIC.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "IRS — United Kingdom tax treaty documents",
            href: "https://www.irs.gov/businesses/international-businesses/united-kingdom-uk-tax-treaty-documents",
          },
        ],
      },
      {
        id: "pension-treatment",
        heading: "UK/US pension treatment",
        body: "The US–UK tax treaty addresses some aspects of cross-border pension treatment, but rules differ by pension type and can require specific elections or disclosures.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "IRS — United Kingdom tax treaty documents",
            href: "https://www.irs.gov/businesses/international-businesses/united-kingdom-uk-tax-treaty-documents",
          },
          {
            label: "GOV.UK — Pension scheme rates and allowances",
            href: "https://www.gov.uk/government/publications/rates-and-allowances-pension-schemes",
          },
        ],
      },
      {
        id: "totalisation",
        heading: "Social Security totalisation",
        body: "The US–UK social security agreement can help coordinate contribution history between the two systems so that periods of work in each country can count toward benefit eligibility.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "SSA — US–UK social security agreement",
            href: "https://www.ssa.gov/international/Agreement_Pamphlets/uk.html",
          },
          {
            label: "GOV.UK — The new State Pension",
            href: "https://www.gov.uk/new-state-pension/what-youll-get",
          },
        ],
      },
      {
        id: "uk-ltr",
        heading: "UK inheritance tax: long-term-residence milestone",
        body: "Since 6 April 2025, UK inheritance tax exposure on worldwide assets can be triggered by having been UK-resident for at least 10 of the previous 20 tax years, replacing the previous domicile-based test.",
        asOf: "as of 9 August 2026",
        links: [
          {
            label: "GOV.UK — Tax on foreign income and UK residence",
            href: "https://www.gov.uk/tax-foreign-income/residence",
          },
        ],
      },
    ],
  },

  disclaimer: {
    label: "Important disclaimer",
    text: "This tool provides general educational estimates only. It is not tax, legal, investment, or financial advice. Cross-border rules are complex, fact-specific, and change frequently. Consult suitably qualified US and UK professionals before making financial, tax, or investment decisions. Your plan is stored only in this browser unless you export it.",
    openLabel: "Read full disclaimer",
  },

  data: {
    title: "Your data",
    export: "Export plan as JSON",
    import: "Import plan from JSON",
    reset: "Reset to example plan",
    sensitivityWarning:
      "Exported files contain your full financial plan. Treat exported and imported files as sensitive personal data.",
    confirmResetTitle: "Reset to the example plan?",
    confirmResetBody:
      "This replaces your current plan with the example plan. Export your current plan first if you want to keep it.",
    confirmImportTitle: "Replace your current plan?",
    confirmImportBody:
      "Importing this file will replace your current plan. Export your current plan first if you want to keep it.",
    importSuccess: "Plan imported successfully.",
    importErrorPrefix: "Import failed: ",
    confirm: "Confirm",
    cancel: "Cancel",
    noTransmission:
      "No plan data is transmitted anywhere and no analytics are loaded.",
  },

  common: {
    close: "Close",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
  },

  errors: {
    required: "Required",
    invalidNumber: "Enter a valid number",
    negativeNotAllowed: "Must be zero or greater",
  },
} as const;

export default enGB;
export type LocaleStrings = typeof enGB;
