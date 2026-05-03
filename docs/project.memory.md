# Project Memory

Significant decisions, hard-won lessons, and rejected approaches. Written for future agents
and developers who were not present when the decision was made.

---

## Income replacement ratio: make it configurable from the start

**Context:** The initial projection engine hardcoded `2/3` as the retirement income
replacement ratio inside `computeAnnualWithdrawal()`. This was identified as a bug — it is
a material planning assumption that varies by household.

**Decision:** Move the ratio into `Assumptions.incomeReplacementRatio` with a UK default of
`2 / 3`. Pass it explicitly into
`computeAnnualWithdrawal(annualIncome, statePension, incomeReplacementRatio)`.

**Migration strategy:** `deserializePlans()` spreads `UK_DEFAULTS` before the stored
assumptions object. Any saved plan missing a newer field automatically inherits the current
UK default. This is the established pattern for all future additions to `Assumptions` —
always add the field to `UK_DEFAULTS` at the same time as the type.

**Lesson:** Every numeric constant in `Assumptions` that a user might reasonably want to
change should be a named field in `UK_DEFAULTS`, not a literal in a calculation function.
When adding a new `Assumptions` field, simultaneously add it to `UK_DEFAULTS` (so
`deserializePlans` migration works) and add a test that restores the default for a legacy
plan missing the field.

**Refs:** `specs/configurable-income-replacement-ratio.spec.md`, PR #50.

---

## UK-defaults-as-migration pattern

**Context:** As `Assumptions` grows, saved plans in `localStorage` will not have newer
fields. We need a safe upgrade path without a formal migration version scheme.

**Decision:** `deserializePlans()` always does `{ ...UK_DEFAULTS, ...plan.assumptions }`,
so any missing field falls back to the UK default. This is safe as long as UK defaults are
sensible (not zero or null) for every field.

**Caveat:** Changing a UK default in `defaults.ts` will silently "upgrade" any plan that
never explicitly set that field. Document default changes clearly in commit messages.

**Alternative rejected:** A versioned migration function (e.g. `migratePlan(v1Plan) → v2Plan`)
was considered but deemed over-engineered for a client-side localStorage app at this stage.
Revisit if the Assumptions schema diverges significantly between locales.

---

## Static export chosen over server-side rendering

**Context:** Initial framework setup. Considered full Next.js SSR on Vercel.

**Decision:** Static export (`output: "export"`) to GitHub Pages. No server, no database,
no account linking.

**Reason:** Privacy-first; all data stays in the browser. Zero hosting cost. Simpler
security surface.
