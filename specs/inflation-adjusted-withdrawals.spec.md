# Inflation-Adjusted Retirement Withdrawals

**Status:** Ready  
**Issue:** bug: Withdrawals are not inflation-adjusted during retirement

---

## Background

Retirement drawdown currently uses the same nominal portfolio withdrawal every year. This makes long retirements look safer than they are because the requested income does not rise with inflation.

---

## User Stories

> As a UK retirement planner, I want annual retirement withdrawals to increase with inflation so that projections preserve the intended purchasing power through retirement.

---

## Acceptance Criteria

1. `computeAnnualWithdrawal()` can calculate a withdrawal for a specific retirement year using `baseWithdrawal × (1 + inflationRate)^yearsSinceRetirement`.
2. Retirement year 0 uses the existing base withdrawal calculation unchanged.
3. `projectSavings()` applies `assumptions.inflationRate` to every retired year using the number of years elapsed since `input.retirementAge`.
4. Negative state pension values are still treated as zero before inflation is applied.
5. Non-positive or non-finite `annualIncome` still returns a zero withdrawal.
6. Existing accumulation-phase projection behaviour remains unchanged.

---

## Data Model

No persisted data model changes. `Assumptions.inflationRate` already exists and is used by `projectSavings()` for retirement drawdown.

---

## Business Logic

### `computeAnnualWithdrawal(annualIncome, statePension, inflationRate, yearsSinceRetirement) → number`

- Compute the base withdrawal as `max(0, annualIncome × 2/3 − max(0, statePension))`.
- Return `baseWithdrawal` when `yearsSinceRetirement` is `0`.
- Return `baseWithdrawal × (1 + inflationRate)^yearsSinceRetirement` for later retirement years.
- Treat non-finite `inflationRate` as `0`.
- Treat non-finite or negative `yearsSinceRetirement` as `0`.

### `projectSavings(input, assumptions) → ProjectionDataPoint[]`

- For each `age >= input.retirementAge`, pass `age - input.retirementAge` and `assumptions.inflationRate` to `computeAnnualWithdrawal()`.
- Continue to reduce the withdrawal need by state pension only when `age >= assumptions.statePensionAge`.

---

## UI / UX

No UI changes. Existing projection charts and summary cards consume the updated calculation output.

---

## Non-Functional Requirements

- Keep calculation logic pure and deterministic.
- Add focused unit tests for the new withdrawal calculation and projection behaviour.
- Do not introduce new dependencies.

---

## Out of Scope

- Changing contribution inflation, state pension uprating, tax treatment, or income replacement assumptions.
- Adding new projection fields to `ProjectionDataPoint`.
- Changing assumption slider ranges or labels.
