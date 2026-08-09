import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CashFlowSection } from "./CashFlowSection";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";

const strings = getLocaleStrings("en-GB");

describe("CashFlowSection", () => {
  it("calls onChange when take-home income changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const cashFlow = createExamplePlan().cashFlow;
    render(
      <CashFlowSection
        strings={strings}
        cashFlow={cashFlow}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText(strings.cashFlow.takeHomeIncome);
    await user.clear(input);
    await user.type(input, "60000");
    expect(onChange).toHaveBeenCalled();
  });

  it("calls onChange when the current spending currency changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const cashFlow = createExamplePlan().cashFlow;
    render(
      <CashFlowSection
        strings={strings}
        cashFlow={cashFlow}
        onChange={onChange}
      />,
    );
    const selects = screen.getAllByLabelText(strings.cashFlow.currency);
    await user.selectOptions(selects[1], "USD");
    expect(onChange).toHaveBeenCalledWith({
      currentSpending: { ...cashFlow.currentSpending, currency: "USD" },
    });
  });
});
