import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import enGB from "@/locales/en-GB";
import { UK_DEFAULTS } from "@/lib/defaults";
import { AssumptionsPanel } from "./AssumptionsPanel";

describe("AssumptionsPanel", () => {
  it("exposes income replacement ratio as a configurable slider", () => {
    const onUpdate = vi.fn();

    render(
      <AssumptionsPanel
        strings={enGB}
        assumptions={UK_DEFAULTS}
        onUpdate={onUpdate}
        onReset={vi.fn()}
      />,
    );

    const slider = screen.getByLabelText(/Income Replacement/i);

    expect(slider).toHaveAttribute("type", "range");
    expect(slider).toHaveAttribute("min", "0.5");
    expect(slider).toHaveAttribute("max", "0.8");

    fireEvent.change(slider, { target: { value: "0.75" } });

    expect(onUpdate).toHaveBeenLastCalledWith("incomeReplacementRatio", 0.75);
  });
});
