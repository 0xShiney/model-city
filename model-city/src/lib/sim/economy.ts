import { CONFIG, SEGMENTS, VERTICALS } from "./config";
import { clamp } from "./rng";
import type { GameState, ModelSpec, PlanConfig, PlanId, SegmentId } from "./types";

export function releasedModels(state: GameState): ModelSpec[] {
  return state.models.filter((m) => m.status === "released");
}

export function bestModel(state: GameState): ModelSpec | null {
  const released = releasedModels(state);
  if (released.length === 0) return null;
  return released.reduce((best, m) => (m.quality > best.quality ? m : best));
}

export function activeModel(state: GameState): ModelSpec | null {
  if (state.activeModelId) {
    const found = state.models.find((m) => m.id === state.activeModelId);
    if (found && found.status === "released") return found;
  }
  return bestModel(state);
}

/** Product quality blends the model, the last shipped version and website polish. */
export function productQuality(state: GameState): number {
  const model = activeModel(state);
  if (!model) return 0;
  const version = state.product.versions.at(-1);
  const versionBoost = version ? clamp((version.quality - 50) * 0.18, -6, 9) : 0;
  const site = (state.website.designScore + state.website.speedScore) / 2;
  return clamp(model.quality * 0.82 + versionBoost + site * 0.08, 0, 100);
}

export function costPerMessage(state: GameState, model: ModelSpec | null = activeModel(state)): number {
  if (!model) return 0.0004;
  const infra = state.research.infra;
  const efficiency = 1 + infra * 0.06;
  const tokens = 0.00052; // ~520 tokens round trip, in millions of tokens
  return (model.costPerMTok * tokens) / efficiency;
}

export function activePlans(state: GameState): PlanConfig[] {
  return state.pricing.plans.filter((plan) => plan.enabled);
}

export function averageMessagesPerUser(state: GameState): { paid: number; free: number } {
  let weighted = 0;
  let weight = 0;
  (Object.keys(SEGMENTS) as SegmentId[]).forEach((key) => {
    const segment = SEGMENTS[key];
    weighted += segment.usage * segment.share;
    weight += segment.share;
  });
  const paid = weight > 0 ? weighted / weight : 60;
  return { paid, free: CONFIG.economy.freeUserMessages * 3.2 };
}

export function dailyInferenceCost(state: GameState): number {
  const model = activeModel(state);
  if (!model) return 0;
  const usage = averageMessagesPerUser(state);
  const paid = state.kpis.paidUsers * usage.paid;
  const free = Math.max(0, state.kpis.users - state.kpis.paidUsers) * usage.free;
  return (paid + free) * costPerMessage(state, model);
}

export function salariesDaily(state: GameState): number {
  const founders = 1;
  const team = state.team.reduce((sum, person) => sum + person.salary, 0);
  return (team + founders * CONFIG.start.salaryPerHeadDay) * CONFIG.start.costScale[state.difficulty];
}

export function dailyCostBreakdown(state: GameState): Record<string, number> {
  const scale = CONFIG.start.costScale[state.difficulty];
  // Rented hours are consumed and re-rented daily; owned capacity is depreciated
  // slowly, so a garage full of cards does not bankrupt you by Thursday.
  const compute =
    (state.res.computeRented * CONFIG.economy.gpuHourCost * 0.9 +
      state.res.computeOwned * CONFIG.economy.gpuHourCost * 0.012) *
    scale;
  const energy = state.res.energyCost;
  const legal = 20 + state.legal.risk * 12 + state.legal.lawsuits * 420;
  const support = state.kpis.paidUsers * CONFIG.economy.supportCostPerPaidUserDay;
  const marketing = state.website.abTest === "signup" ? 160 : 90;
  const upkeep = CONFIG.start.rentDay + state.office.upgrades.length * 140;
  const all = {
    compute,
    energy,
    salaries: salariesDaily(state),
    inference: dailyInferenceCost(state),
    legal,
    support,
    marketing,
    upkeep,
    data: 0,
  };
  return all;
}

export function dailyCosts(state: GameState): number {
  return Object.values(dailyCostBreakdown(state)).reduce((sum, value) => sum + value, 0);
}

export function monthlyRecurring(state: GameState): number {
  const plans = activePlans(state);
  if (plans.length === 0) return 0;
  const price = weightedPrice(state);
  const paid = state.kpis.paidUsers;
  const enterpriseShare = 0.06;
  const enterprise = paid * enterpriseShare * 5.5;
  const api = state.kpis.users * 0.004 * (state.pricing.apiInput + state.pricing.apiOutput) * 0.35;
  return price * (paid - paid * enterpriseShare) + enterprise * price + api;
}

export function weightedPrice(state: GameState): number {
  const plans = activePlans(state).filter((p) => p.id !== "free");
  if (plans.length === 0) return 0;
  const weights: Record<PlanId, number> = { free: 0, plus: 4, pro: 3, team: 1.6, enterprise: 0.4 };
  const total = plans.reduce((sum, plan) => sum + weights[plan.id], 0);
  if (total === 0) return plans[0]?.price ?? 0;
  return plans.reduce((sum, plan) => sum + plan.price * weights[plan.id], 0) / total;
}

export function grossMargin(state: GameState): number {
  const mrr = monthlyRecurring(state);
  const cogs = (dailyInferenceCost(state) + dailyCostBreakdown(state).compute) * 30;
  if (mrr <= 0) return -1;
  return (mrr - cogs) / mrr;
}

export function planMargins(state: GameState): { plan: PlanConfig; usage: number; cost: number; margin: number }[] {
  const usage = averageMessagesPerUser(state);
  return state.pricing.plans.map((plan) => {
    const messages = Math.min(plan.capMessages, usage.paid);
    const cost = messages * costPerMessage(state);
    const margin = plan.price > 0 ? (plan.price - cost) / plan.price : -1;
    return { plan, usage: messages, cost, margin };
  });
}

export function churnRate(state: GameState): number {
  const value = productQuality(state);
  const price = weightedPrice(state);
  const costOfLiving = 18;
  const valueScore = clamp((value - 40) / 60, -0.3, 1);
  const pricePain = clamp((price / costOfLiving - 1) * CONFIG.economy.priceElasticity * 0.06, -0.02, 0.12);
  const trustPenalty = (60 - state.res.userTrust) * 0.0009;
  const outagePenalty = state.legal.lawsuits * 0.004;
  return clamp(CONFIG.economy.churnBase - valueScore * 0.036 + pricePain + trustPenalty + outagePenalty, 0.008, 0.34);
}

export function dailyRevenue(state: GameState): number {
  return monthlyRecurring(state) / 30;
}

export function burnRate(state: GameState): number {
  return dailyCosts(state) - dailyRevenue(state);
}

export function runwayDays(state: GameState): number {
  const burn = burnRate(state);
  if (burn <= 0) return Number.POSITIVE_INFINITY;
  return state.res.cash / burn;
}

export function runwayMonths(state: GameState): number {
  const days = runwayDays(state);
  return Number.isFinite(days) ? days / 30 : 99;
}

export function funnel(state: GameState): { visitors: number; signups: number; activated: number; paid: number } {
  const visitors = state.kpis.visitors;
  return {
    visitors,
    signups: state.kpis.signups,
    activated: state.kpis.activated,
    paid: state.kpis.paidUsers,
  };
}

/** Monthly survival curve, used by the cohort retention chart. */
export function cohortRetention(state: GameState): number[] {
  const churn = churnRate(state);
  const points: number[] = [];
  let alive = 100;
  for (let month = 0; month < 12; month++) {
    points.push(Math.round(alive));
    alive *= 1 - churn;
  }
  return points;
}

export function segmentRevenue(state: GameState, segment: SegmentId): number {
  const info = SEGMENTS[segment];
  const users = state.kpis.paidUsers * info.share;
  return users * info.arpu;
}

export function organicGrowth(state: GameState): number {
  const quality = productQuality(state) / 100;
  const siteScore =
    (state.website.designScore + state.website.seoScore + state.website.speedScore + state.website.trustScore) / 400;
  const hype = clamp(state.res.hype / 100, 0, 1.6);
  const trend = state.market.trend === state.company.vertical ? 1.16 : 0.95;
  const rep = clamp(state.res.devRep / 100, 0, 1.4);
  const base = CONFIG.economy.organicGrowthBase * CONFIG.start.growthScale[state.difficulty];
  const share = clamp(0.35 + state.market.share * 6, 0.2, 1.8);
  return base * (0.25 + quality * 1.5) * (0.5 + siteScore) * (0.45 + hype) * trend * (0.6 + rep) * share;
}

export function dailySignups(state: GameState): number {
  const visitors = state.kpis.visitors;
  const conversion =
    0.03 +
    state.website.trustScore * 0.0005 +
    state.res.userTrust * 0.0003 +
    (state.website.abTest === "signup" ? 0.012 : 0) +
    state.research.products * 0.004;
  return visitors * clamp(conversion, 0.012, 0.22);
}

export function netNewUsers(state: GameState): number {
  const churned = state.kpis.users * (churnRate(state) / 30);
  const signups = dailySignups(state);
  const growth = state.kpis.users * organicGrowth(state);
  return signups + growth - churned;
}

export function verticalInfo(state: GameState) {
  return VERTICALS[state.company.vertical];
}

export function marketDemand(state: GameState): number {
  return 1 + (state.market.trend === state.company.vertical ? state.market.trendBonus : 0);
}
