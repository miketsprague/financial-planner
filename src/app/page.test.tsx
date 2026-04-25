import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

// useLocalStorage relies on window.localStorage - stub it out for tests
beforeEach(() => {
  vi.stubGlobal("localStorage", {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  });
});

describe("Home page", () => {
  it("renders the app title", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /Financial Planner/i })).toBeInTheDocument();
  });

  it("renders the quick-start form", () => {
    render(<Home />);
    expect(screen.getByLabelText(/Quick-Start Projection/i)).toBeInTheDocument();
  });
});
