# Tech Stack

## Runtime

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router, static export) | 15.x |
| Language | TypeScript (strict) | 5.x |
| Styling | Tailwind CSS | v4 |
| Charts | Recharts | latest |

## Testing

| Tool | Purpose |
|------|---------|
| Vitest | Unit and integration tests (`npm run test`) |
| React Testing Library | Component behaviour tests |
| Playwright | End-to-end tests (`e2e/`) |

## CI / Deployment

| Tool | Purpose |
|------|---------|
| GitHub Actions | CI (lint, typecheck, test, build) and deployment |
| GitHub Pages | Static hosting (`out/`) |
| GitHub Copilot Cloud Agent | Agentic development workflows |

## Notable Decisions

- **Static export** — `next.config.ts` sets `output: "export"`. No server-side rendering.
- **No backend** — all state is ephemeral in React or persisted to `localStorage`.
  Privacy-first; no data leaves the browser.
- **Tailwind v4** — configuration syntax differs significantly from v3; consult Tailwind v4
  docs before adding custom tokens.
- **Vitest with happy-dom** — test environment is `happy-dom` (see `vitest.config.ts`),
  not jsdom. Browser globals are available but behaviour may differ from a real browser.
