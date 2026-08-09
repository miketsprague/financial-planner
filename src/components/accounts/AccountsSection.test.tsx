import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountsSection } from "./AccountsSection";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";

const strings = getLocaleStrings("en-GB");

describe("AccountsSection", () => {
  it("renders the empty state when there are no accounts", () => {
    render(
      <AccountsSection
        strings={strings}
        accounts={[]}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/No accounts yet/i)).toBeInTheDocument();
  });

  it("calls onAdd when the add button is clicked", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <AccountsSection
        strings={strings}
        accounts={[]}
        onAdd={onAdd}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    await user.click(
      screen.getByRole("button", { name: strings.accounts.add }),
    );
    expect(onAdd).toHaveBeenCalledOnce();
  });

  it("shows a PFIC consideration note for an ISA account", () => {
    const accounts = createExamplePlan().accounts.filter(
      (a) => a.type === "uk-isa",
    );
    render(
      <AccountsSection
        strings={strings}
        accounts={accounts}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={vi.fn()}
      />,
    );
    expect(screen.getByText(/PFIC/i)).toBeInTheDocument();
  });

  it("calls onUpdate when a field changes", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    const accounts = [createExamplePlan().accounts[0]];
    render(
      <AccountsSection
        strings={strings}
        accounts={accounts}
        onAdd={vi.fn()}
        onUpdate={onUpdate}
        onRemove={vi.fn()}
      />,
    );
    const nameInput = screen.getByLabelText(strings.accounts.name);
    await user.clear(nameInput);
    await user.type(nameInput, "X");
    expect(onUpdate).toHaveBeenCalled();
  });

  it("requires confirmation before removing an account", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const accounts = [createExamplePlan().accounts[0]];
    render(
      <AccountsSection
        strings={strings}
        accounts={accounts}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: strings.accounts.remove }),
    );
    const dialog = await screen.findByRole("alertdialog");
    expect(onRemove).not.toHaveBeenCalled();

    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );
    expect(onRemove).toHaveBeenCalledWith(accounts[0].id);
  });

  it("cancels removal without calling onRemove", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const accounts = [createExamplePlan().accounts[0]];
    render(
      <AccountsSection
        strings={strings}
        accounts={accounts}
        onAdd={vi.fn()}
        onUpdate={vi.fn()}
        onRemove={onRemove}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: strings.accounts.remove }),
    );
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.cancel }),
    );
    expect(onRemove).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
