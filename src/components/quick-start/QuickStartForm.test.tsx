import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import enGB from "@/locales/en-GB";
import { QuickStartForm } from "./QuickStartForm";

describe("QuickStartForm", () => {
  it.each([
    { field: "current age", label: enGB.quickStart.currentAge },
    { field: "retirement age", label: enGB.quickStart.retirementAge },
    { field: "life expectancy", label: enGB.quickStart.lifeExpectancy },
    { field: "current savings", label: enGB.quickStart.currentSavings },
    { field: "annual income", label: enGB.quickStart.annualIncome },
  ])("allows the $field field to be cleared before retyping", async ({ label }) => {
    const user = userEvent.setup();

    render(<QuickStartForm strings={enGB} onSubmit={vi.fn()} />);

    const input = screen.getByLabelText(label) as HTMLInputElement;

    await user.clear(input);
    expect(input.value).toBe("");

    await user.type(input, "35");
    expect(input.value).toBe("35");
  });

  it("shows a required error when a cleared field is submitted", async () => {
    const user = userEvent.setup();

    render(<QuickStartForm strings={enGB} onSubmit={vi.fn()} />);

    await user.clear(screen.getByLabelText(enGB.quickStart.currentAge));
    await user.click(screen.getByRole("button", { name: enGB.quickStart.submit }));

    expect(screen.getByText(enGB.quickStart.errors.required)).toBeInTheDocument();
  });

  it("submits a retyped current age as a number", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<QuickStartForm strings={enGB} onSubmit={onSubmit} />);

    const input = screen.getByLabelText(enGB.quickStart.currentAge);
    await user.clear(input);
    await user.type(input, "35");
    await user.click(screen.getByRole("button", { name: enGB.quickStart.submit }));

    expect(onSubmit).toHaveBeenCalledWith({
      currentAge: 35,
      retirementAge: 67,
      lifeExpectancy: 90,
      currentSavings: 0,
      annualIncome: 40000,
    });
  });
});
