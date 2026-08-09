import type { LocaleStrings } from "@/locales/en-GB";
import type { Profile } from "@/types";
import { SectionCard } from "@/components/ui/SectionCard";

type CrossBorderGuideProps = {
  strings: LocaleStrings;
  profile: Profile;
};

/** UK inheritance-tax long-term-residence threshold, effective 6 April 2025 (acceptance criterion 18). */
const UK_LONG_TERM_RESIDENCE_YEARS = 10;

export function CrossBorderGuide({ strings, profile }: CrossBorderGuideProps) {
  const s = strings.guide;
  const milestoneReached =
    profile.yearsUKResident >= UK_LONG_TERM_RESIDENCE_YEARS;

  return (
    <SectionCard id="guide" title={s.title}>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{s.intro}</p>

      <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-900 dark:bg-blue-900/30 dark:text-blue-200">
        <h3 className="font-semibold">{s.milestoneHeading}</h3>
        <p className="mt-1">{s.milestoneBody}</p>
        <p className="mt-2 font-medium">
          {profile.yearsUKResident} {s.milestoneYearsLabel} —{" "}
          {milestoneReached ? s.milestoneReached : s.milestoneNotReached}
        </p>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {s.sections.map((section) => (
          <li
            key={section.id}
            className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {section.heading}
            </h3>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {section.body}
            </p>
            <p className="mt-1 text-xs italic text-zinc-500 dark:text-zinc-500">
              {section.asOf}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {section.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-700 underline hover:text-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:text-blue-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}
