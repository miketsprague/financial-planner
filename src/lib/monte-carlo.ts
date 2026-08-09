import type {
  MonteCarloPercentilePoint,
  MonteCarloResult,
  Plan,
} from "@/types";
import {
  isValidProjectionProfile,
  projectPlanWithReturnShock,
} from "./calculations";

/** Default deterministic seed used when the caller does not supply one. */
export const DEFAULT_MONTE_CARLO_SEED = 20250809;

const MIN_SIMULATION_RUNS = 500;
const MAX_SIMULATION_RUNS = 5000;
const DEFAULT_SIMULATION_RUNS = 1000;

/**
 * Deterministic pseudo-random generator (mulberry32). Produces a repeatable
 * stream of numbers in [0, 1) from an integer seed so that Monte Carlo runs
 * are explainable and repeatable in tests (spec: "Monte Carlo").
 */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample via the Box–Muller transform. */
function nextGaussian(rng: () => number): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** Clamp the bounded simulation run count (500–5,000, default 1,000). */
export function normalizeSimulationRuns(runs: number): number {
  if (!Number.isFinite(runs) || !Number.isInteger(runs))
    return DEFAULT_SIMULATION_RUNS;
  return Math.min(MAX_SIMULATION_RUNS, Math.max(MIN_SIMULATION_RUNS, runs));
}

/** Nearest-rank percentile on a pre-sorted ascending array. */
function nearestRank(sortedAscending: number[], percentile: number): number {
  if (sortedAscending.length === 0) return 0;
  const rank = Math.ceil((percentile / 100) * sortedAscending.length);
  const index = Math.min(sortedAscending.length, Math.max(1, rank)) - 1;
  return sortedAscending[index];
}

/**
 * Run a seeded Monte Carlo simulation for a plan (acceptance criteria 11–12).
 *
 * Each annual path applies one normally distributed market-return shock
 * (scaled by `assumptions.returnVolatility`) to every account's expected
 * return, using a deterministic seeded generator. With zero volatility every
 * path equals the deterministic projection. A path succeeds only when its
 * closing balance is greater than zero at every projected age. Percentiles
 * use the nearest-rank method and always satisfy `p10 <= p50 <= p90`.
 * Invalid plans return a safe empty result.
 */
export function runMonteCarloSimulation(
  plan: Plan,
  seed: number = DEFAULT_MONTE_CARLO_SEED,
): MonteCarloResult {
  const emptyResult: MonteCarloResult = {
    successProbability: 0,
    percentiles: [],
    seed,
    runs: 0,
  };

  if (!isValidProjectionProfile(plan.profile)) return emptyResult;

  const runs = normalizeSimulationRuns(plan.assumptions.simulationRuns);
  const volatility = Number.isFinite(plan.assumptions.returnVolatility)
    ? Math.min(0.6, Math.max(0, plan.assumptions.returnVolatility))
    : 0;

  const rng = createRng(seed);
  const ages: number[] = [];
  const balancesByAgeIndex: number[][] = [];
  let successes = 0;

  for (let run = 0; run < runs; run++) {
    let allPositive = true;
    // `shockForAge` is invoked exactly once per age by the projection loop, so one
    // gaussian draw per age gives every account the same market shock that year.
    const points = projectPlanWithReturnShock(
      plan,
      () => nextGaussian(rng) * volatility,
    );

    points.forEach((point, index) => {
      if (run === 0) {
        ages.push(point.age);
        balancesByAgeIndex.push([]);
      }
      balancesByAgeIndex[index].push(point.closingBalance);
      if (point.closingBalance <= 0) allPositive = false;
    });

    if (allPositive && points.length > 0) successes += 1;
  }

  const percentiles: MonteCarloPercentilePoint[] = ages.map((age, index) => {
    const sorted = [...balancesByAgeIndex[index]].sort((a, b) => a - b);
    return {
      age,
      p10: nearestRank(sorted, 10),
      p50: nearestRank(sorted, 50),
      p90: nearestRank(sorted, 90),
    };
  });

  return {
    successProbability: runs > 0 ? successes / runs : 0,
    percentiles,
    seed,
    runs,
  };
}
