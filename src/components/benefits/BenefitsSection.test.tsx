import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BenefitsSection } from "./BenefitsSection";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";

const strings = getLocaleStrings("en-GB");

describe("BenefitsSection", () => {
  it("renders the empty state when there are no benefits", () => {
    render(
      <BenefitsSection
        strings={strings}
        benefits={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/No benefits configured/i)).toBeInTheDocument();
  });

  it("calls onAdd when the add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <BenefitsSection
        strings={strings}
        benefits={[]}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: strings.benefits.add }),
    );
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("toggles the enabled checkbox", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const benefits = [createExamplePlan().benefits[0]];
    render(
      <BenefitsSection
        strings={strings}
        benefits={benefits}
        onAdd={vi.fn()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />,
    );
    await user.click(screen.getByLabelText(strings.benefits.enabled));
    expect(onUpdate).toHaveBeenCalledWith(benefits[0].id, { enabled: false });
  });

  it("removes a benefit after confirmation", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const benefits = [createExamplePlan().benefits[0]];
    render(
      <BenefitsSection
        strings={strings}
        benefits={benefits}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: strings.benefits.remove }),
    );
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );
    expect(onRemove).toHaveBeenCalledWith(benefits[0].id);
  });
});
