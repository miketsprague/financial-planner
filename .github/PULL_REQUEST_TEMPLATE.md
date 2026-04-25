## Summary

<!-- What changed and why? Be concise but complete. -->


## Related Issue / Spec

<!-- Link the issue this PR closes and the spec it implements. -->

Closes #

- Spec: `specs/`
- Issue: #

## Changes

<!-- Bullet-point list of what was changed. -->

-
-

## How to Test Manually

<!-- Step-by-step instructions for a reviewer to verify the change. -->

1.
2.
3.

## Checklist

### Code Quality
- [ ] TypeScript strict mode — no `any`, no `@ts-ignore` without explanation
- [ ] No business logic in React components — logic lives in `src/lib/`
- [ ] No hardcoded locale strings — locale layer used for all user-facing text
- [ ] No hardcoded currency symbols or date formats

### Tests
- [ ] New logic has unit tests in `src/lib/` or co-located `__tests__/`
- [ ] Tests follow Arrange–Act–Assert pattern with descriptive names
- [ ] `npm run test:run` passes locally

### CI
- [ ] `npm run lint` — no ESLint errors
- [ ] `npm run typecheck` — no TypeScript errors
- [ ] `npm run build` — static export succeeds

### Documentation
- [ ] Spec in `specs/` matches the implementation (or no spec was required for this change)
- [ ] `docs/project.context.md` updated if goals or active work changed
- [ ] New domain terms added to `docs/glossary.md`
- [ ] Architecture docs updated if structure changed (`docs/architecture.md`)

### PR Hygiene
- [ ] PR title follows format: `<type>(<scope>): <short description>` (e.g. `feat(calculations): add inflation projection`)
- [ ] Scope is small and reviewable — one feature or fix per PR
- [ ] No debug code, console.log statements, or temporary TODOs left in
- [ ] Branch is up to date with `main`

---

<!-- Agent note: if this PR was produced by a Copilot agent, confirm all checklist items above before requesting review. -->
