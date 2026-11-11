import type { BackgroundId, CityId, Rival, VerticalId } from "./types";

export const CITIES: Record<
  CityId,
  {
    name: string;
    country: string;
    blurb: string;
    costMod: number;
    talentMod: number;
    investorMod: number;
    regulatorMod: number;
    energyMod: number;
  }
> = {
  lisbon: {
    name: "Lisbon",
    country: "Portugal",
    blurb: "Cheap desks, good coffee, a government that actually answers email.",
    costMod: 0.82,
    talentMod: 0.95,
    investorMod: 0.9,
    regulatorMod: 0.9,
    energyMod: 0.95,
  },
  austin: {
    name: "Austin",
    country: "United States",
    blurb: "Investor density per square kilometre: alarming. Also, the grid.",
    costMod: 1.18,
    talentMod: 1.12,
    investorMod: 1.3,
    regulatorMod: 1,
    energyMod: 1.15,
  },
  tallinn: {
    name: "Tallinn",
    country: "Estonia",
    blurb: "Everything is digital, including the bureaucracy. Suspiciously efficient.",
    costMod: 0.88,
    talentMod: 1.02,
    investorMod: 0.98,
    regulatorMod: 0.78,
    energyMod: 1.05,
  },
  jakarta: {
    name: "Jakarta",
    country: "Indonesia",
    blurb: "Enormous mobile-first market, monsoon-grade infrastructure risk.",
    costMod: 0.7,
    talentMod: 1.05,
    investorMod: 0.85,
    regulatorMod: 1.1,
    energyMod: 1.2,
  },
  zurich: {
    name: "Zurich",
    country: "Switzerland",
    blurb: "Talent and capital, priced accordingly. Nobody will ever be late.",
    costMod: 1.42,
    talentMod: 1.18,
    investorMod: 1.12,
    regulatorMod: 1.2,
    energyMod: 0.9,
  },
  bengaluru: {
    name: "Bengaluru",
    country: "India",
    blurb: "Deep engineering bench, traffic that doubles as an excuse.",
    costMod: 0.72,
    talentMod: 1.15,
    investorMod: 1.02,
    regulatorMod: 1.05,
    energyMod: 1.1,
  },
};

export const BACKGROUNDS: Record<
  BackgroundId,
  {
    name: string;
    blurb: string;
    trait: string;
    flaw: string;
    start: {
      cash: number;
      devRep: number;
      safety: number;
      hype: number;
      investorConfidence: number;
      morale: number;
      dataQuality: number;
      computeOwned: number;
    };
    qualityBias: number;
  }
> = {
  researcher: {
    name: "Ex-Big-Tech Researcher",
    blurb: "You shipped a paper once. Twelve people cite it monthly. You know the tricks.",
    trait: "+8 baseline model quality, benchmarks read you as credible.",
    flaw: "Enterprise sales terrify you; investors find you slow.",
    start: { cash: 0, devRep: 16, safety: 8, hype: -2, investorConfidence: 8, morale: 2, dataQuality: 8, computeOwned: 12_000 },
    qualityBias: 6,
  },
  hacker: {
    name: "Self-taught Hacker",
    blurb: "You learned distributed systems from a forum thread and a grudge.",
    trait: "Cheap infrastructure, fast shipping, absurd compute efficiency.",
    flaw: "Safety is a spreadsheet tab you keep meaning to open.",
    start: { cash: 30_000, devRep: 4, safety: -10, hype: 6, investorConfidence: -3, morale: 4, dataQuality: -4, computeOwned: 6_000 },
    qualityBias: 2,
  },
  serial: {
    name: "Serial Founder",
    blurb: "Second exit. Third company. The deck is already in Drive.",
    trait: "Raise money faster, hire faster, survive the boring parts.",
    flaw: "Your last team says you vanish after the term sheet.",
    start: { cash: 90_000, devRep: 2, safety: 0, hype: 10, investorConfidence: 22, morale: -2, dataQuality: 0, computeOwned: 0 },
    qualityBias: 0,
  },
  academic: {
    name: "Academic",
    blurb: "You have a lab, a grant, and forty pages of reviewer comments.",
    trait: "Data quality and safety scores start high; press loves your quotes.",
    flaw: "Ships on academic timelines. Everything is 'almost ready'.",
    start: { cash: 20_000, devRep: 12, safety: 12, hype: -4, investorConfidence: -6, morale: 6, dataQuality: 14, computeOwned: 2_000 },
    qualityBias: 3,
  },
  marketer: {
    name: "Growth Marketer",
    blurb: "You can sell a waitlist for a product that does not exist yet. You have.",
    trait: "Hype and signup conversion are strong from day one.",
    flaw: "Early models look great on the site and average in the benchmark.",
    start: { cash: 40_000, devRep: -4, safety: -4, hype: 22, investorConfidence: 6, morale: 0, dataQuality: -6, computeOwned: 0 },
    qualityBias: -2,
  },
};

export const VERTICAL_KEYS: VerticalId[] = ["chat", "coding", "image", "voice", "enterprise", "research"];

export const RIVAL_SEEDS: Rival[] = [
  {
    id: "hyperion",
    name: "Hyperion Labs",
    persona: "The incumbent giant. Unlimited compute, quarterly product keynotes, no taste.",
    quality: 82,
    price: 14,
    users: 4_200_000,
    hype: 68,
    aggression: 0.9,
    lastReleaseDay: -40,
    lobbyPower: 0.8,
  },
  {
    id: "halcyon",
    name: "Halcyon Institute",
    persona: "Safety-first lab. Publishes long PDFs. Refuses to ship anything fun.",
    quality: 74,
    price: 21,
    users: 780_000,
    hype: 42,
    aggression: 0.5,
    lastReleaseDay: -90,
    lobbyPower: 0.95,
  },
  {
    id: "openmath",
    name: "OpenMath Collective",
    persona: "Open-weights collective. Gives it away, eats your enterprise deals.",
    quality: 66,
    price: 1.2,
    users: 2_600_000,
    hype: 58,
    aggression: 0.7,
    lastReleaseDay: -25,
    lobbyPower: 0.3,
  },
  {
    id: "veloce",
    name: "Veloce",
    persona: "Cheap-and-fast startup. Cuts price every time you blink.",
    quality: 58,
    price: 3.4,
    users: 1_900_000,
    hype: 51,
    aggression: 1.25,
    lastReleaseDay: -12,
    lobbyPower: 0.2,
  },
  {
    id: "sahana",
    name: "Sahana AI",
    persona: "Regional champion. Owns three countries and every government meeting.",
    quality: 63,
    price: 7,
    users: 3_100_000,
    hype: 44,
    aggression: 0.8,
    lastReleaseDay: -55,
    lobbyPower: 0.85,
  },
  {
    id: "gridworks",
    name: "Gridworks",
    persona: "Hardware company cosplaying as an AI lab. Owns the datacenters.",
    quality: 61,
    price: 9,
    users: 640_000,
    hype: 34,
    aggression: 0.6,
    lastReleaseDay: -70,
    lobbyPower: 0.6,
  },
  {
    id: "parrot",
    name: "Parrot Studio",
    persona: "Consumer app shop. Ships delight, weak benchmarks, terrifying distribution.",
    quality: 54,
    price: 12,
    users: 5_400_000,
    hype: 72,
    aggression: 1,
    lastReleaseDay: -18,
    lobbyPower: 0.15,
  },
];

export const INVESTOR_PERSONAS = [
  {
    id: "hype-chaser",
    name: "Bex Marlowe",
    fund: "Momentum Capital",
    persona: "Hype-chaser",
    thesis: "I fund momentum. Show me the graph, I will bring the money.",
    likes: "hype",
    dislikes: "flat growth",
    aggressiveness: 1.3,
    minAmount: 350_000,
    maxAmount: 2_400_000,
  },
  {
    id: "safety-fund",
    name: "Dr. Ivo Renner",
    fund: "Careful Partners",
    persona: "Safety-focused fund",
    thesis: "The next decade belongs to labs that can pass an audit without sweating.",
    likes: "safety",
    dislikes: "scandals",
    aggressiveness: 0.7,
    minAmount: 500_000,
    maxAmount: 3_000_000,
  },
  {
    id: "hardware-angel",
    name: "Ron Kestrel",
    fund: "Kestrel Hardware",
    persona: "Hardware-obsessed angel",
    thesis: "Rented GPUs are a service. Owned GPUs are a moat.",
    likes: "compute",
    dislikes: "pure SaaS",
    aggressiveness: 0.9,
    minAmount: 150_000,
    maxAmount: 800_000,
  },
  {
    id: "sovereign",
    name: "Nadia Al-Rashid",
    fund: "Meridian Sovereign Fund",
    persona: "Sovereign wealth fund",
    thesis: "We invest in national capability. We also invest in stability.",
    likes: "reputation",
    dislikes: "regulatory chaos",
    aggressiveness: 0.5,
    minAmount: 4_000_000,
    maxAmount: 40_000_000,
  },
  {
    id: "big-tech",
    name: "Wardell Systems",
    fund: "Wardell Strategic",
    persona: "Big-tech strategic investor",
    thesis: "We can offer distribution. We will want your roadmap.",
    likes: "users",
    dislikes: "independence",
    aggressiveness: 1.1,
    minAmount: 3_000_000,
    maxAmount: 25_000_000,
  },
  {
    id: "revenue-based",
    name: "Priya Nair",
    fund: "Compound Revenue",
    persona: "Revenue-based financier",
    thesis: "No dilution, no board seat, just a slice of your invoices.",
    likes: "mrr",
    dislikes: "pre-revenue",
    aggressiveness: 0.8,
    minAmount: 200_000,
    maxAmount: 1_500_000,
  },
  {
    id: "deep-tech",
    name: "Kai Oyelaran",
    fund: "Foundry Deep Tech",
    persona: "Deep-tech seed fund",
    thesis: "I want to see the eval suite before I see the deck.",
    likes: "benchmarks",
    dislikes: "marketing-only launches",
    aggressiveness: 0.75,
    minAmount: 400_000,
    maxAmount: 2_000_000,
  },
] as const;

export const FIRST_NAMES = [
  "Ada", "Bo", "Chen", "Dara", "Emil", "Faye", "Gio", "Hana", "Ilya", "Juno",
  "Kira", "Leo", "Mira", "Noor", "Odin", "Pia", "Quinn", "Rami", "Sena", "Tovar",
  "Uma", "Vesna", "Wren", "Xan", "Yuki", "Zara", "Ari", "Bilal", "Cato", "Dina",
];

export const LAST_NAMES = [
  "Achterberg", "Bekele", "Cordero", "Duvall", "Eriksen", "Fontaine", "Gul", "Hoang",
  "Ibrahim", "Jansen", "Kovač", "Lindqvist", "Moyo", "Nakamura", "Okonkwo", "Petrov",
  "Quiroga", "Rautio", "Sørensen", "Tanaka", "Ueda", "Varga", "Wojcik", "Xu",
];

export const COMPANY_A = ["Nova", "Vela", "Kernel", "Lattice", "Signal", "Torque", "Atlas", "Ember", "Orbit", "Basalt", "Quanta", "Harbor"];
export const COMPANY_B = ["forge", "lab", "works", "stack", "mind", "river", "grid", "foundry", "desk", "loop", "yard", "core"];

export const TAGLINE_OPENERS = ["Intelligence that", "Compute that", "Models that", "Software that", "Research that"];
export const TAGLINE_CLOSERS = [
  "actually ships",
  "respects your budget",
  "admits when it is wrong",
  "runs on a Tuesday",
  "scales without drama",
  "you can audit",
  "stays in the garage",
];

export const NAME_GENERATOR_REJECTS = [
  "already a shoe brand",
  "trademarked by a bakery in Ohio",
  "too close to a car lease company",
  "squatted since 1998",
  "features a dead startup's logo",
  "reserved by a law firm",
];
