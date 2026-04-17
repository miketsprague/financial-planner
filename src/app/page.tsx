export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <main className="flex max-w-2xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Financial Planner
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Long-term financial planning with Monte Carlo simulation, inflation
          adjustment, and scenario comparison.
        </p>
        <p className="text-sm text-zinc-400">
          🚧 Under construction — built via agentic development workflows
        </p>
      </main>
    </div>
  );
}
