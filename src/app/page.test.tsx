import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

function makeStore() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      store.delete(key);
    }),
  };
}

// usePlanState relies on window.localStorage — stub it out for tests.
beforeEach(() => {
  vi.stubGlobal("localStorage", makeStore());
});

// Recharts' ResponsiveContainer needs real layout dimensions that jsdom/happy-dom
// don't provide; mock a stable size so the chart renders without warnings.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe("Home page", () => {
  it("renders the app title", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /Financial Planner/i }),
    ).toBeInTheDocument();
  });

  it("renders the dashboard metrics", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /Dashboard/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Net worth/i)).toBeInTheDocument();
  });

  it("renders every focused editing section", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /^Profile$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Cash flow$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Accounts$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Future goals$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Retirement benefits$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /^Assumptions$/i }),
    ).toBeInTheDocument();
  });

  it("renders the cross-border guide and disclaimer", () => {
    render(<Home />);
    expect(
      screen.getByRole("heading", { name: /Cross-border guide/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/general educational estimates only/i),
    ).toBeInTheDocument();
  });

  it("renders the example plan's accounts by default", () => {
    render(<Home />);
    expect(
      screen.getAllByDisplayValue(/UK workplace pension/i).length,
    ).toBeGreaterThan(0);
  });
});
