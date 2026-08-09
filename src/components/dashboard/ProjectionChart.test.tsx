import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectionChart } from "./ProjectionChart";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";
import { projectPlan } from "@/lib/calculations";
import { runMonteCarloSimulation } from "@/lib/monte-carlo";

const strings = getLocaleStrings("en-GB");

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 800, height: 400 }}>{children}</div>
    ),
  };
});

describe("ProjectionChart", () => {
  it("renders nothing for an empty projection", () => {
    const { container } = render(
      <ProjectionChart
        strings={strings}
        currency="GBP"
        projection={[]}
        monteCarlo={{
          successProbability: 0,
          percentiles: [],
          seed: 1,
          runs: 0,
        }}
        currentAge={35}
        retirementAge={65}
        inflationRate={0.025}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders the chart title and view toggle for a valid plan", () => {
    const plan = createExamplePlan();
    const projection = projectPlan(plan);
    const monteCarlo = runMonteCarloSimulation(plan);
    render(
      <ProjectionChart
        strings={strings}
        currency={plan.profile.reportingCurrency}
        projection={projection}
        monteCarlo={monteCarlo}
        currentAge={plan.profile.currentAge}
        retirementAge={plan.profile.retirementAge}
        inflationRate={plan.assumptions.inflationRate}
      />,
    );
    expect(
      screen.getByRole("heading", { name: strings.chart.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: strings.chart.nominal }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("toggles to today's-money view", async () => {
    const user = userEvent.setup();
    const plan = createExamplePlan();
    const projection = projectPlan(plan);
    const monteCarlo = runMonteCarloSimulation(plan);
    render(
      <ProjectionChart
        strings={strings}
        currency={plan.profile.reportingCurrency}
        projection={projection}
        monteCarlo={monteCarlo}
        currentAge={plan.profile.currentAge}
        retirementAge={plan.profile.retirementAge}
        inflationRate={plan.assumptions.inflationRate}
      />,
    );
    await user.click(screen.getByRole("button", { name: strings.chart.today }));
    expect(
      screen.getByRole("button", { name: strings.chart.today }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: strings.chart.nominal }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("provides an accessible text summary", () => {
    const plan = createExamplePlan();
    const projection = projectPlan(plan);
    const monteCarlo = runMonteCarloSimulation(plan);
    render(
      <ProjectionChart
        strings={strings}
        currency={plan.profile.reportingCurrency}
        projection={projection}
        monteCarlo={monteCarlo}
        currentAge={plan.profile.currentAge}
        retirementAge={plan.profile.retirementAge}
        inflationRate={plan.assumptions.inflationRate}
      />,
    );
    expect(screen.getByText(strings.chart.summaryHeading)).toBeInTheDocument();
  });
});
