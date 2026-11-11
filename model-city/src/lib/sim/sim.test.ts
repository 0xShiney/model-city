import { describe, expect, it } from "vitest";
import { advanceDay, dispatch, newGame, type NewGameOptions } from "./engine";
import { churnRate, planMargins, runwayDays, monthlyRecurring } from "./economy";
import { dilutionPercent, founderPercent, sharesForInvestment, totalShares } from "./finance";
import { generatePost } from "./reviews";
import { Rng } from "./rng";
import type { GameState, LogoSpec, PipelineStage } from "./types";

const LOGO: LogoSpec = {
  symbol: "◆",
  mask: "none",
  colors: ["#FF5A1F", "#17150F", "#F7F3EA"],
  font: "display",
  layout: "horizontal",
  wordmark: "BASALT",
};

function makeGame(seed = "TEST-SEED", overrides: Partial<NewGameOptions> = {}): GameState {
  return newGame({
    seed,
    difficulty: "normal",
    founderName: "Ada Kovač",
    background: "researcher",
    companyName: "Basalt Labs",
    tagline: "Intelligence that actually ships",
    hq: "lisbon",
    vertical: "chat",
    logo: LOGO,
    ...overrides,
  });
}

const STAGES: PipelineStage[] = ["data", "architecture", "training", "evaluation", "safety", "polish", "launch"];

describe("deterministic engine", () => {
  it("produces an identical run for the same seed and decisions", () => {
    const a = makeGame("SAME");
    const b = makeGame("SAME");
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));

    let left = a;
    let right = b;
    for (let day = 0; day < 12; day++) {
      left = advanceDay(left);
      right = advanceDay(right);
    }
    expect(left.day).toBe(12);
    expect(JSON.stringify(left)).toBe(JSON.stringify(right));
  });

  it("advances without mutating the previous state", () => {
    const original = makeGame("IMMUTABLE");
    const next = advanceDay(original);
    expect(original.day).toBe(0);
    expect(next.day).toBe(1);
    expect(next).not.toBe(original);
  });
});

describe("cap table maths", () => {
  it("computes dilution from amount and pre-money", () => {
    expect(dilutionPercent(1_000_000, 9_000_000)).toBeCloseTo(10, 5);
    expect(dilutionPercent(250_000, 1_000_000)).toBeCloseTo(20, 5);
  });

  it("converts an investment into shares at the pre-money price", () => {
    const shares = sharesForInvestment(900_000, 9_000_000, 10_000_000);
    expect(shares).toBe(1_000_000);
    const table = [
      { id: "founder", name: "Founder", kind: "founder" as const, shares: 9_000_000, invested: 0 },
      { id: "pool", name: "Pool", kind: "optionpool" as const, shares: 1_000_000, invested: 0 },
      { id: "inv", name: "Fund", kind: "investor" as const, shares, invested: 900_000 },
    ];
    expect(totalShares(table)).toBe(11_000_000);
    expect(founderPercent(table)).toBeCloseTo(81.818, 2);
  });

  it("starts the founder at 90% before any round", () => {
    const game = makeGame("CAP");
    expect(founderPercent(game.funding.capTable)).toBe(90);
  });
});

describe("economy", () => {
  it("starts with a finite runway and a positive burn", () => {
    const game = makeGame("RUNWAY");
    const days = runwayDays(game);
    expect(Number.isFinite(days)).toBe(true);
    expect(days).toBeGreaterThan(0);
  });

  it("keeps churn inside sane bounds", () => {
    const game = makeGame("CHURN");
    const churn = churnRate(game);
    expect(churn).toBeGreaterThanOrEqual(0.008);
    expect(churn).toBeLessThanOrEqual(0.34);
  });

  it("does not report revenue before there is a product", () => {
    const game = makeGame("NOR");
    expect(monthlyRecurring(game)).toBe(0);
  });

  it("marks the free plan as a loss leader", () => {
    const game = makeGame("MARGINS");
    const free = planMargins(game).find((entry) => entry.plan.id === "free");
    expect(free).toBeDefined();
    expect(free ? free.margin : 0).toBeLessThan(0);
  });
});

describe("reviews", () => {
  it("composes a readable post deterministically", () => {
    const game = makeGame("REVIEWS");
    const first = generatePost(game, new Rng(42));
    const second = generatePost(game, new Rng(42));
    expect(first.body.length).toBeGreaterThan(12);
    expect(first.body).toBe(second.body);
    expect([-1, 0, 1]).toContain(first.sentiment);
  });
});

describe("training pipeline", () => {
  it("records stage scores and raises model quality", () => {
    let game = makeGame("PIPELINE");
    game = dispatch(game, { type: "start-model", params: 8, context: 32, benchmarkGaming: false });
    const model = game.models[0];
    expect(model).toBeDefined();
    if (!model) return;
    const before = model.quality;

    for (const stage of STAGES) {
      game = dispatch(game, { type: "stage-result", modelId: model.id, stage, score: 95, skipped: false });
    }
    const after = game.models.find((entry) => entry.id === model.id);
    expect(after).toBeDefined();
    expect(after?.quality ?? 0).toBeGreaterThan(before);
    expect(Object.keys(after?.stageScores ?? {})).toHaveLength(7);

    game = dispatch(game, { type: "release-model", modelId: model.id });
    expect(game.stats.modelsShipped).toBe(1);
    expect(game.models[0]?.status).toBe("released");
  });

  it("charges more for bigger models", () => {
    const small = dispatch(makeGame("COST-A"), { type: "start-model", params: 4, context: 8, benchmarkGaming: false });
    const big = dispatch(makeGame("COST-B"), { type: "start-model", params: 60, context: 128, benchmarkGaming: false });
    expect(small.res.cash).toBeGreaterThan(big.res.cash);
  });
});
