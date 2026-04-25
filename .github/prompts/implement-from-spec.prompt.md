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
  Implement a feature from its spec file. Reads the spec, writes production-quality
  TypeScript code, and tests all acceptance criteria.
---

Read the spec at `specs/${input:specFile}.spec.md` and implement everything it requires.

> **Note:** `${input:specFile}` is a [VS Code prompt variable](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files-experimental). When invoking this prompt from Copilot Chat, VS Code will ask you to enter the spec filename (e.g., `compound-interest` for `specs/compound-interest.spec.md`). If running outside VS Code, replace the placeholder manually.

## Your Workflow

1. **Read context files first:**
   - `AGENTS.md` — project overview, commands, architecture
   - `.github/copilot-instructions.md` — coding standards (strict TypeScript, Tailwind, no hardcoded locale strings)
   - `docs/architecture.md` — component relationships and data flow
   - `docs/glossary.md` — domain terminology
   - `docs/project.context.md` — active work that may affect this implementation

2. **Read and understand the spec completely** before writing any code:
   - Identify every acceptance criterion
   - Note dependencies on other features
   - Flag any ambiguities with inline comments documenting your assumption

3. **Plan your changes:**
   - Business logic → `src/lib/` (pure functions, no React, no DOM)
   - UI components → `src/components/<feature>/` (Tailwind CSS, functional React)
   - Custom hooks → `src/hooks/`
   - Shared types → `src/types/index.ts`
   - Locale strings → `src/locales/en-GB/` (never hardcode user-facing strings in components)

4. **Write the implementation** following all rules in `.github/copilot-instructions.md`.

5. **Write tests** for every acceptance criterion in the spec:
   - Co-locate tests: `src/lib/<module>.test.ts` or `src/components/<feature>/__tests__/`
   - Aim for 100% branch coverage on all `src/lib/` functions
   - Use descriptive test names and the Arrange–Act–Assert pattern

6. **Validate before finishing:**
   ```bash
   npm run lint && npm run typecheck && npm run test:run
   ```
   All must pass with zero errors.

## Non-Negotiable Rules

- No `any` in TypeScript — use `unknown` and narrow with type guards
- No hardcoded `£`, `$`, or date formats — use the locale layer
- No business logic in React components — pure functions in `src/lib/`
- UK defaults: GBP, ISA/SIPP, DD/MM/YYYY, April–March tax year
- Tests are mandatory — a PR without tests for new logic will be rejected
- Do not touch `docs/decisions/` — ADRs are immutable

## Definition of Done

- [ ] Every spec acceptance criterion is satisfied
- [ ] All new functions, hooks, and components have tests
- [ ] `npm run lint` passes with zero warnings
- [ ] `npm run typecheck` passes with zero errors
- [ ] `npm run test:run` passes with zero failures
- [ ] `npm run build` succeeds
- [ ] PR description references the spec and explains how to verify the change
