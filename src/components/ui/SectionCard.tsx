type SectionCardProps = {
  id?: string;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

/** Consistent card chrome used for every dashboard/editing section. */
export function SectionCard({
  id,
  title,
  children,
  actions,
}: SectionCardProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2
          id={id ? `${id}-heading` : undefined}
          className="text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        >
          {title}
        </h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
