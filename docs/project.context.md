# Project Context

> Last updated: after the US–UK personal planner rebuild
> (`specs/us-uk-personal-planner.spec.md`)

## What This Project Is

A US–UK cross-border personal financial planning web app that doubles as a showcase for agentic
development workflows (spec-driven, adversarial multi-agent review, project memory, automated
maintenance).

## Current Milestone

**Phase 4 — US–UK Personal Planner Rebuild**

The application has been rebuilt end-to-end from `specs/us-uk-personal-planner.spec.md`,
superseding the earlier single-balance quick-start projection, assumptions panel, and plan
manager. The planner now models a full plan — profile, cash flow, accounts, one-off goals,
retirement benefits, and assumptions — with a deterministic year-by-year projection, a seeded
Monte Carlo simulation, deterministic plan insights, and a sourced cross-border guide.

## What Is Complete

- ✅ Agentic infrastructure (CI, agent personas, spec workflow, branch protection)
- ✅ Project memory and documentation structure (`docs/`, `AGENTS.md`, ADRs)
- ✅ New domain model (`src/types/index.ts`): `Plan`, `Profile`, `CashFlow`, `Account`, `Goal`,
  `Benefit`, `Assumptions`, `ProjectionPoint`, `MonteCarloResult`, `Insight`, `PlanEnvelope`
- ✅ Currency normalisation and GBP/USD conversion (`src/lib/currency.ts`)
- ✅ Deterministic projection engine with contribution/withdrawal allocation
  (`src/lib/calculations.ts`), covering accumulation and retirement phases, inflation-indexed
  spending, benefit growth, and one-off goal flows
- ✅ Seeded Monte Carlo simulation (`src/lib/monte-carlo.ts`) — 500–5,000 paths, nearest-rank
  percentiles, deterministic and repeatable for a given seed
- ✅ Deterministic plan insights and per-account cross-border considerations
  (`src/lib/insights.ts`)
- ✅ The example plan for a mid-thirties US citizen resident in the UK for eight years
  (`src/lib/example-plan.ts`)
- ✅ Versioned, defensively-validated `localStorage` persistence and JSON import/export
  (`src/lib/plan-storage.ts`), under a new storage key distinct from the legacy plan-array model
- ✅ Full dashboard UI: plan-health metrics, projection chart (deterministic + Monte Carlo band,
  nominal/today's-money toggle, accessible text summary), insights panel, focused editing
  sections (profile, cash flow, accounts, goals, benefits, assumptions), cross-border guide, and
  import/export/reset controls with confirmation dialogs
- ✅ Persistent disclaimer footer
- ✅ Comprehensive unit tests for every pure function in `src/lib/`, plus hook and page-level
  tests

## What Is In Progress / Next

- ⏳ Optional: remove now-superseded legacy specs (`epic-1-quick-start-onboarding.spec.md`,
  `inflation-adjusted-projections.spec.md`, `configurable-income-replacement-ratio.spec.md`,
  `quick-start-input-editing.spec.md`, `projection-initial-balance.spec.md`) once the team is
  confident no reference to the old model remains
- ⏳ en-US locale copy (currently falls back to en-GB strings; US product/filing names are already
  retained regardless of interface language)

## What Is Blocked

Nothing currently blocked.

## Active Specs

| Spec                                            | Status                               |
| ----------------------------------------------- | ------------------------------------ |
| `us-uk-personal-planner.spec.md`                | Implemented                          |
| `epic-1-quick-start-onboarding.spec.md`         | Superseded — implementation replaced |
| `inflation-adjusted-projections.spec.md`        | Superseded — implementation replaced |
| `configurable-income-replacement-ratio.spec.md` | Superseded — implementation replaced |
| `quick-start-input-editing.spec.md`             | Superseded — implementation replaced |
| `projection-initial-balance.spec.md`            | Superseded — implementation replaced |
