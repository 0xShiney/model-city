"use client";

import { useState } from "react";
import { ExternalLink, Palette, Rocket, Users } from "lucide-react";
import { useGame } from "@/store/game";
import { SEGMENTS } from "@/lib/sim/config";
import { activeModel, cohortRetention, dailyInferenceCost, grossMargin, planMargins, productQuality, weightedPrice } from "@/lib/sim/economy";
import { simulateReply, suggestedPrompts } from "@/lib/sim/playground";
import { compact, money, num, pct, pctRaw } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { SimulatedChat, Sparkline } from "@/components/motion/kit";
import type { SegmentId } from "@/lib/sim/types";
import { AppFrame, Bar, Empty, Metric, Panel, Row, TextButton } from "./ui";

const FEATURES = [
  { id: "memory", label: "Memory", detail: "Remember context between sessions." },
  { id: "voice", label: "Voice mode", detail: "Latency becomes the product." },
  { id: "vision", label: "Image input", detail: "Screenshots, receipts, whiteboards." },
  { id: "tools", label: "Tool calling", detail: "The model can break things autonomously." },
  { id: "export", label: "Data export", detail: "Boring. Users love boring." },
  { id: "teams", label: "Team spaces", detail: "Shared prompts and an invoice someone approves." },
];

export function ProductApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  if (!game) return null;
  const model = activeModel(game);
  const quality = productQuality(game);

  return (
    <AppFrame title="Product Studio" subtitle="Turn weights into something people pay for, then write release notes that sound confident." actions={<Badge variant={model ? "success" : "warning"}>{model ? model.name : "no model"}</Badge>}>
      <div className="grid gap-2 lg:grid-cols-[1fr_300px]">
        <div className="space-y-2">
          <Panel label="ship a feature">
            <div className="grid gap-1 sm:grid-cols-2">
              {FEATURES.map((feature) => {
                const shipped = game.product.roadmap.includes(feature.id);
                return (
                  <button
                    key={feature.id}
                    type="button"
                    disabled={shipped || game.res.cash < 10_000 || !model}
                    onClick={() => act({ type: "ship-feature", feature: feature.id })}
                    className="border border-line/40 bg-paper px-2 py-1.5 text-left disabled:opacity-45"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{feature.label}</span>
                      <span className="font-mono text-[9px] text-signal">{shipped ? "shipped" : "$10k"}</span>
                    </span>
                    <span className="block text-[10px] text-ink-muted">{feature.detail}</span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel label="versions" aside={<span className="font-mono text-[9px]">quality {Math.round(quality)}</span>}>
            {game.product.versions.length === 0 ? (
              <Empty>No versions yet. Features make versions.</Empty>
            ) : (
              <ul className="space-y-1">
                {[...game.product.versions].reverse().slice(0, 6).map((version) => (
                  <li key={version.id} className="border border-line/30 bg-paper px-2 py-1.5">
                    <span className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold">{version.name}</span>
                      <span className="font-mono text-[9px] text-ink-muted">day {version.day}</span>
                    </span>
                    <span className="block text-[10px] text-ink-muted">{version.notes}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-2">
          <Panel label="product health">
            <div className="grid grid-cols-2 gap-1">
              <Metric label="quality" value={Math.round(quality)} tone={quality > 65 ? "good" : "warn"} />
              <Metric label="nps" value={Math.round(game.kpis.nps)} />
              <Metric label="paid" value={compact(game.kpis.paidUsers)} />
              <Metric label="arpu" value={`$${game.kpis.arpu.toFixed(1)}`} />
            </div>
            <div className="mt-2">
              <span className="label-mono">funnel</span>
              <div className="mt-1 space-y-1">
                <FunnelRow label="visitors" value={game.kpis.visitors} max={game.kpis.visitors} />
                <FunnelRow label="signups" value={game.kpis.signups} max={game.kpis.visitors} />
                <FunnelRow label="activated" value={game.kpis.activated} max={game.kpis.visitors} />
                <FunnelRow label="paid" value={game.kpis.paidUsers} max={game.kpis.visitors} tone="acid" />
              </div>
            </div>
          </Panel>
          <Panel label="roadmap">
            {game.product.roadmap.length === 0 ? (
              <Empty>Empty roadmap. Very confident.</Empty>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {game.product.roadmap.map((item) => (
                  <li key={item} className="border border-line/30 bg-paper px-1.5 py-0.5 font-mono text-[9px]">{item}</li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

function FunnelRow({ label, value, max, tone = "teal" }: { label: string; value: number; max: number; tone?: "teal" | "acid" }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px]">
        <span className="text-ink-muted">{label}</span>
        <span>{compact(value)}</span>
      </div>
      <Bar value={max > 0 ? (value / max) * 100 : 0} tone={tone} />
    </div>
  );
}

export function WebApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const startMinigame = useGame((state) => state.startMinigame);
  const t = useT2();
  const [tab, setTab] = useState("preview");
  if (!game) return null;
  const logo = game.company.logo;
  const blocks = game.website.blocks;

  return (
    <AppFrame
      title="Web Studio"
      subtitle="A real site with a real funnel. The playground is the product; everything else is a brochure with better typography."
      actions={
        <>
          <Badge variant="outline">{blocks.filter((block) => block.enabled).length} blocks</Badge>
          <TextButton onClick={() => startMinigame({ id: "debug-sprint", purpose: "Website performance audit", returnTo: "web" })}>
            <Rocket className="mr-1 inline size-3" /> Perf sprint
          </TextButton>
        </>
      }
    >
      <div className="grid gap-2 lg:grid-cols-[300px_1fr]">
        <div className="space-y-2">
          <Panel label="builder">
            <div className="space-y-1">
              {blocks.map((block) => (
                <label key={block.id} className="flex items-center justify-between gap-2 border border-line/25 bg-paper px-2 py-1">
                  <span className="font-mono text-[10px]">{block.kind}</span>
                  <Switch checked={block.enabled} onCheckedChange={() => act({ type: "website-toggle", blockId: block.id })} />
                </label>
              ))}
            </div>
          </Panel>
          <Panel label={t("logo.preview")}>
            <div className="flex gap-1">
              {(["salvage", "labnote", "monolith"] as const).map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() => act({ type: "website-template", template })}
                  className={`border px-1.5 py-0.5 font-mono text-[9px] uppercase ${game.website.template === template ? "border-line bg-ink text-paper" : "border-line/40 bg-paper"}`}
                >
                  {template}
                </button>
              ))}
            </div>
            <div className="mt-2">
              <span className="label-mono">design score</span>
              <Bar value={game.website.designScore} tone="signal" />
              <span className="label-mono">seo</span>
              <Bar value={game.website.seoScore} tone="teal" />
              <span className="label-mono">speed</span>
              <Bar value={game.website.speedScore} tone="acid" />
              <span className="label-mono">trust</span>
              <Bar value={game.website.trustScore} tone="teal" />
            </div>
          </Panel>
          <Panel label="A/B test">
            <div className="grid grid-cols-2 gap-1">
              {(["none", "hero", "price", "signup"] as const).map((test) => (
                <button
                  key={test}
                  type="button"
                  onClick={() => act({ type: "website-ab", test })}
                  className={`border px-1 py-0.5 font-mono text-[9px] uppercase ${game.website.abTest === test ? "border-line bg-ink text-paper" : "border-line/40 bg-paper"}`}
                >
                  {test}
                </button>
              ))}
            </div>
            <p className="mt-1 font-mono text-[9px] text-ink-muted">$4k per test · signup test adds conversion</p>
          </Panel>
        </div>

        <Panel label="live site" aside={<span className="flex items-center gap-1 font-mono text-[9px] text-ink-muted"><ExternalLink className="size-3" /> {game.company.name.toLowerCase().replace(/\s+/g, "")}.example</span>}>
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList variant="underline">
              <TabsTab value="preview">Site</TabsTab>
              <TabsTab value="playground">Playground</TabsTab>
              <TabsTab value="funnel">Funnel</TabsTab>
            </TabsList>
            <TabsPanel value="preview" className="pt-2">
              <div className="border-2 border-line bg-paper">
                <div className="flex items-center justify-between border-b border-line/40 px-3 py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="grid size-5 place-items-center border border-line text-[9px]" style={{ background: logo.colors[0], color: logo.colors[2], borderRadius: logo.mask === "circle" ? 99 : 3 }}>
                      {logo.symbol}
                    </span>
                    <span className="font-display text-xs font-bold">{game.company.name}</span>
                  </span>
                  <div className="flex gap-2 font-mono text-[9px] text-ink-muted">
                    {blocks.filter((block) => block.enabled).map((block) => (
                      <span key={block.id}>{block.kind}</span>
                    ))}
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  {blocks.find((block) => block.kind === "hero")?.enabled && (
                    <div>
                      <h3 className="font-display text-2xl leading-none">{game.company.name}</h3>
                      <p className="mt-1 text-sm text-ink-muted">{game.company.tagline}</p>
                      <div className="mt-2 flex gap-1.5">
                        <span className="border border-line bg-signal px-2 py-1 font-mono text-[10px] text-white">Start free</span>
                        <span className="border border-line px-2 py-1 font-mono text-[10px]">API docs</span>
                      </div>
                    </div>
                  )}
                  {blocks.find((block) => block.kind === "features")?.enabled && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {["Fast", "Grounded", "Cheap-ish"].map((feature) => (
                        <div key={feature} className="border border-line/30 p-1.5">
                          <p className="font-mono text-[10px] font-bold">{feature}</p>
                          <p className="text-[9px] text-ink-muted">Because the model {feature === "Fast" ? "streams" : feature === "Grounded" ? "cites" : "caches"}.</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {blocks.find((block) => block.kind === "pricing")?.enabled && (
                    <div className="flex gap-1.5">
                      {game.pricing.plans.filter((plan) => plan.enabled).map((plan) => (
                        <div key={plan.id} className="flex-1 border border-line/30 p-1.5 text-center">
                          <p className="font-mono text-[9px] uppercase">{plan.id}</p>
                          <p className="font-display text-sm">${plan.price}</p>
                          <p className="font-mono text-[8px] text-ink-muted">{plan.capMessages} msgs</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {blocks.find((block) => block.kind === "status")?.enabled && (
                    <p className="border-t border-line/20 pt-1.5 font-mono text-[9px] text-teal">● all systems nominal (as far as you know)</p>
                  )}
                </div>
              </div>
            </TabsPanel>
            <TabsPanel value="playground" className="pt-2">
              <SimulatedChat
                className="h-[320px]"
                greeting={`This is ${activeModel(game)?.name ?? "your model"}, running at ${Math.round(productQuality(game))} quality. Try it before your users do.`}
                reply={(prompt) => simulateReply(game, prompt)}
              />
              <div className="mt-1.5 flex flex-wrap gap-1">
                {suggestedPrompts(game).slice(0, 3).map((prompt) => (
                  <span key={prompt} className="border border-line/30 px-1 py-0.5 font-mono text-[9px] text-ink-muted">{prompt}</span>
                ))}
              </div>
            </TabsPanel>
            <TabsPanel value="funnel" className="pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <span className="label-mono">funnel (daily)</span>
                  <div className="mt-1 space-y-1">
                    <FunnelRow label="visitors" value={game.kpis.visitors} max={game.kpis.visitors} />
                    <FunnelRow label="signups" value={game.kpis.signups} max={game.kpis.visitors} />
                    <FunnelRow label="activated" value={game.kpis.activated} max={game.kpis.visitors} />
                    <FunnelRow label="paid" value={game.kpis.paidUsers} max={game.kpis.visitors} tone="acid" />
                  </div>
                </div>
                <div>
                  <span className="label-mono">conversion</span>
                  <p className="font-display text-2xl">{game.kpis.users > 0 ? pct(game.kpis.paidUsers / Math.max(1, game.kpis.users), 2) : "0%"}</p>
                  <p className="font-mono text-[10px] text-ink-muted">of users pay for something</p>
                  <span className="label-mono mt-2 block">uptime story</span>
                  <p className="text-[11px] text-ink-muted">
                    {game.legal.lawsuits > 0 ? "Status page is doing a lot of work this month." : "No outages recorded. Yet."}
                  </p>
                </div>
              </div>
            </TabsPanel>
          </Tabs>
        </Panel>
      </div>
    </AppFrame>
  );
}

export function PricingApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const [selected, setSelected] = useState<"plus" | "pro" | "team" | "enterprise">("pro");
  if (!game) return null;
  const plan = game.pricing.plans.find((entry) => entry.id === selected);
  const margins = planMargins(game);
  const retention = cohortRetention(game);

  return (
    <AppFrame
      title="Pricing & Billing"
      subtitle="Every free message has a cost. Every heavy user on a cheap plan is a small, polite loss."
      actions={<Badge variant={grossMargin(game) < 0 ? "error" : "success"}>margin {grossMargin(game) < 0 ? "negative" : pct(grossMargin(game), 0)}</Badge>}
    >
      <div className="grid gap-2 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          <Panel label="plans">
            <div className="space-y-1">
              {game.pricing.plans.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center gap-2 border border-line/25 bg-paper px-2 py-1.5">
                  <button type="button" onClick={() => setSelected(entry.id as typeof selected)} className={`w-20 text-left font-display text-xs font-semibold ${selected === entry.id ? "text-signal" : ""}`}>
                    {entry.id}
                  </button>
                  <span className="font-mono text-[10px]">${entry.price}/mo</span>
                  <span className="font-mono text-[9px] text-ink-muted">{entry.capMessages.toLocaleString("en-US")} msgs</span>
                  <span className="ml-auto flex items-center gap-2">
                    <span className="font-mono text-[9px] text-ink-muted">{entry.enabled ? "live" : "off"}</span>
                    <Switch checked={entry.enabled} onCheckedChange={(checked) => act({ type: "set-plan", planId: entry.id, patch: { enabled: checked } })} />
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          {plan && (
            <Panel label={`edit ${plan.id}`}>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between font-mono text-[10px]"><span className="text-ink-muted">price</span><span>${plan.price}/mo</span></div>
                  <Slider value={plan.price} min={0} max={400} step={1} onValueChange={(value) => act({ type: "set-plan", planId: plan.id, patch: { price: typeof value === "number" ? value : (value[0] ?? 0) } })} />
                </div>
                <div>
                  <div className="flex justify-between font-mono text-[10px]"><span className="text-ink-muted">message cap</span><span>{plan.capMessages.toLocaleString("en-US")}</span></div>
                  <Slider value={plan.capMessages} min={10} max={20_000} step={10} onValueChange={(value) => act({ type: "set-plan", planId: plan.id, patch: { capMessages: typeof value === "number" ? value : (value[0] ?? 10) } })} />
                </div>
                <p className="font-mono text-[9px] text-ink-muted">
                  Estimated cost to serve a user at cap: ${(plan.capMessages * 0.00052 * (activeModel(game)?.costPerMTok ?? 0.03)).toFixed(2)}/mo.
                </p>
              </div>
            </Panel>
          )}

          <Panel label="api pricing">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <div className="flex justify-between font-mono text-[10px]"><span className="text-ink-muted">input $/1M</span><span>${game.pricing.apiInput}</span></div>
                <Slider value={game.pricing.apiInput} min={0.4} max={30} step={0.1} onValueChange={(value) => act({ type: "set-api-price", input: typeof value === "number" ? value : (value[0] ?? 1), output: game.pricing.apiOutput })} />
              </div>
              <div>
                <div className="flex justify-between font-mono text-[10px]"><span className="text-ink-muted">output $/1M</span><span>${game.pricing.apiOutput}</span></div>
                <Slider value={game.pricing.apiOutput} min={1} max={90} step={0.5} onValueChange={(value) => act({ type: "set-api-price", input: game.pricing.apiInput, output: typeof value === "number" ? value : (value[0] ?? 1) })} />
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-2">
          <Panel label="unit economics">
            <div className="grid grid-cols-2 gap-1">
              <Metric label="mrr" value={money(game.kpis.mrr)} />
              <Metric label="arpu" value={`$${game.kpis.arpu.toFixed(1)}`} />
              <Metric label="inference/day" value={money(dailyInferenceCost(game))} tone="warn" />
              <Metric label="avg price" value={`$${weightedPrice(game).toFixed(0)}`} />
            </div>
            <div className="mt-2 space-y-1">
              {margins.map((entry) => (
                <div key={entry.plan.id}>
                  <div className="flex justify-between font-mono text-[9px]">
                    <span className="text-ink-muted">{entry.plan.id}</span>
                    <span className={entry.margin < 0 ? "text-alarm" : "text-teal"}>{entry.margin < 0 ? "loss" : pct(entry.margin, 0)}</span>
                  </div>
                  <Bar value={Math.max(0, entry.margin * 100)} tone={entry.margin < 0 ? "alarm" : "teal"} />
                </div>
              ))}
            </div>
          </Panel>

          <Panel label="cohort retention">
            <Sparkline points={retention} tone="teal" height={44} />
            <p className="font-mono text-[9px] text-ink-muted">monthly survival at {pctRaw(game.kpis.churn * 100)} churn</p>
          </Panel>

          <Panel label="segments">
            {(Object.keys(SEGMENTS) as SegmentId[]).slice(0, 6).map((key) => {
              const segment = SEGMENTS[key];
              return (
                <Row key={key}>
                  <span className="flex items-center gap-1 text-[10px]"><Users className="size-3 shrink-0" /> {segment.name}</span>
                  <span className="font-mono text-[9px] text-ink-muted">${segment.arpu}/mo · {pct(segment.share, 0)}</span>
                </Row>
              );
            })}
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

function useT2() {
  return (key: "logo.preview") => (key === "logo.preview" ? "Template" : key);
}

export { num, Palette, Empty };
