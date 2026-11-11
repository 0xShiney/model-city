import type { EffectKey, GameEventDef } from "./types";

const c = (
  id: string,
  label: string,
  detail: string,
  effect: string,
  effects: Partial<Record<EffectKey, number>>,
): GameEventDef["choices"][number] => ({ id, label, detail, effect, effects });

const ev = (
  id: string,
  title: string,
  body: string,
  tone: GameEventDef["tone"],
  weight: number,
  minDay: number,
  choices: GameEventDef["choices"],
  once = false,
): GameEventDef => ({ id, title, body, tone, weight, minDay, choices, once });

export const EVENTS: GameEventDef[] = [
  ev("gpu-shortage", "GPU Shortage", "Every cloud provider is out of capacity. A broker offers you a pallet of cards at a 40% premium, no invoice, no questions.", "bad", 1, 20, [
    c("buy", "Take the deal", "Pay the premium and keep training.", "-$85k cash, +compute", { cash: -85_000, computeOwned: 14_000 }),
    c("wait", "Queue politely", "Accept slower progress and keep the cash.", "Training slows", { computeOwned: -2_000, morale: -3 }),
    c("rent", "Rent spot capacity", "Cheap, unstable, and it disappears mid-run.", "+compute, -cash small", { cash: -18_000, computeRented: 9_000, techDebt: 3 }),
  ]),
  ev("power-outage", "Substation Tripped", "A bird, a substation, and your training run. Pick two.", "bad", 1, 30, [
    c("checkpoint", "Restore from checkpoint", "Lose a week of progress, keep the weights.", "Costs time, small trust hit", { cash: -6_000, userTrust: -2 }),
    c("buyups", "Buy UPS capacity", "Expensive insurance that pays for itself eventually.", "-$22k, fewer outages", { cash: -22_000, energyCost: 6 }),
  ]),
  ev("poached-engineer", "Your Best Engineer Has a Meeting", "A rival's recruiter has booked a 30-minute call titled 'quick chat'.", "bad", 1.2, 25, [
    c("counter", "Counter-offer hard", "Money is a language everyone speaks.", "-$40k, morale +4", { cash: -40_000, morale: 4 }),
    c("mission", "Pitch the mission", "Cheaper, riskier, occasionally works.", "50/50", { morale: 2, devRep: -1 }),
    c("letgo", "Let them go", "Save the salary, lose the context.", "Team shrinks", { morale: -6, devRep: -3 }),
  ]),
  ev("copyright-claim", "Copyright Claim", "A publisher's lawyer sends a polite email that is definitely not polite.", "bad", 1.1, 40, [
    c("license", "Sign a licensing deal", "Pay properly and fix the pipeline.", "-$60k, legal risk down", { cash: -60_000, legalRisk: -10, compliance: 4 }),
    c("fight", "Fight it", "Your lawyer's retainer is now a subscription.", "-$25k, risk up", { cash: -25_000, legalRisk: 8, lawsuits: 1 }),
    c("purge", "Purge the dataset quietly", "Expensive, slow, and your model gets dumber.", "-quality, risk down", { qualityDelta: -2, legalRisk: -6, dataQuality: -5 }),
  ]),
  ev("viral-screenshot", "Screenshot SZN", "Someone posts a screenshot of your model being confidently, hilariously wrong. It has 40k likes.", "bad", 1.3, 20, [
    c("apologise", "Post a real apology", "Own it, explain the fix, ship the fix.", "Trust wobble then recovery", { userTrust: -3, hype: -4, devRep: 2 }),
    c("meme", "Reply with a meme", "Risky. Gen Z marketing team is ecstatic.", "Coin flip on hype", { hype: 6, userTrust: -6 }),
    c("silent", "Say nothing", "Let it blow over. It will not blow over.", "Trust down", { userTrust: -8, hype: -6 }),
  ]),
  ev("rival-price-cut", "Price War", "Veloce cut API prices by 60% overnight and posted a chart with your logo on it.", "bad", 1.2, 35, [
    c("match", "Match the price", "Margins compressed, users relieved.", "-MRR margin", { paidUsersPct: 0.01, cash: -20_000 }),
    c("hold", "Hold price, sell quality", "Adult move. Requires the quality to actually be there.", "Depends on quality", { userTrust: 3, hype: -3 }),
    c("bundle", "Bundle a free tier", "Give away the razor, sell the enterprise blade.", "+users, -cash", { usersPct: 0.03, cash: -15_000 }),
  ]),
  ev("keynote-invite", "Keynote Invitation", "A conference with a suspiciously large stage wants you to demo live.", "good", 0.9, 45, [
    c("accept", "Take the stage", "Live demo, live risk.", "Hype, possible disaster", { hype: 10, devRep: 3 }),
    c("send", "Send a recording", "Safe, forgettable.", "Small hype", { hype: 3 }),
    c("decline", "Decline politely", "Focus on shipping.", "No change", { morale: 2 }),
  ]),
  ev("enterprise-rfp", "Enterprise RFP", "A logistics conglomerate wants a pilot. Their procurement document is 84 pages and mentions 'synergy' 31 times.", "good", 1, 50, [
    c("bid", "Bid seriously", "Huge revenue if you win, huge distraction regardless.", "-cash, possible +MRR", { cash: -30_000, paidUsersPct: 0.02, marketShare: 0.01 }),
    c("smb", "Ignore and sell to startups", "Smaller deals, faster cycle.", "+users", { usersPct: 0.02 }),
  ]),
  ev("open-weights-rival", "Open Weights Drop", "OpenMath releases a model that is 90% as good as yours, free, with a permissive licence.", "bad", 1, 60, [
    c("cut", "Cut prices to defend", "Cheap defence, expensive long term.", "-MRR", { cash: -30_000, paidUsersPct: -0.01 }),
    c("differentiate", "Double down on product", "Compete on the experience, not the weights.", "+trust", { userTrust: 4, devRep: 2 }),
    c("release", "Release your own weights", "Hype explosion, revenue leak.", "+hype, -revenue", { hype: 14, paidUsersPct: -0.02 }),
  ]),
  ev("audit-notice", "Regulator Wants a Word", "A safety regulator requests documentation on your evaluation process. They used the word 'forthwith'.", "bad", 1, 70, [
    c("comply", "Comply fully", "Paperwork, lawyers, and a clean conscience.", "-$45k, compliance up", { cash: -45_000, compliance: 8, legalRisk: -8 }),
    c("delay", "Request an extension", "Buys time, raises eyebrows.", "-small risk", { legalRisk: 5, cash: -5_000 }),
  ]),
  ev("data-breach", "Data Spill", "A misconfigured bucket exposed 12,000 customer prompts for six hours. A security researcher found it and was nice about it.", "bad", 0.8, 80, [
    c("disclose", "Disclose publicly", "Painful, correct, remembered fondly.", "-trust, +rep", { userTrust: -6, devRep: 4, cash: -20_000 }),
    c("quiet", "Patch and stay quiet", "Cheaper until it is not.", "Hidden risk", { userTrust: -2, legalRisk: 10 }),
  ]),
  ev("grant-offer", "Research Grant", "A public innovation fund offers a grant with 40 pages of reporting requirements.", "good", 0.8, 40, [
    c("accept", "Take the money", "Free cash, free bureaucracy.", "+$120k, -time", { cash: 120_000, morale: -3, devRep: 3 }),
    c("decline", "Stay independent", "No strings, no cash.", "Nothing", { morale: 2 }),
  ]),
  ev("acqui-hire", "Acqui-hire Offer", "A big platform wants your team, your weights, and your logo, for a number with a lot of zeroes.", "neutral", 0.5, 120, [
    c("consider", "Take the meeting", "Listen. It costs nothing.", "Offer appears in Investors", { investorConfidence: 4 }),
    c("decline", "Decline", "You are not done.", "+morale", { morale: 5 }),
  ]),
  ev("burnout-warning", "Founder Mode, Off", "Your co-founder finds you asleep on the office couch at 4am with a terminal open on 'rm -rf'.", "bad", 0.9, 60, [
    c("rest", "Take a week off", "The company survives. You might too.", "-days, +morale", { morale: 8, cash: -4_000 }),
    c("push", "Push through", "Ship now, pay later.", "Morale down", { morale: -8, devRep: 2 }),
  ]),
  ev("celebrity-endorsement", "Unexpected Endorsement", "A retired athlete posts about your product to 8 million followers. Nobody knows why.", "good", 0.7, 50, [
    c("lean", "Lean into it", "Send merch, book a call, ride the spike.", "+hype, +users", { hype: 12, usersPct: 0.02, cash: -8_000 }),
    c("quiet", "Stay tasteful", "Small, classy bump.", "+trust", { userTrust: 3, hype: 4 }),
  ]),
  ev("security-researcher", "Friendly Hacker", "A researcher found a prompt injection that leaks system prompts. They want a bounty and a shout-out.", "neutral", 1, 55, [
    c("pay", "Pay the bounty", "Cheap insurance and good PR.", "-$12k, +trust", { cash: -12_000, userTrust: 3, safety: 3 }),
    c("ignore", "Ignore it", "They will post about it.", "Risk", { legalRisk: 6, userTrust: -4 }),
  ]),
  ev("office-flood", "The Office Flood", "The office above you flooded. Your GPU rack is now a water feature.", "bad", 0.6, 45, [
    c("replace", "Replace immediately", "Insurance takes months; your roadmap does not.", "-$35k", { cash: -35_000, computeOwned: -2_000 }),
    c("improvise", "Improvise with rentals", "Expensive per hour, but you keep shipping.", "+rentals", { computeRented: 6_000, cash: -6_000 }),
  ]),
  ev("pricing-backlash", "Pricing Backlash", "You raised prices. The forum has a 900-comment thread titled 'goodbye'.", "bad", 1, 65, [
    c("rollback", "Roll it back", "Everyone calms down, metrics get worse.", "-MRR, +trust", { userTrust: 6, paidUsersPct: -0.005 }),
    c("hold", "Hold the line", "Some churn now, better margins later.", "Churn spike", { churnDelta: 0.02, cash: 12_000 }),
    c("apology", "Grandfather existing users", "Split the difference with a spreadsheet.", "+trust, -MRR small", { userTrust: 3, cash: -6_000 }),
  ]),
  ev("hardware-theft", "Rack Gone", "Two people with a van and confidence removed three GPUs from the datacenter.", "bad", 0.5, 80, [
    c("security", "Hire security", "Cameras, badges, a stern sign.", "-$18k, safer", { cash: -18_000, computeOwned: -1_500 }),
    c("move", "Move to rented capacity", "No hardware to steal.", "+rentals, -owned", { computeOwned: -4_000, computeRented: 5_000 }),
  ]),
  ev("benchmark-leak", "Benchmark Leak", "Your internal eval set appears in a competitor's training data. Or theirs in yours. Everyone is accusing everyone.", "bad", 0.8, 90, [
    c("publish", "Publish your methodology", "Radical transparency, radical scrutiny.", "+devRep, -hype", { devRep: 5, hype: -4 }),
    c("quiet", "Investigate quietly", "Fix first, talk later.", "Slow trust loss", { userTrust: -2, safety: 2 }),
  ]),
  ev("government-contract", "Government Pilot", "A ministry wants a sovereign deployment. They also want source code escrow and a local office.", "good", 0.7, 110, [
    c("accept", "Accept", "Fat contract, fat obligations.", "+cash, -flexibility", { cash: 180_000, compliance: 8, morale: -4 }),
    c("negotiate", "Negotiate terms", "Slower, saner.", "+cash small", { cash: 70_000, devRep: 2 }),
  ]),
  ev("employee-protest", "Open Letter", "Forty employees sign an open letter about a customer's use case. A journalist has the letter.", "bad", 0.7, 100, [
    c("listen", "Meet with them", "Lose the customer, keep the team.", "+morale, -cash", { morale: 8, cash: -25_000, userTrust: 3 }),
    c("refuse", "Refuse to discuss", "Short-term focus, long-term leak.", "-morale", { morale: -10, userTrust: -3 }),
  ]),
  ev("founder-viral", "Founder Goes Viral", "Your founder's post about 'shipping from the garage' hits 2M views. Half the replies are about the font.", "good", 0.8, 30, [
    c("double", "Post a follow-up thread", "Ride it.", "+hype", { hype: 12, devRep: 1 }),
    c("humble", "Humble-brag briefly", "Classy bump.", "+trust", { userTrust: 3, hype: 5 }),
  ]),
  ev("downtime-weekend", "Saturday Outage", "Your inference cluster falls over at 02:14 on a Saturday. Your on-call is at a wedding.", "bad", 1.1, 40, [
    c("allhands", "Wake everyone up", "Expensive, fast, morale dent.", "-cash, -morale", { cash: -9_000, morale: -4, userTrust: -1 }),
    c("slow", "Wait for the retry queue", "Cheap, embarrassing.", "Trust down", { userTrust: -7 }),
  ]),
  ev("cofounder-conflict", "Strategy Argument", "Your co-founder wants to chase enterprise. You want developer tools. The whiteboard has both, underlined twice.", "neutral", 0.8, 70, [
    c("enterprise", "Go enterprise", "Follow the money.", "+MRR, -users", { paidUsersPct: 0.015, usersPct: -0.005 }),
    c("devtools", "Go developer", "Follow the love.", "+devRep, +users", { devRep: 5, usersPct: 0.015 }),
    c("both", "Do both badly", "Everyone is unhappy, progress is real.", "+techDebt", { techDebt: 6, morale: -4 }),
  ]),
  ev("press-expose", "The Exposé", "A reporter spent three weeks in your Discord and found things you would rather not see printed.", "bad", 0.6, 95, [
    c("cooperate", "Cooperate fully", "It mostly helps.", "-trust small, +rep", { userTrust: -3, devRep: 3 }),
    c("lawyer", "Send a legal letter", "Never works, always memorable.", "-trust", { userTrust: -7, cash: -18_000 }),
  ]),
  ev("talent-windfall", "A Team Is Available", "A rival shut down. Six excellent engineers are on the market and will join as a group.", "good", 0.6, 85, [
    c("hire", "Hire the whole team", "Cliff hire, instant seniority.", "-$70k, +morale", { cash: -70_000, morale: 6, devRep: 4 }),
    c("cherry", "Hire two", "Cheaper, slower.", "-$25k", { cash: -25_000, devRep: 2 }),
  ]),
  ev("model-jailbreak", "Jailbreak Thread", "Someone found a prompt that makes your model agree to absolutely anything. The thread is a step-by-step guide.", "bad", 1, 75, [
    c("patch", "Patch immediately", "Break the API for two hours, fix the hole.", "+safety, -trust", { safety: 6, userTrust: -3 }),
    c("filter", "Add filters", "Whack-a-mole with a nice dashboard.", "+safety small", { safety: 3, cash: -8_000 }),
  ]),
  ev("climate-bill", "Energy Bill", "Your electricity bill arrives in a box. The energy market is having a week.", "bad", 1, 60, [
    c("hedge", "Buy a hedge", "Lock prices, lose flexibility.", "-$30k, -energy", { cash: -30_000, energyCost: -14 }),
    c("absorb", "Absorb it", "Margins eat it.", "+energy", { energyCost: 10 }),
  ]),
  ev("unexpected-user", "One Very Important User", "A defence contractor opens an account with a free email and immediately asks about 'field deployment'.", "neutral", 0.7, 90, [
    c("block", "Block the account", "Ethical, profitable to avoid, press will ask.", "+safety, -cash", { safety: 5, cash: -4_000 }),
    c("allow", "Allow it", "No policy against it. Yet.", "+cash, risk", { cash: 40_000, legalRisk: 12 }),
  ]),
  ev("dataset-goldmine", "A Dataset Goldmine", "A forum user offers 3 billion cleaned, deduplicated documents. Provenance: 'various'.", "neutral", 1, 45, [
    c("buy", "Buy it", "Cheap data, expensive questions.", "-$25k, +data", { cash: -25_000, dataQty: 3_000, dataQuality: 6, legalRisk: 8 }),
    c("audit", "Usual diligence", "Slower, cleaner.", "-$10k, +quality", { cash: -10_000, dataQty: 900, dataQuality: 4 }),
    c("refuse", "Pass", "Boring and safe.", "Nothing", { morale: 1 }),
  ]),
  ev("startup-award", "Industry Award", "You are nominated for 'Most Promising Lab' by a magazine owned by an investor in a rival.", "good", 0.6, 70, [
    c("attend", "Attend the gala", "Networking, canapés, one photo.", "+rep", { devRep: 4, hype: 3, cash: -3_000 }),
    c("skip", "Skip it", "Ship instead.", "+morale small", { morale: 2 }),
  ]),
  ev("compliance-deadline", "Compliance Deadline", "New transparency rules kick in within 45 days. Every model needs documentation you do not have.", "bad", 1, 100, [
    c("comply", "Build the documentation", "Expensive, boring, necessary.", "-$40k, +compliance", { cash: -40_000, compliance: 10 }),
    c("partial", "Do the minimum", "Enough to pass a glance.", "-$10k, risk", { cash: -10_000, compliance: 4, legalRisk: 4 }),
  ]),
  ev("hiring-fraud", "Resume Situation", "Your new hire's 'ex-Stanford' is actually 'attended one summer program'. They are also very good at the job.", "neutral", 0.6, 80, [
    c("keep", "Keep them", "Results over résumés.", "+morale, -rep", { morale: 3, devRep: -2 }),
    c("fire", "Fire them", "Policy is policy.", "-cash, -morale", { cash: -6_000, morale: -5 }),
  ]),
  ev("conference-booth", "Conference Booth", "A dev conference offers a booth for the price of a small car.", "neutral", 0.7, 55, [
    c("booth", "Buy the booth", "Demos, stickers, badge scans.", "-$18k, +signups", { cash: -18_000, usersPct: 0.008, devRep: 3 }),
    c("talk", "Submit a talk instead", "Free, if accepted.", "+rep", { devRep: 3 }),
  ]),
  ev("dramatic-paper", "A Paper Drops", "A lab publishes a technique that makes your architecture look quaint. The code is not released. Yet.", "bad", 0.8, 85, [
    c("replicate", "Try to replicate", "Burn compute on a rumour.", "-compute", { computeOwned: -3_000, techDebt: 4 }),
    c("ignore", "Ignore it", "Most papers do not replicate.", "Nothing", { devRep: -1 }),
  ]),
  ev("power-deal", "Cheap Power Offer", "A decommissioned aluminium smelter has surplus power and no neighbours.", "good", 0.5, 120, [
    c("sign", "Sign the PPA", "Cheap energy, remote site.", "-$60k, -energy", { cash: -60_000, energyCost: -25, morale: -2 }),
    c("pass", "Stay where the talent is", "Expensive power, good coffee.", "Nothing", { morale: 2 }),
  ]),
  ev("customer-escalation", "Churn Risk", "Your biggest customer's integration broke during their board meeting. They are asking for a call in ten minutes.", "bad", 1, 65, [
    c("call", "Take the call yourself", "Founder-level grovelling.", "-time, +trust", { userTrust: 4, morale: -2 }),
    c("credit", "Offer a credit", "Money fixes most things.", "-$15k, +trust", { cash: -15_000, userTrust: 3 }),
  ]),
  ev("intern-viral", "Intern Post", "An intern posted an unlisted feature and it got 500k views before legal noticed.", "neutral", 0.7, 50, [
    c("launch", "Launch it properly", "Ship the thing they leaked.", "+hype, +techDebt", { hype: 9, techDebt: 3 }),
    c("delete", "Delete and pretend", "The screenshots are forever.", "-hype", { hype: -4, userTrust: -2 }),
  ]),
  ev("safety-pledge", "Pledge Season", "A coalition of labs signs a safety pledge. Signing costs you roadmap speed; not signing costs you reputation.", "neutral", 0.8, 105, [
    c("sign", "Sign", "Slow down, look responsible.", "-quality, +safety", { qualityDelta: -1, safety: 6, investorConfidence: 4 }),
    c("abstain", "Abstain", "Speed, scrutiny.", "+quality, -rep", { qualityDelta: 1.5, devRep: -4 }),
  ]),
  ev("down-round", "Down Round Pressure", "An existing investor suggests a 'structured' round at a lower valuation with generous protections. For them.", "bad", 0.5, 160, [
    c("accept", "Take it", "Survive, diluted.", "+cash, -control", { cash: 150_000, investorConfidence: -6, boardConfidence: -8 }),
    c("bridge", "Bridge instead", "Cheaper, faster, riskier.", "+cash small", { cash: 60_000, cash_placeholder_ignore: 0 } as Partial<Record<EffectKey, number>>),
    c("cut", "Cut costs instead", "Painful, honest.", "-morale, -burn", { morale: -10, cash: 40_000 }),
  ]),
  ev("ai-winter", "Funding Winter", "Term sheets have frozen. Every investor is 'focusing on portfolio support' this quarter.", "bad", 0.8, 130, [
    c("extend", "Extend runway", "Cut marketing and hiring.", "-growth, -burn", { cash: 25_000, hype: -5 }),
    c("bridge", "Do a bridge", "Friends, family, and one persistent angel.", "+cash, -control", { cash: 80_000, boardConfidence: -4 }),
  ]),
  ev("agent-regret", "Agent Goes Rogue", "A customer's agent, powered by your model, booked 400 flights before anyone noticed.", "bad", 0.9, 120, [
    c("cap", "Ship hard caps", "Fewer features, fewer incidents.", "+safety, -quality", { safety: 6, qualityDelta: -1 }),
    c("support", "Help clean up", "Expensive goodwill.", "-cash, +trust", { cash: -30_000, userTrust: 4 }),
  ]),
  ev("acquisition-interest", "Strategic Interest", "A platform company schedules a 'partnership discussion'. Their corp-dev team is larger than your company.", "neutral", 0.6, 140, [
    c("listen", "Listen", "Information is free.", "+investorConfidence", { investorConfidence: 5 }),
    c("refuse", "Refuse", "Focus.", "+morale", { morale: 4 }),
  ]),
  ev("talent-poach-wave", "Poaching Season", "Three of your engineers get the same recruiter's calendar invite within an hour.", "bad", 0.9, 90, [
    c("retain", "Retention packages", "Expensive, effective.", "-$50k, +morale", { cash: -50_000, morale: 6 }),
    c("culture", "Culture offsite", "Cheaper, slower.", "-$12k, +morale", { cash: -12_000, morale: 4 }),
    c("nothing", "Do nothing", "Some will leave.", "-morale", { morale: -7 }),
  ]),
  ev("os-release", "Open Source Contribution", "An engineer open-sourced an internal tool. It now has more stars than your product.", "neutral", 0.6, 75, [
    c("embrace", "Embrace it", "Hire the maintainers, brand the repo.", "+rep, +hype", { devRep: 6, hype: 5 }),
    c("reclaim", "Reclaim it", "Legal asks about licences.", "-rep", { devRep: -4, morale: -3 }),
  ]),
  ev("rate-limit-storm", "Rate Limit Storm", "A scraper network is draining your free tier. Inference costs tripled overnight.", "bad", 1.1, 55, [
    c("limit", "Add rate limits", "Legit users grumble.", "-abuse, +trust", { cash: 18_000, userTrust: 2 }),
    c("captcha", "Add verification", "Friction, fewer bots.", "Mixed", { cash: 12_000, userTrust: -2 }),
    c("absorb", "Absorb the cost", "Generous, expensive.", "-cash", { cash: -40_000, userTrust: 4 }),
  ]),
  ev("benchmark-invite", "Arena Invitation", "A public arena wants your model in the ring. Public Elo, public losses.", "neutral", 0.9, 50, [
    c("enter", "Enter the arena", "Transparency, risk.", "+hype", { hype: 7, devRep: 3 }),
    c("decline", "Decline", "No data, no damage.", "Nothing", { devRep: -1 }),
  ]),
  ev("energy-audit", "Energy Audit", "A sustainability auditor arrives with a clipboard and questions about your cooling loop.", "neutral", 0.6, 85, [
    c("improve", "Invest in efficiency", "Good PR, real savings.", "-$25k, -energy", { cash: -25_000, energyCost: -18 }),
    c("report", "Report and move on", "Paperwork only.", "Nothing", { cash: -3_000 }),
  ]),
  ev("troll-wave", "Coordinated Trolls", "A group has decided your company is the villain of the week. The accusations are mostly fictional.", "bad", 0.8, 70, [
    c("ignore", "Ignore", "They move on.", "-hype small", { hype: -4 }),
    c("engage", "Engage publicly", "Risky, occasionally effective.", "Coin flip", { userTrust: -3, hype: 4 }),
  ]),
  ev("documentary", "Documentary Crew", "A streaming service wants to film 'the garage years'. They will also film the bad weeks.", "neutral", 0.5, 100, [
    c("allow", "Allow it", "Free brand, no control.", "+hype, -trust", { hype: 10, userTrust: -3 }),
    c("deny", "Decline", "Privacy, mystique.", "Nothing", { morale: 2 }),
  ]),
  ev("hardware-discount", "Fire Sale", "A crypto miner is liquidating. 200 GPUs, cash only, no warranty, one weekend.", "good", 0.7, 40, [
    c("buy", "Buy them", "Cheap compute, sketchy provenance.", "-$70k, +compute", { cash: -70_000, computeOwned: 22_000, techDebt: 3 }),
    c("half", "Buy half", "Balanced.", "-$35k, +compute", { cash: -35_000, computeOwned: 10_000 }),
  ]),
  ev("model-plagiarism", "Copycat", "A competitor's new model produces answers that match yours word for word on 40% of prompts.", "bad", 0.6, 95, [
    c("expose", "Publish the analysis", "Public, embarrassing for them.", "+hype, -devRep", { hype: 6, devRep: -2 }),
    c("lawyer", "Legal route", "Slow, expensive.", "-cash", { cash: -20_000, legalRisk: -2 }),
  ]),
  ev("customer-war-story", "The Best Ad You Never Paid For", "A customer posts a long thread about how your product saved their launch. It reads like a case study.", "good", 1, 40, [
    c("amplify", "Amplify it", "Ask permission, quote it, link it.", "+trust", { userTrust: 5, hype: 4 }),
    c("offer", "Offer them a discount", "Awkward, kind.", "Nothing much", { userTrust: 2, cash: -1_000 }),
  ]),
  ev("new-office", "The Real Office", "You can afford actual walls. The garage lease ends in a month.", "good", 0.6, 75, [
    c("move", "Move in", "Real desks, real rent.", "-$40k, +morale", { cash: -40_000, morale: 8 }),
    c("stay", "Stay in the garage", "For the story.", "+hype", { hype: 5, morale: 2 }),
  ]),
  ev("legal-threat-generic", "A Letter Arrives", "A law firm with a menacing name claims your tagline is too similar to a client's. It is not.", "bad", 0.7, 60, [
    c("settle", "Settle quietly", "Cheap, annoying.", "-$14k", { cash: -14_000, legalRisk: -3 }),
    c("fight", "Fight it", "Principle is expensive.", "-$30k", { cash: -30_000, legalRisk: 4, devRep: 1 }),
  ]),
  ev("research-breakthrough", "A Lucky Gradient", "A routine experiment produces a loss curve nobody can explain. Your researcher wants a week to chase it.", "good", 0.5, 90, [
    c("chase", "Chase it", "Might be nothing. Might be everything.", "-time, +quality", { qualityDelta: 3, techDebt: 2 }),
    c("note", "Write it down and move on", "Responsible.", "Nothing", { devRep: 1 }),
  ]),
  ev("hardware-failure", "Card Fried", "A GPU dies mid-run. Then another. The datacenter says it is 'within tolerance'.", "bad", 0.8, 70, [
    c("replace", "Replace under warranty", "Weeks of waiting.", "-compute", { computeOwned: -2_000 }),
    c("buy", "Buy replacements", "Fast, expensive.", "-$20k", { cash: -20_000, computeOwned: 1_000 }),
  ]),
  ev("partnership-offer", "Distribution Deal", "A device maker wants your model preinstalled on 2 million units. They want exclusivity and a revenue share.", "good", 0.6, 115, [
    c("sign", "Sign", "Distribution now, constraints forever.", "+users, -share", { usersPct: 0.08, cash: -20_000, marketShare: 0.02 }),
    c("limited", "Limited pilot", "Smaller, safer.", "+users small", { usersPct: 0.02, marketShare: 0.006 }),
    c("decline", "Decline", "Independence.", "+morale", { morale: 2 }),
  ]),
  ev("churn-spike", "Quiet Churn", "Your churn chart has developed a slope. Nobody has complained. That is the worrying part.", "bad", 0.9, 80, [
    c("research", "Run interviews", "Painful truths.", "+trust, -cash", { userTrust: 3, cash: -6_000 }),
    c("discount", "Discount to retain", "Buys a quarter.", "-MRR, +retention", { paidUsersPct: 0.005, cash: -12_000 }),
  ]),
  ev("accreditation", "Accreditation", "A standards body offers a certification. It costs money and means nothing until an enterprise asks for it.", "neutral", 0.7, 105, [
    c("certify", "Get certified", "Boring, useful.", "-$30k, +compliance", { cash: -30_000, compliance: 6, marketShare: 0.004 }),
    c("skip", "Skip", "Save the money.", "Nothing", { cash: 0 }),
  ]),
  ev("salary-leak", "Salary Spreadsheet", "Someone shared the salary spreadsheet in the general channel. It was not an accident.", "bad", 0.6, 85, [
    c("transparent", "Publish bands", "Chaos, then calm.", "-morale, +trust", { morale: -3, devRep: 2 }),
    c("raise", "Raise the underpaid", "Expensive, fair.", "-$25k, +morale", { cash: -25_000, morale: 7 }),
  ]),
  ev("demo-fail", "Live Demo, Dead Air", "A prospect's demo failed in front of their entire leadership team. The model returned a 500 and a haiku.", "bad", 1, 75, [
    c("fix", "Fix it and re-demo", "Effort, humility.", "+trust", { userTrust: 3, morale: -2 }),
    c("blame", "Blame their network", "Bold.", "-trust", { userTrust: -5 }),
  ]),
  ev("open-letter-vcs", "A VC Writes About You", "A well-known investor publishes a post calling your category 'a rounding error'.", "bad", 0.7, 65, [
    c("respond", "Respond with data", "Adult, effective.", "+rep", { devRep: 4, investorConfidence: 2 }),
    c("ignore", "Ignore", "Dignified.", "Nothing", { morale: 1 }),
  ]),
  ev("user-meetup", "First User Meetup", "Twelve people show up to a bar to talk about your product. One has a tattoo of your logo.", "good", 0.8, 60, [
    c("attend", "Attend", "Free insight, great photos.", "+morale, +trust", { morale: 6, userTrust: 3 }),
    c("sponsor", "Sponsor the next one", "Cheap loyalty.", "-$4k, +trust", { cash: -4_000, userTrust: 4 }),
  ]),
  ev("data-poisoning", "Poisoned Batch", "Your cleaning pipeline let through a batch of subtly wrong documents. The model now believes something odd about pigeons.", "bad", 0.8, 70, [
    c("retrain", "Retrain", "Expensive, correct.", "-compute, +quality", { computeOwned: -4_000, qualityDelta: 1 }),
    c("prompt", "Patch with prompting", "Cheap, fragile.", "-quality, +techDebt", { qualityDelta: -2, techDebt: 5 }),
  ]),
  ev("infra-award", "Cloud Credits", "A cloud provider offers $200k of credits in exchange for a logo on your site.", "good", 0.9, 45, [
    c("accept", "Accept", "Free compute, free lock-in.", "+compute, -independence", { computeRented: 25_000, techDebt: 2 }),
    c("decline", "Decline", "Portability has value.", "+morale", { morale: 2 }),
  ]),
  ev("hiring-freeze", "Hiring Freeze", "Finance says no new heads this quarter. Engineering says otherwise, loudly.", "neutral", 0.8, 90, [
    c("freeze", "Freeze hiring", "Cash is oxygen.", "-morale, +cash", { morale: -5, cash: 15_000 }),
    c("exception", "One exception", "Compromise, precedent.", "-cash, +morale", { cash: -12_000, morale: 3 }),
  ]),
  ev("safety-incident-near-miss", "Near Miss", "An internal test produced an output that would have been a front-page story. It never shipped. You know.", "neutral", 0.8, 100, [
    c("publish", "Publish a transparency note", "Unusual, respected.", "+safety, +devRep", { safety: 5, devRep: 4, hype: -2 }),
    c("fix", "Fix silently", "Common.", "+safety small", { safety: 3 }),
  ]),
  ev("rival-talent", "Rival Alumni", "A senior researcher from Hyperion wants to join. They bring a non-compete and a reputation.", "good", 0.6, 110, [
    c("hire", "Hire them", "Expensive, credible.", "-$60k, +devRep", { cash: -60_000, devRep: 6, qualityDelta: 1 }),
    c("pass", "Pass", "Legal risk avoided.", "Nothing", { morale: 1 }),
  ]),
  ev("pricing-experiment", "Growth Team Idea", "Growth wants to test a paywall on the third message. Users will notice immediately.", "neutral", 0.8, 55, [
    c("test", "Run the test", "Data, angry replies.", "+MRR, -trust", { paidUsersPct: 0.01, userTrust: -4 }),
    c("refuse", "Refuse", "Keep the funnel generous.", "+trust", { userTrust: 3 }),
  ]),
  ev("ai-safety-hearing", "Hearing Invitation", "A legislative committee invites you to testify. C-SPAN, or an equivalent.", "neutral", 0.6, 130, [
    c("testify", "Testify", "Public, political.", "+rep, -time", { devRep: 5, compliance: 4, morale: -2 }),
    c("send", "Send your policy lead", "Safe, forgettable.", "Nothing", { compliance: 2 }),
  ]),
  ev("hardware-shortage-customers", "Latency Complaints", "Users report your responses got slower this week. They are correct; you are batching aggressively.", "bad", 0.9, 60, [
    c("revert", "Revert batching", "Costs money, feels fast.", "-cash, +trust", { cash: -14_000, userTrust: 4 }),
    c("explain", "Explain the tradeoff", "Honest, still slow.", "-trust small", { userTrust: -2 }),
  ]),
  ev("cofounder-exit", "Co-founder Wants Out", "Your co-founder wants to leave, keep their equity, and 'stay involved as an advisor'.", "bad", 0.6, 120, [
    c("buyback", "Buy back equity", "Expensive, clean.", "-$40k, +control", { cash: -40_000, boardConfidence: 3 }),
    c("vest", "Let it vest", "Cheap, messy.", "-control", { boardConfidence: -4, morale: -3 }),
  ]),
  ev("enterprise-audit", "Security Questionnaire", "An enterprise sends a 200-question security questionnaire. Question 148 is 'describe your AI safety culture'.", "neutral", 0.9, 95, [
    c("answer", "Answer everything", "Weeks of work, real deal.", "-time, +MRR", { paidUsersPct: 0.02, morale: -3 }),
    c("template", "Send a template", "Fast, vague.", "Small chance", { userTrust: -1 }),
  ]),
  ev("unexpected-profit", "A Good Month", "Revenue beat projections. Finance suggests a small celebration budget.", "good", 0.8, 70, [
    c("party", "Throw a party", "Morale, receipts.", "-$8k, +morale", { cash: -8_000, morale: 8 }),
    c("reinvest", "Reinvest", "Compute and hiring.", "+compute", { computeOwned: 3_000 }),
  ]),
  ev("api-abuse", "API Abuse", "Someone is reselling your API as their own product. Their landing page is nicer than yours.", "neutral", 0.7, 80, [
    c("allow", "Allow it", "Revenue is revenue.", "+cash", { cash: 18_000, userTrust: -2 }),
    c("block", "Block them", "Control, lost revenue.", "-cash", { cash: -6_000, userTrust: 2 }),
  ]),
  ev("founder-interview", "The Profile Piece", "A business magazine wants a founder profile. The photographer wants you to hold a GPU dramatically.", "good", 0.7, 65, [
    c("accept", "Accept", "Free press.", "+hype", { hype: 8, devRep: 2 }),
    c("control", "Accept with copy approval", "Slower, safer.", "+rep", { devRep: 3, hype: 3 }),
  ]),
  ev("scaling-wall", "Scaling Wall", "Loss stops improving. Your team argues about data, architecture, and whose idea it originally was.", "bad", 0.9, 85, [
    c("data", "More data", "Brute force.", "-cash, +quality", { cash: -25_000, qualityDelta: 2 }),
    c("arch", "Change architecture", "Risky, slow.", "-time, +quality later", { qualityDelta: 1, techDebt: 4 }),
    c("accept", "Accept the plateau", "Ship what you have.", "Nothing", { devRep: -1 }),
  ]),
  ev("garage-rent", "Garage Rent Increase", "Your landlord discovered what your company is worth. The rent triples.", "bad", 0.7, 50, [
    c("pay", "Pay it", "Cheap relative to moving.", "-$6k", { cash: -6_000 }),
    c("move", "Move to a coworking space", "Cheaper, less mythic.", "-hype", { hype: -3, cash: 4_000 }),
  ]),
  ev("model-retirement", "Legacy Model", "Users still love your old model. Keeping it online costs more than it earns.", "neutral", 0.7, 90, [
    c("retire", "Retire it", "Savings, complaints.", "+cash, -trust", { cash: 20_000, userTrust: -4 }),
    c("keep", "Keep it running", "Sentimental and expensive.", "-cash, +trust", { cash: -12_000, userTrust: 3 }),
  ]),
  ev("grant-rejection", "Grant Rejected", "Your grant application was rejected. The feedback says your project is 'commercially focused'.", "bad", 0.6, 70, [
    c("appeal", "Appeal", "Time, dignity.", "-time", { morale: -3, devRep: 1 }),
    c("move", "Move on", "Focus.", "+morale", { morale: 2 }),
  ]),
  ev("meme-account", "A Meme Account Loves You", "An account with 900k followers posts your logo with the caption 'unhinged and correct'.", "good", 0.8, 45, [
    c("engage", "Ship a joke feature", "Playful, risky.", "+hype, +techDebt", { hype: 10, techDebt: 2 }),
    c("thank", "Say thanks", "Wholesome.", "+trust", { userTrust: 3 }),
  ]),
  ev("gpu-theft-insurance", "Insurance Renewal", "Your insurer reclassified you as 'high risk infrastructure'. Premium up 60%.", "bad", 0.6, 90, [
    c("pay", "Pay", "Boring.", "-$14k", { cash: -14_000 }),
    c("drop", "Drop coverage", "Brave.", "+cash, risk", { cash: 6_000, legalRisk: 4 }),
  ]),
  ev("safety-hire", "Safety Lead Interview", "A well-known safety researcher will join, but wants veto power over releases.", "neutral", 0.6, 100, [
    c("hire", "Give them the veto", "Slower releases, better sleep.", "-quality, +safety", { safety: 8, qualityDelta: -1, devRep: 4 }),
    c("pass", "Pass", "Speed.", "+quality", { qualityDelta: 1, devRep: -2 }),
  ]),
  ev("competitor-flop", "A Rival Stumbles", "A competitor's launch went badly. Their users are looking for somewhere to go.", "good", 0.7, 75, [
    c("poach", "Poach their users", "Ads, migration tools, a comparison page.", "-$20k, +users", { cash: -20_000, usersPct: 0.02 }),
    c("wait", "Wait for organic", "Cheap, slow.", "+users small", { usersPct: 0.006 }),
  ]),
  ev("keynote-crash", "The Demo Crashed", "Your livestream demo died on stage. The clip is doing numbers.", "bad", 0.7, 110, [
    c("publish", "Publish the raw footage", "Self-aware, charming.", "+hype, +trust", { hype: 8, userTrust: 3 }),
    c("edit", "Post the edited version", "Transparent-ish.", "-trust", { userTrust: -3 }),
  ]),
  ev("budget-review", "Board Budget Review", "The board wants a plan to profitability 'or at least a plan to a plan'.", "neutral", 0.8, 120, [
    c("profit", "Present a profit plan", "Credible, constraining.", "+board", { boardConfidence: 8, morale: -3 }),
    c("growth", "Present a growth plan", "Exciting, risky.", "+board small", { boardConfidence: 3, hype: 4 }),
  ]),
  ev("summer-lull", "Summer Lull", "Usage drops as everyone goes outside. Revenue follows.", "bad", 0.6, 80, [
    c("discount", "Summer promotion", "Cheap, effective.", "-cash, +users", { cash: -8_000, usersPct: 0.01, paidUsersPct: 0.005 }),
    c("wait", "Wait for autumn", "Free.", "-MRR small", { cash: -4_000 }),
  ]),
  ev("unexpected-departure", "Resignation Letter", "Your lead designer resigns via a beautifully typeset PDF. The design system will miss them.", "bad", 0.7, 85, [
    c("counter", "Counter-offer", "Expensive.", "-$20k, +morale", { cash: -20_000, morale: 4 }),
    c("accept", "Accept", "Hire someone cheaper.", "-morale small", { morale: -4, userTrust: -1 }),
  ]),
  ev("legal-win", "You Win One", "A nuisance claim is dismissed. Your lawyer sends an invoice that is not dismissal-shaped.", "good", 0.6, 120, [
    c("celebrate", "Tell everyone", "Small win, good story.", "+devRep, -cash", { devRep: 3, cash: -12_000 }),
    c("quiet", "Stay quiet", "Classy.", "Nothing", { morale: 2 }),
  ]),
  ev("openai-of-the-day", "Imitation Launch", "A new startup launches with your exact positioning and a better landing page. They have been live for six days.", "bad", 0.8, 95, [
    c("differentiate", "Sharpen positioning", "Marketing sprint.", "+trust, -cash", { userTrust: 3, cash: -10_000 }),
    c("outspend", "Outspend them", "Expensive.", "-cash, +hype", { cash: -30_000, hype: 6 }),
  ]),
  ev("seo-attack", "SEO Attack", "A content farm is outranking your docs for your own product name.", "bad", 0.6, 70, [
    c("content", "Publish real docs", "Boring, effective.", "+seo, -cash", { cash: -8_000, userTrust: 3 }),
    c("ignore", "Ignore", "It resolves itself. Sometimes.", "-users small", { usersPct: -0.004 }),
  ]),
  ev("user-council", "User Council", "Ten power users offer to form an advisory council. They have opinions about your roadmap and a shared spreadsheet.", "good", 0.7, 85, [
    c("form", "Form the council", "Free product direction.", "+trust, +quality", { userTrust: 5, qualityDelta: 1 }),
    c("decline", "Decline", "Focus.", "Nothing", { morale: 1 }),
  ]),
];

export function eventsById(id: string): GameEventDef | undefined {
  return EVENTS.find((event) => event.id === id);
}
