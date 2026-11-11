import { CONFIG, RESEARCH_COST, SEGMENTS, VERTICALS } from "./config";
import { clamp, hashSeed, Rng } from "./rng";
import {
  activeModel,
  bestModel,
  churnRate,
  dailyCosts,
  dailyRevenue,
  monthlyRecurring,
  netNewUsers,
  productQuality,
  runwayDays,
  weightedPrice,
} from "./economy";
import { applyTermSheet, ceoControl, stageForValuation, totalShares, valuation } from "./finance";
import { generatePost } from "./reviews";
import { EVENTS, eventsById } from "./events";
import { TECH_TREE, techById } from "./content";
import {
  BACKGROUNDS,
  CITIES,
  FIRST_NAMES,
  INVESTOR_PERSONAS,
  LAST_NAMES,
  RIVAL_SEEDS,
} from "./world";
import type {
  BackgroundId,
  CityId,
  Difficulty,
  EffectKey,
  EndingId,
  GameState,
  LogoSpec,
  MinigameId,
  PipelineStage,
  PlanConfig,
  PlanId,
  StageId,
  TermSheet,
  VerticalId,
} from "./types";

const clone = (state: GameState): GameState => structuredClone(state);

const clampRes = (state: GameState): void => {
  state.res.hype = clamp(state.res.hype, 0, 100);
  state.res.morale = clamp(state.res.morale, 0, 100);
  state.res.devRep = clamp(state.res.devRep, 0, 100);
  state.res.userTrust = clamp(state.res.userTrust, 0, 100);
  state.res.investorConfidence = clamp(state.res.investorConfidence, 0, 100);
  state.res.safety = clamp(state.res.safety, 0, 100);
  state.res.dataQuality = clamp(state.res.dataQuality, 0, 100);
  state.res.dataRisk = clamp(state.res.dataRisk, 0, 100);
  state.legal.risk = clamp(state.legal.risk, 0, 100);
  state.funding.boardConfidence = clamp(state.funding.boardConfidence, 0, 100);
  state.legal.compliance = clamp(state.legal.compliance, 0, 100);
  state.res.computeOwned = Math.max(0, state.res.computeOwned);
  state.res.computeRented = Math.max(0, state.res.computeRented);
  state.kpis.churn = clamp(state.kpis.churn, 0, 1);
};

export interface NewGameOptions {
  seed: string;
  difficulty: Difficulty;
  founderName: string;
  background: BackgroundId;
  companyName: string;
  tagline: string;
  hq: CityId;
  vertical: VerticalId;
  logo: LogoSpec;
  ngPlus?: boolean;
}

export function newGame(options: NewGameOptions): GameState {
  const rng = new Rng(hashSeed(options.seed || "model-city"));
  const background = BACKGROUNDS[options.background];
  const city = CITIES[options.hq];
  const difficulty = options.difficulty;
  const startCash = CONFIG.start.cash[difficulty] + background.start.cash;
  const plans: PlanConfig[] = [
    { id: "free", enabled: true, price: 0, capMessages: 20, features: ["basic"], trialDays: 0 },
    { id: "plus", enabled: true, price: 12, capMessages: 600, features: ["faster"], trialDays: 7 },
    { id: "pro", enabled: true, price: 32, capMessages: 4_000, features: ["long context"], trialDays: 7 },
    { id: "team", enabled: false, price: 120, capMessages: 12_000, features: ["admin"], trialDays: 14 },
    { id: "enterprise", enabled: false, price: 2_400, capMessages: 200_000, features: ["SSO", "audit"], trialDays: 30 },
  ];

  return {
    version: 3,
    seed: options.seed,
    rngState: rng.state,
    difficulty,
    day: 0,
    weekday: 0,
    quarter: 1,
    era: 1,
    founder: {
      name: options.founderName.trim() || "Founder",
      background: options.background,
      trait: background.trait,
      flaw: background.flaw,
    },
    company: {
      name: options.companyName.trim() || "Basalt Labs",
      tagline: options.tagline,
      hq: options.hq,
      vertical: options.vertical,
      logo: options.logo,
      foundedDay: 0,
    },
    res: {
      cash: Math.round(startCash * city.costMod * 0.4 + startCash * 0.6),
      computeOwned: Math.round((CONFIG.start.computeOwned[difficulty] + background.start.computeOwned) * city.energyMod),
      computeRented: 0,
      energyCost: Math.round(4 * (city.energyMod - 1) * 100) / 10,
      dataQty: CONFIG.start.dataQty,
      dataQuality: clamp(CONFIG.start.dataQuality + background.start.dataQuality, 0, 100),
      dataRisk: 12,
      morale: clamp(CONFIG.start.morale + background.start.morale, 0, 100),
      devRep: clamp(CONFIG.start.devRep + background.start.devRep, 0, 100),
      userTrust: CONFIG.start.userTrust,
      investorConfidence: clamp(CONFIG.start.investorConfidence + background.start.investorConfidence, 0, 100),
      hype: clamp(CONFIG.start.hype + background.start.hype, 0, 100),
      safety: clamp(CONFIG.start.safety + background.start.safety, 0, 100),
      techDebt: 4,
    },
    kpis: {
      users: 0,
      paidUsers: 0,
      mrr: 0,
      churn: 0.05,
      nps: 0,
      arpu: 0,
      cac: 0,
      visitors: 0,
      signups: 0,
      activated: 0,
      reviewsCount: 0,
      sentiment: 0,
    },
    models: [],
    activeModelId: null,
    team: [],
    pricing: {
      plans,
      apiInput: 4,
      apiOutput: 12,
      annualDiscount: 20,
      studentDiscount: 30,
      lastChangedDay: 0,
      experiments: [],
    },
    product: { versions: [], roadmap: [] },
    website: {
      blocks: [
        { id: "hero", kind: "hero", enabled: true },
        { id: "features", kind: "features", enabled: true },
        { id: "pricing", kind: "pricing", enabled: true },
        { id: "playground", kind: "playground", enabled: true },
        { id: "docs", kind: "docs", enabled: false },
        { id: "changelog", kind: "changelog", enabled: false },
        { id: "customers", kind: "customers", enabled: false },
        { id: "careers", kind: "careers", enabled: false },
        { id: "blog", kind: "blog", enabled: false },
        { id: "status", kind: "status", enabled: true },
      ],
      template: "salvage",
      accent: "#FF5A1F",
      designScore: 34,
      seoScore: 30,
      speedScore: 58,
      trustScore: 26,
      abTest: "none",
    },
    social: [],
    market: {
      rivals: RIVAL_SEEDS.map((rival) => ({ ...rival })),
      share: CONFIG.market.startShare,
      trend: "chat",
      trendBonus: 0.08,
    },
    research: { models: 0, data: 0, infra: 0, products: 0, safety: 0 },
    legal: { risk: 8, lawsuits: 0, auditsPassed: 0, compliance: 6, redTeamScore: 0 },
    funding: {
      stage: "garage",
      rounds: 0,
      lastRoundDay: -999,
      capTable: [
        { id: "founder", name: options.founderName || "Founder", kind: "founder", shares: 9_000_000, invested: 0 },
        { id: "pool", name: "Option pool", kind: "optionpool", shares: 1_000_000, invested: 0 },
      ],
      termSheets: [],
      boardConfidence: 52,
      ceoControl: 90,
      inventory: [],
    },
    office: { upgrades: [], desks: 1 },
    events: { log: [], pending: null, lastEventDay: -10 },
    mail: [
      {
        id: `mail-welcome-${rng.int(100, 999)}`,
        day: 0,
        from: "Wren Achterberg",
        subject: "Your garage has a company in it now",
        body: "Congratulations on incorporating. Rule one: the model is never as good as the demo. Rule two: the demo is the only thing anyone remembers. Ship something small this week, then ship something honest.",
        kind: "system",
        read: false,
      },
      {
        id: `mail-advisor-${rng.int(100, 999)}`,
        day: 0,
        from: "Wren Achterberg",
        subject: "Runway math, briefly",
        body: "Cash divided by monthly burn is your runway. Every hire shortens it. Every dollar of margin lengthens it. That is the whole game at the start, whatever the pitch deck says.",
        kind: "system",
        read: false,
      },
    ],
    history: [],
    achievements: [],
    diary: ["Day 0 — Founded " + (options.companyName || "the company") + " in a garage with one GPU and too much confidence."],
    tutorials: { seen: [], dismissed: [] },
    minigames: { played: 0, best: {}, assists: [] },
    ending: null,
    stats: { modelsShipped: 0, hires: 0, fires: 0, launches: 0, scandals: 0, cashRaised: 0, daysPlayed: 0 },
  };
}

export function applyEffects(state: GameState, effects: Partial<Record<EffectKey, number>> | undefined): GameState {
  if (!effects) return state;
  const s = clone(state);
  for (const [key, raw] of Object.entries(effects)) {
    const value = raw ?? 0;
    switch (key as EffectKey) {
      case "cash":
        s.res.cash += value;
        break;
      case "hype":
        s.res.hype += value;
        break;
      case "morale":
        s.res.morale += value;
        break;
      case "devRep":
        s.res.devRep += value;
        break;
      case "userTrust":
        s.res.userTrust += value;
        break;
      case "investorConfidence":
        s.res.investorConfidence += value;
        break;
      case "safety":
        s.res.safety += value;
        break;
      case "dataQty":
        s.res.dataQty += value;
        break;
      case "dataQuality":
        s.res.dataQuality += value;
        break;
      case "dataRisk":
        s.res.dataRisk += value;
        break;
      case "computeOwned":
        s.res.computeOwned += value;
        break;
      case "computeRented":
        s.res.computeRented += value;
        break;
      case "energyCost":
        s.res.energyCost += value;
        break;
      case "techDebt":
        s.res.techDebt += value;
        break;
      case "legalRisk":
        s.legal.risk += value;
        break;
      case "lawsuits":
        s.legal.lawsuits += value;
        break;
      case "compliance":
        s.legal.compliance += value;
        break;
      case "usersPct":
        s.kpis.users = Math.max(0, Math.round(s.kpis.users * (1 + value)));
        break;
      case "paidUsersPct":
        s.kpis.paidUsers = Math.max(0, Math.round(s.kpis.paidUsers * (1 + value) + s.kpis.users * value * 0.15));
        break;
      case "churnDelta":
        s.kpis.churn += value;
        break;
      case "qualityDelta":
        s.models = s.models.map((model) => ({ ...model, quality: clamp(model.quality + value, 0, 100) }));
        break;
      case "marketShare":
        s.market.share = clamp(s.market.share + value, 0, 1);
        break;
      case "boardConfidence":
        s.funding.boardConfidence += value;
        break;
      case "ceoControl":
        s.funding.ceoControl += value;
        break;
      default:
        break;
    }
  }
  clampRes(s);
  return s;
}

export type Command =
  | { type: "research"; nodeId: string }
  | { type: "hire"; candidateId: string }
  | { type: "fire"; employeeId: string }
  | { type: "train-employee"; employeeId: string }
  | { type: "set-plan"; planId: PlanId; patch: Partial<PlanConfig> }
  | { type: "set-api-price"; input: number; output: number }
  | { type: "website-toggle"; blockId: string }
  | { type: "website-template"; template: GameState["website"]["template"] }
  | { type: "website-accent"; accent: string }
  | { type: "website-ab"; test: GameState["website"]["abTest"] }
  | { type: "start-model"; params: number; context: number; benchmarkGaming: boolean; name?: string }
  | { type: "stage-result"; modelId: string; stage: PipelineStage; score: number; skipped: boolean }
  | { type: "release-model"; modelId: string; openWeights?: boolean }
  | { type: "buy-compute"; gpus: number; owned: boolean }
  | { type: "event-choice"; choiceId: string; score?: number }
  | { type: "raise-round"; investorId: string }
  | { type: "sign-term-sheet"; sheet: TermSheet }
  | { type: "reject-term-sheet"; investorId: string }
  | { type: "social-action"; action: "reply" | "ads" | "sponsor" | "apology" | "ama"; postId?: string }
  | { type: "legal-action"; action: "license" | "audit" | "settle" | "compliance" }
  | { type: "office-upgrade"; id: string }
  | { type: "ship-feature"; feature: string }
  | { type: "read-mail"; id: string }
  | { type: "mail-action"; id: string }
  | { type: "choose-ending"; ending: EndingId }
  | { type: "apply-effects"; effects: Partial<Record<EffectKey, number>>; note?: string };

export function dispatch(state: GameState, command: Command): GameState {
  if (state.ending && command.type !== "read-mail") return state;
  const rng = new Rng(state.rngState + 7);
  let s = clone(state);

  switch (command.type) {
    case "research": {
      const node = techById(command.nodeId);
      if (!node) return state;
      if (s.funding.inventory.includes(node.id)) return state;
      if (s.research[node.branch] < node.tier - 1) return state;
      if (s.res.cash < node.cost || s.res.computeOwned + s.res.computeRented < node.compute) return state;
      if (s.research[node.branch] >= node.tier) return state;
      s.res.cash -= node.cost;
      s.res.computeOwned = Math.max(0, s.res.computeOwned - node.compute);
      s.research[node.branch] = node.tier;
      s.funding.inventory.push(node.id);
      s.events.log.unshift({
        id: `log-${s.day}-${node.id}`,
        day: s.day,
        title: node.name,
        body: `${node.desc} Research advanced to tier ${node.tier} in ${node.branch}.`,
        tone: "good",
      });
      s.diary.unshift(`Day ${s.day} — Finished ${node.name}. ${node.desc}`);
      s = applyEffects(s, node.effects);
      break;
    }
    case "hire": {
      const candidate = s.funding.inventory.includes(command.candidateId) ? null : null;
      void candidate;
      const role = s.funding.inventory.find((id) => id === command.candidateId);
      void role;
      const generated = candidateFor(s, command.candidateId);
      if (!generated) return state;
      if (s.res.cash < (generated.salary * 10 + 0)) return state;
      s.team.push(generated);
      s.office.desks = Math.max(s.office.desks, s.team.length + 1);
      s.stats.hires += 1;
      s.res.morale = clamp(s.res.morale + 2, 0, 100);
      s.events.log.unshift({
        id: `log-hire-${generated.id}`,
        day: s.day,
        title: `${generated.name} joins as ${generated.role}`,
        body: `${generated.trait}${generated.flaw ? ` Flaw: ${generated.flaw}` : ""}`,
        tone: "good",
      });
      break;
    }
    case "fire": {
      const person = s.team.find((member) => member.id === command.employeeId);
      if (!person) return state;
      s.team = s.team.filter((member) => member.id !== command.employeeId);
      s.res.cash -= person.salary * 4;
      s.res.morale = clamp(s.res.morale - 5, 0, 100);
      s.stats.fires += 1;
      break;
    }
    case "train-employee": {
      const person = s.team.find((member) => member.id === command.employeeId);
      if (!person || s.res.cash < 6_000) return state;
      person.skill = clamp(person.skill + 4, 0, 100);
      person.morale = clamp(person.morale + 3, 0, 100);
      s.res.cash -= 6_000;
      break;
    }
    case "set-plan": {
      const plan = s.pricing.plans.find((entry) => entry.id === command.planId);
      if (!plan) return state;
      const previous = plan.price;
      Object.assign(plan, command.patch);
      s.pricing.lastChangedDay = s.day;
      if (plan.price > previous && previous > 0) {
        s.pricing.experiments.push("price-hike");
        s.res.userTrust = clamp(s.res.userTrust - 4, 0, 100);
        s.res.hype = clamp(s.res.hype - 2, 0, 100);
      }
      if (plan.price < previous) {
        s.pricing.experiments.push("price-cut");
        s.res.userTrust = clamp(s.res.userTrust + 2, 0, 100);
      }
      break;
    }
    case "set-api-price": {
      s.pricing.apiInput = Math.max(0.4, command.input);
      s.pricing.apiOutput = Math.max(1, command.output);
      s.res.devRep = clamp(s.res.devRep + (command.input < 3 ? 2 : -1), 0, 100);
      break;
    }
    case "website-toggle": {
      const block = s.website.blocks.find((entry) => entry.id === command.blockId);
      if (!block) return state;
      block.enabled = !block.enabled;
      recomputeWebsite(s);
      break;
    }
    case "website-template": {
      s.website.template = command.template;
      recomputeWebsite(s);
      break;
    }
    case "website-accent": {
      s.website.accent = command.accent;
      recomputeWebsite(s);
      break;
    }
    case "website-ab": {
      s.website.abTest = command.test;
      s.res.cash -= 4_000;
      break;
    }
    case "start-model": {
      if (s.models.some((model) => model.status === "training")) return state;
      const cost = Math.round(6_000 + command.params * 650 + command.context * 0.6);
      if (s.res.cash < cost) return state;
      s.res.cash -= cost;
      const backgroundBias = BACKGROUNDS[s.founder.background].qualityBias;
      const quality = clamp(
        16 +
          Math.log2(command.params + 1) * 7.5 +
          (command.context / 128) * 3.2 +
          s.res.dataQuality * 0.3 +
          s.research.models * 3.4 +
          s.research.data * 2.2 +
          s.research.infra * 1.4 +
          (s.difficulty === "sandbox" ? 8 : 0) +
          backgroundBias,
        8,
        96,
      );
      const hidden = {
        hallucination: Math.round(clamp(34 - s.research.data * 4 - s.research.safety * 2 + rng.range(-6, 8), 1, 55)),
        bias: Math.round(clamp(30 - s.research.safety * 4 + rng.range(-5, 12), 1, 60)),
        quirk: rng.pick([
          "answers everything in bullet points",
          "refuses to say the word 'moist'",
          "invents citations with suspicious confidence",
          "adds an unnecessary apology before every answer",
          "prefers British spelling even in code",
          "stops mid-sentence when it gets bored",
          "explains jokes after making them",
          "calls everything 'a fascinating question'",
        ]),
        personality: rng.pick(["earnest", "deadpan", "over-eager", "professorial", "slightly sarcastic", "relentlessly cheerful"]),
        scandalPending: command.benchmarkGaming,
      };
      const model = {
        id: `model-${s.day}-${rng.int(1000, 9999)}`,
        name: command.name?.trim() || `${s.company.name.split(" ")[0]} ${s.models.length + 1}`,
        params: command.params,
        context: command.context,
        modalities: command.context >= 64 ? ["text", "image"] : ["text"],
        quality,
        safety: clamp(45 + s.research.safety * 4 + rng.range(-5, 5), 0, 100),
        latency: Math.round(180 + command.params * 14 - command.context * 0.18 - s.research.infra * 9),
        costPerMTok: Math.round(command.params * 0.0042 * 1000) / 1000,
        benchmark: clamp(quality * 0.9 + (command.benchmarkGaming ? 12 : 0) + rng.range(-3, 3), 0, 100),
        hidden,
        benchmarkGaming: command.benchmarkGaming,
        status: "training" as const,
        progress: 0,
        stageScores: {},
        createdDay: s.day,
        releasedDay: null,
        hype: 0,
      };
      s.models.push(model);
      s.activeModelId = model.id;
      s.diary.unshift(`Day ${s.day} — Started ${model.name}: ${command.params}B parameters, ${command.context}k context.`);
      break;
    }
    case "stage-result": {
      const model = s.models.find((entry) => entry.id === command.modelId);
      if (!model) return state;
      const penalty = CONFIG.difficulty[s.difficulty].minigamePenalty;
      const adjusted = command.skipped
        ? Math.round(70 * CONFIG.minigame.skipPenalty * penalty)
        : Math.round(command.score);
      model.stageScores[command.stage] = clamp(adjusted, 0, 100);
      const weight: Record<PipelineStage, number> = {
        data: 0.9,
        architecture: 1.1,
        training: 1.6,
        evaluation: 0.7,
        safety: 1,
        polish: 0.7,
        launch: 0.8,
      };
      const delta = ((adjusted - 70) / 30) * weight[command.stage];
      model.quality = clamp(model.quality + delta, 0, 100);
      model.benchmark = clamp(model.benchmark + delta * 0.8, 0, 100);
      if (command.stage === "safety") {
        model.safety = clamp(model.safety + (adjusted - 65) * 0.3, 0, 100);
        s.res.safety = clamp(s.res.safety + (adjusted - 65) * 0.12, 0, 100);
      }
      if (command.stage === "data") s.res.dataQuality = clamp(s.res.dataQuality + (adjusted - 68) * 0.08, 0, 100);
      if (command.stage === "architecture") s.res.techDebt += adjusted > 80 ? -1 : 1;
      s.minigames.played += 1;
      if (command.skipped) s.minigames.assists.push("skipped");
      s.history.push({
        day: s.day,
        cash: s.res.cash,
        mrr: s.kpis.mrr,
        users: s.kpis.users,
        valuation: valuation(s),
        quality: model.quality,
        hype: s.res.hype,
        morale: s.res.morale,
      });
      const scores = Object.values(model.stageScores);
      if (scores.length >= 7) {
        model.status = "training";
        model.progress = 0.05;
      }
      break;
    }
    case "release-model": {
      const model = s.models.find((entry) => entry.id === command.modelId);
      if (!model) return state;
      model.status = "released";
      model.releasedDay = s.day;
      s.activeModelId = model.id;
      s.stats.modelsShipped += 1;
      s.stats.launches += 1;
      s.kpis.users = Math.round(s.kpis.users + 400 + s.res.hype * 30 + model.quality * 45);
      const hypeGain = clamp((model.benchmark - 60) * 0.5 + (s.res.hype * 0.2), -6, 26);
      s.res.hype = clamp(s.res.hype + hypeGain, 0, 100);
      s.kpis.nps = Math.round(model.quality - 6);
      if (command.openWeights) {
        s.product.roadmap.push("open-weights");
        s.res.hype = clamp(s.res.hype + 16, 0, 100);
        s.kpis.paidUsers = Math.round(s.kpis.paidUsers * 0.9);
        s.res.devRep = clamp(s.res.devRep + 8, 0, 100);
      }
      const posts = [generatePost(s, rng), generatePost(s, rng), generatePost(s, rng)];
      s.social = [...posts, ...s.social].slice(0, CONFIG.review.maxPosts);
      s.events.log.unshift({
        id: `log-release-${model.id}`,
        day: s.day,
        title: `${model.name} shipped`,
        body: `Benchmark ${Math.round(model.benchmark)} · quality ${Math.round(model.quality)} · ${model.params}B params.`,
        tone: "good",
      });
      s.diary.unshift(`Day ${s.day} — Shipped ${model.name}. The benchmark says ${Math.round(model.benchmark)}. The users will decide.`);
      break;
    }
    case "buy-compute": {
      const unit = command.owned ? 1_400 : 22;
      const cost = command.gpus * unit;
      if (s.res.cash < cost) return state;
      s.res.cash -= cost;
      if (command.owned) s.res.computeOwned += command.gpus * 420;
      else s.res.computeRented += command.gpus * 420;
      break;
    }
    case "event-choice": {
      const pending = s.events.pending;
      if (!pending) return state;
      const event = eventsById(pending.eventId);
      if (!event) {
        s.events.pending = null;
        return s;
      }
      const choice = event.choices.find((entry) => entry.id === command.choiceId);
      s.events.pending = null;
      if (!choice) return s;
      s = applyEffects(s, choice.effects);
      if (command.score !== undefined) {
        s = applyEffects(s, { hype: (command.score - 65) * 0.06, devRep: (command.score - 65) * 0.04 });
      }
      s.events.log.unshift({
        id: `log-event-${event.id}-${s.day}`,
        day: s.day,
        title: event.title,
        body: `${choice.label} — ${choice.effect}.`,
        tone: event.tone,
      });
      s.diary.unshift(`Day ${s.day} — ${event.title}: chose "${choice.label}". ${choice.effect}.`);
      break;
    }
    case "raise-round": {
      const persona = INVESTOR_PERSONAS.find((entry) => entry.id === command.investorId);
      if (!persona) return state;
      const value = valuation(s);
      const pre = Math.round(value * (persona.aggressiveness > 1 ? 0.9 : 1.05));
      const amount = Math.round(clamp(pre * 0.18, persona.minAmount, persona.maxAmount));
      const sheet: TermSheet = {
        investorId: persona.id,
        investorName: `${persona.name}, ${persona.fund}`,
        amount,
        preMoney: pre,
        liquidationPreference: persona.id === "safety-fund" ? 1 : 1.5,
        boardSeat: persona.id !== "revenue-based" && persona.id !== "hardware-angel",
        proRata: persona.id !== "revenue-based",
        antiDilution: persona.id === "big-tech" ? "full" : "broad",
        vetoes: persona.id === "big-tech" ? ["roadmap", "hiring"] : ["fundraising"],
        expiresDay: s.day + 14,
      };
      s.funding.termSheets = [...s.funding.termSheets.filter((entry) => entry.investorId !== persona.id), sheet];
      break;
    }
    case "sign-term-sheet": {
      const sheet = command.sheet;
      if (s.res.cash < 0) return state;
      const rows = applyTermSheet(s, sheet);
      s.funding.capTable = rows;
      s.res.cash += sheet.amount;
      s.stats.cashRaised += sheet.amount;
      s.funding.rounds += 1;
      s.funding.lastRoundDay = s.day;
      s.funding.boardConfidence = clamp(s.funding.boardConfidence + 6, 0, 100);
      s.res.investorConfidence = clamp(s.res.investorConfidence + 8, 0, 100);
      s.funding.stage = stageForValuation(valuation(s) + sheet.amount);
      s.funding.termSheets = s.funding.termSheets.filter((entry) => entry.investorId !== sheet.investorId);
      s.diary.unshift(`Day ${s.day} — Closed ${Math.round(sheet.amount / 1000)}k from ${sheet.investorName}. Dilution is forever.`);
      break;
    }
    case "reject-term-sheet": {
      s.funding.termSheets = s.funding.termSheets.filter((entry) => entry.investorId !== command.investorId);
      s.res.investorConfidence = clamp(s.res.investorConfidence - 2, 0, 100);
      s.funding.capTable.push({
        id: `rejected-${command.investorId}-${s.day}`,
        name: "Rejected term sheet",
        kind: "investor",
        shares: 0,
        invested: 0,
      });
      break;
    }
    case "social-action": {
      switch (command.action) {
        case "reply": {
          s.res.cash -= 1_500;
          s.res.userTrust = clamp(s.res.userTrust + 2, 0, 100);
          break;
        }
        case "ads": {
          s.res.cash -= 12_000;
          s.kpis.users = Math.round(s.kpis.users * 1.04 + 40);
          s.res.hype = clamp(s.res.hype + 4, 0, 100);
          break;
        }
        case "sponsor": {
          s.res.cash -= 20_000;
          s.res.hype = clamp(s.res.hype + 9, 0, 100);
          break;
        }
        case "apology": {
          s.res.userTrust = clamp(s.res.userTrust + 5, 0, 100);
          s.res.hype = clamp(s.res.hype - 2, 0, 100);
          break;
        }
        case "ama": {
          s.res.devRep = clamp(s.res.devRep + 4, 0, 100);
          s.res.userTrust = clamp(s.res.userTrust + 3, 0, 100);
          break;
        }
      }
      break;
    }
    case "legal-action": {
      if (command.action === "license") {
        if (s.res.cash < 40_000) return state;
        s.res.cash -= 40_000;
        s.legal.risk = clamp(s.legal.risk - 12, 0, 100);
        s.legal.compliance = clamp(s.legal.compliance + 5, 0, 100);
      } else if (command.action === "audit") {
        if (s.res.cash < 60_000) return state;
        s.res.cash -= 60_000;
        s.legal.auditsPassed += 1;
        s.legal.compliance = clamp(s.legal.compliance + 10, 0, 100);
        s.legal.risk = clamp(s.legal.risk - 10, 0, 100);
        s.res.investorConfidence = clamp(s.res.investorConfidence + 4, 0, 100);
      } else if (command.action === "settle") {
        if (s.legal.lawsuits === 0) return state;
        s.legal.lawsuits -= 1;
        s.res.cash -= 45_000;
        s.legal.risk = clamp(s.legal.risk - 8, 0, 100);
      } else {
        if (s.res.cash < 15_000) return state;
        s.res.cash -= 15_000;
        s.legal.compliance = clamp(s.legal.compliance + 4, 0, 100);
      }
      break;
    }
    case "office-upgrade": {
      if (s.office.upgrades.includes(command.id)) return state;
      if (s.res.cash < 25_000) return state;
      s.res.cash -= 25_000;
      s.office.upgrades.push(command.id);
      if (command.id === "ergonomic-desk") s.res.morale = clamp(s.res.morale + 5, 0, 100);
      if (command.id === "quiet-room") s.res.devRep = clamp(s.res.devRep + 3, 0, 100);
      if (command.id === "gpu-shrine") s.res.hype = clamp(s.res.hype + 3, 0, 100);
      if (command.id === "coffee-lab") s.res.morale = clamp(s.res.morale + 4, 0, 100);
      if (command.id === "whiteboard-wall") s.res.safety = clamp(s.res.safety + 2, 0, 100);
      break;
    }
    case "ship-feature": {
      if (s.res.cash < 10_000) return state;
      s.res.cash -= 10_000;
      s.product.roadmap.push(command.feature);
      const quality = productQuality(s);
      s.product.versions.push({
        id: `v-${s.day}`,
        name: `v${s.product.versions.length + 1}.0`,
        day: s.day,
        quality: clamp(quality + 3, 0, 100),
        features: [command.feature],
        notes: `${command.feature} shipped to everyone, roughly on purpose.`,
      });
      s.kpis.users = Math.round(s.kpis.users * 1.015);
      break;
    }
    case "read-mail": {
      const mail = s.mail.find((entry) => entry.id === command.id);
      if (mail) mail.read = true;
      break;
    }
    case "mail-action": {
      const mail = s.mail.find((entry) => entry.id === command.id);
      if (!mail || !mail.action) return state;
      mail.read = true;
      if (mail.action.kind === "investor") s.res.investorConfidence = clamp(s.res.investorConfidence + 3, 0, 100);
      if (mail.action.kind === "customer") s.res.userTrust = clamp(s.res.userTrust + 2, 0, 100);
      if (mail.action.kind === "legal") s.legal.risk = clamp(s.legal.risk - 4, 0, 100);
      if (mail.action.kind === "press") s.res.hype = clamp(s.res.hype + 3, 0, 100);
      break;
    }
    case "choose-ending": {
      s.ending = command.ending;
      s.stats.daysPlayed = s.day;
      break;
    }
    case "apply-effects": {
      s = applyEffects(s, command.effects);
      if (command.note) {
        s.events.log.unshift({
          id: `log-effect-${s.day}-${s.events.log.length}`,
          day: s.day,
          title: command.note,
          body: Object.entries(command.effects)
            .map(([key, value]) => `${key} ${Number(value) > 0 ? "+" : ""}${Math.round(Number(value))}`)
            .join(" · "),
          tone: "neutral",
        });
      }
      break;
    }
    default:
      return state;
  }

  clampRes(s);
  return s;
}

export function recomputeWebsite(state: GameState): void {
  const enabled = state.website.blocks.filter((block) => block.enabled);
  const count = enabled.length;
  const hasPlayground = enabled.some((block) => block.kind === "playground");
  const hasDocs = enabled.some((block) => block.kind === "docs");
  const hasPricing = enabled.some((block) => block.kind === "pricing");
  const designBias: Record<GameState["website"]["template"], number> = { salvage: 8, labnote: 16, monolith: 4 };
  state.website.designScore = clamp(12 + count * 6 + designBias[state.website.template] + state.research.products * 4, 0, 100);
  state.website.seoScore = clamp(10 + count * 4 + (hasDocs ? 18 : 0) + state.research.products * 6, 0, 100);
  state.website.speedScore = clamp(70 - count * 3 + state.research.infra * 8 + (state.res.computeRented > 0 ? 4 : 0), 0, 100);
  state.website.trustScore = clamp(
    10 + (hasPricing ? 10 : 0) + (hasPlayground ? 14 : 0) + state.res.userTrust * 0.4 + state.legal.compliance * 0.2,
    0,
    100,
  );
}

function candidateFor(state: GameState, id: string) {
  const rng = new Rng(hashSeed(state.seed + id));
  if (!id.startsWith("cand-")) return null;
  const role = (["ml", "infra", "design", "growth", "safety", "ops"] as const)[rng.int(0, 5)];
  const first = rng.pick(FIRST_NAMES);
  const last = rng.pick(LAST_NAMES);
  return {
    id,
    name: `${first} ${last}`,
    role,
    skill: rng.int(38, 92),
    salary: Math.round(CONFIG.start.salaryPerHeadDay * 30 * rng.range(0.8, 1.6)),
    morale: rng.int(60, 85),
    tenure: 0,
    trait: rng.pick([
      "Ships on Fridays and means it.",
      "Has read every paper you have not.",
      "Can debug a cluster from a phone.",
      "Writes documentation nobody asked for, then everyone needs it.",
      "Very calm during incidents.",
      "Turns vague ideas into tickets.",
    ]),
    flaw: rng.chance(0.45)
      ? rng.pick(["Refuses to use the issue tracker.", "Optimises for elegance over shipping.", "Will say 'I told you so'.", "Terrible at estimates.", "Leaves at 6pm exactly. Correctly."])
      : null,
  };
}

export function generateCandidates(state: GameState): NonNullable<ReturnType<typeof candidateFor>>[] {
  const rng = new Rng(state.rngState + state.day * 13);
  const candidates = [];
  for (let i = 0; i < 4; i++) {
    const seedId = `cand-${state.day}-${i}-${rng.int(100, 999)}`;
    const candidate = candidateFor(state, seedId);
    if (candidate) candidates.push(candidate);
  }
  return candidates;
}

export function advanceDay(state: GameState): GameState {
  const s = clone(state);
  if (s.ending) return s;
  const rng = new Rng(s.rngState);
  s.day += 1;
  s.weekday = s.day % 7;
  s.quarter = Math.floor(s.day / CONFIG.time.daysPerQuarter) + 1;
  s.era = Math.min(5, 1 + Math.floor(s.day / 120));
  s.stats.daysPlayed = s.day;
  s.rngState = rng.state;

  const difficulty = CONFIG.difficulty[s.difficulty];

  // Research/training progress and compute burn.
  for (const model of s.models) {
    if (model.status !== "training" || model.progress <= 0) continue;
    const stages = Object.keys(model.stageScores).length;
    if (stages < 7) continue;
    const computeNeeded = model.params * 55;
    const available = s.res.computeOwned + s.res.computeRented;
    if (available < computeNeeded) {
      model.progress = Math.max(0, model.progress - 0.01);
      continue;
    }
    s.res.computeOwned = Math.max(0, s.res.computeOwned - computeNeeded * 0.35);
    s.res.computeRented = Math.max(0, s.res.computeRented - computeNeeded * 0.35);
    s.res.cash -= computeNeeded * 0.18;
    model.progress = clamp(model.progress + 0.09 + s.research.infra * 0.008, 0, 1);
    if (model.progress >= 1) {
      model.status = "ready";
      s.diary.unshift(`Day ${s.day} — ${model.name} finished training. The loss curve looked fine, which is what worries you.`);
    }
  }

  // Rivals act.
  for (const rival of s.market.rivals) {
    const sinceRelease = s.day - rival.lastReleaseDay;
    const threshold = Math.round(45 / Math.max(0.3, rival.aggression * difficulty.rivalAggression));
    if (sinceRelease > threshold && rng.chance(0.03 * rival.aggression)) {
      rival.quality = clamp(rival.quality + rng.range(1.5, 5), 0, 100);
      rival.lastReleaseDay = s.day;
      rival.hype = clamp(rival.hype + rng.range(3, 12), 0, 100);
      rival.users = Math.round(rival.users * rng.range(1.01, 1.045));
      s.events.log.unshift({
        id: `log-rival-${rival.id}-${s.day}`,
        day: s.day,
        title: `${rival.name} ships a new model`,
        body: `${rival.persona} Benchmark chatter suggests ${Math.round(rival.quality)}.`,
        tone: "neutral",
      });
    }
    if (rng.chance(0.006)) {
      rival.price = Math.max(0.4, Math.round(rival.price * 0.82 * 100) / 100);
      s.events.log.unshift({
        id: `log-rival-price-${rival.id}-${s.day}`,
        day: s.day,
        title: `${rival.name} cuts prices`,
        body: `Now $${rival.price}/seat. The group chat has opinions.`,
        tone: "bad",
      });
    }
  }

  // Market share drifts toward quality/price competitiveness.
  const model = activeModel(s);
  if (model) {
    const rivalQuality =
      s.market.rivals.reduce((sum, rival) => sum + rival.quality, 0) / Math.max(1, s.market.rivals.length);
    const priceEdge = clamp((weightedPrice(s) || 20) / 25, 0.4, 2);
    const edge = (model.quality - rivalQuality) / 100 - (priceEdge - 1) * 0.15;
    s.market.share = clamp(s.market.share + edge * 0.0016, 0.0005, 0.55);
    s.market.trend = (["chat", "coding", "image", "voice", "enterprise", "research"] as VerticalId[])[
      Math.floor(s.day / CONFIG.market.trendDriftDays) % 6
    ] ?? "chat";
    s.market.trendBonus = 0.06 + (Math.floor(s.day / 60) % 5) * 0.02;
  }

  // Users, revenue, money.
  const churn = churnRate(s);
  const newUsers = netNewUsers(s);
  s.kpis.users = Math.max(0, Math.round(s.kpis.users + newUsers));
  const conversion = clamp(0.028 + s.website.trustScore * 0.0006 + s.research.products * 0.008, 0.012, 0.35);
  const targetPaid = Math.round(s.kpis.users * conversion);
  s.kpis.paidUsers = Math.max(0, Math.round(s.kpis.paidUsers + (targetPaid - s.kpis.paidUsers) * 0.18));
  s.kpis.mrr = Math.round(monthlyRecurring(s));
  s.kpis.churn = churn;
  s.kpis.visitors = Math.round(s.kpis.users * 0.7 + s.res.hype * 12);
  s.kpis.signups = Math.round(s.kpis.visitors * (0.02 + s.website.designScore * 0.0004));
  s.kpis.activated = Math.round(s.kpis.signups * 0.55);
  s.kpis.arpu = s.kpis.paidUsers > 0 ? s.kpis.mrr / s.kpis.paidUsers : 0;
  s.kpis.sentiment = (() => {
    const recent = s.social.filter((post) => s.day - post.day < 30);
    if (recent.length === 0) return 0;
    return recent.reduce((sum, post) => sum + post.sentiment, 0) / recent.length;
  })();
  s.res.cash += dailyRevenue(s) - dailyCosts(s);

  // Sentiment/trust/morale drift.
  s.res.userTrust = clamp(s.res.userTrust + s.kpis.sentiment * 0.35 - (churn > 0.08 ? 0.3 : 0), 0, 100);
  s.res.hype = clamp(s.res.hype * 0.995 + (s.kpis.sentiment > 0 ? 0.12 : -0.06), 0, 100);
  const salaryPressure = s.team.length > 0 ? 0.02 : -0.01;
  s.res.morale = clamp(s.res.morale + salaryPressure + (s.office.upgrades.length * 0.01), 0, 100);
  s.res.safety = clamp(s.res.safety - (s.research.safety === 0 ? 0.02 : 0), 0, 100);
  s.res.techDebt = clamp(s.res.techDebt + 0.01, 0, 100);
  s.legal.risk = clamp(s.legal.risk + (s.res.dataRisk > 40 ? 0.05 : -0.01), 0, 100);
  if (s.legal.risk > 72 && rng.chance(0.01)) {
    s.legal.lawsuits += 1;
    s.events.log.unshift({
      id: `log-lawsuit-${s.day}`,
      day: s.day,
      title: "Lawsuit filed",
      body: `A rights-holder is suing over training data. Legal counsel is now a line item.`,
      tone: "bad",
    });
  }

  // Benchmark-gaming scandal.
  if (model?.benchmarkGaming && model.status === "released" && rng.chance(0.01)) {
    model.hidden.scandalPending = false;
    s.stats.scandals += 1;
    s.res.userTrust = clamp(s.res.userTrust - 14, 0, 100);
    s.res.devRep = clamp(s.res.devRep - 10, 0, 100);
    s.res.hype = clamp(s.res.hype + 6, 0, 100);
    s.social.unshift({
      id: `post-scandal-${s.day}`,
      day: s.day,
      platform: "hackerfeed",
      author: "Anonymous eval gremlin",
      handle: "eval_gremlin",
      followers: 42_000,
      body: `${model.name} scores 12 points worse on a fresh eval set than on the public benchmark it was tuned on. Explain.`,
      sentiment: -1,
      likes: 3_100,
      replies: 240,
      topic: "benchmarks",
      kind: "rant",
    });
  }

  // Social feed.
  if (s.kpis.users > 0 && rng.chance(0.75)) {
    const count = rng.chance(0.3) ? 2 : 1;
    const posts = Array.from({ length: count }, () => generatePost(s, rng));
    s.social = [...posts, ...s.social].slice(0, CONFIG.review.maxPosts);
    s.kpis.reviewsCount += count;
  }

  // Event roll.
  const pendingBlocked = s.events.pending !== null;
  const gate = 0.11 * difficulty.eventMultiplier;
  if (!pendingBlocked && rng.chance(gate) && s.day - s.events.lastEventDay > 3) {
    const eligible = EVENTS.filter(
      (event) => s.day >= event.minDay && !(event.once && s.funding.inventory.includes(`ev:${event.id}`)),
    );
    if (eligible.length > 0) {
      const event = rng.weighted(eligible, (entry) => entry.weight);
      if (event) {
        s.events.pending = { eventId: event.id, day: s.day };
        s.events.lastEventDay = s.day;
      }
    }
  }

  // Mail drip.
  if (rng.chance(0.06)) {
    const mail = generateMail(s, rng);
    s.mail = [mail, ...s.mail].slice(0, 60);
  }

  // Weekly history + diary.
  if (s.day % 7 === 0) {
    s.history.push({
      day: s.day,
      cash: s.res.cash,
      mrr: s.kpis.mrr,
      users: s.kpis.users,
      valuation: valuation(s),
      quality: productQuality(s),
      hype: s.res.hype,
      morale: s.res.morale,
    });
    if (s.history.length > CONFIG.history.maxPoints) s.history.shift();
    s.diary.unshift(
      `Week ${Math.floor(s.day / 7)} — ${s.kpis.users.toLocaleString("en-US")} users, $${Math.round(s.kpis.mrr).toLocaleString("en-US")} MRR, $${Math.round(s.res.cash).toLocaleString("en-US")} in the bank. ${
        s.res.cash < 0 ? "The bank has questions." : "Runway is a number, not a feeling."
      }`,
    );
  }

  s.funding.stage = stageForValuation(valuation(s));
  s.funding.ceoControl = ceoControl(s);

  // Endings.
  if (s.res.cash < -60_000) s.ending = "bankrupt";
  if (s.funding.rounds > 0 && ceoControl(s) < 12) s.ending = "ousted";
  if (s.day > 200 && s.res.morale <= 0) s.ending = "burnout";
  if (model && model.quality >= 95 && s.res.safety >= 82 && s.res.cash > 0) s.ending = "breakthrough";

  s.diary = s.diary.slice(0, 80);
  s.events.log = s.events.log.slice(0, 120);
  clampRes(s);
  return s;
}

function generateMail(state: GameState, rng: Rng) {
  const id = `mail-${state.day}-${rng.int(100, 999)}`;
  const customer = rng.chance(0.4);
  return {
    id,
    day: state.day,
    from: rng.pick(FIRST_NAMES) + " " + rng.pick(LAST_NAMES),
    subject: customer
      ? rng.pick(["Your API timed out during our demo", "Feature request: export", "Invoice question", "Can we get a security review?"])
      : rng.pick(["Quick intro", "Following up on your round", "Press request", "Someone is impersonating you"]),
    body: customer
      ? "We are evaluating three vendors. You are currently second. The deciding factor is latency and whether anyone answers this email."
      : "Saw your launch. Would love 20 minutes. No deck needed, just the metrics and an honest answer about burn.",
    kind: (customer ? "customer" : "investor") as "customer" | "investor",
    read: false,
    action: { label: customer ? "Reply and offer a call" : "Reply with metrics", kind: customer ? ("customer" as const) : ("investor" as const) },
  };
}

export { SEGMENTS, VERTICALS, TECH_TREE, totalShares, bestModel };
