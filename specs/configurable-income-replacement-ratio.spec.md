# Configurable Income Replacement Ratio

**Status:** Implemented

## Background

Issue: bug: Income replacement ratio (2/3) is hardcoded, not configurable.

Retirement drawdown currently assumes users need two thirds of their pre-retirement
gross income in retirement. This is a material planning assumption that varies by
household, so it must be part of the editable assumptions model rather than a
hardcoded calculation constant.

## User Stories

- As a user, I want to adjust my income replacement ratio so that my projection
  reflects my expected retirement spending needs.
- As a user, I want the default ratio to preserve the existing two-thirds
  projection behaviour unless I change it.

## Acceptance Criteria

1. `Assumptions` includes an `incomeReplacementRatio` numeric field.
2. UK defaults set `incomeReplacementRatio` to `2 / 3` to preserve existing
   projections.
3. `computeAnnualWithdrawal()` uses the provided income replacement ratio instead
   of a hardcoded value.
4. `projectSavings()` passes `assumptions.incomeReplacementRatio` into
   `computeAnnualWithdrawal()`.
5. The Assumptions panel exposes `incomeReplacementRatio` as a percentage slider.
6. The slider allows a common planning range of 50% to 80%.
7. Updating the slider updates the active assumptions through the existing
   assumptions update flow.
8. Existing saved plans without `incomeReplacementRatio` are restored with the UK
   default ratio.

## Data Model

```typescript
type Assumptions = {
  incomeReplacementRatio: number; // fraction of income e.g. 0.6667
  // existing fields omitted
};
```

## Business Logic

### `computeAnnualWithdrawal(annualIncome, statePension, incomeReplacementRatio) → number`

- Returns `max(0, annualIncome × incomeReplacementRatio − max(0, statePension))`.
- Returns 0 for non-positive or non-finite `annualIncome`.
- Returns 0 for negative or non-finite `incomeReplacementRatio`.
- Treats negative or non-finite `statePension` as 0.

### `projectSavings(input, assumptions) → ProjectionDataPoint[]`

- Uses `assumptions.incomeReplacementRatio` for retirement withdrawals.
- Continues to use all existing accumulation and drawdown rules.

## UI / UX

- Add an "Income Replacement" slider to the existing Assumptions panel.
- Display the current value with the existing locale-aware percentage formatter.
- Slider range: 50% to 80%.
- Slider step: 1 percentage point.
- Add locale strings for the label and tooltip.

## Non-Functional Requirements

- Keep calculations pure and deterministic.
- Preserve the existing default projection by defaulting to two thirds.
- Do not introduce server-side behaviour; this remains compatible with static
  export.
- Do not hardcode currency symbols or locale-specific formatting in components.

## Out of Scope

- Advice on what replacement ratio users should choose.
- Per-plan recommendation engines or automated spending analysis.
- Locale-specific default ratio variants beyond the existing UK default.
