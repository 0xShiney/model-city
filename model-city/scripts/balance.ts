/**
 * Balance sweep: simulates runs with random strategies and prints the outcome
 * distribution. Run with `bun run balance`.
 *
 * Targets (Normal): ~35% of runs reach Series A+, ~10% reach IPO-scale.
 */
import { advanceDay, dispatch, newGame, type NewGameOptions } from "../src/lib/sim/engine";
import { TECH_TREE } from "../src/lib/sim/content";
import { EVENTS } from "../src/lib/sim/events";
import type { Difficulty, GameState, PipelineStage } from "../src/lib/sim/types";

const STAGES: PipelineStage[] = ["data", "architecture", "training", "evaluation", "safety", "polish", "launch"];

const LOGO = {
  symbol: "◆",
  mask: "none" as const,
  colors: ["#FF5A1F", "#17150F", "#F7F3EA"] as [string, string, string],
  font: "display" as const,
  layout: "horizontal" as const,
  wordmark: "SWEEP",
};

function pick<T>(items: readonly T[], random: () => number): T {
  return items[Math.floor(random() * items.length)] as T;
}

function seededRandom(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

interface Result {
  seed: string;
  days: number;
  stage: string;
  valuation: number;
  ending: string;
  models: number;
  users: number;
  raised: number;
  cash: number;
  mrr: number;
}

function runOne(seed: string, difficulty: Difficulty): Result {
  const random = seededRandom(seed);
  const options: NewGameOptions = {
    seed,
    difficulty,
    founderName: "Sweep Founder",
    background: "hacker",
    companyName: `Sweep ${seed.slice(-3)}`,
    tagline: "automatic",
    hq: "lisbon",
    vertical: "chat",
    logo: LOGO,
  };
  let game: GameState = newGame(options);
  let guard = 0;

  while (!game.ending && game.day < 540 && guard < 2000) {
    guard += 1;
    if (game.events.pending) {
      const event = EVENTS.find((entry) => entry.id === game.events.pending?.eventId);
      const choice = event ? pick(event.choices, random) : null;
      game = dispatch(game, { type: "event-choice", choiceId: choice?.id ?? "" });
    }

    const active = game.models.find((entry) => entry.status === "training" || entry.status === "ready");
    if (!active) {
      if (game.res.cash > 40_000) {
        game = dispatch(game, {
          type: "start-model",
          params: 4 + Math.floor(random() * 30),
          context: pick([8, 32, 128], random),
          benchmarkGaming: random() < 0.12,
        });
      }
    } else if (active.status === "training") {
      const missing = STAGES.filter((stage) => active.stageScores[stage] === undefined);
      const stage = missing[0];
      if (stage) {
        const skip = random() < 0.12;
        game = dispatch(game, {
          type: "stage-result",
          modelId: active.id,
          stage,
          score: skip ? 70 : 55 + Math.floor(random() * 45),
          skipped: skip,
        });
      }
    } else {
      game = dispatch(game, { type: "release-model", modelId: active.id, openWeights: random() < 0.1 });
    }

    if (random() < 0.12) {
      const affordable = TECH_TREE.filter(
        (node) =>
          !game.funding.inventory.includes(node.id) &&
          game.res.cash > node.cost &&
          game.res.computeOwned + game.res.computeRented > node.compute,
      );
      if (affordable.length > 0) {
        game = dispatch(game, { type: "research", nodeId: pick(affordable, random).id });
      }
    }

    if (game.funding.termSheets.length > 0 && random() < 0.3) {
      const sheet = game.funding.termSheets[0];
      if (sheet) game = dispatch(game, { type: "sign-term-sheet", sheet });
    } else if (random() < 0.02 && game.funding.rounds < 6) {
      const investors = ["hype-chaser", "deep-tech", "safety-fund", "sovereign", "big-tech"];
      game = dispatch(game, { type: "raise-round", investorId: pick(investors, random) });
    }

    if (game.day === 0) {
      for (const block of game.website.blocks.filter((entry) => !entry.enabled)) {
        game = dispatch(game, { type: "website-toggle", blockId: block.id });
      }
    }

    if (game.res.cash > 80_000 && random() < 0.05) {
      const feature = pick(["memory", "tools", "export", "vision", "teams", "voice"], random);
      if (!game.product.roadmap.includes(feature)) {
        game = dispatch(game, { type: "ship-feature", feature });
      }
    }

    if (game.team.length < 4 && game.res.cash > 100_000 && random() < 0.06) {
      game = dispatch(game, { type: "hire", candidateId: `cand-sweep-${game.day}-${Math.floor(random() * 999)}` });
    }

    game = advanceDay(game);
  }

  return {
    seed,
    days: game.day,
    stage: game.funding.stage,
    valuation: Math.round(game.kpis.mrr * 12 * 18),
    ending: game.ending ?? "running",
    models: game.stats.modelsShipped,
    users: Math.round(game.kpis.users),
    raised: Math.round(game.stats.cashRaised),
    cash: Math.round(game.res.cash),
    mrr: Math.round(game.kpis.mrr),
  };
}

function sweep(difficulty: Difficulty, runs: number): void {
  const results: Result[] = [];
  for (let index = 0; index < runs; index++) {
    results.push(runOne(`SWEEP-${difficulty}-${index}`, difficulty));
  }
  const seriesA = results.filter((result) => ["scaleup", "unicorn", "frontier"].includes(result.stage)).length;
  const ipo = results.filter((result) => result.ending === "ipo" || result.stage === "frontier").length;
  const bankrupt = results.filter((result) => result.ending === "bankrupt").length;
  const ousted = results.filter((result) => result.ending === "ousted").length;
  const avgDays = results.reduce((sum, result) => sum + result.days, 0) / results.length;
  const avgModels = results.reduce((sum, result) => sum + result.models, 0) / results.length;

  console.log(`\n=== ${difficulty.toUpperCase()} · ${runs} runs ===`);
  console.log(`reached Series A+   ${((seriesA / runs) * 100).toFixed(1)}%`);
  console.log(`IPO / frontier       ${((ipo / runs) * 100).toFixed(1)}%`);
  console.log(`bankrupt             ${((bankrupt / runs) * 100).toFixed(1)}%`);
  console.log(`ousted               ${((ousted / runs) * 100).toFixed(1)}%`);
  console.log(`avg simulated days   ${avgDays.toFixed(0)}`);
  console.log(`avg models shipped   ${avgModels.toFixed(2)}`);
  const stageCounts = results.reduce<Record<string, number>>((acc, result) => {
    acc[result.stage] = (acc[result.stage] ?? 0) + 1;
    return acc;
  }, {});
  console.log("stage distribution  ", stageCounts);
  const median = (values: number[]): number => {
    const sorted = [...values].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] ?? 0;
  };
  console.log(`median cash          $${median(results.map((entry) => entry.cash)).toLocaleString("en-US")}`);
  console.log(`median mrr           $${median(results.map((entry) => entry.mrr)).toLocaleString("en-US")}`);
  console.log(`median users         ${median(results.map((entry) => entry.users)).toLocaleString("en-US")}`);
  console.log(`median raised        $${median(results.map((entry) => entry.raised)).toLocaleString("en-US")}`);
}

const runs = Number(process.argv[2] ?? 100);
sweep("normal", runs);
sweep("brutal", Math.max(20, Math.round(runs / 2)));
sweep("chill", Math.max(20, Math.round(runs / 2)));
