# QA Bot Agent

**Status:** Implemented  
**Issue:** #<!-- qa-bot-issue -->

---

## Background

When a pull request is opened or updated, there is no automated quality-assurance pass that exercises the application in a real browser. Static checks (lint, typecheck, unit tests) catch logic errors but not UI regressions, broken flows, or confusing UX. A dedicated QA bot agent closes this gap by analysing each PR's scope and running targeted Playwright browser tests against the built application, then reporting any bugs directly in the PR.

---

## User Stories

### QA-1 — Automatic QA on Every PR
> As a contributor, I want an automated QA agent to test the user-facing behaviour changed by my PR, so that regressions are caught before merge.

### QA-2 — Spec-Driven Test Focus
> As a contributor, I want the QA agent to derive its test plan from the relevant feature specs, so that tests reflect intended behaviour rather than guesswork.

### QA-3 — Bug Reports in the PR
> As a reviewer, I want the QA agent to post a structured summary of test results and any bugs found directly in the PR, so I can see QA status at a glance without leaving GitHub.

---

## Acceptance Criteria

### Workflow Trigger

1. The QA bot workflow triggers automatically on `pull_request` events of type `opened`, `synchronize`, and `ready_for_review` against the `main` branch.
2. The workflow does **not** trigger on draft PRs.

### QA Comment

3. On trigger, the workflow posts a PR comment (or updates an existing one) that addresses `@copilot` with structured QA instructions.
4. The comment includes:
   - A summary of the PR's scope (title, affected files from the diff).
   - A directive to read the relevant spec(s) from `specs/`.
   - A checklist of user flows to exercise.
   - An instruction to run Playwright against the built application.
   - A template for reporting bugs found.
5. The comment is idempotent: if a QA comment already exists on the PR (from a previous push), it is **updated** rather than duplicated.

### QA Agent Persona

6. A persona file exists at `.github/agents/qa.agent.md` with:
   - Clear role description (QA tester, not coder).
   - Step-by-step QA workflow: scope analysis → spec review → test plan → Playwright execution → bug report.
   - Structured bug report format (flow, steps to reproduce, expected vs actual, severity).
   - Explicit instructions on severity classification.
7. The persona is registered in `AGENTS.md` in the agent table.

### Prompt Template

8. A reusable prompt exists at `.github/prompts/qa-review.prompt.md` that encodes the QA process and can be used independently of the workflow.

### Playwright Integration

9. The QA agent builds the application (`npm run build`) before testing.
10. The QA agent serves the built static site locally and runs Playwright tests against it.
11. Tests cover at minimum: form submission happy path, validation error states, projection chart rendering, plan create/rename/delete, and assumptions panel interaction.

---

## Non-Functional Requirements

- **Non-blocking:** The QA workflow runs in parallel with CI; it must not block the CI status check.
- **Idempotent comments:** Re-triggering the workflow updates the existing comment rather than spamming new ones.
- **Locale-aware:** QA tests use the `en-GB` locale by default.
- **No secrets required:** The workflow uses only `GITHUB_TOKEN`.

---

## Out of Scope

- Automated fix of bugs found by the QA agent (the agent reports only; a human or implementer agent acts on findings).
- Performance benchmarking or visual regression testing (screenshot diffing).
- Mobile-specific Playwright tests (desktop viewport only for now).
- E2E test suite expansion beyond existing `e2e/` directory structure.
