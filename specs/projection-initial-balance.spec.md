# Projection Initial Balance Data Point

**Status:** Ready  
**Issue:** bug: Projection chart missing initial balance data point  
**Branch:** `copilot/fix-projection-chart-initial-balance`

---

## Background

The projection chart is driven by `projectSavings()`. The current projection loop applies one year of growth and contribution before recording the first `ProjectionDataPoint`, so the chart starts at the post-growth balance instead of the user's actual starting savings.

---

## User Stories

> As a user, I want the first projection chart point to show my current savings so that the chart accurately starts from my real financial position.

---

## Acceptance Criteria

1. `projectSavings(input, assumptions)` returns its first data point at `input.currentAge`.
2. The first data point balance is the starting balance before investment growth, contributions, or withdrawals are applied.
3. The following age's data point reflects one year of projection from the starting balance.
4. The existing projection range remains one entry per year from `currentAge` to `max(retirementAge, lifeExpectancy)`.
5. Existing invalid-input behaviour remains unchanged.

---

## Data Model

No data model changes. `ProjectionDataPoint` remains:

```typescript
type ProjectionDataPoint = {
  age: number;
  balance: number;
  isRetired: boolean;
  hasStatePension: boolean;
};
```

---

## Business Logic

`projectSavings()` records the starting balance at `currentAge` before applying annual projection logic. For each subsequent age, it applies the existing accumulation or drawdown calculation and then records the resulting balance for that age.

Starting savings continue to be clamped at zero, matching the existing non-negative balance behaviour.

---

## UI / UX

No component changes are required. Projection charts consuming `projectSavings()` will automatically include the initial starting-balance point.

---

## Non-Functional Requirements

- Keep the projection engine pure and deterministic.
- Add focused unit tests for the initial current-age data point and the first projected year.
- Do not introduce locale-specific formatting or currency strings.

---

## Out of Scope

- Changing financial assumptions, defaults, or contribution rates.
- Changing chart rendering, labels, or visual design.
- Changing retirement or state pension age semantics.
