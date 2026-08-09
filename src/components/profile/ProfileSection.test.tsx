import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileSection } from "./ProfileSection";
import { getLocaleStrings } from "@/locales";
import { createExamplePlan } from "@/lib/example-plan";

const strings = getLocaleStrings("en-GB");

describe("ProfileSection", () => {
  it("calls onChange when current age changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const profile = createExamplePlan().profile;
    render(
      <ProfileSection
        strings={strings}
        profile={profile}
        onChange={onChange}
      />,
    );
    const input = screen.getByLabelText(strings.profile.currentAge);
    await user.clear(input);
    await user.type(input, "40");
    expect(onChange).toHaveBeenCalled();
  });

  it("does not show a validation error for a valid profile", () => {
    const profile = createExamplePlan().profile;
    render(
      <ProfileSection strings={strings} profile={profile} onChange={vi.fn()} />,
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("shows a validation error for an invalid profile", () => {
    const profile = {
      ...createExamplePlan().profile,
      retirementAge: 30,
      currentAge: 35,
    };
    render(
      <ProfileSection strings={strings} profile={profile} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("calls onChange when reporting currency changes", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const profile = createExamplePlan().profile;
    render(
      <ProfileSection
        strings={strings}
        profile={profile}
        onChange={onChange}
      />,
    );
    await user.selectOptions(
      screen.getByLabelText(strings.profile.reportingCurrency),
      "USD",
    );
    expect(onChange).toHaveBeenCalledWith({ reportingCurrency: "USD" });
  });
});
