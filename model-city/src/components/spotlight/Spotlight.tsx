"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/store/game";
import { cn } from "@/lib/utils";

export interface TourStep {
  title: string;
  body: string;
  target?: string;
  action?: string;
}

export const TOURS: Record<string, TourStep[]> = {
  welcome: [
    {
      title: "Welcome to the garage",
      body: "This is a fake operating system for a company that does not exist yet. Your first job: open the Dashboard and read the numbers.",
      target: "dock",
      action: "The dock is where every app lives.",
    },
    {
      title: "Time only moves when you let it",
      body: "Pause, 1x, 2x and 4x sit in the top bar. Nothing happens while you read, which is the only generous thing this game does.",
      target: "speed",
    },
    {
      title: "Everything is a skill check",
      body: "Training a model runs through seven stages, each with a short minigame. Score affects quality. You can skip, but skipping is honest mediocrity.",
      target: "cash",
    },
  ],
  "tour:dashboard": [
    { title: "Dashboard", body: "Runway, burn, users and the queue of decisions nobody else will make.", target: "app-body" },
    { title: "Read the queue", body: "Pending events stack here. Handle them before the clock runs, or the market handles you.", target: "app-body" },
  ],
  "tour:training": [
    { title: "Training Lab", body: "Configure a model, then run its seven stages. Parameters cost money; context costs money; ambition costs both.", target: "app-body" },
    { title: "Benchmarks lie", body: "Overfitting to public benchmarks buys hype and a scandal later. The hidden gap is real.", target: "app-body" },
  ],
  "tour:web": [
    { title: "Web Studio", body: "Your website is a real funnel. Toggle blocks, pick a template, test the playground.", target: "app-body" },
    { title: "The playground is the product", body: "Chat with your own model here. Answer quality reflects its real stats, latency and quirks.", target: "app-body" },
  ],
  "tour:pricing": [
    { title: "Pricing & Billing", body: "Every free message costs you inference. Heavy users on cheap plans are how startups die politely.", target: "app-body" },
    { title: "Change prices carefully", body: "Raising prices triggers churn and forum threads. Both are simulated and both are merciless.", target: "app-body" },
  ],
  "tour:investors": [
    { title: "Investors", body: "Ask for a term sheet, then read it. Liquidation preference and board seats outlive the celebration.", target: "app-body" },
    { title: "Cap table", body: "Dilution is permanent. Your control meter is the number that can end the run.", target: "app-body" },
  ],
  "tour:research": [
    { title: "Research Lab", body: "Five branches, five tiers each. Every node costs cash and compute, and shifts the numbers that decide your fate.", target: "app-body" },
  ],
  "tour:data": [
    { title: "Data Room", body: "Quality beats quantity, and licensing beats lawsuits. Usually.", target: "app-body" },
  ],
  "tour:social": [
    { title: "Social Feed", body: "Reviews are generated from your real stats, price and quirks. This is what users actually think.", target: "app-body" },
  ],
  "tour:team": [
    { title: "Team", body: "Hire for skill, tolerate flaws, and watch morale. They are simulated people with opinions.", target: "app-body" },
  ],
  "tour:market": [
    { title: "Market", body: "Seven rivals with their own strategies. Release timing matters more than anyone admits.", target: "app-body" },
  ],
  "tour:legal": [
    { title: "Legal & Safety", body: "Risk compounds quietly. Audits and licences are boring, expensive insurance.", target: "app-body" },
  ],
  "tour:compute": [
    { title: "Compute", body: "Rented is flexible, owned is cheaper per hour and harder to escape.", target: "app-body" },
  ],
  "tour:product": [
    { title: "Product Studio", body: "Ship features, cut versions, write release notes that sound confident.", target: "app-body" },
  ],
  "tour:office": [
    { title: "Office", body: "Small upgrades, small buffs. Also the only place your team exists visually.", target: "app-body" },
  ],
  "tour:mail": [
    { title: "Mail", body: "Customers, investors, lawyers and one person impersonating you.", target: "app-body" },
  ],
  "tour:settings": [
    { title: "Settings", body: "Language, sound, saves, achievements and the glossary. Replay tours any time.", target: "app-body" },
  ],
  "tour:minigame": [
    { title: "Skill check", body: "Drag, click, or use the keyboard. Score is stamped into the model pipeline. Retry costs cash.", target: "minigame-body" },
  ],
};

export function Spotlight() {
  const spotlight = useGame((state) => state.spotlight);
  const setStep = useGame((state) => state.setSpotlightStep);
  const close = useGame((state) => state.closeSpotlight);
  const markSeen = useGame((state) => state.markSeen);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps = useMemo(() => {
    if (!spotlight) return [];
    return TOURS[spotlight.id] ?? [{ title: "Quick tour", body: "Look around, then get back to work. The clock is not running." }];
  }, [spotlight?.id]);

  const step = spotlight ? Math.min(spotlight.step, steps.length - 1) : 0;
  const current = steps[step];

  useEffect(() => {
    if (!spotlight || !current?.target) {
      const clear = window.requestAnimationFrame(() => setRect(null));
      return () => window.cancelAnimationFrame(clear);
    }
    const update = () => {
      const node = document.querySelector(`[data-spot="${current.target}"]`);
      setRect(node ? node.getBoundingClientRect() : null);
    };
    const initial = window.requestAnimationFrame(update);
    window.addEventListener("resize", update);
    const timer = window.setInterval(update, 400);
    return () => {
      window.cancelAnimationFrame(initial);
      window.removeEventListener("resize", update);
      window.clearInterval(timer);
    };
  }, [spotlight, step, current?.target]);

  useEffect(() => {
    if (!spotlight) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
      if (event.key === "ArrowRight" || event.key === "Enter") next();
      if (event.key === "ArrowLeft") back();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!spotlight || !current) return null;

  function next() {
    if (step + 1 >= steps.length) {
      finish();
      return;
    }
    setStep(step + 1);
  }
  function back() {
    setStep(Math.max(0, step - 1));
  }
  function finish() {
    if (spotlight?.id === "welcome") markSeen("tutorial-complete");
    close();
  }

  const cardStyle: React.CSSProperties = rect
    ? {
        position: "fixed",
        left: Math.min(Math.max(12, rect.left), window.innerWidth - 340),
        top: Math.min(rect.bottom + 14, window.innerHeight - 220),
        width: 320,
      }
    : { position: "fixed", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: 340 };

  return (
    <div className="fixed inset-0 z-[95]" role="dialog" aria-modal="true" aria-label={current.title}>
      <div className="absolute inset-0 bg-ink/62" onClick={finish} />
      {rect && (
        <div
          className="pointer-events-none absolute rounded-[6px] border-2 border-acid"
          style={{
            left: rect.left - 4,
            top: rect.top - 4,
            width: rect.width + 8,
            height: rect.height + 8,
          }}
        />
      )}
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
        style={cardStyle}
        className="paper-card z-[96] p-4"
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="label-mono">
            Step {step + 1} / {steps.length}
          </span>
          <button type="button" onClick={finish} aria-label="Skip tour" className="text-ink-muted hover:text-ink">
            <X className="size-3.5" />
          </button>
        </div>
        <h3 className="font-display text-lg leading-tight">{current.title}</h3>
        <p className="mt-1.5 text-sm text-ink-muted">{current.body}</p>
        {current.action && <p className="mt-2 border-l-2 border-signal pl-2 font-mono text-[11px]">{current.action}</p>}
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={finish}
            className={cn("font-mono text-[10px] tracking-widest uppercase", "text-ink-muted hover:text-ink")}
          >
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button type="button" onClick={back} className="border border-line px-2.5 py-1 text-xs">
                Back
              </button>
            )}
            <button
              type="button"
              onClick={next}
              className="flex items-center gap-1 border border-line bg-signal px-3 py-1 text-xs font-semibold text-white"
            >
              {step + 1 >= steps.length ? "Got it" : "Next"} <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </motion.div>
      <AnimatePresence />
    </div>
  );
}
