import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home page", () => {
  it("renders the app title", () => {
    render(<Home />);
    expect(screen.getByText("Financial Planner")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<Home />);
    expect(
      screen.getByText(/Monte Carlo simulation/i),
    ).toBeInTheDocument();
  });
});
