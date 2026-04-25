import type { Locale } from "@/types";
import enGB from "./en-GB";
import type { LocaleStrings } from "./en-GB";

export type { LocaleStrings };

// Future: add en-US strings object here and add to the map.
const locales: Record<Locale, LocaleStrings> = {
  "en-GB": enGB,
  // en-US will use a deep-merged en-GB base with US overrides
  "en-US": enGB, // temporary fallback until en-US strings are implemented
};

export function getLocaleStrings(locale: Locale = "en-GB"): LocaleStrings {
  return locales[locale] ?? enGB;
}

export { enGB };
