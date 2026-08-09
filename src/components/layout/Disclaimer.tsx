import type { LocaleStrings } from "@/locales/en-GB";

type DisclaimerProps = {
  strings: LocaleStrings;
};

/**
 * The required disclaimer, always visible in the page footer (acceptance
 * criterion 20: "The disclaimer is always available").
 */
export function Disclaimer({ strings }: DisclaimerProps) {
  return (
    <footer
      role="contentinfo"
      aria-label={strings.disclaimer.label}
      className="border-t border-zinc-200 bg-zinc-100 px-6 py-4 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
    >
      <p className="mx-auto max-w-6xl">
        <strong className="font-semibold text-zinc-800 dark:text-zinc-200">
          {strings.disclaimer.label}:{" "}
        </strong>
        {strings.disclaimer.text}
      </p>
    </footer>
  );
}
