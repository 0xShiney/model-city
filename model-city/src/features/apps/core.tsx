"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Download,
  Mail,
  RotateCcw,
  Upload,
  Volume2,
} from "lucide-react";
import { useGame } from "@/store/game";
import { useT } from "@/lib/i18n";
import { ACHIEVEMENTS, productVerdict } from "@/lib/sim/content";
import { activeModel, burnRate, grossMargin, productQuality, runwayMonths } from "@/lib/sim/economy";
import { founderPercent, totalShares, valuation } from "@/lib/sim/finance";
import { compact, money, num, pct, runwayLabel } from "@/lib/format";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { Sparkline } from "@/components/motion/kit";
import { AppFrame, Bar, Empty, Field, Metric, Panel, Row, TextButton } from "./ui";
import type { AppId } from "./meta";

export function DashboardApp() {
  const game = useGame((state) => state.game);
  const openApp = useGame((state) => state.openApp);
  const t = useT();
  if (!game) return null;
  const runway = runwayMonths(game);
  const quality = productQuality(game);
  const model = activeModel(game);
  const unread = game.mail.filter((mail) => !mail.read).length;
  const todos: { label: string; app: AppId; detail: string }[] = [];
  if (game.events.pending) todos.push({ label: "A decision is pending", app: "dashboard", detail: "Open the decision card" });
  if (!model) todos.push({ label: "No model in production", app: "training", detail: "Start a training run" });
  if (game.website.designScore < 55) todos.push({ label: "Website is a brochure", app: "web", detail: "Enable more blocks" });
  if (runway < 6) todos.push({ label: "Runway is short", app: "investors", detail: "Raise or cut burn" });
  if (game.team.length === 0) todos.push({ label: "You are a company of one", app: "team", detail: "Hire someone" });
  if (unread > 0) todos.push({ label: `${unread} unread messages`, app: "mail", detail: "Someone wants an answer" });

  return (
    <AppFrame
      title={t("app.dashboard")}
      subtitle={`${game.company.tagline} · ${game.company.name} · ${productVerdict(game)}`}
      actions={
        <Badge variant={runway < 2 ? "error" : runway < 6 ? "warning" : "success"}>
          runway {runwayLabel(runway)}
        </Badge>
      }
    >
      <div className="space-y-3">
        {runway < 2 && (
          <Alert variant="error">
            <AlertTitle>{t("dash.runwayAlert")}</AlertTitle>
            <AlertDescription>Burn is {money(burnRate(game))}/day. Cash is {money(game.res.cash)}.</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-5">
          <Metric label="cash" value={money(game.res.cash)} tone={game.res.cash < 0 ? "bad" : "ink"} hint={`${money(burnRate(game))}/day burn`} />
          <Metric label="mrr" value={money(game.kpis.mrr)} hint={`margin ${grossMargin(game) < 0 ? "negative" : pct(grossMargin(game), 0)}`} tone={game.kpis.mrr > 0 ? "good" : "muted"} />
          <Metric label="users" value={compact(game.kpis.users)} hint={`${compact(game.kpis.paidUsers)} paid`} />
          <Metric label="quality" value={Math.round(quality)} hint={model ? model.name : "no model"} tone={quality > 70 ? "good" : "warn"} />
          <Metric label="valuation" value={money(valuation(game))} hint={`${pct(founderPercent(game.funding.capTable) / 100, 0)} founder`} />
        </div>

        <div className="grid gap-2 lg:grid-cols-3">
          <Panel label={t("dash.kpis")} className="lg:col-span-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="label-mono">mrr history</p>
                <Sparkline points={game.history.map((point) => point.mrr)} tone="teal" />
              </div>
              <div>
                <p className="label-mono">users history</p>
                <Sparkline points={game.history.map((point) => point.users)} tone="signal" />
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              <MeterRow label="hype" value={game.res.hype} tone="signal" />
              <MeterRow label="morale" value={game.res.morale} tone="acid" />
              <MeterRow label="trust" value={game.res.userTrust} tone="teal" />
              <MeterRow label="safety" value={game.res.safety} tone="teal" />
              <MeterRow label="dev rep" value={game.res.devRep} tone="ink" />
              <MeterRow label="investor" value={game.res.investorConfidence} tone="ink" />
              <MeterRow label="churn" value={game.kpis.churn * 100} tone="alarm" max={30} />
              <MeterRow label="tech debt" value={game.res.techDebt} tone="alarm" />
            </div>
          </Panel>

          <div className="space-y-2">
            <Panel label={t("dash.todo")}>
              {todos.length === 0 ? (
                <Empty>Nothing waiting. Suspicious.</Empty>
              ) : (
                <ul className="space-y-1">
                  {todos.slice(0, 5).map((todo) => (
                    <li key={todo.label}>
                      <button
                        type="button"
                        onClick={() => openApp(todo.app)}
                        className="flex w-full items-center justify-between gap-2 border border-line/30 bg-paper px-2 py-1 text-left hover:bg-accent"
                      >
                        <span>
                          <span className="block text-[11px] font-semibold">{todo.label}</span>
                          <span className="block font-mono text-[9px] text-ink-muted">{todo.detail}</span>
                        </span>
                        <ArrowRight className="size-3 shrink-0" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel label="this week">
              <div className="space-y-1 font-mono text-[10px] text-ink-muted">
                <p>day {game.day} · week {Math.floor(game.day / 7)} · quarter {game.quarter}</p>
                <p>stage {game.funding.stage} · {game.funding.rounds} rounds</p>
                <p>models {game.stats.modelsShipped} shipped · {game.models.length} built</p>
                <p>compute {compact(game.res.computeOwned)} owned · {compact(game.res.computeRented)} rented</p>
              </div>
            </Panel>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-2">
          <Panel label="founder diary">
            <ul className="scroll-thin max-h-44 space-y-1 overflow-y-auto font-mono text-[10px] text-ink-muted">
              {game.diary.slice(0, 8).map((entry, index) => (
                <li key={`${entry}-${index}`} className="border-l border-line/30 pl-2">{entry}</li>
              ))}
            </ul>
          </Panel>
          <Panel label="recent events">
            {game.events.log.length === 0 ? (
              <Empty>Quiet. Enjoy it.</Empty>
            ) : (
              <ul className="scroll-thin max-h-44 space-y-1 overflow-y-auto">
                {game.events.log.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="border-b border-line/20 pb-1 last:border-0">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold">{entry.title}</span>
                      <span className="font-mono text-[9px] text-ink-muted">d{entry.day}</span>
                    </span>
                    <span className="block font-mono text-[9px] text-ink-muted">{entry.body}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

function MeterRow({ label, value, tone = "teal", max = 100 }: { label: string; value: number; tone?: "teal" | "signal" | "acid" | "alarm" | "ink"; max?: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="label-mono">{label}</span>
        <span className="font-mono text-[10px] tabular">{Math.round(value)}</span>
      </div>
      <Bar value={value} max={max} tone={tone} />
    </div>
  );
}

export function MailApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const [selected, setSelected] = useState<string | null>(null);
  if (!game) return null;
  const mail = game.mail.find((entry) => entry.id === selected) ?? game.mail[0];

  return (
    <AppFrame title="Mail" subtitle="Customers, investors, lawyers and one person impersonating you." actions={<Badge variant="outline">{game.mail.filter((m) => !m.read).length} unread</Badge>}>
      <div className="grid gap-2 sm:grid-cols-[240px_1fr]">
        <Panel label="inbox" className="max-h-[440px] overflow-hidden">
          <ul className="scroll-thin max-h-[400px] space-y-0.5 overflow-y-auto">
            {game.mail.length === 0 && <Empty>No mail. Peaceful.</Empty>}
            {game.mail.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelected(entry.id);
                    act({ type: "read-mail", id: entry.id });
                  }}
                  className={`w-full border px-2 py-1.5 text-left ${mail?.id === entry.id ? "border-line bg-ink text-paper" : "border-line/25 bg-paper"}`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] font-semibold">{entry.from}</span>
                    {!entry.read && <span className="size-1.5 shrink-0 rounded-full bg-signal" />}
                  </span>
                  <span className={`block truncate text-[10px] ${mail?.id === entry.id ? "text-paper/70" : "text-ink-muted"}`}>{entry.subject}</span>
                </button>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel label={mail ? `d${mail.day} · ${mail.kind}` : "message"}>
          {mail ? (
            <div>
              <h3 className="font-display text-base">{mail.subject}</h3>
              <p className="font-mono text-[10px] text-ink-muted">from {mail.from}</p>
              <p className="mt-2 text-sm whitespace-pre-wrap">{mail.body}</p>
              {mail.action && (
                <div className="mt-3 flex gap-1.5">
                  <TextButton tone="primary" onClick={() => act({ type: "mail-action", id: mail.id })}>
                    {mail.action.label}
                  </TextButton>
                  <TextButton tone="quiet">Archive</TextButton>
                </div>
              )}
            </div>
          ) : (
            <Empty>Select a message.</Empty>
          )}
        </Panel>
      </div>
    </AppFrame>
  );
}

const GLOSSARY: [string, string][] = [
  ["Runway", "Cash divided by daily burn, in months. Under two, investors can smell it."],
  ["Dilution", "The share of the company you no longer own after a round. Permanent."],
  ["Liquidation preference", "Who gets paid first in a sale. 1.5x means they take 1.5x their money before you see anything."],
  ["MRR", "Monthly recurring revenue. The only number that survives a bad quarter."],
  ["Churn", "Users who leave each month. Compounding, like everything else."],
  ["Benchmark gaming", "Tuning on the public test set. Buys hype, hides a gap, ends in a screenshot."],
  ["Gross margin", "Revenue minus the cost of serving it. AI companies discover this late."],
  ["Cap table", "The spreadsheet that decides who controls the ending."],
];

export function SettingsApp() {
  const game = useGame((state) => state.game);
  const locale = useGame((state) => state.locale);
  const sound = useGame((state) => state.sound);
  const reducedMotion = useGame((state) => state.reducedMotion);
  const setLocale = useGame((state) => state.setLocale);
  const setSound = useGame((state) => state.setSound);
  const setReducedMotion = useGame((state) => state.setReducedMotion);
  const exportSave = useGame((state) => state.exportSave);
  const importSave = useGame((state) => state.importSave);
  const reset = useGame((state) => state.reset);
  const t = useT();
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    typeof window !== "undefined" && window.localStorage.getItem("model-city-theme") === "dark" ? "dark" : "light",
  );
  if (!game) return null;

  const doExport = () => {
    const json = exportSave();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `model-city-${game.seed}-day${game.day}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Save exported. Paranoia pays.");
  };

  return (
    <AppFrame title={t("app.settings")} subtitle="Language, saves, achievements and the paperwork of a fictional company.">
      <Tabs defaultValue="general">
        <TabsList variant="underline">
          <TabsTab value="general">General</TabsTab>
          <TabsTab value="save">Save</TabsTab>
          <TabsTab value="achievements">Achievements</TabsTab>
          <TabsTab value="glossary">Glossary</TabsTab>
          <TabsTab value="archive">Archive</TabsTab>
        </TabsList>

        <TabsPanel value="general" className="pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Panel label={t("settings.language")}>
              <div className="flex gap-1">
                <TextButton tone={locale === "en" ? "primary" : "default"} onClick={() => setLocale("en")}>English</TextButton>
                <TextButton tone={locale === "id" ? "primary" : "default"} onClick={() => setLocale("id")}>Indonesia</TextButton>
              </div>
              <p className="mt-2 font-mono text-[9px] text-ink-muted">Generated narrative stays in English; UI chrome is translated.</p>
            </Panel>
            <Panel label="Audio & motion">
              <div className="space-y-2">
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1.5"><Volume2 className="size-3.5" /> {t("settings.sound")}</span>
                  <Switch checked={sound} onCheckedChange={setSound} />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>{t("settings.motion")}</span>
                  <Switch checked={reducedMotion} onCheckedChange={setReducedMotion} />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Dark mode</span>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      const next = checked ? "dark" : "light";
                      setTheme(next);
                      document.documentElement.classList.toggle("dark", checked);
                      window.localStorage.setItem("model-city-theme", next);
                    }}
                  />
                </label>
              </div>
            </Panel>
            <Panel label="Tutorials">
              <p className="text-[11px] text-ink-muted">Tours run once per app. Replay the intro any time.</p>
              <div className="mt-2 flex gap-1">
                <TextButton onClick={() => useGame.getState().openSpotlight("welcome")}>{t("settings.replay")}</TextButton>
              </div>
            </Panel>
            <Panel label="Keyboard">
              <ul className="space-y-0.5 font-mono text-[10px] text-ink-muted">
                <li>⌘K / Ctrl+K — command palette</li>
                <li>Space — pause / resume</li>
                <li>1 / 2 / 4 — speed</li>
                <li>← → — spotlight steps</li>
              </ul>
            </Panel>
          </div>
        </TabsPanel>

        <TabsPanel value="save" className="pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Panel label="Current save">
              <p className="font-mono text-[10px] text-ink-muted">seed {game.seed} · day {game.day} · version {game.version}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <TextButton tone="primary" onClick={doExport}><Download className="mr-1 inline size-3" />{t("settings.export")}</TextButton>
                <TextButton tone="danger" onClick={reset}>{t("settings.newGame")}</TextButton>
              </div>
              {message && <p className="mt-2 font-mono text-[10px] text-teal">{message}</p>}
            </Panel>
            <Panel label={t("settings.import")}>
              <textarea
                value={importText}
                onChange={(event) => setImportText(event.target.value)}
                rows={5}
                className="w-full border border-line bg-paper p-1.5 font-mono text-[10px]"
                placeholder="Paste a Model City save JSON"
              />
              <div className="mt-1.5 flex items-center gap-1.5">
                <TextButton
                  onClick={() => {
                    const result = importSave(importText);
                    setMessage(result.ok ? "Save imported." : result.error ?? "Import failed.");
                  }}
                >
                  <Upload className="mr-1 inline size-3" /> Import
                </TextButton>
                {message && <span className="font-mono text-[10px] text-ink-muted">{message}</span>}
              </div>
            </Panel>
          </div>
        </TabsPanel>

        <TabsPanel value="achievements" className="pt-3">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="success">{game.achievements.length} / {ACHIEVEMENTS.length}</Badge>
            <span className="font-mono text-[10px] text-ink-muted">Hidden achievements do not show their condition.</span>
          </div>
          <div className="grid gap-1 sm:grid-cols-2">
            {ACHIEVEMENTS.map((achievement) => {
              const unlocked = game.achievements.includes(achievement.id);
              return (
                <div key={achievement.id} className={`border px-2 py-1.5 ${unlocked ? "border-teal bg-acid/20" : "border-line/30 bg-paper"}`}>
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold">
                    {unlocked ? <Check className="size-3 text-teal" /> : <span className="size-3 border border-line/40" />}
                    {unlocked || !achievement.hidden ? achievement.name : "???"}
                  </span>
                  <span className="block font-mono text-[9px] text-ink-muted">
                    {unlocked || !achievement.hidden ? achievement.desc : "Hidden"}
                  </span>
                </div>
              );
            })}
          </div>
        </TabsPanel>

        <TabsPanel value="glossary" className="pt-3">
          <div className="space-y-1">
            {GLOSSARY.map(([term, definition]) => (
              <div key={term} className="border border-line/30 bg-paper px-2 py-1.5">
                <span className="font-display text-xs font-semibold">{term}</span>
                <span className="block text-[11px] text-ink-muted">{definition}</span>
              </div>
            ))}
          </div>
        </TabsPanel>

        <TabsPanel value="archive" className="pt-3">
          <div className="grid gap-2 sm:grid-cols-2">
            <Panel label="Founder diary">
              <ul className="scroll-thin max-h-64 space-y-1 overflow-y-auto font-mono text-[10px] text-ink-muted">
                {game.diary.map((entry, index) => (
                  <li key={`${entry}-${index}`} className="border-l border-line/30 pl-2">{entry}</li>
                ))}
              </ul>
            </Panel>
            <Panel label="Run summary">
              <div className="grid grid-cols-2 gap-1">
                <Metric label="day" value={game.day} />
                <Metric label="users" value={num(game.kpis.users)} />
                <Metric label="mrr" value={money(game.kpis.mrr)} />
                <Metric label="raised" value={money(game.stats.cashRaised)} />
                <Metric label="models" value={game.stats.modelsShipped} />
                <Metric label="equity" value={pct(founderPercent(game.funding.capTable) / 100, 0)} />
              </div>
              <p className="mt-2 font-mono text-[10px] text-ink-muted">
                {founderPercent(game.funding.capTable).toFixed(1)}% founder · {totalShares(game.funding.capTable).toLocaleString("en-US")} shares
              </p>
              <p className="mt-1 font-mono text-[10px] text-ink-muted">{game.ending ? `Ending: ${game.ending}` : "Still running."}</p>
            </Panel>
          </div>
        </TabsPanel>
      </Tabs>
    </AppFrame>
  );
}

export { Mail, RotateCcw, Field };
