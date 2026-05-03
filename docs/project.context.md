# Project Context

> Last updated: after PR #50 (configurable income replacement ratio)

## What This Project Is

A UK-first personal financial planning web app that doubles as a showcase for agentic
development workflows (spec-driven, adversarial multi-agent review, automated maintenance).

## Current Milestone

**Phase 3 — Application Foundation**

The core calculation and projection engine is in place and tested. The Quick Start
onboarding flow is live.

## What Is Complete

- ✅ Agentic infrastructure (CI, agent personas, spec workflow, branch protection)
- ✅ Project memory and documentation structure (`docs/`, `AGENTS.md`, ADRs)
- ✅ Core type model (`Assumptions`, `Plan`, `QuickStartInput`, `ProjectionDataPoint`)
- ✅ Calculation engine (`calculations.ts`): contributions, withdrawals, year-by-year
  projection with accumulation and drawdown phases
- ✅ UK defaults (`defaults.ts`): inflation, investment return, state pension, contribution
  rate, income replacement ratio
- ✅ Plan management (`plans.ts`): create, update, duplicate, serialise/deserialise with
  forward-compatible `UK_DEFAULTS` migration
- ✅ Quick Start onboarding flow (Epic 1)
- ✅ Quick Start input editing (inline editing of projection inputs)
- ✅ **Configurable income replacement ratio** — `Assumptions.incomeReplacementRatio` is
  now a user-adjustable field (default 2/3); `computeAnnualWithdrawal()` no longer
  hardcodes the ratio; existing plans missing the field are migrated to the UK default

## What Is In Progress / Next

- ⏳ Projection chart initial balance data point fix
  (spec: `projection-initial-balance.spec.md` — status: Ready)
- ⏳ Monte Carlo simulation engine (`src/lib/monte-carlo.ts`)
- ⏳ Scenario comparison (multiple saved plans side-by-side)

## What Is Blocked

Nothing currently blocked.

## Active Specs

| Spec | Status |
|------|--------|
| `projection-initial-balance.spec.md` | Ready — next up |
| `configurable-income-replacement-ratio.spec.md` | Implemented |
| `quick-start-input-editing.spec.md` | Implemented |
| `epic-1-quick-start-onboarding.spec.md` | Implemented |
