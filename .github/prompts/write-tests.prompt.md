---
mode: agent
tools:
  - read_file
  - write_file
  - create_file
  - run_terminal_cmd
  - search_files
  - list_dir
description: >
  Analyse src/lib/ for uncovered or under-tested code and write comprehensive
  unit tests to close the gaps.
---

Analyse `src/lib/` for uncovered or under-tested code and write comprehensive unit tests.

## Your Workflow

1. **Read context first:**
   - `AGENTS.md` — project overview, test commands, architecture
   - `.github/copilot-instructions.md` — testing conventions (Vitest, RTL, Arrange–Act–Assert)

2. **Generate a coverage baseline:**
   ```bash
   npm run test:coverage
   ```
   Identify all files in `src/lib/` with fewer than 100% branch coverage.

3. **Read each under-covered file carefully:**
   - Understand the function signatures, input types, and expected outputs
   - Identify every uncovered branch, edge case, and error path

4. **Write tests** for every gap found:
   - Place test files alongside the source: `src/lib/<module>.test.ts`
   - Use `describe` blocks to group related tests logically
   - Use descriptive `it` names: `it("returns 0 when principal is 0", ...)`
   - Follow the **Arrange–Act–Assert** pattern strictly
   - Test behaviour and output — not implementation details or internal state
   - Cover edge cases: zero values, negative inputs, `NaN`, `Infinity`, boundary conditions, and type coercion

5. **Validate your tests:**
   ```bash
   npm run test:run
   npm run test:coverage
   ```
   Every new test must pass. Coverage for `src/lib/` must be at or near 100% branch coverage after your changes.

## Coverage Targets

| Path | Target |
|------|--------|
| `src/lib/` | 100% branch coverage |
| `src/hooks/` | Key logic paths covered |
| `src/components/` | Behaviour tests for non-trivial UI logic |

## Testing Rules

- **Vitest** is the test runner — use `describe`, `it`, `expect`, `beforeEach`, `vi.mock`
- **React Testing Library** for component tests — query by role and accessible name, not test IDs
- Mock only what is strictly necessary — prefer testing real implementations
- Do not test implementation details (internal variable names, private methods)
- Do not remove or weaken existing tests
- Each test must have a single, clear assertion purpose

## Definition of Done

- [ ] `npm run test:coverage` shows 100% branch coverage for all `src/lib/` files
- [ ] All new tests pass with `npm run test:run`
- [ ] No existing tests are modified or deleted
- [ ] Test names clearly describe the behaviour under test
