"use client";

import { useState } from "react";
import { Beaker, Database, FlaskConical, Play, Server, TriangleAlert } from "lucide-react";
import { useGame } from "@/store/game";
import { BRANCH_LABELS } from "@/lib/sim/config";
import { TECH_TREE, techForBranch } from "@/lib/sim/content";
import { bestModel, productQuality } from "@/lib/sim/economy";
import { compact, money, num, pct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import type { BranchId, MinigameId, PipelineStage } from "@/lib/sim/types";
import { AppFrame, Bar, Empty, Field, Metric, Panel, Row, TextButton } from "./ui";

export const STAGE_MINIGAME: Record<PipelineStage, MinigameId> = {
  data: "data-sorting",
  architecture: "architecture",
  training: "training-run",
  evaluation: "benchmark-gauntlet",
  safety: "red-team",
  polish: "prompt-craft",
  launch: "launch-day",
};

const STAGES: { id: PipelineStage; label: string; blurb: string }[] = [
  { id: "data", label: "Data", blurb: "Sort, clean, discard. Precision beats volume." },
  { id: "architecture", label: "Architecture", blurb: "Wire layers under a compute and latency budget." },
  { id: "training", label: "Training", blurb: "Ride the loss curve without divergence." },
  { id: "evaluation", label: "Evaluation", blurb: "Timed benchmark gauntlet. Some of it is theatre." },
  { id: "safety", label: "Safety", blurb: "Red team: flag what is unsafe, without false positives." },
  { id: "polish", label: "Fine-tune", blurb: "Preference labelling against a shifting rubric." },
  { id: "launch", label: "Launch", blurb: "Keep the servers up while the internet arrives." },
];

export function ResearchApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const [branch, setBranch] = useState<BranchId>("models");
  if (!game) return null;

  return (
    <AppFrame title="Research Lab" subtitle="Five branches, five tiers. Every node costs cash and compute and moves a number nobody can see.">
      <Tabs value={branch} onValueChange={(value) => setBranch(value as BranchId)}>
        <TabsList variant="underline">
          {(Object.keys(BRANCH_LABELS) as BranchId[]).map((id) => (
            <TabsTab key={id} value={id}>
              {BRANCH_LABELS[id]} <span className="ml-1 font-mono text-[9px] text-ink-muted">{game.research[id]}</span>
            </TabsTab>
          ))}
        </TabsList>
        {(["models", "data", "infra", "products", "safety"] as BranchId[]).map((id) => (
          <TabsPanel key={id} value={id} className="pt-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {techForBranch(id).map((node) => {
                const owned = game.funding.inventory.includes(node.id);
                const locked = game.research[id] < node.tier - 1;
                const affordable = game.res.cash >= node.cost && game.res.computeOwned + game.res.computeRented >= node.compute;
                return (
                  <div key={node.id} className={`paper-card p-2.5 ${locked ? "opacity-55" : ""}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="label-mono">tier {node.tier}</span>
                        <h3 className="font-display text-sm leading-tight">{node.name}</h3>
                      </div>
                      {owned ? <Badge variant="success">owned</Badge> : locked ? <Badge variant="outline">locked</Badge> : null}
                    </div>
                    <p className="mt-1 text-[11px] text-ink-muted">{node.desc}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[9px] text-ink-muted">
                      <span className="border border-line/30 px-1">{money(node.cost)}</span>
                      <span className="border border-line/30 px-1">{compact(node.compute)} GPUh</span>
                      {Object.entries(node.effects).map(([key, value]) => (
                        <span key={key} className="border border-line/30 px-1 text-teal">
                          {key} {value > 0 ? "+" : ""}
                          {value}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2">
                      <TextButton
                        tone="primary"
                        disabled={owned || locked || !affordable}
                        onClick={() => act({ type: "research", nodeId: node.id })}
                      >
                        {owned ? "Researched" : locked ? "Locked" : "Research"}
                      </TextButton>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsPanel>
        ))}
      </Tabs>
    </AppFrame>
  );
}

export function DataRoomApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  if (!game) return null;

  const sources = [
    {
      id: "scrape" as const,
      name: "Open crawl",
      detail: "Cheap, fast, legally interesting.",
      effects: { dataQty: 900, dataQuality: 2, dataRisk: 6, cash: -8_000 },
      cost: "$8k",
    },
    {
      id: "license" as const,
      name: "Publisher licence",
      detail: "Expensive, clean, audit-friendly.",
      effects: { dataQty: 600, dataQuality: 7, dataRisk: -8, legalRisk: -6, cash: -55_000 },
      cost: "$55k",
    },
    {
      id: "synthetic" as const,
      name: "Synthetic generation",
      detail: "Unlimited volume, mild model collapse risk.",
      effects: { dataQty: 2_400, dataQuality: 3, techDebt: 4, cash: -22_000 },
      cost: "$22k",
    },
    {
      id: "user" as const,
      name: "User data program",
      detail: "Free, useful, needs consent and a lawyer.",
      effects: { dataQty: 1_100, dataQuality: 5, dataRisk: 10, userTrust: -3, cash: -4_000 },
      cost: "$4k",
    },
  ];

  return (
    <AppFrame title="Data Room" subtitle="Quality beats quantity. Licensing beats lawsuits, most of the time." actions={<Badge variant={game.res.dataRisk > 45 ? "warning" : "outline"}>risk {Math.round(game.res.dataRisk)}</Badge>}>
      <div className="grid gap-2 sm:grid-cols-3">
        <Metric label="dataset size" value={`${compact(game.res.dataQty)} docs`} />
        <Metric label="quality" value={Math.round(game.res.dataQuality)} tone={game.res.dataQuality > 60 ? "good" : "warn"} />
        <Metric label="legal exposure" value={Math.round(game.res.dataRisk)} tone={game.res.dataRisk > 50 ? "bad" : "ink"} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {sources.map((source) => (
          <Panel key={source.id} label={source.name} aside={<span className="font-mono text-[9px] text-signal">{source.cost}</span>}>
            <p className="text-[11px] text-ink-muted">{source.detail}</p>
            <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[9px]">
              {Object.entries(source.effects).map(([key, value]) => (
                <span key={key} className={`border border-line/30 px-1 ${value < 0 ? "text-alarm" : "text-teal"}`}>
                  {key} {value > 0 ? "+" : ""}
                  {Math.round(value)}
                </span>
              ))}
            </div>
            <div className="mt-2">
              <TextButton
                disabled={game.res.cash < Math.abs(Number(source.effects.cash ?? 0))}
                onClick={() => act({ type: "apply-effects", effects: source.effects, note: `Acquired data via ${source.name}` })}
              >
                Acquire
              </TextButton>
            </div>
          </Panel>
        ))}
      </div>
      <Panel label="cleaning pipeline" className="mt-2">
        <p className="text-[11px] text-ink-muted">
          Cleaning is free but slow: every dataset pass adds quality and removes duplicates. Your research tree unlocks better passes.
        </p>
        <div className="mt-1.5 flex gap-1.5">
          <TextButton onClick={() => act({ type: "apply-effects", effects: { dataQuality: 3, dataQty: -120 }, note: "Ran dedupe pass" })}>
            Dedupe pass
          </TextButton>
          <TextButton onClick={() => act({ type: "apply-effects", effects: { dataQuality: 2, dataRisk: -4, cash: -6_000 }, note: "Manual review of flagged data" })}>
            Human review ($6k)
          </TextButton>
        </div>
      </Panel>
    </AppFrame>
  );
}

export function TrainingApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const startMinigame = useGame((state) => state.startMinigame);
  const [params, setParams] = useState(8);
  const [context, setContext] = useState(32);
  const [gaming, setGaming] = useState(false);
  if (!game) return null;
  const model = bestModel(game) ?? game.models.at(-1);
  const active = model;

  return (
    <AppFrame
      title="Training Lab"
      subtitle="Seven stages. Each one is a skill check; each score is stamped into the weights."
      actions={active ? <Badge variant={active.status === "released" ? "success" : "warning"}>{active.name} · {active.status}</Badge> : null}
    >
      <div className="grid gap-2 lg:grid-cols-[300px_1fr]">
        <Panel label="new model">
          <div className="space-y-2.5">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="label-mono">parameters</span>
                <span className="font-mono text-[11px]">{params}B</span>
              </div>
              <Slider value={params} min={1} max={120} step={1} onValueChange={(value) => setParams(typeof value === "number" ? value : (value[0] ?? 1))} />
            </div>
            <div>
              <span className="label-mono">context window</span>
              <div className="mt-1 grid grid-cols-4 gap-1">
                {[8, 32, 128, 512].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setContext(size)}
                    className={`border px-1 py-0.5 font-mono text-[10px] ${context === size ? "border-line bg-ink text-paper" : "border-line/40 bg-paper"}`}
                  >
                    {size}k
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center justify-between gap-2 text-[11px]">
              <span>
                Benchmark gaming
                <span className="block font-mono text-[9px] text-alarm">+hype now, hidden gap later</span>
              </span>
              <Switch checked={gaming} onCheckedChange={setGaming} />
            </label>
            <div className="border-t border-line/30 pt-2 font-mono text-[10px] text-ink-muted">
              <p>est. cost {money(6_000 + params * 650 + context * 0.6)}</p>
              <p>est. quality {Math.round(16 + Math.log2(params + 1) * 7.5 + (context / 128) * 3.2 + game.res.dataQuality * 0.3 + game.research.models * 3.4)}</p>
            </div>
            <TextButton
              tone="primary"
              disabled={game.models.some((entry) => entry.status === "training" && Object.keys(entry.stageScores).length < 7)}
              onClick={() => act({ type: "start-model", params, context, benchmarkGaming: gaming })}
            >
              <Beaker className="mr-1 inline size-3" /> Start pipeline
            </TextButton>
          </div>
        </Panel>

        <div className="space-y-2">
          {!active ? (
            <Empty>No model yet. Configure one on the left and start the pipeline.</Empty>
          ) : (
            <>
              <Panel label="spec sheet" aside={<span className="font-mono text-[9px]">{active.status}</span>}>
                <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                  <Metric label="quality" value={Math.round(active.quality)} tone={active.quality > 70 ? "good" : "warn"} />
                  <Metric label="benchmark" value={Math.round(active.benchmark)} />
                  <Metric label="safety" value={Math.round(active.safety)} tone={active.safety < 45 ? "bad" : "good"} />
                  <Metric label="latency" value={`${active.latency}ms`} />
                  <Metric label="params" value={`${active.params}B`} />
                  <Metric label="context" value={`${active.context}k`} />
                  <Metric label="$/1M tok" value={`$${active.costPerMTok.toFixed(3)}`} />
                  <Metric label="training" value={`${Math.round(active.progress * 100)}%`} />
                </div>
                {active.status === "released" && (
                  <div className="mt-2 border border-line/30 bg-paper px-2 py-1.5 font-mono text-[10px] text-ink-muted">
                    <p>personality: {active.hidden.personality} · quirk: {active.hidden.quirk}</p>
                    <p>hallucination {active.hidden.hallucination}% · bias {active.hidden.bias}% {active.benchmarkGaming ? "· benchmark gap flagged" : ""}</p>
                  </div>
                )}
              </Panel>

              <div className="space-y-1">
                {STAGES.map((stage) => {
                  const score = active.stageScores[stage.id];
                  const done = score !== undefined;
                  return (
                    <div key={stage.id} className="flex flex-wrap items-center gap-2 border border-line/30 bg-paper px-2 py-1.5">
                      <span className="w-20 font-display text-xs font-semibold">{stage.label}</span>
                      <span className="min-w-0 flex-1 text-[10px] text-ink-muted">{stage.blurb}</span>
                      {done ? (
                        <Badge variant={score >= 82 ? "success" : score >= 65 ? "info" : "warning"}>{Math.round(score)}</Badge>
                      ) : active.status === "training" ? (
                        <div className="flex gap-1">
                          <TextButton
                            tone="primary"
                            onClick={() =>
                              startMinigame({
                                id: STAGE_MINIGAME[stage.id],
                                purpose: `${stage.label} · ${active.name}`,
                                stage: stage.id,
                                modelId: active.id,
                                returnTo: "training",
                              })
                            }
                          >
                            <Play className="mr-1 inline size-3" /> Run
                          </TextButton>
                          <TextButton
                            tone="quiet"
                            onClick={() =>
                              act({ type: "stage-result", modelId: active.id, stage: stage.id, score: 70, skipped: true })
                            }
                          >
                            Skip
                          </TextButton>
                        </div>
                      ) : (
                        <span className="font-mono text-[9px] text-ink-muted">—</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {active.status === "ready" && (
                <Panel label="release">
                  <p className="text-[11px] text-ink-muted">
                    Releasing publishes the spec, wakes the feed and starts paying inference bills. Open weights add hype, remove API revenue.
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <TextButton tone="primary" onClick={() => act({ type: "release-model", modelId: active.id })}>
                      Ship it
                    </TextButton>
                    <TextButton onClick={() => act({ type: "release-model", modelId: active.id, openWeights: true })}>
                      Ship open weights
                    </TextButton>
                  </div>
                </Panel>
              )}
            </>
          )}
        </div>
      </div>
    </AppFrame>
  );
}

export function ComputeApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const [owned, setOwned] = useState(4);
  const [rented, setRented] = useState(10);
  if (!game) return null;
  const capacity = game.res.computeOwned + game.res.computeRented;
  const need = (bestModel(game)?.params ?? 0) * 55;

  return (
    <AppFrame title="Compute" subtitle="Rented is flexible. Owned is cheaper per hour and harder to walk away from." actions={<Badge variant={capacity < need ? "error" : "success"}>{compact(capacity)} GPUh</Badge>}>
      <div className="grid gap-2 sm:grid-cols-3">
        <Metric label="owned" value={compact(game.res.computeOwned)} hint="cheap, illiquid" />
        <Metric label="rented" value={compact(game.res.computeRented)} hint="spot pricing, disappears" />
        <Metric label="energy / day" value={money(game.res.energyCost)} tone={game.res.energyCost > 40 ? "warn" : "ink"} />
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <Panel label="buy hardware">
          <div className="flex items-baseline justify-between">
            <span className="label-mono">racks</span>
            <span className="font-mono text-[11px]">{owned} × 420 GPUh</span>
          </div>
          <Slider value={owned} min={1} max={40} onValueChange={(value) => setOwned(typeof value === "number" ? value : (value[0] ?? 1))} />
          <p className="mt-1 font-mono text-[10px] text-ink-muted">cost {money(owned * 1400)} · adds {compact(owned * 420)} GPUh</p>
          <div className="mt-1.5">
            <TextButton tone="primary" disabled={game.res.cash < owned * 1400} onClick={() => act({ type: "buy-compute", gpus: owned, owned: true })}>
              Buy
            </TextButton>
          </div>
        </Panel>
        <Panel label="rent capacity">
          <div className="flex items-baseline justify-between">
            <span className="label-mono">hours</span>
            <span className="font-mono text-[11px]">{rented} × 420 GPUh</span>
          </div>
          <Slider value={rented} min={1} max={60} onValueChange={(value) => setRented(typeof value === "number" ? value : (value[0] ?? 1))} />
          <p className="mt-1 font-mono text-[10px] text-ink-muted">cost {money(rented * 22)} · adds {compact(rented * 420)} GPUh</p>
          <div className="mt-1.5">
            <TextButton tone="primary" disabled={game.res.cash < rented * 22} onClick={() => act({ type: "buy-compute", gpus: rented, owned: false })}>
              Rent
            </TextButton>
          </div>
        </Panel>
      </div>

      <Panel label="training demand" className="mt-2">
        <p className="text-[11px] text-ink-muted">
          {need > 0
            ? `The current training run needs ${compact(need)} GPUh/day. You have ${compact(capacity)}.`
            : "No training run active. Capacity is sitting there, costing rent."}
        </p>
        <div className="mt-1.5">
          <Bar value={Math.min(100, (capacity / Math.max(1, need)) * 100)} tone={capacity < need ? "alarm" : "teal"} />
        </div>
        {capacity < need && (
          <p className="mt-1 flex items-center gap-1 font-mono text-[10px] text-alarm">
            <TriangleAlert className="size-3" /> Not enough compute. Training progress will stall.
          </p>
        )}
      </Panel>
      <div className="mt-2 grid gap-1 sm:grid-cols-2">
        <div className="border border-line/30 bg-paper px-2 py-1.5 font-mono text-[10px] text-ink-muted">
          <Server className="mb-1 size-3" /> Infra research reduces inference cost per token and speeds training.
        </div>
        <div className="border border-line/30 bg-paper px-2 py-1.5 font-mono text-[10px] text-ink-muted">
          <FlaskConical className="mb-1 size-3" /> Current quality estimate {Math.round(productQuality(game))} across the product.
        </div>
      </div>
    </AppFrame>
  );
}

export { Database, num, pct, Row, Field, TECH_TREE };
