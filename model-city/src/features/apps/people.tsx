"use client";

import { useState } from "react";
import { Armchair, Briefcase, Coffee, Cpu, Sun, Users } from "lucide-react";
import { useGame } from "@/store/game";
import { generateCandidates } from "@/lib/sim/engine";
import { INVESTOR_PERSONAS } from "@/lib/sim/world";
import { ceoControl, founderPercent, investorPercent, previewTermSheet, totalShares, valuation } from "@/lib/sim/finance";
import { runwayMonths } from "@/lib/sim/economy";
import { compact, money, num, pct } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppFrame, Bar, Empty, Metric, Panel, Row, TextButton } from "./ui";

const ROLE_LABEL: Record<string, string> = {
  ml: "ML researcher",
  infra: "Infra engineer",
  design: "Designer",
  growth: "Growth",
  safety: "Safety",
  ops: "Ops",
};

export function TeamApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const startMinigame = useGame((state) => state.startMinigame);
  const [refresh, setRefresh] = useState(0);
  if (!game) return null;
  const candidates = generateCandidates({ ...game, day: game.day + refresh });
  const payroll = game.team.reduce((sum, person) => sum + person.salary, 0);

  return (
    <AppFrame
      title="Team"
      subtitle="Hire for skill, tolerate flaws, watch morale. They are simulated people with opinions."
      actions={
        <>
          <Badge variant="outline">{game.team.length} people</Badge>
          <TextButton onClick={() => startMinigame({ id: "hiring-match", purpose: "Hiring sprint", returnTo: "team" })}>
            <Users className="mr-1 inline size-3" /> Hiring sprint
          </TextButton>
        </>
      }
    >
      <div className="grid gap-2 lg:grid-cols-[1fr_1fr]">
        <Panel label="open candidates" aside={<TextButton tone="quiet" onClick={() => setRefresh((value) => value + 1)}>refresh</TextButton>}>
          <div className="space-y-1">
            {candidates.map((candidate) => (
              <div key={candidate.id} className="border border-line/30 bg-paper px-2 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span>
                    <span className="text-[11px] font-semibold">{candidate.name}</span>
                    <span className="ml-1 font-mono text-[9px] text-ink-muted">{ROLE_LABEL[candidate.role]}</span>
                  </span>
                  <span className="font-mono text-[10px]">${candidate.salary}/mo</span>
                </div>
                <p className="font-mono text-[9px] text-ink-muted">skill {candidate.skill} · {candidate.trait}</p>
                {candidate.flaw && <p className="font-mono text-[9px] text-alarm">flaw: {candidate.flaw}</p>}
                <div className="mt-1">
                  <TextButton
                    tone="primary"
                    disabled={game.res.cash < candidate.salary * 6}
                    onClick={() => act({ type: "hire", candidateId: candidate.id })}
                  >
                    Hire
                  </TextButton>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-2">
          <Panel label="roster" aside={<span className="font-mono text-[9px]">{money(payroll)}/mo payroll</span>}>
            {game.team.length === 0 ? (
              <Empty>Just you, a laptop and an idea. For now.</Empty>
            ) : (
              <div className="space-y-1">
                {game.team.map((person) => (
                  <div key={person.id} className="border border-line/30 bg-paper px-2 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold">{person.name}</span>
                      <span className="font-mono text-[9px] text-ink-muted">{ROLE_LABEL[person.role]}</span>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <span className="font-mono text-[9px]">skill {person.skill}</span>
                      <div className="min-w-8 flex-1"><Bar value={person.morale} tone={person.morale < 40 ? "alarm" : "teal"} /></div>
                    </div>
                    <div className="mt-1 flex gap-1">
                      <TextButton onClick={() => act({ type: "train-employee", employeeId: person.id })}>Train ($6k)</TextButton>
                      <TextButton tone="danger" onClick={() => act({ type: "fire", employeeId: person.id })}>Let go</TextButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
          <Panel label="morale">
            <Bar value={game.res.morale} tone={game.res.morale < 40 ? "alarm" : "acid"} />
            <p className="mt-1 font-mono text-[10px] text-ink-muted">
              {game.res.morale < 35 ? "People are updating their CVs during standup." : game.res.morale > 70 ? "Actually fine. Rare." : "Stable, in the way a Jenga tower is stable."}
            </p>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

export function InvestorsApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  if (!game) return null;
  const value = valuation(game);
  const control = ceoControl(game);
  const stageOk = game.funding.stage === "unicorn" || game.funding.stage === "frontier";

  return (
    <AppFrame
      title="Investors"
      subtitle="Term sheets are legal documents with a compliment attached."
      actions={<Badge variant={control < 30 ? "error" : "outline"}>control {Math.round(control)}%</Badge>}
    >
      <div className="grid gap-2 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          <Panel label="ask for a term sheet">
            <div className="grid gap-1 sm:grid-cols-2">
              {INVESTOR_PERSONAS.map((persona) => {
                const sheet = game.funding.termSheets.find((entry) => entry.investorId === persona.id);
                return (
                  <div key={persona.id} className="border border-line/30 bg-paper px-2 py-1.5">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold">{persona.name}</span>
                      <span className="font-mono text-[9px] text-ink-muted">{persona.persona}</span>
                    </span>
                    <p className="font-mono text-[9px] text-ink-muted">{persona.thesis}</p>
                    <div className="mt-1">
                      {sheet ? (
                        <Badge variant="success">sheet on the table</Badge>
                      ) : (
                        <TextButton onClick={() => act({ type: "raise-round", investorId: persona.id })}>Ask for terms</TextButton>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {game.funding.termSheets.length > 0 && (
            <Panel label="term sheets">
              <div className="space-y-1.5">
                {game.funding.termSheets.map((sheet) => {
                  const preview = previewTermSheet(game, sheet);
                  return (
                    <div key={sheet.investorId} className="border-2 border-line bg-paper p-2">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold">{sheet.investorName}</span>
                        <span className="font-mono text-[10px] text-signal">{money(sheet.amount)}</span>
                      </span>
                      <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 font-mono text-[9px] text-ink-muted">
                        <span>pre-money {money(sheet.preMoney)}</span>
                        <span>dilution {pct(preview.dilution / 100, 1)}</span>
                        <span>liq pref {sheet.liquidationPreference}x</span>
                        <span>board seat {sheet.boardSeat ? "yes" : "no"}</span>
                        <span>anti-dilution {sheet.antiDilution}</span>
                        <span>founder after {pct(preview.founderAfter / 100, 1)}</span>
                      </div>
                      <div className="mt-1.5 flex gap-1">
                        <TextButton tone="primary" onClick={() => act({ type: "sign-term-sheet", sheet })}>Sign</TextButton>
                        <TextButton tone="quiet" onClick={() => act({ type: "reject-term-sheet", investorId: sheet.investorId })}>Pass</TextButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          )}

          <Panel label="cap table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>holder</TableHead>
                  <TableHead>type</TableHead>
                  <TableHead>shares</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>invested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {game.funding.capTable.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="max-w-[160px] truncate text-[11px]">{row.name}</TableCell>
                    <TableCell className="font-mono text-[9px] text-ink-muted">{row.kind}</TableCell>
                    <TableCell className="font-mono text-[10px] tabular">{compact(row.shares)}</TableCell>
                    <TableCell className="font-mono text-[10px] tabular">{((row.shares / totalShares(game.funding.capTable)) * 100).toFixed(1)}%</TableCell>
                    <TableCell className="font-mono text-[10px]">{row.invested > 0 ? money(row.invested) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Panel>
        </div>

        <div className="space-y-2">
          <Panel label="valuation">
            <p className="font-display text-2xl leading-none">{money(value)}</p>
            <p className="font-mono text-[10px] text-ink-muted">{game.funding.stage} · {game.funding.rounds} rounds · {money(game.stats.cashRaised)} raised</p>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <Metric label="founder" value={pct(founderPercent(game.funding.capTable) / 100, 1)} />
              <Metric label="investors" value={pct(investorPercent(game.funding.capTable) / 100, 1)} />
              <Metric label="runway" value={runwayMonths(game) > 60 ? "∞" : `${runwayMonths(game).toFixed(1)}mo`} tone={runwayMonths(game) < 3 ? "bad" : "ink"} />
              <Metric label="board" value={Math.round(game.funding.boardConfidence)} />
            </div>
            <div className="mt-2">
              <span className="label-mono">founder control</span>
              <Bar value={control} tone={control < 25 ? "alarm" : "teal"} />
            </div>
          </Panel>

          <Panel label="board & endings">
            <p className="text-[11px] text-ink-muted">
              {control < 25 ? "The board is drafting a statement about your transition." : "The board is supportive, for now."}
            </p>
            <div className="mt-2 grid gap-1">
              <TextButton
                tone="primary"
                disabled={!stageOk}
                onClick={() => act({ type: "choose-ending", ending: "ipo" })}
              >
                Take the company public
              </TextButton>
              <TextButton
                disabled={value < 40_000_000}
                onClick={() => act({ type: "choose-ending", ending: "acquired" })}
              >
                Accept acquisition
              </TextButton>
              <TextButton
                disabled={game.kpis.mrr < 40_000}
                onClick={() => act({ type: "choose-ending", ending: "indie" })}
              >
                Stay independent &amp; profitable
              </TextButton>
            </div>
            <p className="mt-1 font-mono text-[9px] text-ink-muted">
              IPO needs unicorn stage · acquisition needs {money(40_000_000)} valuation · indie needs {money(40_000)} MRR
            </p>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}

const UPGRADES = [
  { id: "ergonomic-desk", name: "Ergonomic desks", detail: "+morale", icon: Armchair },
  { id: "quiet-room", name: "Quiet room", detail: "+dev reputation", icon: Sun },
  { id: "gpu-shrine", name: "GPU shrine", detail: "+hype, oddly", icon: Cpu },
  { id: "coffee-lab", name: "Coffee lab", detail: "+morale", icon: Coffee },
  { id: "whiteboard-wall", name: "Whiteboard wall", detail: "+safety culture", icon: Briefcase },
];

export function OfficeApp() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  if (!game) return null;
  const desks = Math.max(1, game.team.length + 1);

  return (
    <AppFrame title="Office" subtitle="Concrete, cables and a whiteboard with an arrow pointing up." actions={<Badge variant="outline">{desks} desks</Badge>}>
      <div className="grid gap-2 lg:grid-cols-[1fr_280px]">
        <Panel label="floor plan">
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: Math.max(8, desks) }).map((_, index) => {
              const person = game.team[index];
              const occupied = index < desks;
              return (
                <div
                  key={index}
                  className={`flex aspect-square flex-col items-center justify-center border text-center ${occupied ? "border-line bg-paper" : "border-dashed border-line/25 bg-surface"}`}
                >
                  {occupied ? (
                    <>
                      <span className="font-mono text-[10px]">{person ? person.name.split(" ")[0] : "you"}</span>
                      <span className="font-mono text-[8px] text-ink-muted">{person ? ROLE_LABEL[person.role] : "founder"}</span>
                      {person && <Bar value={person.morale} tone={person.morale < 40 ? "alarm" : "teal"} />}
                    </>
                  ) : (
                    <span className="font-mono text-[8px] text-ink-muted">empty</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[9px] text-ink-muted">Desks scale with headcount. Upgrades are cosmetic with small buffs.</p>
        </Panel>

        <div className="space-y-2">
          <Panel label="upgrades">
            <div className="space-y-1">
              {UPGRADES.map((upgrade) => {
                const Icon = upgrade.icon;
                const owned = game.office.upgrades.includes(upgrade.id);
                return (
                  <div key={upgrade.id} className="flex items-center gap-2 border border-line/30 bg-paper px-2 py-1">
                    <Icon className="size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold">{upgrade.name}</span>
                      <span className="block font-mono text-[9px] text-ink-muted">{upgrade.detail}</span>
                    </span>
                    <TextButton
                      tone={owned ? "quiet" : "default"}
                      disabled={owned || game.res.cash < 25_000}
                      onClick={() => act({ type: "office-upgrade", id: upgrade.id })}
                    >
                      {owned ? "built" : "$25k"}
                    </TextButton>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel label="vibe check">
            <Row>
              <span className="text-[10px]">morale</span>
              <span className="font-mono text-[10px]">{Math.round(game.res.morale)}</span>
            </Row>
            <Row>
              <span className="text-[10px]">payroll</span>
              <span className="font-mono text-[10px]">{money(game.team.reduce((sum, person) => sum + person.salary, 0))}</span>
            </Row>
            <Row>
              <span className="text-[10px]">headcount</span>
              <span className="font-mono text-[10px]">{num(game.team.length + 1)}</span>
            </Row>
          </Panel>
        </div>
      </div>
    </AppFrame>
  );
}
