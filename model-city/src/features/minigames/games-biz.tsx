"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MinigameShell, ScoreMeter, useTimer, type MinigameProps } from "./shell";
import { cn } from "@/lib/utils";

/* 7. LAUNCH DAY --------------------------------------------------------- */

const REGIONS = ["us-east", "eu-west", "apac-south"];

export function LaunchDay({ onFinish }: MinigameProps) {
  const [capacity, setCapacity] = useState<number[]>([3, 3, 3]);
  const [wave, setWave] = useState(0);
  const [uptime, setUptime] = useState(100);
  const waveRef = useRef(0);
  const served = useRef(0);
  const demand = useRef(0);
  const [log, setLog] = useState<string[]>([]);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const uptime = demand.current > 0 ? served.current / demand.current : 0;
    onFinish(Math.round(uptime * 100));
  };
  const { left, total } = useTimer(40, finish);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const spikes = [4, 9, 6];
      waveRef.current += 1;
      const waveNumber = waveRef.current;
      const traffic = spikes.map(() => 2 + Math.floor(Math.random() * 5));
      const regionalCapacity = waveNumber > 3 ? capacity.map((cap) => cap + 2) : capacity;
      let dayServed = 0;
      let dayDemand = 0;
      traffic.forEach((demandValue, index) => {
        dayDemand += demandValue;
        dayServed += Math.min(demandValue, regionalCapacity[index] ?? 0);
      });
      served.current += dayServed;
      demand.current += dayDemand;
      setLog((entries) => [`wave ${waveNumber}: ${dayServed}/${dayDemand} served`, ...entries].slice(0, 4));
      setWave(waveNumber);
      setUptime(demand.current > 0 ? Math.round((served.current / demand.current) * 100) : 100);
      if (waveNumber >= 8) finish();
    }, 3200);
    return () => window.clearInterval(interval);
  }, [capacity]);

  const shift = (index: number, delta: number) => {
    setCapacity((current) => {
      const next = [...current];
      const value = (next[index] ?? 0) + delta;
      const sum = next.reduce((totalValue, entry) => totalValue + entry, 0) - (next[index] ?? 0);
      if (value < 0 || value > 9 || sum + value > 9) return current;
      next[index] = value;
      return next;
    });
  };

  return (
    <MinigameShell title="Launch day" instruction="Traffic spikes every three seconds. 9 points of capacity, 3 regions, no perfect answer." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`wave ${Math.min(wave, 8)}/8 · uptime ${uptime}%`} value={uptime} />
        <div className="grid gap-1.5 sm:grid-cols-3">
          {REGIONS.map((region, index) => (
            <div key={region} className="border-2 border-line bg-paper p-2">
              <p className="label-mono">{region}</p>
              <div className="mt-1 flex items-center justify-between">
                <button type="button" onClick={() => shift(index, -1)} className="border border-line px-2">−</button>
                <span className="font-mono text-lg">{capacity[index]}</span>
                <button type="button" onClick={() => shift(index, 1)} className="border border-line px-2">+</button>
              </div>
              <div className="mt-1 flex gap-0.5">
                {Array.from({ length: 9 }).map((_, cell) => (
                  <span key={cell} className={cn("h-1.5 flex-1", cell < (capacity[index] ?? 0) ? "bg-teal" : "bg-line/20")} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border border-line/30 bg-ink p-2 font-mono text-[10px] text-paper">
          <p className="mb-1 text-paper/60">status log</p>
          {log.length === 0 ? <p>waiting for traffic...</p> : log.map((entry, index) => <p key={`${entry}-${index}`}>{entry}</p>)}
        </div>
      </div>
    </MinigameShell>
  );
}

/* 8. DEBUG SPRINT ------------------------------------------------------- */

const SNIPPETS = [
  {
    title: "Inference cache",
    lines: ["const cache = new Map();", "const key = prompt;", "cache.set(key, response);", "return cache.get(prompt);"],
    bug: 1,
    why: "The cache key ignores the model and temperature, so every variant shares one answer.",
  },
  {
    title: "Token budget",
    lines: ["let total = 0;", "for (const msg of messages) {", "  total += msg.tokens;", "}", "if (total > limit) return truncate(messages);"],
    bug: 0,
    why: "The counter starts at zero while the system prompt already consumed the budget.",
  },
  {
    title: "Usage billing",
    lines: ["const cost = tokens * price;", "if (plan.id === 'free') cost = 0;", "await charge(user, cost);", "metrics.add('cost', cost);"],
    bug: 2,
    why: "Free plans still call charge() with zero, which is a support ticket waiting to happen.",
  },
];

export function DebugSprint({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const score = useRef(0);
  const finished = useRef(false);
  const [found, setFound] = useState(0);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(Math.round((score.current / SNIPPETS.length) * 100));
  };
  const { left, total } = useTimer(40, finish);
  const snippet = SNIPPETS[index];

  const choose = (line: number) => {
    if (picked !== null || !snippet || finished.current) return;
    setPicked(line);
    if (line === snippet.bug) score.current += 1;
    setFound(score.current);
    window.setTimeout(() => {
      setPicked(null);
      if (index + 1 >= SNIPPETS.length) finish();
      else setIndex((value) => value + 1);
    }, 900);
  };

  return (
    <MinigameShell title="Debug sprint" instruction="Click the line that causes the bug. Three snippets, forty seconds." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`${found} / ${SNIPPETS.length} found`} value={(found / SNIPPETS.length) * 100} />
        {snippet && (
          <div className="animate-rise border-2 border-line bg-ink p-2 font-mono text-[11px] text-paper">
            <p className="mb-1 text-paper/60">{snippet.title}.ts</p>
            {snippet.lines.map((line, lineIndex) => (
              <button
                key={line}
                type="button"
                onClick={() => choose(lineIndex)}
                className={cn(
                  "block w-full px-1 py-0.5 text-left",
                  picked !== null && lineIndex === snippet.bug && "bg-acid text-ink",
                  picked === lineIndex && lineIndex !== snippet.bug && "bg-alarm text-white",
                  picked === null && "hover:bg-paper/10",
                )}
              >
                <span className="mr-2 inline-block w-4 text-right text-paper/40">{lineIndex + 1}</span>
                {line}
              </button>
            ))}
          </div>
        )}
        {picked !== null && <p className="border border-line/30 bg-paper px-2 py-1 font-mono text-[10px] text-ink-muted">{snippet?.why}</p>}
      </div>
    </MinigameShell>
  );
}

/* 9. HIRING MATCH ------------------------------------------------------- */

const CANDIDATES = [
  { name: "Ada Kovač", skill: 88, flaw: null, note: "Ships on Fridays and means it." },
  { name: "Bo Lindqvist", skill: 52, flaw: "No issue tracker", note: "Elegant code, invisible work." },
  { name: "Chen Hoang", skill: 74, flaw: null, note: "Calm during incidents." },
  { name: "Dara Moyo", skill: 91, flaw: "Says I told you so", note: "Strong, abrasive." },
  { name: "Emil Petrov", skill: 61, flaw: "Leaves at 6pm", note: "Correctly leaves at 6pm." },
  { name: "Faye Quiroga", skill: 79, flaw: null, note: "Writes docs nobody asked for." },
];

export function HiringMatch({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const hires = useRef(0);
  const goodHires = useRef(0);
  const finished = useRef(false);
  const [tally, setTally] = useState({ good: 0, hires: 0 });

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const precision = hires.current > 0 ? goodHires.current / hires.current : 0;
    onFinish(Math.round(precision * 78 + (hires.current > 0 ? 22 : 0)));
  };
  const { left, total } = useTimer(38, finish);
  const candidate = CANDIDATES[index];

  const decide = (hire: boolean) => {
    if (!candidate || finished.current) return;
    const good = candidate.skill >= 70 && !candidate.flaw;
    if (hire) {
      hires.current += 1;
      if (good) goodHires.current += 1;
    }
    setTally({ good: goodHires.current, hires: hires.current });
    if (index + 1 >= CANDIDATES.length) finish();
    else setIndex((value) => value + 1);
  };

  return (
    <MinigameShell title="Hiring match" instruction="The role needs skill 70+ and no obvious flaw. Hire well; a bad hire costs more than a missed one." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`${tally.good} good of ${tally.hires} hires`} value={tally.hires ? (tally.good / tally.hires) * 100 : 0} />
        {candidate && (
          <div className="animate-rise border-2 border-line bg-paper p-3">
            <p className="label-mono">candidate {index + 1} / {CANDIDATES.length}</p>
            <p className="font-display text-lg leading-none">{candidate.name}</p>
            <p className="mt-1 font-mono text-[10px]">skill {candidate.skill}</p>
            <p className="font-mono text-[10px] text-ink-muted">{candidate.note}</p>
            <p className={cn("font-mono text-[10px]", candidate.flaw ? "text-alarm" : "text-teal")}>
              {candidate.flaw ? `flaw: ${candidate.flaw}` : "no obvious red flags"}
            </p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" onClick={() => decide(false)} className="border-2 border-line bg-paper py-2 font-mono text-[11px] tracking-widest uppercase">Pass</button>
          <button type="button" onClick={() => decide(true)} className="border-2 border-line bg-acid py-2 font-mono text-[11px] tracking-widest uppercase">Hire</button>
        </div>
      </div>
    </MinigameShell>
  );
}

/* 10. PITCH DECK -------------------------------------------------------- */

const SLIDES = [
  { id: "problem", label: "Problem", correct: 1 },
  { id: "solution", label: "Solution", correct: 2 },
  { id: "traction", label: "Traction", correct: 3 },
  { id: "market", label: "Market", correct: 4 },
  { id: "ask", label: "The ask", correct: 5 },
];

const QA = [
  { q: "What is your churn?", good: "Monthly churn, cohort by cohort, with the number we are embarrassed by." },
  { q: "Why will a big lab not crush you?", good: "Distribution via a wedge they cannot price down without killing their own margin." },
  { q: "What does the money buy?", good: "18 months of runway, two senior hires, and the eval infrastructure we keep postponing." },
];

export function PitchDeck({ onFinish }: MinigameProps) {
  const [order, setOrder] = useState<string[]>(["solution", "problem", "ask", "traction", "market"]);
  const [qaIndex, setQaIndex] = useState(0);
  const [qaScore, setQaScore] = useState(0);
  const [phase, setPhase] = useState<"order" | "qa">("order");
  const finished = useRef(false);

  const finish = (finalQa: number) => {
    if (finished.current) return;
    finished.current = true;
    const correctPositions = order.reduce((sum, id, index) => {
      const slide = SLIDES.find((entry) => entry.id === id);
      return sum + (slide && slide.correct === index + 1 ? 1 : 0);
    }, 0);
    onFinish(Math.round((correctPositions / SLIDES.length) * 45 + (finalQa / QA.length) * 55));
  };
  const { left, total } = useTimer(55, () => finish(qaScore));

  const move = (index: number, direction: -1 | 1) => {
    setOrder((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const a = next[index] as string;
      const b = next[target] as string;
      next[index] = b;
      next[target] = a;
      return next;
    });
  };

  const answer = (good: boolean) => {
    const nextScore = qaScore + (good ? 1 : 0);
    setQaScore(nextScore);
    if (qaIndex + 1 >= QA.length) finish(nextScore);
    else setQaIndex(qaIndex + 1);
  };

  const question = QA[qaIndex];

  return (
    <MinigameShell title="Pitch deck" instruction="Order the deck like an investor reads it, then survive three questions." left={left} total={total}>
      {phase === "order" ? (
        <div className="space-y-2">
          <p className="label-mono">slide order</p>
          <div className="space-y-1">
            {order.map((id, index) => {
              const slide = SLIDES.find((entry) => entry.id === id);
              return (
                <div key={id} className="flex items-center gap-1.5 border border-line/30 bg-paper px-2 py-1">
                  <span className="w-4 font-mono text-[10px] text-ink-muted">{index + 1}</span>
                  <span className="flex-1 text-[11px]">{slide?.label}</span>
                  <button type="button" onClick={() => move(index, -1)} className="border border-line px-1 text-[10px]">↑</button>
                  <button type="button" onClick={() => move(index, 1)} className="border border-line px-1 text-[10px]">↓</button>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={() => setPhase("qa")} className="w-full border border-line bg-ink py-1.5 text-[11px] text-paper">
            Start the Q&amp;A
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <ScoreMeter label={`${qaScore} / ${QA.length} answered well`} value={(qaScore / QA.length) * 100} />
          {question && (
            <div className="animate-rise border-2 border-line bg-paper p-3">
              <p className="label-mono">investor question {qaIndex + 1} / {QA.length}</p>
              <p className="font-display text-sm">{question.q}</p>
              <div className="mt-2 space-y-1">
                <button type="button" onClick={() => answer(true)} className="w-full border border-line bg-acid/20 px-2 py-1.5 text-left text-[11px]">{question.good}</button>
                <button type="button" onClick={() => answer(false)} className="w-full border border-line/40 bg-paper px-2 py-1.5 text-left text-[11px]">
                  “We are pre-revenue but the market is enormous.”
                </button>
                <button type="button" onClick={() => answer(false)} className="w-full border border-line/40 bg-paper px-2 py-1.5 text-left text-[11px]">
                  “Our metrics are in the appendix.” (There is no appendix.)
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </MinigameShell>
  );
}

/* 11. KEYNOTE DEMO ------------------------------------------------------ */

const BEATS = ["Intro", "Live prompt", "Latency flex", "Tool call", "Customer quote", "Close"];
const OFF_SCRIPT = [
  "the model starts explaining its training data",
  "a refusal appears mid-sentence",
  "the spinner stays for nine seconds",
  "it invents a customer that does not exist",
  "it reads the system prompt out loud",
  "it thanks the wrong company",
];

export function KeynoteDemo({ onFinish }: MinigameProps) {
  const [beat, setBeat] = useState(0);
  const [offScript, setOffScript] = useState<number | null>(null);
  const [recovered, setRecovered] = useState(0);
  const missed = useRef(0);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(Math.max(5, 96 - missed.current * 16 - Math.max(0, 6 - beat) * 4));
  };
  const { left, total } = useTimer(38, finish);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setOffScript((current) => {
        if (current !== null) {
          missed.current += 1;
        }
        return Math.random() < 0.55 ? Math.floor(Math.random() * OFF_SCRIPT.length) : null;
      });
      setBeat((value) => {
        const next = value + 1;
        if (next >= 6) finish();
        return next;
      });
    }, 3600);
    return () => window.clearInterval(interval);
  }, []);

  const recover = () => {
    if (offScript === null) return;
    setRecovered((value) => value + 1);
    setOffScript(null);
  };

  return (
    <MinigameShell title="Keynote demo" instruction="Click RECOVER the instant the demo goes off-script. Hesitation becomes a clip." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`beat ${Math.min(beat + 1, 6)} / 6`} value={(Math.min(beat, 6) / 6) * 100} />
        <div className="grid grid-cols-3 gap-1">
          {BEATS.map((label, index) => (
            <span key={label} className={cn("border px-1 py-1 text-center font-mono text-[9px] uppercase", index <= beat ? "border-line bg-ink text-paper" : "border-line/30 text-ink-muted")}>
              {label}
            </span>
          ))}
        </div>
        <div className={cn("min-h-24 border-2 p-3", offScript !== null ? "animate-rise border-alarm bg-alarm/10" : "border-line bg-paper")}>
          {offScript !== null ? (
            <>
              <p className="label-mono text-alarm">off script</p>
              <p className="font-display text-sm">{OFF_SCRIPT[offScript]}</p>
            </>
          ) : (
            <>
              <p className="label-mono">on script</p>
              <p className="font-display text-sm">The demo is working. Nobody believes it either.</p>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={recover}
          className={cn("w-full border-2 py-2 font-mono text-[11px] tracking-[0.2em] uppercase", offScript !== null ? "border-alarm bg-alarm text-white" : "border-line bg-paper text-ink-muted")}
        >
          Recover · {recovered} saves
        </button>
      </div>
    </MinigameShell>
  );
}

/* 12. PR CRISIS --------------------------------------------------------- */

const CRISES = [
  {
    text: "A screenshot shows your model giving a confidently wrong answer about a medical dose. It has 90k likes.",
    best: "empathy",
    bestLine: "We were wrong, here is the fix, and here is how we will catch it next time.",
  },
  {
    text: "A rival claims your benchmark numbers were tuned on the test set. They have a chart.",
    best: "technical",
    bestLine: "Here is our eval methodology, the held-out set and the numbers we are less proud of.",
  },
  {
    text: "Your pricing change doubled bills for power users. The forum is on fire.",
    best: "accountable",
    bestLine: "We got this wrong. Existing users keep their old price, and we are capping overages.",
  },
];

const TONES = [
  { id: "empathy", label: "Warm and accountable" },
  { id: "technical", label: "Technical and transparent" },
  { id: "defiant", label: "Confident, slightly defensive" },
];

export function PRCrisis({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const [tone, setTone] = useState<string | null>(null);
  const [line, setLine] = useState<number | null>(null);
  const score = useRef(0);
  const finished = useRef(false);
  const [handled, setHandled] = useState(0);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(Math.round((score.current / CRISES.length) * 100));
  };
  const { left, total } = useTimer(36, finish);
  const crisis = CRISES[index];

  const send = () => {
    if (!crisis || tone === null || line === null) return;
    if (tone === crisis.best && line === 0) score.current += 1;
    else if (tone === crisis.best) score.current += 0.5;
    setHandled(score.current);
    if (index + 1 >= CRISES.length) finish();
    else {
      setIndex(index + 1);
      setTone(null);
      setLine(null);
    }
  };

  const options = useMemo(
    () => [
      crisis?.bestLine ?? "",
      "We hear you and we are taking this seriously. More details soon.",
      "This is an industry-wide issue and we are disappointed by the framing.",
    ],
    [crisis],
  );

  return (
    <MinigameShell title="PR crisis" instruction="Pick a tone, pick the wording, send before the thread gets a name." left={left} total={total} footer={
      <button type="button" onClick={send} disabled={tone === null || line === null} className="w-full border border-line bg-signal py-1.5 text-xs font-semibold text-white disabled:opacity-40">
        Publish response
      </button>
    }>
      <div className="space-y-2">
        <ScoreMeter label={`${handled} / ${CRISES.length} handled`} value={(handled / CRISES.length) * 100} />
        {crisis && (
          <div className="border-2 border-line bg-paper p-2.5">
            <p className="label-mono">crisis {index + 1} / {CRISES.length}</p>
            <p className="mt-0.5 text-[11px]">{crisis.text}</p>
          </div>
        )}
        <div>
          <p className="label-mono">tone</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {TONES.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => setTone(entry.id)}
                className={cn("border px-1.5 py-0.5 font-mono text-[9px] uppercase", tone === entry.id ? "border-line bg-ink text-paper" : "border-line/40 bg-paper")}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="label-mono">wording</p>
          <div className="mt-1 space-y-1">
            {options.map((option, optionIndex) => (
              <button
                key={option}
                type="button"
                onClick={() => setLine(optionIndex)}
                className={cn("w-full border px-2 py-1.5 text-left text-[11px]", line === optionIndex ? "border-line bg-acid/20" : "border-line/40 bg-paper")}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </MinigameShell>
  );
}
