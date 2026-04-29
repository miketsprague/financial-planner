# State Pension Inflation Indexing

**Status:** Ready  
**Issue:** bug: State Pension amount is not indexed for inflation

---

## Background

The quick-start projection currently treats `annualStatePension` as a flat annual amount once a user reaches State Pension age. In reality, the UK State Pension is uprated each year, so later retirement years should reduce the required portfolio withdrawal by an indexed pension amount rather than by the same base value every year.

---

## User Stories

> As a UK retirement planner, I want State Pension income to increase each year after State Pension age so that long-term drawdown projections do not understate pension support in later retirement.

---

## Acceptance Criteria

1. `projectSavings()` uses the base `annualStatePension` amount in the first projected year where `age >= statePensionAge`.
2. For each later projected year with State Pension, `projectSavings()` uses `annualStatePension × (1 + inflationRate)^n`, where `n` is the number of years since `statePensionAge`.
3. Years before `statePensionAge` continue to receive no State Pension offset.
4. Existing projection markers (`isRetired` and `hasStatePension`) remain unchanged.
5. The change is covered by focused unit tests for State Pension indexing.

---

## Data Model

No data model changes. `Assumptions` continues to use the existing `inflationRate` and `annualStatePension` fields:

```typescript
type Assumptions = {
  inflationRate: number;
  annualStatePension: number;
  // other existing fields unchanged
};
```

---

## Business Logic

When calculating the retirement withdrawal for a projected age:

```text
statePensionYears = age - statePensionAge
indexedStatePension = annualStatePension × (1 + inflationRate)^statePensionYears
```

The indexed amount is passed to the existing withdrawal calculation. If the projected age is before State Pension age, the pension amount remains `0`.

---

## UI / UX

No UI changes. Existing charts and summary cards continue to display the resulting projected balances and State Pension markers.

---

## Non-Functional Requirements

- Keep the calculation pure and deterministic.
- Do not hardcode currency symbols or locale-specific formatting.
- Preserve existing lint, typecheck, unit test, and build behaviour.

---

## Out of Scope

- Adding a separate `statePensionGrowthRate` assumption.
- Modelling wage growth or full triple-lock policy details.
- Changing State Pension defaults or UI labels.
