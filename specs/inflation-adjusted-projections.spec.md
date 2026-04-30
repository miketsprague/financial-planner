# Inflation-Adjusted Projections

**Status:** Ready  
**Issue:** bug: inflationRate assumption is stored but never used in projections  
**Branch:** `copilot/fix-inflation-rate-usage`

---

## Background

The `Assumptions` data model includes `inflationRate`, and the quick-start assumptions UI exposes an inflation slider. Before this change, `projectSavings()` accepted `Assumptions` but did not read `inflationRate`, so changing the slider did not affect projected balances.

`investmentReturn` remains a real return assumption, so projections must not inflate investment returns. Inflation is applied to income needs and State Pension amounts used during drawdown.

---

## User Stories

> As a user, I want the inflation assumption to change my retirement projection so that the slider reflects a real model input.

> As a user, I want retirement withdrawals and State Pension assumptions to rise with inflation so that future drawdown years are not modelled as flat nominal amounts.

---

## Acceptance Criteria

1. `projectSavings(input, assumptions)` reads `assumptions.inflationRate`.
2. Accumulation behaviour remains unchanged: balances grow by `investmentReturn` and receive annual contributions.
3. During drawdown, the income target used for `computeAnnualWithdrawal()` is inflated from `input.currentAge` to the projected age using `inflationRate`.
4. During drawdown, `annualStatePension` is inflated from `input.currentAge` to the projected age before reducing the portfolio withdrawal when `age >= statePensionAge`.
5. `investmentReturn` remains a real return and is not adjusted by `inflationRate`.
6. Projection balances remain floored at 0.
7. Focused unit tests cover retirement withdrawals and State Pension inflation.

---

## Data Model

No data model changes. The existing `Assumptions` shape continues to include:

```typescript
type Assumptions = {
  inflationRate: number;
  investmentReturn: number;
  lifeExpectancy: number;
  statePensionAge: number;
  annualStatePension: number;
  annualContributionRate: number;
  locale: Locale;
};
```

---

## Business Logic

For each projected age:

- `yearsElapsed = age - input.currentAge`.
- `inflatedAnnualIncome = input.annualIncome × (1 + inflationRate) ^ yearsElapsed`.
- `inflatedStatePension = annualStatePension × (1 + inflationRate) ^ yearsElapsed` when State Pension is active; otherwise `0`.
- Drawdown uses `computeAnnualWithdrawal(inflatedAnnualIncome, inflatedStatePension)`.
- Investment growth continues to use `investmentReturn` unchanged.

---

## UI / UX

No UI control changes are required. Existing assumption controls continue to drive `projectSavings()` through the current assumptions state.

---

## Non-Functional Requirements

- Keep `projectSavings()` deterministic and side-effect free.
- Preserve existing TypeScript strictness and unit test style.
- Avoid hardcoded locale strings or currency symbols.

---

## Out of Scope

- Adding a chart toggle for nominal versus today's-pounds values.
- Changing default assumption values.
- Changing the `ProjectionDataPoint` data model.
