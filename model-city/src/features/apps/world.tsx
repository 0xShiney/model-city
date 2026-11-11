"use client";

import { useState } from "react";
import { MessageSquare, Megaphone, ShieldCheck, TrendingUp } from "lucide-react";
import { useGame } from "@/store/game";
import { activeModel, productQuality } from "@/lib/sim/economy";
import { sentimentLabel } from "@/lib/sim/reviews";
import { compact, money, num, pct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { AppFrame, Bar, Empty, Metric, Panel, Row, TextButton } from "./ui";

const PLATFORMS = ["chirp", "threadly", "hackerfeed", "launchpad", "storefront", "tubely", "press"] as const;

export function SocialApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const [platform, setPlatform] = useState<(typeof PLATFORMS)[number] | "all">("all");
  if (!game) return null;
  const posts = game.social.filter((post) => platform === "all" || post.platform === platform).slice(0, 40);
  const positive = game.social.filter((post) => post.sentiment > 0).length;
  const negative = game.social.filter((post) => post.sentiment < 0).length;

  return (
    <AppFrame
      title="Social Feed"
      subtitle="Fictional platforms, genuinely earned reviews. They read your real stats, price and quirks."
      actions={<Badge variant={game.kpis.sentiment > 0.1 ? "success" : game.kpis.sentiment < -0.1 ? "error" : "outline"}>{sentimentLabel(game.kpis.sentiment)}</Badge>}
    >
      <div className="grid gap-2 lg:grid-cols-[1fr_260px]">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setPlatform("all")}
              className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase ${platform === "all" ? "border-line bg-ink text-paper" : "border-line/40 bg-paper"}`}
            >
              all
            </button>
            {PLATFORMS.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setPlatform(id)}
                className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase ${platform === id ? "border-line bg-ink text-paper" : "border-line/40 bg-paper"}`}
              >
                {id}
              </button>
            ))}
          </div>

          {posts.length === 0 ? (
            <Empty>No posts yet. Ship something and the internet will have opinions.</Empty>
          ) : (
            <ul className="scroll-thin max-h-[400px] space-y-1.5 overflow-y-auto pr-1">
              {posts.map((post) => (
                <li key={post.id} className={`border-l-2 bg-paper px-2 py-1.5 ${post.sentiment > 0 ? "border-teal" : post.sentiment < 0 ? "border-alarm" : "border-sun"}`}>
                  <div className="flex items-center justify-between gap-2 font-mono text-[9px] text-ink-muted">
                    <span>
                      {post.platform} · @{post.handle} · {compact(post.followers)} followers
                    </span>
                    <span>d{post.day}</span>
                  </div>
                  <p className="mt-0.5 text-[11px]">{post.body}</p>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[9px] text-ink-muted">
                    <span>{num(post.likes)} likes</span>
                    <span>{post.replies} replies</span>
                    <span>#{post.topic}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <Panel label="sentiment">
            <div className="grid grid-cols-2 gap-1">
              <Metric label="positive" value={positive} tone="good" />
              <Metric label="negative" value={negative} tone="bad" />
              <Metric label="posts" value={game.social.length} />
              <Metric label="nps" value={Math.round(game.kpis.nps)} />
            </div>
            <div className="mt-2">
              <Bar value={(game.kpis.sentiment + 1) * 50} tone={game.kpis.sentiment < 0 ? "alarm" : "teal"} />
              <p className="mt-1 font-mono text-[9px] text-ink-muted">-1 hostile · +1 adored</p>
            </div>
          </Panel>
          <Panel label="act as the company">
            <div className="grid gap-1">
              <TextButton onClick={() => act({ type: "social-action", action: "reply" })}>
                <MessageSquare className="mr-1 inline size-3" /> Reply to reviews ($1.5k)
              </TextButton>
              <TextButton onClick={() => act({ type: "social-action", action: "ads" })}>
                <Megaphone className="mr-1 inline size-3" /> Buy ads ($12k)
              </TextButton>
              <TextButton onClick={() => act({ type: "social-action", action: "sponsor" })}>
                <Megaphone className="mr-1 inline size-3" /> Sponsor a creator ($20k)
              </TextButton>
              <TextButton onClick={() => act({ type: "social-action", action: "apology" })}>Public apology</TextButton>
              <TextButton onClick={() => act({ type: "social-action", action: "ama" })}>Host an AMA</TextButton>
            </div>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

export function MarketApp() {
  const game = useGame((state) => state.game);
  if (!game) return null;
  const model = activeModel(game);
  const playerBenchmark = model ? model.benchmark : 0;
  const board = [
    { name: game.company.name, quality: playerBenchmark, users: game.kpis.users, hype: game.res.hype, you: true },
    ...game.market.rivals.map((rival) => ({ name: rival.name, quality: rival.quality, users: rival.users, hype: rival.hype, you: false })),
  ].sort((a, b) => b.quality - a.quality);

  return (
    <AppFrame
      title="Market"
      subtitle="Seven rivals with their own strategies. Release timing matters more than anyone admits."
      actions={<Badge variant="outline">share {(game.market.share * 100).toFixed(1)}%</Badge>}
    >
      <div className="grid gap-2 lg:grid-cols-2">
        <Panel label="leaderboard (benchmark)">
          <ul className="space-y-1">
            {board.map((entry, index) => (
              <li key={entry.name} className={`flex items-center gap-2 border px-2 py-1 ${entry.you ? "border-line bg-acid/25" : "border-line/25 bg-paper"}`}>
                <span className="w-4 font-mono text-[10px] text-ink-muted">{index + 1}</span>
                <span className="min-w-0 flex-1 truncate text-[11px] font-semibold">{entry.name}</span>
                <span className="font-mono text-[10px] tabular">{Math.round(entry.quality)}</span>
                <span className="w-16 font-mono text-[9px] text-ink-muted">{compact(entry.users)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-2">
          <Panel label="market read">
            <div className="grid grid-cols-2 gap-1">
              <Metric label="share" value={`${(game.market.share * 100).toFixed(2)}%`} tone="good" />
              <Metric label="trending" value={game.market.trend} hint={`bonus ${pct(game.market.trendBonus, 0)}`} />
              <Metric label="quality" value={Math.round(productQuality(game))} />
              <Metric label="rivals" value={game.market.rivals.length} />
            </div>
            <p className="mt-2 font-mono text-[10px] text-ink-muted">
              {game.market.rivals.filter((rival) => rival.price < 5).length} rival(s) are pricing below $5/seat. The price war is on.
            </p>
          </Panel>
          <Panel label="rival behaviour">
            <ul className="space-y-1">
              {game.market.rivals.slice(0, 4).map((rival) => (
                <li key={rival.id} className="border border-line/25 bg-paper px-2 py-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold">{rival.name}</span>
                    <span className="font-mono text-[9px] text-ink-muted">${rival.price}/seat</span>
                  </span>
                  <span className="block font-mono text-[9px] text-ink-muted">{rival.persona}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

export function LegalApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const startMinigame = useGame((state) => state.startMinigame);
  const [tab, setTab] = useState("risk");
  if (!game) return null;

  return (
    <AppFrame
      title="Legal & Safety"
      subtitle="Risk compounds quietly, then arrives with a letterhead."
      actions={<Badge variant={game.legal.risk > 60 ? "error" : game.legal.risk > 35 ? "warning" : "success"}>risk {Math.round(game.legal.risk)}</Badge>}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="underline">
          <TabsTab value="risk">Risk</TabsTab>
          <TabsTab value="actions">Actions</TabsTab>
          <TabsTab value="redteam">Red team</TabsTab>
        </TabsList>

        <TabsPanel value="risk" className="pt-3">
          <div className="grid gap-2 sm:grid-cols-3">
            <Metric label="data risk" value={Math.round(game.res.dataRisk)} tone={game.res.dataRisk > 50 ? "bad" : "ink"} />
            <Metric label="compliance" value={Math.round(game.legal.compliance)} tone="good" />
            <Metric label="lawsuits" value={game.legal.lawsuits} tone={game.legal.lawsuits > 0 ? "bad" : "ink"} />
            <Metric label="audits passed" value={game.legal.auditsPassed} />
            <Metric label="safety score" value={Math.round(game.res.safety)} tone={game.res.safety < 45 ? "bad" : "good"} />
            <Metric label="red team" value={game.legal.redTeamScore} />
          </div>
          <Panel label="exposure" className="mt-2">
            <Bar value={game.legal.risk} tone={game.legal.risk > 60 ? "alarm" : "signal"} />
            <p className="mt-1 font-mono text-[10px] text-ink-muted">
              {game.legal.risk > 60
                ? "One more claim and your lawyer stops answering on weekends."
                : "Manageable. Keep licensing data and documenting evals."}
            </p>
          </Panel>
        </TabsPanel>

        <TabsPanel value="actions" className="pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Panel label="licensing">
              <p className="text-[11px] text-ink-muted">Pay publishers, reduce exposure, sleep.</p>
              <div className="mt-1.5">
                <TextButton tone="primary" disabled={game.res.cash < 40_000} onClick={() => act({ type: "legal-action", action: "license" })}>
                  Sign licence ($40k)
                </TextButton>
              </div>
            </Panel>
            <Panel label="audit">
              <p className="text-[11px] text-ink-muted">Third-party audit unlocks enterprise deals and calms investors.</p>
              <div className="mt-1.5">
                <TextButton disabled={game.res.cash < 60_000} onClick={() => act({ type: "legal-action", action: "audit" })}>
                  <ShieldCheck className="mr-1 inline size-3" /> Commission audit ($60k)
                </TextButton>
              </div>
            </Panel>
            <Panel label="settlement">
              <p className="text-[11px] text-ink-muted">Make a claim disappear quietly. Expensive, effective.</p>
              <div className="mt-1.5">
                <TextButton disabled={game.legal.lawsuits === 0 || game.res.cash < 45_000} onClick={() => act({ type: "legal-action", action: "settle" })}>
                  Settle ($45k)
                </TextButton>
              </div>
            </Panel>
            <Panel label="compliance program">
              <p className="text-[11px] text-ink-muted">Training, paperwork, and a policy nobody reads.</p>
              <div className="mt-1.5">
                <TextButton disabled={game.res.cash < 15_000} onClick={() => act({ type: "legal-action", action: "compliance" })}>
                  Run programme ($15k)
                </TextButton>
              </div>
            </Panel>
          </div>
        </TabsPanel>

        <TabsPanel value="redteam" className="pt-3">
          <Panel label="adversarial review">
            <p className="text-[11px] text-ink-muted">
              Flag unsafe prompts before the internet does. False positives hurt usefulness; missed ones hurt everything else.
            </p>
            <div className="mt-2 flex gap-1.5">
              <TextButton
                tone="primary"
                onClick={() => startMinigame({ id: "red-team", purpose: "Internal red team session", returnTo: "legal" })}
              >
                <ShieldCheck className="mr-1 inline size-3" /> Start red team
              </TextButton>
              <TextButton onClick={() => act({ type: "apply-effects", effects: { safety: 2, legalRisk: -2, cash: -8_000 }, note: "Safety review pass" })}>
                Review pass ($8k)
              </TextButton>
            </div>
            <p className="mt-2 font-mono text-[10px] text-ink-muted">Last score: {game.legal.redTeamScore}/100</p>
          </Panel>
        </TabsPanel>
      </Tabs>

      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <Row>
          <span className="flex items-center gap-1 text-[10px]"><TrendingUp className="size-3" /> investigator interest</span>
          <span className="font-mono text-[9px] text-ink-muted">{game.legal.risk > 50 ? "elevated" : "background noise"}</span>
        </Row>
        <Row>
          <span className="flex items-center gap-1 text-[10px]"><ShieldCheck className="size-3" /> model safety</span>
          <span className="font-mono text-[9px] text-ink-muted">{Math.round(game.legal.redTeamScore)}/100 internal</span>
        </Row>
      </div>
    </AppFrame>
  );
}
