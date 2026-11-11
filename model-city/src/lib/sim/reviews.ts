import { Rng } from "./rng";
import { activeModel, productQuality, weightedPrice } from "./economy";
import type { GameState, PlatformId, SocialPost } from "./types";

const HANDLES = [
  "gpu_hoarder", "spreadsheet_girl", "eval_enjoyer", "latency_larry", "tinyml",
  "context_window", "attn_is_all", "startup_cto", "burnrate_ben", "prod_incident",
  "quiet_quitter", "chief_vibes", "ml_curmudgeon", "api_gremlin", "founder_mode",
  "tokenmaxxer", "garage_lab", "safety_skeptic", "benchmark_bro", "sre_nightshift",
];

const PRAISE = [
  "genuinely surprised by how good this is",
  "has not hallucinated once today, which is more than I can say for my team",
  "fast enough that I stopped noticing the spinner",
  "the answers are boringly correct, which is the highest compliment",
  "replaced a $400/month tool and nobody noticed",
  "the refusal messages read like a human wrote them",
  "cheaper than the incumbent and twice as fast",
  "my whole standup is now one prompt",
  "actually cites things instead of inventing them",
  "ships features while the big labs ship press releases",
];

const RANT = [
  "confidently wrong in a way that costs me an hour every time",
  "was great last month and now it is a different product",
  "refuses the most harmless request for no stated reason",
  "the free tier is a demo of the paid tier's problems",
  "responded to a simple question with a five-paragraph memo",
  "still cannot count. it is 2026. please count",
  "ignored my instructions and then apologised in bullet points",
  "slow enough that I checked my wifi twice",
  "the docs describe a product that does not exist",
  "pricing page needs a finance degree",
];

const MEME = [
  "screenshot of the model answering a question nobody asked",
  "the founder doing a keynote with a live demo and a prayer",
  "an org chart with nine VPs and one engineer",
  "a benchmark chart with the axis starting at 94",
  "the 'we are hiring' page with 0 open roles",
  "the safety page, dated last quarter",
  "a GPU invoice printed on a single sheet of A3",
];

const BUG = [
  "the playground loses your prompt if you switch tabs",
  "streaming stops mid-sentence on long answers",
  "the API returns 200 with an empty body sometimes",
  "image upload silently downscales to 64px",
  "the mobile site forgets your login every other day",
  "copy button copies the wrong message",
];

const FEATURE = [
  "please add a proper context window indicator",
  "would pay extra for a team audit log",
  "need a self-hosted option or my security team says no",
  "add an export button before I lose another afternoon",
  "support for longer documents, please",
  "an actual status page that updates, not a screenshot",
];

const PRESS = [
  "raises questions about benchmark methodology",
  "quietly becomes the default tool in three startups",
  "shows the AI market has not consolidated yet",
  "suggests the pricing war is just beginning",
  "puts pressure on the incumbents' margins",
];

const COMPARISONS = [
  "Hyperion Labs", "Halcyon Institute", "OpenMath Collective", "Veloce", "Sahana AI",
];

const PLATFORMS: PlatformId[] = ["chirp", "threadly", "hackerfeed", "launchpad", "storefront", "tubely", "press"];

function tag(rng: Rng, bank: readonly string[]): string {
  return rng.pick(bank);
}

function handle(rng: Rng): { handle: string; followers: number } {
  const base = rng.pick(HANDLES);
  const suffix = rng.chance(0.4) ? String(rng.int(2, 99)) : "";
  const followers = rng.chance(0.08) ? rng.int(40_000, 900_000) : rng.int(12, 9_000);
  return { handle: `${base}${suffix}`, followers };
}

export interface ReviewContext {
  quality: number;
  price: number;
  safety: number;
  trust: number;
  hallucination: number;
  quirk: string;
  personality: string;
  outlet: string;
}

export function reviewContext(state: GameState): ReviewContext {
  const model = activeModel(state);
  return {
    quality: productQuality(state),
    price: weightedPrice(state),
    safety: state.res.safety,
    trust: state.res.userTrust,
    hallucination: model?.hidden.hallucination ?? 20,
    quirk: model?.hidden.quirk ?? "answers everything with bullet points",
    personality: model?.hidden.personality ?? "earnest",
    outlet: state.company.name,
  };
}

/** Composes a single post from composable banks so no two reviews read alike. */
export function generatePost(state: GameState, rng: Rng): SocialPost {
  const ctx = reviewContext(state);
  const platform = rng.weighted(PLATFORMS, (p) => (p === "storefront" ? 3 : p === "press" ? 0.6 : 1));
  const { handle: who, followers } = handle(rng);
  const quality = ctx.quality;
  const expensive = ctx.price > 30;
  const risky = ctx.safety < 45;
  const flaky = state.legal.lawsuits > 0 || ctx.trust < 45;
  const positive = quality + rng.range(-14, 14) > 52;

  let body: string;
  let kind: SocialPost["kind"] = positive ? "praise" : "rant";

  if (platform === "storefront") {
    kind = positive ? "review" : "rant";
    body = positive
      ? `${rng.int(4, 5)}/5 — ${tag(rng, PRAISE)}. ${rng.chance(0.5) ? "Would buy again." : ""}`
      : `${rng.int(1, 3)}/5 — ${tag(rng, RANT)}.`;
  } else if (platform === "press") {
    kind = "press";
    body = `${ctx.outlet} ${tag(rng, PRESS)}.`;
  } else if (!positive && rng.chance(0.3)) {
    kind = "meme";
    body = `meme: ${tag(rng, MEME)}`;
  } else if (!positive && rng.chance(0.35)) {
    kind = "rant";
    body = `bug report: ${tag(rng, BUG)}. ${rng.chance(0.5) ? "Please fix." : "Third time I've posted this."}`;
  } else if (positive && rng.chance(0.25)) {
    kind = "praise";
    body = `feature request: ${tag(rng, FEATURE)}. Otherwise: ${tag(rng, PRAISE)}.`;
  } else if (positive) {
    const quirkLine = rng.chance(0.35) ? ` It also ${ctx.quirk}, which is either charming or a bug.` : "";
    body = `${rng.pick(["okay, ", "hot take: ", "day 12 using ", ""])}${ctx.outlet} is ${tag(rng, PRAISE)}.${quirkLine}`;
  } else {
    body = `${tag(rng, RANT)}${rng.chance(0.4) ? ` and it ${ctx.quirk}` : ""}.`;
  }

  if (risky && rng.chance(0.25)) {
    kind = "rant";
    body = `${body} Also their safety page has not been updated since launch.`;
  }
  if (expensive && rng.chance(0.2)) {
    body = `${body} ${Math.round(ctx.price)} dollars a month, for this.`;
  }
  if (flaky && rng.chance(0.18)) {
    body = `${body} (posted after the outage, hence the tone)`;
  }

  const sentiment: -1 | 0 | 1 = kind === "praise" || kind === "review" ? 1 : kind === "meme" || kind === "press" ? 0 : -1;

  const topicPool = [
    "quality", "pricing", "latency", "safety", "outages", "benchmarks", "support", "docs", "hiring",
  ];

  return {
    id: `post-${state.day}-${rng.int(1000, 9999)}`,
    day: state.day,
    platform,
    author: positive ? rng.pick(["Early user", "Long-time user", "Skeptic", "Customer"]) : rng.pick(["Unhappy user", "Ex-user", "Free tier gremlin", "Anonymous"]),
    handle: who,
    followers,
    body,
    sentiment,
    likes: rng.int(3, Math.max(6, Math.round(followers * 0.02))),
    replies: rng.int(0, 40),
    topic: rng.pick(topicPool),
    kind,
  };
}

export function generatePosts(state: GameState, rng: Rng, count: number): SocialPost[] {
  const posts: SocialPost[] = [];
  for (let i = 0; i < count; i++) posts.push(generatePost(state, rng));
  return posts;
}

export function rivalMention(rng: Rng): string {
  return `${rng.pick(["meanwhile", "watching", "versus"])} ${rng.pick(COMPARISONS)}`;
}

/** One-line social summary used by the island and the market app. */
export function sentimentLabel(value: number): string {
  if (value > 0.45) return "adored";
  if (value > 0.15) return "positive";
  if (value > -0.15) return "mixed";
  if (value > -0.45) return "irritated";
  return "hostile";
}
