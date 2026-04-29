# Quick-Start Numeric Input Editing

**Status:** Implemented  
**Issue:** bug: quick start projection input boxes force a leading zero  
**Branch:** `copilot/fix-input-box-leading-zero`

---

## Background

Quick-start projection fields are controlled numeric inputs. When a user cleared a field, the form immediately converted the empty string to `0`, causing the field to display `0` before the user finished typing. Typing a replacement value could then produce confusing values such as `035` instead of `35`.

---

## User Stories

> As a user, I want to clear and retype quick-start numeric inputs without a forced leading zero so that editing existing values feels predictable.

---

## Acceptance Criteria

1. Clearing any quick-start numeric input leaves the visible field temporarily empty while the user is editing.
2. Retyping a value after clearing a field displays exactly the typed digits, without an inserted leading zero.
3. Submitting with a cleared required field shows the existing required validation error.
4. Submitting a valid form converts string input values back to `QuickStartInput` numbers before saving or projecting.
5. Existing validation constraints from `epic-1-quick-start-onboarding.spec.md` remain unchanged.

---

## Data Model

No persisted data model changes. `QuickStartInput` remains the submitted numeric shape:

```typescript
type QuickStartInput = {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  annualIncome: number;
};
```

---

## Business Logic

The form may keep in-progress field values as strings so empty input can be represented during editing. On blur or submit, the string form values are parsed and validated before any `QuickStartInput` is emitted.

---

## UI / UX

The quick-start form keeps the same fields, labels, validation messages, and locale-sourced currency prefix. The only UX change is that clearing a numeric field no longer immediately repopulates it with `0`.

---

## Non-Functional Requirements

- Preserve accessibility attributes for invalid fields.
- Do not introduce hardcoded currency symbols or locale-specific formatting.
- Add focused component tests for the input editing behaviour.

---

## Out of Scope

- Changing quick-start default values.
- Changing validation ranges or financial assumptions.
- Replacing native number inputs with custom formatted inputs.
