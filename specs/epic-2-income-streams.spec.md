# Spec: Epic 2 — Income Streams & Cash Inflows

**Status:** Implemented  
**Epic:** 2  
**Issue:** https://github.com/miketsprague/financial-planner/issues/  
**Dependencies:** Epic 1 (Quick-Start Onboarding) — requires `QuickStartInput` and `Plan` types  

---

## Overview

Allow users to model multiple income sources that affect their retirement projection:
1. **Employment Income** — one or more jobs with annual salary growth
2. **State Pension (UK)** — proportional to NI qualifying years, with optional deferral
3. **Other Income Streams** — rental, private pension, annuity, side business, etc.

All income data is stored per-Plan and persisted to `localStorage`.

---

## 2.1 Employment Income

### Fields
| Field | Type | Default | Constraints |
|---|---|---|---|
| `id` | `string` | generated | — |
| `name` | `string` | `"Job"` | non-empty |
| `annualGrossSalary` | `number` | `30000` | ≥ 0 |
| `annualRaiseRate` | `number` (fraction) | `0.03` | ≥ 0 |
| `startAge` | `number` | `currentAge` | ≥ 16 |
| `endAge` | `number` | `retirementAge` | > `startAge` |
| `isPreTax` | `boolean` | `true` | — |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria
- **AC-2.1.1:** Multiple employment incomes can be added to a plan
- **AC-2.1.2:** Each job may be enabled/disabled without deletion (for scenario testing)
- **AC-2.1.3:** Annual raise rate is applied per year from `startAge`; salary at target age = `startingSalary × (1 + raiseRate)^(targetAge − startAge)`
- **AC-2.1.4:** Contributions from employment = `salaryAtAge × annualContributionRate`
- **AC-2.1.5:** A job outside its `[startAge, endAge]` range contributes 0
- **AC-2.1.6:** Disabled jobs contribute 0
- **AC-2.1.7:** When no active job is found at a given age, fall back to `computeAnnualContribution(annualIncome, annualContributionRate)`

---

## 2.2 State Pension (UK)

### Constants (2025/26)
| Constant | Value |
|---|---|
| Full new State Pension (weekly) | £221.20 |
| Full new State Pension (annual) | £11,502.40 (221.20 × 52) |
| Full qualifying NI years | 35 |
| Minimum qualifying NI years | 10 |
| Deferral increase per year | 5.8% |
| Default State Pension age | 67 (from `Assumptions.statePensionAge`) |

### Fields
| Field | Type | Default | Constraints |
|---|---|---|---|
| `niQualifyingYears` | `number` | `35` | 0–40+ |
| `deferralYears` | `number` | `0` | 0–5 |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria
- **AC-2.2.1:** Returns 0 for < 10 qualifying NI years
- **AC-2.2.2:** Returns proportional amount for 10–34 years: `(niYears / 35) × FULL_ANNUAL`
- **AC-2.2.3:** Returns full State Pension (£11,502.40/yr) for ≥ 35 qualifying years (capped at 35)
- **AC-2.2.4:** Deferral multiplier = `1 + (deferralYears × 0.058)` applied to base pension
- **AC-2.2.5:** Deferral is added to `statePensionAge` in projections: `effectiveStatePensionAge = statePensionAge + deferralYears`
- **AC-2.2.6:** When disabled, `annualStatePension` from `Assumptions` is used instead
- **AC-2.2.7:** Invalid inputs (NaN, Infinity, negative) return 0

---

## 2.3 Other Income Streams

### Preset Types
`"private-pension" | "rental" | "side-business" | "annuity" | "part-time" | "other"`

### Fields
| Field | Type | Default | Constraints |
|---|---|---|---|
| `id` | `string` | generated | — |
| `name` | `string` | `"Income"` | non-empty |
| `type` | `IncomeStreamType` | `"other"` | — |
| `annualAmount` | `number` | `5000` | ≥ 0 |
| `startAge` | `number` | `retirementAge` | — |
| `endAge` | `number \| null` | `null` | `null` = no end |
| `growthRate` | `number` (fraction) | `0.02` | any |
| `enabled` | `boolean` | `true` | — |

### Acceptance Criteria
- **AC-2.3.1:** Income at age = `annualAmount × (1 + growthRate)^(age − startAge)`
- **AC-2.3.2:** Stream with `endAge = null` continues indefinitely
- **AC-2.3.3:** Stream with `endAge` set contributes 0 after that age
- **AC-2.3.4:** Disabled streams contribute 0
- **AC-2.3.5:** Multiple streams are summed per age
- **AC-2.3.6:** Age before `startAge` returns 0

---

## Projection Integration

### Accumulation Phase
- When `incomeConfig.employmentIncomes` has ≥ 1 job active at a given age: use `computeEmploymentContributionsAtAge`
- Falls back to `computeAnnualContribution(annualIncome, annualContributionRate)` if no active job at that age

### Drawdown Phase
- `annualStatePension` is overridden by `computeStatePensionAnnual` when `statePensionConfig.enabled`
- Effective State Pension age = `assumptions.statePensionAge + statePensionConfig.deferralYears`
- `computeIncomeStreamsAtAge` result is added to pension offset, reducing portfolio withdrawal needed
- `hasStatePension` in `ProjectionDataPoint` reflects the effective (deferred) State Pension age

---

## Data Persistence

- `Plan` type gains three new fields: `employmentIncomes`, `statePensionConfig`, `incomeStreams`
- `deserializePlans` migrates legacy plans: empty arrays for income lists, `DEFAULT_STATE_PENSION_CONFIG` for config
- `createPlan` initialises all three fields with safe defaults

---

## UI: `IncomeStreamsPanel`

Sidebar panel with three sections:

1. **Employment Income** — list with add/remove/toggle per job; fields: name, salary, raise %, start age, end age
2. **State Pension** — NI qualifying years slider (0–40), deferral years input, enable toggle, computed annual + weekly display
3. **Other Income Streams** — list with add/remove/toggle per stream; fields: name, type, amount, growth rate, start age, end age

---

## Edge Cases

| Input | Expected |
|---|---|
| `computeStatePensionAnnual(NaN)` | 0 |
| `computeStatePensionAnnual(35, -1)` | 0 |
| `computeStatePensionAnnual(9)` | 0 |
| `computeStatePensionAnnual(40)` | Full pension (capped) |
| `computeEmploymentSalaryAtAge(50000, 0.03, 30, 25)` | 0 (target before start) |
| `computeIncomeStreamsAtAge([], 65)` | 0 |
| Stream with `growthRate = 0` | Flat `annualAmount` at every age |
| No employment incomes configured | Falls back to `annualIncome × contributionRate` |
