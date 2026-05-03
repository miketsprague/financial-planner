# Glossary

Domain terms used in Financial Planner. Every term that appears in the TypeScript types or
financial logic is defined here. UK-specific terms are marked 🇬🇧.

---

## Accumulation Phase

The period between `currentAge` and `retirementAge` during which the user is still working
and contributing to their savings pot. In `projectSavings()`, each year the balance grows
at `investmentReturn` and receives an annual contribution.

**Contrast with:** Drawdown Phase.

---

## Annual Contribution Rate

**TypeScript:** `Assumptions.annualContributionRate` (`number`, fraction)

The fraction of gross annual income contributed to savings each year during the accumulation
phase. E.g. `0.10` = 10%. UK default: 10%.

---

## Assumptions

**TypeScript:** `Assumptions` (`src/types/index.ts`)

The full set of configurable planning parameters that drive `projectSavings()`. Includes
inflation rate, investment return, life expectancy, state pension settings, contribution
rate, income replacement ratio, and locale. UK defaults live in `src/lib/defaults.ts`.

---

## Drawdown Phase

The period from `retirementAge` onwards during which the user withdraws from their savings
pot. Each year the balance grows at `investmentReturn` then is reduced by the inflation-
adjusted annual withdrawal. The balance cannot go below zero.

**Contrast with:** Accumulation Phase.

---

## Income Replacement Ratio

**TypeScript:** `Assumptions.incomeReplacementRatio` (`number`, fraction)

The fraction of pre-retirement gross income the user expects to need in retirement.
E.g. `0.667` = two thirds. UK default: `2 / 3`. Used by `computeAnnualWithdrawal()` to
derive the target retirement income before deducting the state pension.

Common planning range: 50% – 80%.

---

## ISA 🇬🇧

Individual Savings Account. A UK tax-advantaged savings wrapper. Annual ISA allowance
(2024/25): £20,000. Not modelled as a separate account type in the current projection
engine; relevant to future tax-optimisation features.

---

## Life Expectancy

**TypeScript:** `Assumptions.lifeExpectancy` (`number`, age)

The age to which the projection runs. Also aliased as the end of the drawdown phase.
UK default: 90.

---

## Locale

**TypeScript:** `Locale` = `"en-GB" | "en-US"` (`src/types/index.ts`)

Controls currency symbol, number formatting, and date format throughout the UI.
Default: `"en-GB"` (GBP, DD/MM/YYYY).

---

## Plan

**TypeScript:** `Plan` (`src/types/index.ts`)

A saved planning scenario comprising a `QuickStartInput`, an `Assumptions` object, and
metadata (`id`, `name`, `createdAt`, `updatedAt`). Plans are persisted to `localStorage`
via `serializePlans()` / `deserializePlans()` in `src/lib/plans.ts`.

---

## ProjectionDataPoint

**TypeScript:** `ProjectionDataPoint` (`src/types/index.ts`)

A single year's snapshot in the output of `projectSavings()`. Fields:
`age`, `balance`, `isRetired`, `hasStatePension`.

---

## QuickStartInput

**TypeScript:** `QuickStartInput` (`src/types/index.ts`)

User-supplied values that seed the projection: `currentAge`, `retirementAge`,
`lifeExpectancy`, `currentSavings`, `annualIncome`.

---

## SIPP 🇬🇧

Self-Invested Personal Pension. A UK tax-advantaged pension wrapper that allows broad
investment choice. Contributions receive income-tax relief. Not modelled as a separate
account type in the current projection engine; relevant to future tax-optimisation features.

---

## State Pension 🇬🇧

**TypeScript:** `Assumptions.annualStatePension` (`number`, annual amount in GBP)

The UK full new State Pension. 2024/25 value: £11,502/yr. During the drawdown phase,
the inflation-adjusted state pension is deducted from the retirement income target to
calculate the required portfolio withdrawal.

**US equivalent:** Social Security.

---

## State Pension Age

**TypeScript:** `Assumptions.statePensionAge` (`number`, age) 🇬🇧

The age at which state pension payments begin. UK default: 67. In `projectSavings()`,
`hasStatePension` is `true` once `age >= statePensionAge`.
