import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataControls } from "./DataControls";
import { getLocaleStrings } from "@/locales";

const strings = getLocaleStrings("en-GB");

describe("DataControls", () => {
  it("triggers a download when exporting", async () => {
    const user = userEvent.setup();
    const exportPlanJson = vi.fn(() => "{}");
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, "createObjectURL", {
        value: vi.fn(),
        configurable: true,
      });
    }
    if (!URL.revokeObjectURL) {
      Object.defineProperty(URL, "revokeObjectURL", {
        value: vi.fn(),
        configurable: true,
      });
    }
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock");
    const revokeObjectURL = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => undefined);

    render(
      <DataControls
        strings={strings}
        exportPlanJson={exportPlanJson}
        importPlanJson={vi.fn()}
        resetToExample={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: strings.data.export }));

    expect(exportPlanJson).toHaveBeenCalledOnce();
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledOnce();

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });

  it("imports a file after confirmation and shows a success message", async () => {
    const user = userEvent.setup();
    const importPlanJson = vi.fn(() => ({ ok: true as const }));
    render(
      <DataControls
        strings={strings}
        exportPlanJson={vi.fn()}
        importPlanJson={importPlanJson}
        resetToExample={vi.fn()}
      />,
    );

    const file = new File(['{"hello":"world"}'], "plan.json", {
      type: "application/json",
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );

    expect(importPlanJson).toHaveBeenCalledWith('{"hello":"world"}');
    expect(
      await screen.findByText(strings.data.importSuccess),
    ).toBeInTheDocument();
  });

  it("shows an error message when import fails", async () => {
    const user = userEvent.setup();
    const importPlanJson = vi.fn(() => ({
      ok: false as const,
      error: "bad file",
    }));
    render(
      <DataControls
        strings={strings}
        exportPlanJson={vi.fn()}
        importPlanJson={importPlanJson}
        resetToExample={vi.fn()}
      />,
    );

    const file = new File(["not json"], "plan.json", {
      type: "application/json",
    });
    const input = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    await user.upload(input, file);

    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );

    expect(await screen.findByText(/bad file/i)).toBeInTheDocument();
  });

  it("resets to the example plan after confirmation", async () => {
    const user = userEvent.setup();
    const resetToExample = vi.fn();
    render(
      <DataControls
        strings={strings}
        exportPlanJson={vi.fn()}
        importPlanJson={vi.fn()}
        resetToExample={resetToExample}
      />,
    );

    await user.click(screen.getByRole("button", { name: strings.data.reset }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.confirm }),
    );

    expect(resetToExample).toHaveBeenCalledOnce();
  });

  it("cancels a reset without calling resetToExample", async () => {
    const user = userEvent.setup();
    const resetToExample = vi.fn();
    render(
      <DataControls
        strings={strings}
        exportPlanJson={vi.fn()}
        importPlanJson={vi.fn()}
        resetToExample={resetToExample}
      />,
    );

    await user.click(screen.getByRole("button", { name: strings.data.reset }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(
      within(dialog).getByRole("button", { name: strings.data.cancel }),
    );

    expect(resetToExample).not.toHaveBeenCalled();
  });
});
