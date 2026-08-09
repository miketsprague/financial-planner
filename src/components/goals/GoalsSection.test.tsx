import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { GoalsSection } from "./GoalsSection";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";

const strings = getLocaleStrings("en-GB");

describe("GoalsSection", () => {
  it("renders the empty state when there are no goals", () => {
    render(
      <GoalsSection
        strings={strings}
        goals={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/No one-off goals yet/i)).toBeInTheDocument();
  });

  it("calls onAdd when the add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <GoalsSection
        strings={strings}
        goals={[]}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: strings.goals.add }));
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("calls onUpdate when the amount changes", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const goals = [createExamplePlan().goals[0]];
    render(
      <GoalsSection
        strings={strings}
        goals={goals}
        onAdd={vi.fn()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />,
    );
    const amountInput = screen.getByLabelText(strings.goals.amount);
    await user.clear(amountInput);
    await user.type(amountInput, "500");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("removes a goal after confirmation", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const goals = [createExamplePlan().goals[0]];
    render(
      <GoalsSection
        strings={strings}
        goals={goals}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: strings.goals.remove }),
    );
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );
    expect(onRemove).toHaveBeenCalledWith(goals[0].id);
  });
});
