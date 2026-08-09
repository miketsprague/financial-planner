# US–UK Personal Financial Planner

**Status:** Ready — revised after independent adversarial review  
**Last fact-checked:** 9 August 2026

## Background

The current application offers a single-balance retirement projection but does not answer the
practical questions faced by a US citizen who lives and works in the UK. This rebuild prioritises a
useful personal planning workspace over process demonstrations.

Product research reviewed ProjectionLab, Boldin, Voyant, Timeline, Moneyhub, Monarch, Empower,
Actual Budget, and current US/UK government guidance. The useful patterns are:

- ProjectionLab's manual, private scenario modelling;
- Boldin's clear plan-health summary and guided next actions;
- Voyant and Timeline's whole-life cash-flow timeline and account-wrapper inventory;
- Monarch and Moneyhub's approachable net-worth and cash-flow dashboard;
- Actual Budget's local-first data ownership.

The planner is educational software, not a tax return, regulated recommendation, or replacement for
a cross-border professional.

### Primary references

- [IRS — US citizens and resident aliens abroad](https://www.irs.gov/individuals/international-taxpayers/us-citizens-and-resident-aliens-abroad)
- [IRS — Form 8938 and FBAR comparison](https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements)
- [FinCEN — Report of Foreign Bank and Financial Accounts](https://www.fincen.gov/report-foreign-bank-and-financial-accounts)
- [IRS — United Kingdom tax treaty documents](https://www.irs.gov/businesses/international-businesses/united-kingdom-uk-tax-treaty-documents)
- [SSA — US–UK social security agreement](https://www.ssa.gov/international/Agreement_Pamphlets/uk.html)
- [GOV.UK — Tax on foreign income and UK residence](https://www.gov.uk/tax-foreign-income/residence)
- [GOV.UK — The new State Pension](https://www.gov.uk/new-state-pension/what-youll-get)
- [GOV.UK — Pension scheme rates and allowances](https://www.gov.uk/government/publications/rates-and-allowances-pension-schemes)

## User Stories

1. As a US citizen living in the UK, I want all of my UK and US accounts in one private plan so
   that I can see my actual net worth without linking financial institutions.
2. As a planner, I want income, spending, contributions, benefits, and one-off goals represented on
   one timeline so that I can understand the causes of changes in my future balance.
3. As a person decades from retirement, I want both a baseline forecast and a range of uncertain
   outcomes so that a single assumed return does not create false confidence.
4. As someone with assets in two currencies, I want a user-controlled GBP/USD conversion assumption
   so that my plan has one consistent reporting currency.
5. As a US person abroad, I want prominent, sourced reminders about PFIC, FBAR, FATCA, pensions, and
   the UK long-term-residence threshold so that I know which questions require specialist advice.
6. As the owner of sensitive financial data, I want it stored only in my browser and portable as a
   JSON file so that I remain in control of it.
7. As a returning user, I want to adjust inputs directly from a dashboard and immediately see the
   forecast change so that scenario exploration is quick.

## Acceptance Criteria

1. The application opens with a usable example plan specialised for a mid-thirties US citizen who
   has lived in the UK for eight years; every value can be changed.
2. The plan records current age, planned retirement age, planning age, years resident in the UK,
   reporting currency, annual take-home income, current annual living costs, and retirement
   spending. Every cash-flow value has its own currency.
3. Users can add, edit, and remove accounts. Each account records a name, wrapper/type, currency,
   current balance, annual contribution, and expected nominal return.
4. Supported account types include cash, UK workplace pension, SIPP, ISA, UK taxable/GIA,
   US 401(k), traditional IRA, Roth IRA, US taxable brokerage, property, and other.
5. USD balances and flows are converted to GBP with an editable GBP-per-USD rate before aggregation.
   When USD is selected as the reporting currency, the inverse conversion is used. Changing the
   reporting currency changes display conversion only and never reinterprets or mutates stored
   source values.
6. Users can add, edit, and remove one-off future goals with a name, age, amount, currency, and
   expense/income direction.
7. UK State Pension and US Social Security are represented as separate optional income streams,
   each with a start age, annual amount, and currency.
8. The deterministic projection produces one point per age from current age through planning age,
   including starting balance, contributions, take-home income, living costs, goal flows, benefit
   income, investment growth, and ending balance.
9. Earned income and account contributions stop at retirement. Retirement spending applies from
   retirement age; current spending applies before retirement.
10. Before retirement, planned contributions allocate the available surplus
    (`take-home income - living costs`) among accounts. Contributions are capped proportionally at
    the available surplus and any unallocated surplus is added to the first cash account, or
    proportionally across accounts when there is no cash account. This prevents contributions from
    being double-counted or funded by imaginary gross income.
11. A seeded Monte Carlo simulation runs 1,000 paths by default using each account's configured
    expected return and the portfolio volatility, returning success probability plus 10th, 50th,
    and 90th percentile balances by age.
12. A path succeeds only when its closing balance is greater than zero at every projected age.
    Invalid inputs return a safe empty result rather than `NaN` or an infinite loop.
13. The dashboard shows net worth, annual savings, retirement target age, plan success probability,
    and projected balance at retirement.
14. The dashboard chart can show the deterministic balance and Monte Carlo percentile range in
    nominal or today's-money terms. It remains legible on mobile and provides an accessible text
    summary.
15. Inputs are organised into focused sections for profile, cash flow, accounts, future goals,
    retirement benefits, and assumptions rather than a long onboarding wizard.
16. The dashboard displays actionable observations derived from the plan, including low success
    probability, negative current cash flow, contributions above available surplus, concentrated
    cash, pension access before common minimum ages, missing benefit estimates, and cross-border
    wrapper considerations.
17. Accounts marked as ISA or UK taxable/GIA display a neutral PFIC consideration; pension accounts
    display a treaty/reporting consideration. The app does not decide whether a holding is a PFIC.
18. The cross-border guide covers worldwide US filing, FBAR/FATCA, PFIC, UK/US pension treatment,
    post-2025 Social Security totalisation, and the UK inheritance-tax long-term-residence milestone
    (10 UK-resident years in the prior 20 years under rules effective 6 April 2025) with source
    links.
19. Regulatory content is dated and avoids personalised eligibility or liability claims.
20. The disclaimer is always available and states that the application provides estimates and
    general education, not tax, legal, investment, or financial advice.
21. Plan data is saved to `localStorage` using a versioned envelope and survives reloads.
22. Users can export the current plan as JSON and import a previously exported valid plan. Invalid
    or unsupported files are rejected without destroying the current plan.
23. No plan data is transmitted, no analytics are loaded, and no account-linking capability exists.
24. All financial calculation functions are pure and have unit tests covering normal cases,
    retirement boundaries, currencies, goal flows, depleted plans, invalid ages, and deterministic
    seeded simulation.
25. The application passes lint, strict type checking, unit tests, and static production build.

## Data Model

### Plan envelope

- `schemaVersion`: integer used for migrations.
- `updatedAt`: ISO 8601 timestamp.
- `plan`: the complete user-editable plan.

### Profile

- `currentAge`, `retirementAge`, `planningAge`: integer ages.
- `yearsUKResident`: non-negative number used only for an educational milestone.
- `reportingCurrency`: `"GBP" | "USD"`.

### Cash flow

- `takeHomeIncome`: annual income after tax and payroll deductions, with an explicit currency.
- `currentSpending`: annual living costs excluding account contributions, in today's money, with an
  explicit currency.
- `retirementSpending`: annual spending from retirement in today's money, with an explicit currency.

### Account

- Stable `id` and user-facing `name`.
- `type`: one of the wrappers listed in acceptance criterion 4.
- `currency`: `"GBP" | "USD"`.
- `balance`, `annualContribution`: non-negative monetary amounts.
- `expectedReturn`: nominal annual fraction. Account-specific returns permit cash and investments to
  behave differently.

### Goal

- Stable `id`, `name`, integer `age`, non-negative `amount`, currency, and
  `kind: "expense" | "income"`.

### Benefit

- Stable `id`, `name`, `kind: "uk-state-pension" | "us-social-security" | "other"`,
  enabled flag, start age, annual amount, currency, and nominal annual growth fraction.

### Assumptions

- `inflationRate`: annual fraction.
- `returnVolatility`: annual standard deviation used by simulation, bounded from 0% to 60% and
  defaulting to 12%.
- `gbpPerUsd`: positive GBP value of one USD, supplied by the user.
- `simulationRuns`: bounded integer of 500–5,000, defaulting to 1,000.

### Projection point

Each annual point contains age, phase, opening balance, contribution, earned income, spending,
benefits, goals, investment growth, and closing balance in the reporting currency.

## Business Logic

### Normalisation and validation

- Monetary inputs that are non-finite or negative are treated as zero by calculations.
- Return and inflation inputs are bounded to prevent mathematically invalid projections.
- A projection is invalid when ages are non-finite, non-integers, not ordered as
  `currentAge < retirementAge <= planningAge`, or span more than 100 years.
- Currency conversion uses `gbpPerUsd`; a missing/non-positive rate falls back to one rather than
  producing non-finite output.

### Annual cash-flow order

For every age:

1. Record each account's opening balance and the aggregate opening balance.
2. Apply each account's nominal expected return.
3. Calculate take-home income (pre-retirement only), age-appropriate spending indexed from today's
   money by inflation, enabled benefit income grown by its own rate from its start age, and one-off
   goals.
4. Before retirement, calculate available surplus as
   `max(0, take-home income - living costs + goal income - goal expenses)`. Allocate planned account
   contributions up to that surplus, reducing every contribution proportionally if their total
   exceeds it. Add remaining surplus to the first cash account, or proportionally by opening balance
   when no cash account exists.
5. When annual cash flow is negative, cover the deficit by withdrawing proportionally from all
   positive account balances. This pro-rata convention is a neutral aggregate-model assumption, not
   withdrawal-order advice. Any amount that cannot be funded is recorded as a shortfall.
6. At and after retirement, no planned contributions or take-home income apply. Benefits and goal
   income reduce the spending deficit before any pro-rata withdrawal.
7. Clamp account balances to zero. The closing aggregate must always equal the sum of closing
   account balances.
8. Benefits beginning at a given age are included in that age. The retirement phase begins at the
   retirement age.

The initial age point represents one full planning year and explicitly exposes its cash flows; the
chart therefore starts with today's opening balance and its closing balance.

### Monte Carlo

- Each annual path applies one normally distributed market shock to account expected returns using a
  deterministic seeded pseudo-random generator. Sampled returns are floored at -100%.
- Cash flows use the same age and inflation rules as the deterministic projection.
- Percentiles use the nearest-rank method on sorted balances and satisfy `p10 <= p50 <= p90`.
- A run is successful only if every annual closing balance is greater than zero.
- With zero volatility, every Monte Carlo path equals the deterministic projection.
- Results include the seed and run count so that they are explainable and repeatable in tests.

### Real and nominal values

Stored inputs and projection arithmetic are nominal. Today's-money display divides a projected
balance by cumulative inflation from the current age. The selected view changes presentation only.

### Insights

Insights are deterministic observations, not recommendations. They identify facts in the entered
plan, explain why each may matter, and suggest a question to investigate. No insight instructs the
user to buy, sell, claim, contribute, or file.

## UI / UX

- Use a calm, high-contrast dashboard with a compact header, privacy indicator, and persistent
  "educational estimates" label.
- Lead with the four or five plan-health metrics and timeline chart; do not gate value behind a
  wizard.
- Use a responsive two-column workspace on desktop and one column on mobile.
- Editing sections use native labelled controls, visible focus styles, error text, and comfortable
  touch targets.
- Accounts and goals use cards on small screens rather than wide data tables.
- The chart uses more than colour alone: distinct line styles, legend text, tooltip labels, and an
  adjacent text summary.
- Use locale-aware `Intl.NumberFormat` only through shared formatting helpers.
- All default interface copy uses UK English while retaining US product and filing names.
- Import/export controls explain that JSON contains sensitive financial information.
- Destructive reset/import actions require confirmation or an explicit two-step action.

## Migration and Supersession

- The rebuild uses a new `localStorage` key and a versioned single-plan envelope. Legacy plan arrays
  remain untouched but are not interpreted as the new model; the example plan is shown on first use.
- The new spec supersedes the quick-start projection, assumptions panel, plan manager, and the prior
  calculation model described by `epic-1-quick-start-onboarding.spec.md`,
  `inflation-adjusted-projections.spec.md`, `configurable-income-replacement-ratio.spec.md`,
  `quick-start-input-editing.spec.md`, and `projection-initial-balance.spec.md`.
- Legacy files may be removed once equivalent new tests pass. README, architecture, glossary, and
  project context must be updated with the new model.

## Non-Functional Requirements

- Static-export compatible; no server components requiring a runtime server.
- No new runtime dependency unless essential.
- Typical edits recalculate within 100 ms and 1,000 simulation paths complete within one second on
  a contemporary laptop.
- Strict TypeScript; no `any`.
- WCAG-oriented semantic structure, keyboard operation, and focus visibility.
- Local-only persistence; no network calls from application code.
- Versioned, defensively validated imported data.
- Source links open in a new tab with safe `rel` attributes.
- Financial constants shown as education include an as-of date. User-entered projections do not
  silently depend on changing statutory limits.

## Required Disclaimer

> This tool provides general educational estimates only. It is not tax, legal, investment, or
> financial advice. Cross-border rules are complex, fact-specific, and change frequently. Consult
> suitably qualified US and UK professionals before making financial, tax, or investment decisions.
> Your plan is stored only in this browser unless you export it.

## Out of Scope

- Tax return preparation or personalised US/UK tax-liability calculations.
- Determining whether a security is a PFIC.
- Form 1116, 8621, 8938, FBAR, IHT, estate-tax, or pension-treaty calculations.
- Live market prices, live FX, bank/brokerage linking, authentication, cloud sync, or analytics.
- Asset-allocation, security-selection, contribution, withdrawal-order, or claiming advice.
- Historical backtesting, household/member-level ownership, debt amortisation, property cash flows,
  healthcare costs, and detailed country-relocation modelling.
- Promising a retirement outcome or presenting simulation probability as certainty.
