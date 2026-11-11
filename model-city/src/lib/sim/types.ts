/**
 * MODEL CITY — simulation types.
 * No React imports may ever appear in this folder: the engine must stay
 * pure, deterministic and unit-testable.
 */

export type Difficulty = "chill" | "normal" | "brutal" | "sandbox";
export type BackgroundId = "researcher" | "hacker" | "serial" | "academic" | "marketer";
export type VerticalId = "chat" | "coding" | "image" | "voice" | "enterprise" | "research";
export type CityId = "lisbon" | "austin" | "tallinn" | "jakarta" | "zurich" | "bengaluru";
export type StageId = "garage" | "seed" | "scaleup" | "unicorn" | "frontier";
export type BranchId = "models" | "data" | "infra" | "products" | "safety";
export type Grade = "bronze" | "silver" | "gold" | "perfect";
export type PipelineStage =
  | "data"
  | "architecture"
  | "training"
  | "evaluation"
  | "safety"
  | "polish"
  | "launch";
export type MinigameId =
  | "data-sorting"
  | "architecture"
  | "training-run"
  | "benchmark-gauntlet"
  | "red-team"
  | "prompt-craft"
  | "launch-day"
  | "debug-sprint"
  | "hiring-match"
  | "pitch-deck"
  | "keynote-demo"
  | "pr-crisis";
export type PlanId = "free" | "plus" | "pro" | "team" | "enterprise";
export type SegmentId =
  | "hobbyists"
  | "students"
  | "developers"
  | "startups"
  | "enterprises"
  | "power"
  | "abusers";
export type EndingId =
  | "ipo"
  | "acquired"
  | "ousted"
  | "bankrupt"
  | "breakthrough"
  | "burnout"
  | "indie";
export type RoleId = "ml" | "infra" | "design" | "growth" | "safety" | "ops";
export type PlatformId = "chirp" | "threadly" | "hackerfeed" | "launchpad" | "storefront" | "tubely" | "press";
export type MailKind = "customer" | "investor" | "press" | "recruiting" | "legal" | "system";

export interface LogoSpec {
  symbol: string;
  mask: "none" | "circle" | "squircle" | "hex";
  colors: [string, string, string];
  font: "display" | "sans" | "mono";
  layout: "stacked" | "horizontal";
  wordmark: string;
}

export interface Founder {
  name: string;
  background: BackgroundId;
  trait: string;
  flaw: string;
}

export interface Company {
  name: string;
  tagline: string;
  hq: CityId;
  vertical: VerticalId;
  logo: LogoSpec;
  foundedDay: number;
}

export interface Resources {
  cash: number;
  computeOwned: number;
  computeRented: number;
  energyCost: number;
  dataQty: number;
  dataQuality: number;
  dataRisk: number;
  morale: number;
  devRep: number;
  userTrust: number;
  investorConfidence: number;
  hype: number;
  safety: number;
  techDebt: number;
}

export interface Kpis {
  users: number;
  paidUsers: number;
  mrr: number;
  churn: number;
  nps: number;
  arpu: number;
  cac: number;
  visitors: number;
  signups: number;
  activated: number;
  reviewsCount: number;
  sentiment: number;
}

export interface ModelHidden {
  hallucination: number;
  bias: number;
  quirk: string;
  personality: string;
  scandalPending: boolean;
}

export interface ModelSpec {
  id: string;
  name: string;
  params: number;
  context: number;
  modalities: string[];
  quality: number;
  safety: number;
  latency: number;
  costPerMTok: number;
  benchmark: number;
  hidden: ModelHidden;
  benchmarkGaming: boolean;
  status: "training" | "ready" | "released" | "retired";
  progress: number;
  stageScores: Partial<Record<PipelineStage, number>>;
  createdDay: number;
  releasedDay: number | null;
  hype: number;
}

export interface Employee {
  id: string;
  name: string;
  role: RoleId;
  skill: number;
  salary: number;
  morale: number;
  tenure: number;
  trait: string;
  flaw: string | null;
}

export interface PlanConfig {
  id: PlanId;
  enabled: boolean;
  price: number;
  capMessages: number;
  features: string[];
  trialDays: number;
}

export interface PricingState {
  plans: PlanConfig[];
  apiInput: number;
  apiOutput: number;
  annualDiscount: number;
  studentDiscount: number;
  lastChangedDay: number;
  experiments: string[];
}

export interface ProductVersion {
  id: string;
  name: string;
  day: number;
  quality: number;
  features: string[];
  notes: string;
}

export interface WebsiteBlock {
  id: string;
  kind:
    | "hero"
    | "features"
    | "pricing"
    | "playground"
    | "docs"
    | "changelog"
    | "customers"
    | "careers"
    | "blog"
    | "status";
  enabled: boolean;
}

export interface WebsiteState {
  blocks: WebsiteBlock[];
  template: "salvage" | "labnote" | "monolith";
  accent: string;
  designScore: number;
  seoScore: number;
  speedScore: number;
  trustScore: number;
  abTest: "none" | "price" | "hero" | "signup";
}

export interface SocialPost {
  id: string;
  day: number;
  platform: PlatformId;
  author: string;
  handle: string;
  followers: number;
  body: string;
  sentiment: -1 | 0 | 1;
  likes: number;
  replies: number;
  topic: string;
  kind: "review" | "rant" | "praise" | "press" | "meme" | "bot" | "troll" | "influencer";
}

export interface Rival {
  id: string;
  name: string;
  persona: string;
  quality: number;
  price: number;
  users: number;
  hype: number;
  aggression: number;
  lastReleaseDay: number;
  lobbyPower: number;
}

export interface CapTableRow {
  id: string;
  name: string;
  kind: "founder" | "employees" | "investor" | "optionpool";
  shares: number;
  invested: number;
}

export interface TermSheet {
  investorId: string;
  investorName: string;
  amount: number;
  preMoney: number;
  liquidationPreference: number;
  boardSeat: boolean;
  proRata: boolean;
  antiDilution: "none" | "broad" | "full";
  vetoes: string[];
  expiresDay: number;
}

export interface FundraisingState {
  stage: StageId;
  rounds: number;
  lastRoundDay: number;
  capTable: CapTableRow[];
  termSheets: TermSheet[];
  boardConfidence: number;
  ceoControl: number;
  inventory: string[];
}

export interface HistoryPoint {
  day: number;
  cash: number;
  mrr: number;
  users: number;
  valuation: number;
  quality: number;
  hype: number;
  morale: number;
}

export interface EventLogEntry {
  id: string;
  day: number;
  title: string;
  body: string;
  tone: "good" | "bad" | "neutral";
}

export type EffectKey =
  | "cash"
  | "hype"
  | "morale"
  | "devRep"
  | "userTrust"
  | "investorConfidence"
  | "safety"
  | "dataQty"
  | "dataQuality"
  | "dataRisk"
  | "computeOwned"
  | "computeRented"
  | "energyCost"
  | "techDebt"
  | "legalRisk"
  | "lawsuits"
  | "compliance"
  | "usersPct"
  | "churnDelta"
  | "qualityDelta"
  | "marketShare"
  | "boardConfidence"
  | "ceoControl"
  | "paidUsersPct";

export interface EventChoice {
  id: string;
  label: string;
  detail: string;
  effect: string;
  effects?: Partial<Record<EffectKey, number>>;
}

export interface GameEventDef {
  id: string;
  title: string;
  body: string;
  weight: number;
  minDay: number;
  tone: "good" | "bad" | "neutral";
  choices: EventChoice[];
  minigame?: MinigameId;
  once?: boolean;
}

export interface PendingEvent {
  eventId: string;
  day: number;
}

export interface MailMessage {
  id: string;
  day: number;
  from: string;
  subject: string;
  body: string;
  kind: MailKind;
  read: boolean;
  action?: { label: string; kind: "investor" | "hire" | "customer" | "legal" | "press" };
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  hidden: boolean;
}

export interface TutorialState {
  seen: string[];
  dismissed: string[];
}

export interface LegalState {
  risk: number;
  lawsuits: number;
  auditsPassed: number;
  compliance: number;
  redTeamScore: number;
}

export interface OfficeState {
  upgrades: string[];
  desks: number;
}

export interface GameState {
  version: number;
  seed: string;
  rngState: number;
  difficulty: Difficulty;
  day: number;
  weekday: number;
  quarter: number;
  era: number;
  founder: Founder;
  company: Company;
  res: Resources;
  kpis: Kpis;
  models: ModelSpec[];
  activeModelId: string | null;
  team: Employee[];
  pricing: PricingState;
  product: { versions: ProductVersion[]; roadmap: string[] };
  website: WebsiteState;
  social: SocialPost[];
  market: { rivals: Rival[]; share: number; trend: VerticalId; trendBonus: number };
  research: Record<BranchId, number>;
  legal: LegalState;
  funding: FundraisingState;
  office: OfficeState;
  events: { log: EventLogEntry[]; pending: PendingEvent | null; lastEventDay: number };
  mail: MailMessage[];
  history: HistoryPoint[];
  achievements: string[];
  diary: string[];
  tutorials: TutorialState;
  minigames: { played: number; best: Partial<Record<MinigameId, number>>; assists: string[] };
  ending: EndingId | null;
  stats: {
    modelsShipped: number;
    hires: number;
    fires: number;
    launches: number;
    scandals: number;
    cashRaised: number;
    daysPlayed: number;
  };
}

export interface MinigameResult {
  score: number;
  grade: Grade;
  skipped: boolean;
  cashSpent: number;
}
