"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Cpu } from "lucide-react";
import { useGame } from "@/store/game";
import { Desktop } from "@/components/os/Desktop";
import { Onboarding } from "@/features/onboarding/Onboarding";
import { LangProvider, LocaleProvider, type Lang } from "@/lib/i18n";

export function GameRoot() {
  const game = useGame((state) => state.game);
  const locale = useGame((state) => state.locale);
  const reducedMotion = useGame((state) => state.reducedMotion);
  const setLocale = useGame((state) => state.setLocale);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("model-city-theme");
    document.documentElement.classList.toggle("dark", saved === "dark");
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setBooted(true), 1500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <LangProvider lang={locale as Lang} setLang={setLocale}>
      <LocaleProvider locale={locale} messages={{}}>
        <div className={reducedMotion ? "reduce-motion" : undefined}>
          {!booted ? (
            <BootScreen onSkip={() => setBooted(true)} />
          ) : game ? (
            <Desktop />
          ) : (
            <Onboarding />
          )}
        </div>
      </LocaleProvider>
    </LangProvider>
  );
}

function BootScreen({ onSkip }: { onSkip: () => void }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((value) => Math.min(100, value + 7));
    }, 90);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className="relative flex h-dvh flex-col overflow-hidden bg-ink text-paper">
      <div className="grain pointer-events-none absolute inset-0 opacity-30" />
      <div className="desktop-grid pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6">
        <div className="mb-6 flex items-end gap-2" aria-hidden>
          <span className="h-10 w-3 border border-paper/40 bg-signal" />
          <span className="h-16 w-3 border border-paper/40 bg-sun" />
          <span className="h-24 w-3 border border-paper/40 bg-acid" />
          <span className="h-14 w-3 border border-paper/40 bg-teal" />
        </div>
        <p className="font-mono text-[10px] tracking-[0.3em] text-paper/60 uppercase">garage operating system · v0.9</p>
        <h1 className="mt-2 font-display text-5xl font-extrabold tracking-tight sm:text-6xl">MODEL CITY</h1>
        <p className="mt-2 max-w-sm text-center text-sm text-paper/60">
          One GPU. One idea. One suspiciously confident founder.
        </p>
        <div className="mt-8 w-64">
          <div className="h-1.5 w-full overflow-hidden border border-paper/30">
            <div className="h-full bg-acid transition-all" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] tracking-widest text-paper/50 uppercase">
            <span className="flex items-center gap-1">
              <Cpu className="size-3" /> initialising
            </span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onSkip}
        className="absolute right-4 bottom-4 flex items-center gap-1 border border-paper/30 px-2 py-1 font-mono text-[10px] tracking-widest text-paper/70 uppercase hover:border-paper"
      >
        skip <ArrowRight className="size-3" />
      </button>
    </main>
  );
}
