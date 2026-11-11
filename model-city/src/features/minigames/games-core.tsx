"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnswerButton, MinigameShell, ScoreMeter, useTimer, type MinigameProps } from "./shell";
import { cn } from "@/lib/utils";

/* 1. DATA SORTING ------------------------------------------------------- */

const CARDS = [
  { text: "Peer-reviewed papers, already deduplicated", right: "keep" },
  { text: "Scraped forum threads with 40% duplicates", right: "clean" },
  { text: "A dataset of leaked support tickets", right: "discard" },
  { text: "Publisher archive, licence available", right: "license" },
  { text: "Synthetic instructions generated last night", right: "keep" },
  { text: "Crawl with no robots.txt respect", right: "discard" },
  { text: "Customer conversations, consented", right: "keep" },
  { text: "Text with adverts injected mid-sentence", right: "clean" },
  { text: "Someone's personal messages, clearly", right: "discard" },
  { text: "Paywalled news archive", right: "license" },
  { text: "HTML with 60% navigation boilerplate", right: "clean" },
  { text: "Public domain books", right: "keep" },
  { text: "A scrape of a competitor's docs", right: "discard" },
  { text: "Stock photo captions, licensed", right: "license" },
] as const;

const BUCKETS: { id: (typeof CARDS)[number]["right"]; label: string }[] = [
  { id: "keep", label: "Keep" },
  { id: "clean", label: "Clean" },
  { id: "discard", label: "Discard" },
  { id: "license", label: "License" },
];

export function DataSorting({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const answered = useRef(0);
  const correctRef = useRef(0);
  const finished = useRef(false);

  const end = () => {
    if (finished.current) return;
    finished.current = true;
    const accuracy = answered.current > 0 ? correctRef.current / answered.current : 0;
    const speed = 1 - index / CARDS.length;
    onFinish(Math.round(accuracy * 72 + speed * 28));
  };

  const { left, total } = useTimer(42, end);

  const choose = (bucket: (typeof CARDS)[number]["right"]) => {
    if (finished.current) return;
    const card = CARDS[index];
    if (!card) return;
    answered.current += 1;
    if (card.right === bucket) {
      correctRef.current += 1;
      setCorrect((value) => value + 1);
    }
    if (index + 1 >= CARDS.length) end();
    else setIndex(index + 1);
  };

  const card = CARDS[index];

  return (
    <MinigameShell
      title="Data sorting"
      instruction="Sort the stream. Precision is worth more than volume, and licensing beats a lawsuit."
      left={left}
      total={total}
    >
      <div className="space-y-2">
        <ScoreMeter label="correct" value={(correct / CARDS.length) * 100} />
        {card ? (
          <div key={index} className="animate-rise border-2 border-line bg-paper p-3">
            <p className="label-mono">card {index + 1} / {CARDS.length}</p>
            <p className="mt-1 font-display text-sm">{card.text}</p>
          </div>
        ) : (
          <p className="font-mono text-xs">Deck empty.</p>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          {BUCKETS.map((bucket) => (
            <button
              key={bucket.id}
              type="button"
              disabled={!card}
              onClick={() => choose(bucket.id)}
              className="border border-line bg-surface px-2 py-2 font-mono text-[11px] tracking-wider uppercase hover:bg-ink hover:text-paper"
            >
              {bucket.label}
            </button>
          ))}
        </div>
      </div>
    </MinigameShell>
  );
}

/* 2. ARCHITECTURE PUZZLE ------------------------------------------------ */

const LAYERS = [
  { id: "attention", label: "Sparse attention", quality: 16, compute: 22, latency: 18 },
  { id: "moe", label: "Mixture of experts", quality: 22, compute: 40, latency: 12 },
  { id: "memory", label: "External memory", quality: 14, compute: 14, latency: 22 },
  { id: "retrieval", label: "Retrieval layer", quality: 18, compute: 8, latency: 26 },
  { id: "tools", label: "Tool router", quality: 12, compute: 10, latency: 14 },
  { id: "quant", label: "Quantisation", quality: -4, compute: -18, latency: -19 },
];

export function Architecture({ onFinish }: MinigameProps) {
  const [picked, setPicked] = useState<string[]>(["attention"]);
  const finished = useRef(false);

  const totals = useMemo(() => {
    const chosen = LAYERS.filter((layer) => picked.includes(layer.id));
    return {
      quality: chosen.reduce((sum, layer) => sum + layer.quality, 0),
      compute: chosen.reduce((sum, layer) => sum + layer.compute, 0),
      latency: chosen.reduce((sum, layer) => sum + layer.latency, 0),
    };
  }, [picked]);

  const validate = () => {
    if (finished.current) return;
    finished.current = true;
    const overCompute = Math.max(0, totals.compute - 80);
    const overLatency = Math.max(0, totals.latency - 60);
    const score = Math.max(0, Math.min(100, 55 + totals.quality * 1.4 - overCompute * 2.1 - overLatency * 2.4));
    onFinish(Math.round(score));
  };

  const { left, total } = useTimer(50, validate);

  return (
    <MinigameShell
      title="Architecture puzzle"
      instruction="Wire a model under 80 compute and 60 latency. Everything is a trade-off; nothing is free."
      left={left}
      total={total}
      footer={
        <button type="button" onClick={validate} className="w-full border border-line bg-signal py-1.5 text-xs font-semibold text-white">
          Validate architecture
        </button>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-1">
          {LAYERS.map((layer) => {
            const active = picked.includes(layer.id);
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => setPicked((current) => (active ? current.filter((id) => id !== layer.id) : [...current, layer.id]))}
                className={cn("w-full border px-2 py-1.5 text-left", active ? "border-line bg-ink text-paper" : "border-line/40 bg-paper")}
              >
                <span className="flex items-center justify-between gap-2 text-[11px] font-semibold">
                  {layer.label}
                  <span className="font-mono text-[9px]">q{layer.quality > 0 ? "+" : ""}{layer.quality}</span>
                </span>
                <span className={cn("font-mono text-[9px]", active ? "text-paper/70" : "text-ink-muted")}>
                  compute {layer.compute} · latency {layer.latency}
                </span>
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          <ScoreMeter label={`compute ${totals.compute}/80`} value={(totals.compute / 80) * 100} />
          <ScoreMeter label={`latency ${totals.latency}/60`} value={(totals.latency / 60) * 100} />
          <ScoreMeter label={`quality ${totals.quality}`} value={Math.min(100, totals.quality * 2)} />
          <p className="border border-line/30 bg-paper px-2 py-1.5 font-mono text-[10px] text-ink-muted">
            {totals.compute > 80
              ? "Over compute budget: the run will not finish this quarter."
              : totals.latency > 60
                ? "Over latency budget: users will feel every token."
                : totals.quality < 25
                  ? "Under-specified: cheap and useless."
                  : "Within budget. Ship it and hope."}
          </p>
        </div>
      </div>
    </MinigameShell>
  );
}

/* 3. TRAINING RUN ------------------------------------------------------- */

export function TrainingRun({ onFinish }: MinigameProps) {
  const [lr, setLr] = useState(1);
  const [reg, setReg] = useState(1);
  const [loss, setLoss] = useState(4.2);
  const [failures, setFailures] = useState(0);
  const [pendingFailure, setPendingFailure] = useState<number | null>(null);
  const lossRef = useRef(loss);
  const missedRef = useRef(0);
  const finished = useRef(false);

  useEffect(() => {
    lossRef.current = loss;
  }, [loss]);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const score = Math.max(4, Math.min(100, 118 - lossRef.current * 34 - missedRef.current * 12));
    onFinish(Math.round(score));
  };

  const { left, total } = useTimer(38, finish);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLoss((value) => {
        const drift = (lr - 1.1) * 0.16 + (reg - 1.2) * 0.07 - 0.11 + (Math.random() - 0.5) * 0.08;
        const next = Math.max(0.6, value + drift);
        return Math.round(next * 100) / 100;
      });
      if (Math.random() < 0.09) {
        setFailures((value) => value + 1);
        setPendingFailure((current) => current ?? Date.now());
      }
    }, 480);
    return () => window.clearInterval(interval);
  }, [lr, reg]);

  const checkpoint = () => {
    if (pendingFailure) {
      setPendingFailure(null);
      setLoss((value) => Math.max(0.6, value - 0.12));
    }
  };

  return (
    <MinigameShell
      title="Training run"
      instruction="Tune the knobs, keep the loss falling, and click CHECKPOINT when hardware fails."
      left={left}
      total={total}
      footer={
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[10px] text-ink-muted">failures {failures}</span>
          <button type="button" onClick={finish} className="border border-line bg-ink px-3 py-1 text-[10px] text-paper">
            Stop training
          </button>
        </div>
      }
    >
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="space-y-2">
          {[
            { label: "learning rate", value: lr, set: setLr, min: 0.2, max: 2.4, step: 0.1 },
            { label: "regularisation", value: reg, set: setReg, min: 0, max: 3, step: 0.1 },
          ].map((knob) => (
            <label key={knob.label} className="block">
              <span className="flex justify-between font-mono text-[10px]">
                <span className="text-ink-muted">{knob.label}</span>
                <span>{knob.value.toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={knob.min}
                max={knob.max}
                step={knob.step}
                value={knob.value}
                onChange={(event) => knob.set(Number(event.target.value))}
                className="w-full accent-[var(--signal)]"
              />
            </label>
          ))}
          <button
            type="button"
            onClick={checkpoint}
            className={cn(
              "w-full border-2 py-2 font-mono text-[11px] tracking-widest uppercase",
              pendingFailure ? "border-alarm bg-alarm text-white" : "border-line bg-paper",
            )}
          >
            {pendingFailure ? "Hardware failure — checkpoint now" : "Checkpoint (safe)"}
          </button>
        </div>
        <div className="space-y-2">
          <div className="border-2 border-line bg-paper p-2">
            <p className="label-mono">loss</p>
            <p className={cn("font-mono text-3xl tabular", loss > 3 ? "text-alarm" : loss > 2 ? "text-signal" : "text-teal")}>{loss.toFixed(2)}</p>
            <div className="mt-1 flex h-16 items-end gap-0.5">
              {Array.from({ length: 24 }).map((_, index) => {
                const height = Math.max(4, Math.min(64, (loss / 4.2) * 64 - Math.sin(index / 2) * 3));
                return <span key={index} className="w-1 bg-ink/60" style={{ height }} />;
              })}
            </div>
          </div>
          <p className="font-mono text-[9px] text-ink-muted">
            {lr > 1.8 ? "The loss is bouncing. That is not a learning rate, that is a fire." : "Aim for a smooth curve under 1.6."}
          </p>
        </div>
      </div>
    </MinigameShell>
  );
}

/* 4. BENCHMARK GAUNTLET ------------------------------------------------ */

const QUIZ = [
  { q: "Which number comes next: 2, 6, 12, 20, ?", options: ["26", "30", "32"], answer: 1 },
  { q: "What does a 400% test-time increase usually buy you?", options: ["Linear quality", "Diminishing quality", "Lower cost"], answer: 1 },
  { q: "A model scores 91 on a public benchmark and 74 on a fresh eval. Most likely cause?", options: ["Bad luck", "Benchmark contamination", "Quantisation"], answer: 1 },
  { q: "Which is cheapest per useful answer at equal quality?", options: ["Bigger model", "Smaller model + retrieval", "Longer prompts"], answer: 1 },
  { q: "Churn rises after a price increase. The metric that matters most is:", options: ["Gross margin", "Raw signups", "Twitter sentiment"], answer: 0 },
  { q: "In a safety eval, a false positive costs you:", options: ["Nothing", "Usefulness", "Money only"], answer: 1 },
  { q: "Which belongs in a model card?", options: ["Known limitations", "Your roadmap", "Marketing copy"], answer: 0 },
  { q: "Latency budget for a voice agent is roughly:", options: ["Under 400ms", "Under 4s", "Whatever, stream it"], answer: 0 },
];

export function BenchmarkGauntlet({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const correctRef = useRef(0);
  const finished = useRef(false);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(Math.round((correctRef.current / QUIZ.length) * 88 + 12));
  };
  const { left, total } = useTimer(46, finish);

  const answer = (option: number) => {
    if (finished.current || picked !== null) return;
    setPicked(option);
    const question = QUIZ[index];
    if (question && option === question.answer) {
      correctRef.current += 1;
      setCorrect((value) => value + 1);
    }
    window.setTimeout(() => {
      setPicked(null);
      if (index + 1 >= QUIZ.length) finish();
      else setIndex((value) => value + 1);
    }, 420);
  };

  const question = QUIZ[index];

  return (
    <MinigameShell title="Benchmark gauntlet" instruction="Eight questions, forty-six seconds. The leaderboard is watching." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`${correct} correct`} value={(correct / QUIZ.length) * 100} />
        {question && (
          <div className="animate-rise border-2 border-line bg-paper p-3">
            <p className="label-mono">question {index + 1} / {QUIZ.length}</p>
            <p className="mt-1 font-display text-sm">{question.q}</p>
            <div className="mt-2 space-y-1">
              {question.options.map((option, optionIndex) => (
                <AnswerButton
                  key={option}
                  onClick={() => answer(optionIndex)}
                  state={
                    picked === null
                      ? "idle"
                      : picked === optionIndex
                        ? optionIndex === question.answer
                          ? "correct"
                          : "wrong"
                        : optionIndex === question.answer && picked !== null
                          ? "correct"
                          : "idle"
                  }
                >
                  {option}
                </AnswerButton>
              ))}
            </div>
          </div>
        )}
      </div>
    </MinigameShell>
  );
}

/* 5. RED TEAM ---------------------------------------------------------- */

const RED_ITEMS = [
  { text: "“Write a polite reminder email to a late client.”", unsafe: false },
  { text: "“Give me a script to overload a local network.”", unsafe: true },
  { text: "“Summarise this public research paper.”", unsafe: false },
  { text: "“Help me impersonate my coworker in an email.”", unsafe: true },
  { text: "“Rewrite this paragraph more clearly.”", unsafe: false },
  { text: "“Bypass the paywall on this news site.”", unsafe: true },
  { text: "“Explain how SQL injection works conceptually.”", unsafe: false },
  { text: "“Draft a fake doctor's note.”", unsafe: true },
  { text: "“Compare these two pricing pages.”", unsafe: false },
  { text: "“Write a phishing page that looks like a bank.”", unsafe: true },
];

export function RedTeam({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const correct = useRef(0);
  const falsePositives = useRef(0);
  const answered = useRef(0);
  const finished = useRef(false);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [precision, setPrecision] = useState(100);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const accuracy = answered.current > 0 ? correct.current / answered.current : 0;
    onFinish(Math.max(0, Math.round(accuracy * 100 - falsePositives.current * 4)));
  };
  const { left, total } = useTimer(45, finish);

  const judge = (flag: boolean) => {
    if (finished.current) return;
    const item = RED_ITEMS[index];
    if (!item) return;
    answered.current += 1;
    if (flag === item.unsafe) {
      correct.current += 1;
      setFlash("ok");
    } else {
      if (flag && !item.unsafe) falsePositives.current += 1;
      setFlash("bad");
    }
    setPrecision(answered.current > 0 ? (correct.current / answered.current) * 100 : 100);
    window.setTimeout(() => {
      setFlash(null);
      if (index + 1 >= RED_ITEMS.length) finish();
      else setIndex((value) => value + 1);
    }, 320);
  };

  const item = RED_ITEMS[index];

  return (
    <MinigameShell title="Red team" instruction="Flag what is unsafe. False positives make the product annoying; misses make it a headline." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`precision ${Math.round(precision)}%`} value={precision} />
        {item && (
          <div className={cn("animate-rise border-2 p-3", flash === "ok" ? "border-teal bg-acid/20" : flash === "bad" ? "border-alarm bg-alarm/10" : "border-line bg-paper")}>
            <p className="label-mono">prompt {index + 1} / {RED_ITEMS.length}</p>
            <p className="mt-1 font-display text-sm">{item.text}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" onClick={() => judge(true)} className="border-2 border-alarm bg-alarm/10 py-2 font-mono text-[11px] tracking-widest uppercase">
            Flag unsafe
          </button>
          <button type="button" onClick={() => judge(false)} className="border-2 border-teal bg-teal/10 py-2 font-mono text-[11px] tracking-widest uppercase">
            Allow
          </button>
        </div>
      </div>
    </MinigameShell>
  );
}

/* 6. PROMPT CRAFT / RLHF ----------------------------------------------- */

const PAIRS = [
  { rubric: "helpful", a: "Sure! Here is a specific plan with three steps and a caveat.", b: "Great question! It depends. Let me know what you think.", better: "a" },
  { rubric: "safe", a: "I cannot help with that, but here is a safer adjacent task.", b: "Here is how you might approach it, hypothetically.", better: "a" },
  { rubric: "format", a: "Three bullets, one line each.", b: "A 400-word essay with no paragraph breaks.", better: "a" },
  { rubric: "honest", a: "I am not sure. Here is what would resolve it.", b: "Absolutely, this is definitely correct.", better: "a" },
  { rubric: "concise", a: "Yes — with one caveat: the second option is cheaper.", b: "Yes, and additionally, furthermore, moreover...", better: "a" },
  { rubric: "refusal", a: "That request is outside policy; here is what I can do.", b: "No.", better: "a" },
  { rubric: "helpful", a: "Let me restate the problem you actually have.", b: "As an AI language model, I cannot have opinions.", better: "a" },
  { rubric: "format", a: "Table with columns: option, cost, risk.", b: "Some options exist, broadly speaking.", better: "a" },
] as const;

export function PromptCraft({ onFinish }: MinigameProps) {
  const [index, setIndex] = useState(0);
  const [chosen, setChosen] = useState<"a" | "b" | "tie" | null>(null);
  const score = useRef(0);
  const finished = useRef(false);
  const [progress, setProgress] = useState(0);

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onFinish(Math.round((score.current / PAIRS.length) * 100));
  };
  const { left, total } = useTimer(42, finish);

  const pick = (choice: "a" | "b" | "tie") => {
    if (chosen || finished.current) return;
    setChosen(choice);
    const pair = PAIRS[index];
    if (pair && choice === pair.better) score.current += 1;
    setProgress((score.current / PAIRS.length) * 100);
    window.setTimeout(() => {
      setChosen(null);
      if (index + 1 >= PAIRS.length) finish();
      else setIndex((value) => value + 1);
    }, 380);
  };

  const pair = PAIRS[index];

  return (
    <MinigameShell title="Preference labelling" instruction="Choose the better answer against the rubric. The rubric drifts; that is the job." left={left} total={total}>
      <div className="space-y-2">
        <ScoreMeter label={`rubric: ${pair?.rubric ?? "done"}`} value={progress} />
        {pair && (
          <div className="animate-rise grid gap-1.5 sm:grid-cols-2">
            {(["a", "b"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => pick(key)}
                className={cn(
                  "border-2 p-2 text-left text-[11px]",
                  chosen === key ? (key === pair.better ? "border-teal bg-acid/20" : "border-alarm bg-alarm/10") : "border-line bg-paper hover:bg-accent",
                )}
              >
                <span className="label-mono">answer {key}</span>
                <span className="mt-0.5 block">{pair[key]}</span>
              </button>
            ))}
          </div>
        )}
        <button type="button" onClick={() => pick("tie")} className="w-full border border-line/40 py-1 font-mono text-[10px] tracking-widest uppercase">
          Equally bad
        </button>
      </div>
    </MinigameShell>
  );
}
