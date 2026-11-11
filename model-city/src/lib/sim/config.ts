import type { BranchId, Difficulty, SegmentId, VerticalId } from "./types";

/** Every tunable number lives here so the balance script can sweep it. */
export const CONFIG = {
  start: {
    cash: { chill: 540_000, normal: 340_000, brutal: 170_000, sandbox: 9_999_999 },
    computeOwned: { chill: 40_000, normal: 24_000, brutal: 12_000, sandbox: 500_000 },
    hype: 6,
    morale: 72,
    devRep: 4,
    userTrust: 55,
    investorConfidence: 30,
    safety: 55,
    dataQty: 1_200,
    dataQuality: 48,
    salaryPerHeadDay: 320,
    rentDay: 120,
    /** Multiplier on every cost. */
    costScale: { chill: 0.82, normal: 1, brutal: 1.14, sandbox: 0.6 },
    /** Multiplier on revenue + growth. */
    growthScale: { chill: 1.25, normal: 1, brutal: 0.86, sandbox: 3 },
  },
  time: {
    daysPerWeek: 7,
    daysPerQuarter: 90,
    speeds: [0, 1, 2, 4] as const,
    msPerDayBase: 620,
  },
  economy: {
    /** GPU-hour wholesale price, USD. */
    gpuHourCost: 0.62,
    spotDiscount: 0.42,
    gpuHourPerQualityPoint: 0.014,
    inferenceCostPerBParamPerMTok: 0.0042,
    freeUserMessages: 12,
    dailyActiveShare: 0.34,
    marketingCostPerUser: 3.4,
    churnBase: 0.052,
    churnElasticity: 0.9,
    priceElasticity: 1.35,
    organicGrowthBase: 0.021,
    hypeToSignup: 0.00042,
    trustToConversion: 0.0007,
    supportCostPerPaidUserDay: 0.028,
    outageTrustHit: 4.5,
    benchmarkWarmthDays: 45,
  },
  market: {
    startShare: 0.004,
    rivalCount: 7,
    leaderboardStart: 1180,
    trendDriftDays: 90,
  },
  funding: {
    stageThresholds: { garage: 0, seed: 900_000, scaleup: 9_000_000, unicorn: 120_000_000, frontier: 900_000_000 },
    valuationRevenueMultiple: { garage: 9, seed: 14, scaleup: 22, unicorn: 30, frontier: 34 },
    valuationHypeMultiple: 0.012,
    dilutionPerRoundBase: 0.17,
    investorPatienceDays: 200,
    boardOustThreshold: 0.18,
  },
  difficulty: {
    chill: { eventMultiplier: 0.7, minigamePenalty: 0.72, rivalAggression: 0.8 },
    normal: { eventMultiplier: 1, minigamePenalty: 1, rivalAggression: 1 },
    brutal: { eventMultiplier: 1.35, minigamePenalty: 1.25, rivalAggression: 1.25 },
    sandbox: { eventMultiplier: 0.4, minigamePenalty: 0.6, rivalAggression: 0.6 },
  } satisfies Record<Difficulty, { eventMultiplier: number; minigamePenalty: number; rivalAggression: number }>,
  minigame: {
    retryCost: 1_800,
    skipPenalty: 0.72,
    skipCashSaving: 0.12,
    gradeBands: { bronze: 45, silver: 65, gold: 82, perfect: 93 },
    assistCost: 12_000,
    assistBonus: 0.12,
  },
  review: {
    maxPosts: 240,
    postsPerDay: 1.6,
    influencerChance: 0.08,
  },
  history: { maxPoints: 400 },
} as const;

export const SEGMENTS: Record<
  SegmentId,
  { name: string; share: number; arpu: number; churn: number; usage: number; priceSensitivity: number }
> = {
  hobbyists: { name: "Hobbyists", share: 0.3, arpu: 8, churn: 0.09, usage: 40, priceSensitivity: 1.4 },
  students: { name: "Students", share: 0.18, arpu: 6, churn: 0.11, usage: 55, priceSensitivity: 1.7 },
  developers: { name: "Developers", share: 0.16, arpu: 24, churn: 0.05, usage: 210, priceSensitivity: 0.8 },
  startups: { name: "Startups", share: 0.14, arpu: 120, churn: 0.04, usage: 900, priceSensitivity: 0.5 },
  enterprises: { name: "Enterprises", share: 0.06, arpu: 2400, churn: 0.015, usage: 7400, priceSensitivity: 0.25 },
  power: { name: "Power users", share: 0.08, arpu: 42, churn: 0.06, usage: 1600, priceSensitivity: 0.35 },
  abusers: { name: "Scrapers & abusers", share: 0.08, arpu: 0, churn: 0.2, usage: 5200, priceSensitivity: 0 },
};

export const VERTICALS: Record<
  VerticalId,
  { name: string; blurb: string; costBias: number; qualityBias: number }
> = {
  chat: { name: "Chat assistant", blurb: "Everyone's first demo. Crowded, cheap, forgiving.", costBias: 1, qualityBias: 1 },
  coding: { name: "Coding copilot", blurb: "High willingness to pay, brutal benchmark culture.", costBias: 1.15, qualityBias: 1.08 },
  image: { name: "Image studio", blurb: "Compute-hungry, viral-friendly, moderation headaches.", costBias: 1.4, qualityBias: 1.04 },
  voice: { name: "Voice agents", blurb: "Latency is the product. Enterprises pay early.", costBias: 1.2, qualityBias: 0.98 },
  enterprise: { name: "Enterprise automation", blurb: "Slow sales, fat contracts, compliance theatre.", costBias: 0.95, qualityBias: 0.95 },
  research: { name: "Research tooling", blurb: "Tiny market, enormous reputation, safety halo.", costBias: 0.9, qualityBias: 1.02 },
};

export const BRANCH_LABELS: Record<BranchId, string> = {
  models: "Models",
  data: "Data",
  infra: "Infrastructure",
  products: "Products",
  safety: "Safety & Policy",
};

export const RESEARCH_COST = (level: number): { cash: number; days: number; compute: number } => ({
  cash: Math.round(9_000 * 1.55 ** level),
  days: Math.max(3, Math.round(6 + level * 2.4)),
  compute: Math.round(2_400 * 1.42 ** level),
});

export const ROLES = [
  { id: "ml", name: "ML researcher", base: 620, skillBias: 1.1 },
  { id: "infra", name: "Infra engineer", base: 540, skillBias: 1.0 },
  { id: "design", name: "Product designer", base: 460, skillBias: 0.9 },
  { id: "growth", name: "Growth lead", base: 500, skillBias: 0.9 },
  { id: "safety", name: "Safety engineer", base: 580, skillBias: 1.0 },
  { id: "ops", name: "Ops generalist", base: 400, skillBias: 0.85 },
] as const;
