import type { LocaleStrings } from "@/locales/en-GB";
import type { Insight } from "@/types";
import { SectionCard } from "@/components/ui/SectionCard";

type InsightsPanelProps = {
  strings: LocaleStrings;
  insights: Insight[];
};

export function InsightsPanel({ strings, insights }: InsightsPanelProps) {
  const s = strings.insights;

  return (
    <SectionCard id="insights" title={s.title}>
      {insights.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {insights.map((insight) => (
            <li
              key={insight.id}
              className={[
                "rounded-lg border p-3 text-sm",
                insight.severity === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-900/30 dark:text-amber-200"
                  : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-200",
              ].join(" ")}
            >
              <p className="font-semibold">{insight.title}</p>
              <p className="mt-1">{insight.detail}</p>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
