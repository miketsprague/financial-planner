# Glossary

Domain terms used in Financial Planner's US–UK personal planner model. Every term that appears
in the TypeScript types or financial logic is defined here. UK-specific terms are marked 🇬🇧 and
US-specific terms are marked 🇺🇸.

---

## Account

**TypeScript:** `Account` (`src/types/index.ts`)

A single financial holding: `id`, `name`, `type` (see Account type), `currency`, `balance`,
`annualContribution`, and `expectedReturn` (a nominal annual fraction). Users can add, edit, and
remove accounts in the Accounts section.

---

## Account type

**TypeScript:** `AccountType` (`src/types/index.ts`)

One of: `cash`, `uk-workplace-pension`, `uk-sipp`, `uk-isa`, `uk-taxable`, `us-401k`,
`us-traditional-ira`, `us-roth-ira`, `us-taxable-brokerage`, `property`, `other`. Determines which
cross-border consideration, if any, is shown for that account (see PFIC, Pension treaty
consideration).

---

## Allocate cash flow

**TypeScript:** `allocateCashFlow()` (`src/lib/calculations.ts`)

The pure function that distributes one year's net cash flow across accounts: crediting planned
contributions (capped proportionally to the available surplus) and sweeping any remainder into
the first cash account when cash flow is positive, or withdrawing proportionally from every
account with a positive balance when cash flow is negative.

---

## Assumptions

**TypeScript:** `Assumptions` (`src/types/index.ts`)

Plan-wide modelling parameters: `inflationRate`, `returnVolatility` (0–60%, used by the Monte
Carlo simulation), `gbpPerUsd` (user-supplied exchange rate), and `simulationRuns` (500–5,000,
default 1,000).

---

## Benefit

**TypeScript:** `Benefit` (`src/types/index.ts`)

A government or other retirement income stream: `kind` (UK State Pension, US Social Security, or
other), `enabled`, `startAge`, `annualAmount`, `currency`, and `growthRate`. Disabled benefits are
excluded from the projection entirely.

---

## Cash flow

**TypeScript:** `CashFlow` (`src/types/index.ts`)

The plan's `takeHomeIncome`, `currentSpending`, and `retirementSpending`, each an explicit
`MonetaryAmount` (amount + currency).

---

## Cross-border guide

**Component:** `src/components/guide/CrossBorderGuide.tsx`

Educational, sourced content covering worldwide US filing, FBAR/FATCA, PFIC, UK/US pension
treatment, Social Security totalisation, and the UK long-term-residence milestone. Every section
is dated and links to a primary source; the guide makes no personalised eligibility or liability
claims.

---

## FATCA 🇺🇸

Foreign Account Tax Compliance Act. Can require reporting foreign financial accounts on IRS
Form 8938. See the Cross-border guide and `docs/architecture.md`. This application does not
determine reporting obligations for the user.

---

## FBAR 🇺🇸

Report of Foreign Bank and Financial Accounts (FinCEN Form 114). A separate regime from FATCA
with its own thresholds. See the Cross-border guide.

---

## Goal

**TypeScript:** `Goal` (`src/types/index.ts`)

A one-off future cash flow at a specific age: `name`, `age`, `amount`, `currency`, and
`kind` (`"expense"` or `"income"`). Applied only in the year it occurs — never inflated or
repeated.

---

## GBP per USD

**TypeScript:** `Assumptions.gbpPerUsd` (`number`)

The user-supplied GBP value of one USD, used by `convertToReportingCurrency()`
(`src/lib/currency.ts`) to convert non-reporting-currency amounts. A missing or non-positive rate
falls back to `1` rather than producing non-finite output. Changing the reporting currency only
changes display conversion — it never rewrites stored account currencies.

---

## Insight

**TypeScript:** `Insight` (`src/types/index.ts`)

A deterministic, factual observation about the current plan (not a recommendation), produced by
`computeInsights()` (`src/lib/insights.ts`). Covers low success probability, negative current
cash flow, contributions above available surplus, concentrated cash, early pension/retirement
access, missing benefit estimates, and cross-border wrapper considerations.

---

## ISA 🇬🇧

Individual Savings Account. Modelled as `AccountType` `"uk-isa"`. Displays a neutral PFIC
consideration in the UI, since many non-US-domiciled pooled funds held in an ISA can be treated as
PFICs for US tax purposes.

---

## Monte Carlo simulation

**TypeScript:** `MonteCarloResult` (`src/types/index.ts`); **function:**
`runMonteCarloSimulation()` (`src/lib/monte-carlo.ts`)

Runs `assumptions.simulationRuns` seeded paths, each applying one normally-distributed return
shock per age (shared across all accounts that year) scaled by `assumptions.returnVolatility`.
Returns `successProbability` (fraction of paths where every annual closing balance was greater
than zero), `percentiles` (10th/50th/90th by age via the nearest-rank method), the `seed`, and the
`runs` count. Deterministic and repeatable for a given plan and seed; with zero volatility, every
path equals the deterministic projection exactly.

---

## Nominal vs today's money

Stored plan inputs and all projection arithmetic are **nominal**. `todaysMoneyValue()`
(`src/lib/calculations.ts`) divides a nominal projected balance by cumulative inflation from the
current age, purely for the dashboard chart's "today's money" display toggle. The toggle never
changes the underlying projection.

---

## PFIC 🇺🇸

Passive Foreign Investment Company. Many non-US-domiciled pooled investments (including many UK
funds and ISAs) can be treated as PFICs under US tax law, with complex reporting and taxation.
`getAccountConsideration()` (`src/lib/insights.ts`) shows a neutral note for ISA and UK
taxable/GIA accounts; **the application never decides whether a specific holding is a PFIC.**

---

## Plan

**TypeScript:** `Plan` (`src/types/index.ts`)

The complete user-editable plan: `profile`, `cashFlow`, `accounts`, `goals`, `benefits`, and
`assumptions`. There is a single current plan per browser, owned by `usePlanState()`
(`src/hooks/usePlanState.ts`).

---

## Plan envelope

**TypeScript:** `PlanEnvelope` (`src/types/index.ts`)

The versioned persistence/export wrapper around a `Plan`: `{ schemaVersion, updatedAt, plan }`.
Created by `createPlanEnvelope()` and validated by `isValidPlanEnvelope()`
(`src/lib/plan-storage.ts`). Unsupported schema versions are rejected rather than guessed at.

---

## Profile

**TypeScript:** `Profile` (`src/types/index.ts`)

`currentAge`, `retirementAge`, `planningAge`, `yearsUKResident` (used only for the UK long-term-
residence educational milestone), and `reportingCurrency`.

---

## Projection point

**TypeScript:** `ProjectionPoint` (`src/types/index.ts`)

One year of `projectPlan()`'s output: `age`, `phase` (`"accumulation"` or `"retirement"`),
`openingBalance`, `contribution`, `earnedIncome`, `spending`, `benefits`, `goals`,
`investmentGrowth`, `closingBalance`, and `shortfall` (any cash-flow deficit that could not be
funded by any account balance that year).

---

## Reporting currency

**TypeScript:** `Profile.reportingCurrency` (`"GBP" | "USD"`)

The single currency all dashboard figures are shown in. Every monetary input keeps its own
explicit `currency`; `convertToReportingCurrency()` (`src/lib/currency.ts`) converts at display/
calculation time using `gbpPerUsd`, and changing the reporting currency never mutates stored
values.

---

## Return volatility

**TypeScript:** `Assumptions.returnVolatility` (`number`, 0–0.6)

The annual standard deviation used by the Monte Carlo simulation to generate return shocks. `0`
produces paths identical to the deterministic projection.

---

## Shortfall

**TypeScript:** `ProjectionPoint.shortfall` (`number`)

The portion of a year's cash-flow deficit that could not be funded by any account's positive
balance. Balances are clamped to zero rather than going negative or producing `NaN`.

---

## SIPP 🇬🇧

Self-Invested Personal Pension. Modelled as `AccountType` `"uk-sipp"`. Displays a treaty/reporting
consideration alongside other UK and US pension wrappers (see Pension treaty consideration).
Commonly cannot be accessed before age 55 (rising to 57 from 2028) — flagged by the
`early-uk-pension-access` insight if the planned retirement age is earlier.

---

## Pension treaty consideration

A neutral note shown for UK workplace pension, SIPP, and US 401(k)/IRA/Roth IRA accounts
(`getAccountConsideration()` in `src/lib/insights.ts`), reflecting that pension treatment differs
between the US–UK tax treaty and domestic rules for each wrapper.

---

## State Pension 🇬🇧 / Social Security 🇺🇸

**TypeScript:** `Benefit.kind` values `"uk-state-pension"` and `"us-social-security"`

The UK State Pension and US Social Security are modelled as separate, optional `Benefit` income
streams, each with its own `startAge`, `annualAmount`, `currency`, and `growthRate`. The
Cross-border guide covers post-2025 Social Security totalisation between the two systems.

---

## Success probability

**TypeScript:** `MonteCarloResult.successProbability` (`number`, 0–1)

The fraction of Monte Carlo paths whose closing balance was greater than zero at every projected
age. Shown on the dashboard and flagged by the `low-success-probability` insight below 70%.

---

## UK long-term-residence milestone

An educational flag in the Cross-border guide: since 6 April 2025, UK inheritance tax on
worldwide assets can be triggered by having been UK-resident for at least 10 of the previous 20
tax years. Driven by `Profile.yearsUKResident`; this application never determines a user's actual
tax status.

---

## Years UK resident

**TypeScript:** `Profile.yearsUKResident` (`number`)

A non-negative number of years the user has been UK-resident, used only to surface the UK
long-term-residence educational milestone in the Cross-border guide.
