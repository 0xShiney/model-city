import type { Achievement, BranchId, EffectKey, GameState } from "./types";
import { bestModel, productQuality, runwayMonths } from "./economy";

export interface TechNodeDef {
  id: string;
  branch: BranchId;
  tier: number;
  name: string;
  desc: string;
  cost: number;
  days: number;
  compute: number;
  effects: Partial<Record<EffectKey, number>>;
}

export const TECH_TREE: TechNodeDef[] = [
  // Models
  { id: "models-transformer", branch: "models", tier: 1, name: "Sparse Attention", desc: "Long context without the invoice shock.", cost: 18_000, days: 6, compute: 3_000, effects: { qualityDelta: 1.4 } },
  { id: "models-moe", branch: "models", tier: 2, name: "Mixture of Experts", desc: "Route tokens to tiny specialists. Cheaper per useful answer.", cost: 46_000, days: 10, compute: 9_000, effects: { qualityDelta: 2.2, techDebt: 3 } },
  { id: "models-reasoning", branch: "models", tier: 3, name: "Deliberate Reasoning", desc: "Think longer before answering. Users notice the pauses.", cost: 120_000, days: 16, compute: 26_000, effects: { qualityDelta: 3.4 } },
  { id: "models-multimodal", branch: "models", tier: 4, name: "Unified Multimodal", desc: "One tower for text, image, audio. Expensive, impressive.", cost: 280_000, days: 24, compute: 60_000, effects: { qualityDelta: 4, hype: 4 } },
  { id: "models-agents", branch: "models", tier: 5, name: "Agentic Loops", desc: "The model uses tools, retries, and occasionally its judgement.", cost: 620_000, days: 34, compute: 140_000, effects: { qualityDelta: 5, techDebt: 6 } },
  // Data
  { id: "data-dedupe", branch: "data", tier: 1, name: "Dedupe Pipeline", desc: "Delete the same paragraph, four million times.", cost: 14_000, days: 5, compute: 1_200, effects: { dataQuality: 4 } },
  { id: "data-license", branch: "data", tier: 2, name: "Licensing Desk", desc: "Pay publishers properly. Sleep better.", cost: 55_000, days: 9, compute: 0, effects: { dataQuality: 5, legalRisk: -8, compliance: 6, cash: -5_000 } },
  { id: "data-synthetic", branch: "data", tier: 3, name: "Synthetic Data Farm", desc: "Generate your own textbooks. Watch for model collapse.", cost: 96_000, days: 14, compute: 18_000, effects: { dataQty: 2_500, dataQuality: 3, techDebt: 4 } },
  { id: "data-rlhf", branch: "data", tier: 4, name: "Human Preference Engine", desc: "A small army of raters with strong opinions.", cost: 190_000, days: 18, compute: 12_000, effects: { qualityDelta: 2, dataQuality: 6 } },
  { id: "data-provenance", branch: "data", tier: 5, name: "Full Provenance Ledger", desc: "Every token, traceable. Enterprise legal teams weep with joy.", cost: 340_000, days: 26, compute: 8_000, effects: { legalRisk: -14, compliance: 12, investorConfidence: 4 } },
  // Infra
  { id: "infra-kernels", branch: "infra", tier: 1, name: "Custom Kernels", desc: "Hand-tuned matmuls. The unglamorous 30% speedup.", cost: 16_000, days: 6, compute: 2_400, effects: { energyCost: -0.12 } },
  { id: "infra-scheduler", branch: "infra", tier: 2, name: "Batch Scheduler", desc: "Fill the gaps in the GPU graph instead of idling.", cost: 42_000, days: 10, compute: 5_000, effects: { techDebt: -3, energyCost: -0.1 } },
  { id: "infra-quantize", branch: "infra", tier: 3, name: "Aggressive Quantisation", desc: "Smaller weights, faster answers, one or two personality quirks.", cost: 88_000, days: 13, compute: 8_000, effects: { qualityDelta: -0.8, techDebt: 2 } },
  { id: "infra-datacenter", branch: "infra", tier: 4, name: "Own Datacenter", desc: "Concrete, cooling, and a very large electricity bill.", cost: 260_000, days: 22, compute: 0, effects: { computeOwned: 60_000, energyCost: 40 } },
  { id: "infra-grid", branch: "infra", tier: 5, name: "Grid Negotiation Team", desc: "Buy power like a small nation.", cost: 420_000, days: 28, compute: 0, effects: { energyCost: -60, legalRisk: -2 } },
  // Products
  { id: "products-playground", branch: "products", tier: 1, name: "Playground v2", desc: "A chat box that does not lose your prompt.", cost: 12_000, days: 4, compute: 0, effects: { userTrust: 4 } },
  { id: "products-teams", branch: "products", tier: 2, name: "Team Workspaces", desc: "Shared prompts, admin controls, invoices someone can approve.", cost: 38_000, days: 9, compute: 0, effects: { paidUsersPct: 0.04 } },
  { id: "products-api", branch: "products", tier: 3, name: "Developer Platform", desc: "Keys, docs, rate limits, the whole boring cathedral.", cost: 78_000, days: 12, compute: 2_000, effects: { userTrust: 5, devRep: 4 } },
  { id: "products-enterprise", branch: "products", tier: 4, name: "Enterprise Suite", desc: "SSO, audit logs, and a procurement-approved font.", cost: 210_000, days: 20, compute: 0, effects: { paidUsersPct: 0.05, marketShare: 0.01 } },
  { id: "products-platform", branch: "products", tier: 5, name: "Agent Marketplace", desc: "Let customers build on you. Also let them blame you.", cost: 380_000, days: 30, compute: 6_000, effects: { userTrust: 3, hype: 8 } },
  // Safety
  { id: "safety-evals", branch: "safety", tier: 1, name: "Eval Suite", desc: "Write down what good looks like before shipping.", cost: 10_000, days: 4, compute: 800, effects: { safety: 4 } },
  { id: "safety-redteam", branch: "safety", tier: 2, name: "Internal Red Team", desc: "Hire people to break your product before the internet does.", cost: 48_000, days: 10, compute: 3_000, effects: { safety: 7, legalRisk: -5 } },
  { id: "safety-cards", branch: "safety", tier: 3, name: "Model Cards", desc: "Publish the limitations. Watch rivals quietly copy the format.", cost: 60_000, days: 8, compute: 0, effects: { investorConfidence: 4, safety: 3, legalRisk: -4 } },
  { id: "safety-audit", branch: "safety", tier: 4, name: "Third-Party Audit", desc: "Pay a firm to sign a document nobody reads but everyone asks for.", cost: 150_000, days: 16, compute: 0, effects: { compliance: 10, legalRisk: -10, investorConfidence: 5 } },
  { id: "safety-policy", branch: "safety", tier: 5, name: "Policy Institute", desc: "Write the rules you will be judged by. Risky, effective.", cost: 300_000, days: 26, compute: 0, effects: { compliance: 12, marketShare: 0.008, safety: 6 } },
];

export function techById(id: string): TechNodeDef | undefined {
  return TECH_TREE.find((node) => node.id === id);
}

export function techForBranch(branch: BranchId): TechNodeDef[] {
  return TECH_TREE.filter((node) => node.branch === branch);
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-boot", name: "It Compiles", desc: "Boot the game and name a company.", hidden: false },
  { id: "logo-designer", name: "Brand Department of One", desc: "Design a logo and use it everywhere.", hidden: false },
  { id: "first-model", name: "Hello, Weights", desc: "Release your first model.", hidden: false },
  { id: "first-revenue", name: "Dollar One", desc: "Record your first dollar of revenue.", hidden: false },
  { id: "first-hire", name: "Two-Person Startup", desc: "Make your first hire.", hidden: false },
  { id: "first-minigame", name: "Undignified but Effective", desc: "Finish any minigame.", hidden: false },
  { id: "perfect-run", name: "Perfect Run", desc: "Score 93+ in any minigame.", hidden: false },
  { id: "gold-seven", name: "Seven for Seven", desc: "Gold or better on every pipeline stage of one model.", hidden: false },
  { id: "skip-everything", name: "Trust the Process", desc: "Skip a pipeline minigame.", hidden: false },
  { id: "first-funding", name: "Other People's Money", desc: "Close your first funding round.", hidden: false },
  { id: "seed", name: "Seed Stage", desc: "Reach a seed-stage valuation.", hidden: false },
  { id: "series-a", name: "Series A", desc: "Raise a Series A.", hidden: false },
  { id: "unicorn", name: "Unicorn", desc: "Reach a 120M valuation.", hidden: false },
  { id: "frontier", name: "Frontier Lab", desc: "Reach a 900M valuation.", hidden: false },
  { id: "ipo", name: "Bell Ringing", desc: "Take the company public.", hidden: false },
  { id: "acquired", name: "Acqui-hired", desc: "Accept an acquisition offer.", hidden: false },
  { id: "bankrupt", name: "Out of Runway", desc: "Run out of cash.", hidden: false },
  { id: "ousted", name: "Boardroom Coup", desc: "Get replaced by your own board.", hidden: false },
  { id: "indie", name: "Quietly Profitable", desc: "Reach profitability without raising.", hidden: false },
  { id: "breakthrough", name: "The Paper Everyone Cites", desc: "Trigger a research breakthrough.", hidden: false },
  { id: "burnout", name: "Founder Mode, Off", desc: "Burn out your founder.", hidden: false },
  { id: "ten-k-users", name: "Ten Thousand Humans", desc: "Reach 10k users.", hidden: false },
  { id: "hundred-k-users", name: "A Real Company", desc: "Reach 100k users.", hidden: false },
  { id: "million-users", name: "Default Tool", desc: "Reach 1M users.", hidden: false },
  { id: "million-mrr", name: "Seven Figures", desc: "Reach 1M MRR.", hidden: false },
  { id: "first-outage", name: "Status: Degraded", desc: "Survive an outage.", hidden: false },
  { id: "first-lawsuit", name: "See You in Court", desc: "Get sued.", hidden: false },
  { id: "first-scandal", name: "Screenshot SZN", desc: "Have a model scandal.", hidden: false },
  { id: "benchmark-gamer", name: "Benchmark Enjoyer", desc: "Overfit to public benchmarks.", hidden: true },
  { id: "benchmark-exposed", name: "The Gap", desc: "Get exposed for benchmark gaming.", hidden: true },
  { id: "open-weights", name: "Gift Economy", desc: "Release open weights.", hidden: false },
  { id: "price-cut", name: "Race to the Bottom", desc: "Cut API prices.", hidden: false },
  { id: "price-hike", name: "Courageous Pricing", desc: "Raise subscription prices.", hidden: false },
  { id: "churn-spike", name: "Revolving Door", desc: "Lose 10% of users in a month.", hidden: true },
  { id: "viral", name: "It Escaped Containment", desc: "Have a post go viral.", hidden: false },
  { id: "press-hit", name: "Front Page", desc: "Get written up by the press.", hidden: false },
  { id: "board-meeting", name: "Adults in the Room", desc: "Hold your first board meeting.", hidden: false },
  { id: "down-round", name: "Reality Check", desc: "Close a down round.", hidden: true },
  { id: "fifty-people", name: "Org Chart Territory", desc: "Reach 50 employees.", hidden: false },
  { id: "zero-morale", name: "Culture Problem", desc: "Let morale hit zero.", hidden: true },
  { id: "safety-zero", name: "Move Fast", desc: "Let safety hit zero.", hidden: true },
  { id: "zero-hallucination", name: "Grounded", desc: "Release a model with under 3% hallucination.", hidden: true },
  { id: "all-apps", name: "Clicked Everything", desc: "Open every app at least once.", hidden: false },
  { id: "tutorial-grad", name: "Read the Manual", desc: "Finish the spotlight tutorial.", hidden: false },
  { id: "ami", name: "Asking for a Friend", desc: "Ask the in-game model 20 questions.", hidden: false },
  { id: "day-365", name: "One Year Later", desc: "Play 365 days.", hidden: false },
  { id: "profit", name: "Boring Math", desc: "Have revenue exceed costs for 30 days.", hidden: false },
  { id: "downloaded-save", name: "Paranoia Pays", desc: "Export your save.", hidden: false },
  { id: "seed-hunter", name: "Deal Flow", desc: "Receive three term sheets.", hidden: false },
  { id: "reject-vc", name: "Grown-Up", desc: "Turn down a term sheet.", hidden: true },
  { id: "ipo-day", name: "Roadshow Warrior", desc: "Win the IPO roadshow minigame.", hidden: true },
  { id: "keynote-gold", name: "Demo Gods", desc: "Gold the keynote demo.", hidden: true },
  { id: "redteam-gold", name: "Adversary", desc: "Gold the red team minigame.", hidden: true },
  { id: "architect", name: "Systems Person", desc: "Gold the architecture puzzle.", hidden: true },
  { id: "new-game-plus", name: "Again, With Feeling", desc: "Start a New Game+ run.", hidden: false },
];

export function checkAchievements(state: GameState, unlocked: Set<string>): string[] {
  const fresh: string[] = [];
  const profit = state.kpis.mrr > 0 && state.kpis.mrr > (state.kpis.mrr - 0); // replaced below by cost check
  void profit;
  const best = bestModel(state);
  const conditions: Record<string, boolean> = {
    "first-boot": true,
    "logo-designer": Boolean(state.company.logo.symbol && state.company.logo.wordmark),
    "first-model": state.stats.modelsShipped > 0,
    "first-revenue": state.kpis.mrr > 0,
    "first-hire": state.team.length > 0,
    "first-minigame": state.minigames.played > 0,
    "perfect-run": Object.values(state.minigames.best).some((score) => (score ?? 0) >= 93),
    "gold-seven": state.models.some((model) => {
      const scores = Object.values(model.stageScores);
      return scores.length >= 7 && scores.every((score) => (score ?? 0) >= 82);
    }),
    "skip-everything": state.minigames.assists.includes("skipped"),
    "first-funding": state.funding.rounds > 0,
    seed: state.funding.stage !== "garage",
    "series-a": state.funding.capTable.filter((row) => row.kind === "investor").length >= 4,
    unicorn: (state.funding.stage === "unicorn" || state.funding.stage === "frontier"),
    frontier: state.funding.stage === "frontier",
    "ten-k-users": state.kpis.users >= 10_000,
    "hundred-k-users": state.kpis.users >= 100_000,
    "million-users": state.kpis.users >= 1_000_000,
    "million-mrr": state.kpis.mrr >= 1_000_000,
    "first-outage": state.events.log.some((entry) => entry.title.toLowerCase().includes("outage")),
    "first-lawsuit": state.legal.lawsuits > 0,
    "first-scandal": state.stats.scandals > 0,
    "benchmark-gamer": state.models.some((model) => model.benchmarkGaming),
    "benchmark-exposed": state.models.some((model) => model.benchmarkGaming && model.hidden.scandalPending === false && model.status === "released"),
    "open-weights": state.product.roadmap.includes("open-weights"),
    "price-cut": state.pricing.experiments.includes("price-cut"),
    "price-hike": state.pricing.experiments.includes("price-hike"),
    "churn-spike": state.kpis.churn > 0.1,
    viral: state.social.some((post) => post.likes > 2_000),
    "press-hit": state.social.some((post) => post.platform === "press"),
    "board-meeting": state.quarter >= 1,
    "down-round": state.pricing.experiments.includes("down-round"),
    "fifty-people": state.team.length >= 50,
    "zero-morale": state.res.morale <= 0,
    "safety-zero": state.res.safety <= 0,
    "zero-hallucination": Boolean(best && best.hidden.hallucination < 3),
    "tutorial-grad": state.tutorials.seen.includes("tutorial-complete"),
    ami: state.stats.launches >= 0 && state.minigames.played > 0 && state.social.length > 0 && state.stats.daysPlayed > 0 && state.models.length > 0 && state.tutorials.seen.includes("playground-chat"),
    "day-365": state.day >= 365,
    profit: state.kpis.mrr > 0 && runwayMonths(state) > 90,
    "downloaded-save": state.tutorials.seen.includes("save-exported"),
    "seed-hunter": state.funding.rounds >= 3,
    "reject-vc": state.funding.capTable.some((row) => row.name === "Rejected term sheet"),
    "new-game-plus": state.seed.startsWith("NG+"),
  };

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) continue;
    if (conditions[achievement.id]) fresh.push(achievement.id);
  }
  return fresh;
}

export function qualityWord(value: number): string {
  if (value >= 90) return "state of the art";
  if (value >= 78) return "strong";
  if (value >= 64) return "competent";
  if (value >= 50) return "uneven";
  if (value >= 35) return "rough";
  return "a liability";
}

export function stageName(quality: number): string {
  if (quality >= 92) return "frontier-grade";
  if (quality >= 80) return "competitive";
  if (quality >= 65) return "usable";
  if (quality >= 45) return "demo-grade";
  return "science project";
}

export function productVerdict(state: GameState): string {
  const quality = productQuality(state);
  if (quality === 0) return "No model in production. The website is a brochure.";
  return `Product quality reads as ${qualityWord(quality)}.`;
}

