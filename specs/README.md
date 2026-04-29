# Specs Directory

This directory contains **feature specifications** — the source of truth for every feature in Financial Planner.

## Workflow

```
GitHub Issue → Spec file here → Implementation PR → Review → Merge
```

**No spec = no implementation.** If an issue is assigned to `@copilot` and no spec file exists in this directory, the agent must stop and ask for a spec before writing any code.

This rule is enforced by:
- `.github/agents/implement.agent.md` — the implementer agent's own instructions
- `.github/workflows/agent-quality-gate.yml` — CI checks that every `copilot/*` PR references a `specs/` file

---

## How to Write a Spec

Each spec is a Markdown file named `<feature-slug>.spec.md` and lives in this directory.

### Required Sections

```markdown
# Feature Name

## Background
Why this feature exists. Link to the GitHub issue.

## User Stories
One or more "As a user, I want ... so that ..." statements.

## Acceptance Criteria
A numbered, testable list. Each criterion must be independently verifiable.

## Data Model
Types, interfaces, or data structures introduced or modified.

## Business Logic
Pure-function contracts: inputs → outputs. Include edge cases.

## UI / UX
Component breakdown, interactions, and locale requirements.

## Non-Functional Requirements
Performance, accessibility, locale, security constraints.

## Out of Scope
Explicitly list what this spec does NOT cover.
```

### Good Acceptance Criteria

Acceptance criteria must be **specific, testable, and unambiguous**. For example:

✅ Good:
> `projectSavings()` returns a `ProjectionDataPoint[]` where every point with `age >= retirementAge` has `isRetired: true`.

❌ Bad:
> The chart should look nice and show retirement data.

---

## Spec Lifecycle

| Status | Meaning |
|--------|---------|
| Draft | Being written — not ready for implementation |
| Ready | Reviewed and signed off — ready to implement |
| Implemented | Feature is live in `main` |
| Superseded | Replaced by a newer spec |

Add a `**Status:**` line at the top of each spec.

---

## Index

| Spec | Status | Issue |
|------|--------|-------|
| [epic-1-quick-start-onboarding.spec.md](./epic-1-quick-start-onboarding.spec.md) | Implemented | #29 |
| [quick-start-input-editing.spec.md](./quick-start-input-editing.spec.md) | Implemented | bug: quick start projection input boxes force a leading zero |
| [state-pension-indexing.spec.md](./state-pension-indexing.spec.md) | Ready | bug: State Pension amount is not indexed for inflation |
