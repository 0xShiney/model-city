"use client";

import {
  CircleHelp,
  Command as CommandIcon,
  Pause,
  Play,
  RotateCcw,
  Search,
  TriangleAlert,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useGame, type Speed } from "@/store/game";
import { APP_BY_ID, DOCK_ORDER, type AppId } from "@/features/apps/meta";
import { AppSurface } from "@/features/apps/registry";
import { MinigameOverlay } from "@/features/minigames";
import { WindowFrame } from "@/components/os/WindowFrame";
import { DynamicIsland } from "@/components/motion/kit";
import { AnimatedToastStack, type AnimatedToast } from "@/components/motion/animated-toast-stack";
import { Spotlight } from "@/components/spotlight/Spotlight";
import { useT } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-media-query";
import { compact, dayLabel, money, num, runwayLabel } from "@/lib/format";
import { eventsById } from "@/lib/sim/events";
import { burnRate, runwayMonths } from "@/lib/sim/economy";
import { cn } from "@/lib/utils";

const LOGO_FONT = {
  display: "font-display",
  sans: "font-sans",
  mono: "font-mono",
} as const;

export function LogoMark({ size = 28 }: { size?: number }) {
  const logo = useGame((state) => state.game?.company.logo);
  if (!logo) return null;
  return (
    <span
      className={cn("grid shrink-0 place-items-center border-2 border-line", LOGO_FONT[logo.font])}
      style={{
        width: size,
        height: size,
        background: logo.colors[0],
        color: logo.colors[2],
        borderRadius: logo.mask === "circle" ? "999px" : logo.mask === "squircle" ? "30%" : logo.mask === "hex" ? "14%" : "2px",
        fontSize: size * 0.55,
        lineHeight: 1,
      }}
      aria-hidden
    >
      {logo.symbol}
    </span>
  );
}

export function Desktop() {
  const game = useGame((state) => state.game);
  const windows = useGame((state) => state.windows);
  const speed = useGame((state) => state.speed);
  const setSpeed = useGame((state) => state.setSpeed);
  const openApp = useGame((state) => state.openApp);
  const island = useGame((state) => state.island);
  const dismissIsland = useGame((state) => state.dismissIsland);
  const toasts = useGame((state) => state.toasts);
  const dismissToast = useGame((state) => state.dismissToast);
  const spotlight = useGame((state) => state.spotlight);
  const isMobile = useIsMobile();
  const t = useT();
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    if (!game || speed === 0 || game.ending) return;
    const interval = window.setInterval(() => useGame.getState().tick(), 900 / speed);
    return () => window.clearInterval(interval);
  }, [speed, game?.ending]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPalette((open) => !open);
      }
      if (event.key === "Escape") setPalette(false);
      if (event.code === "Space" && (event.target as HTMLElement)?.tagName !== "INPUT" && (event.target as HTMLElement)?.tagName !== "TEXTAREA") {
        event.preventDefault();
        setSpeed(speed === 0 ? 1 : 0);
      }
      if (["1", "2", "4"].includes(event.key) && !(event.metaKey || event.ctrlKey)) {
        setSpeed(Number(event.key) as Speed);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [speed, setSpeed]);

  const toastItems: AnimatedToast[] = useMemo(
    () =>
      toasts.map((toast) => ({
        id: toast.id,
        title: toast.title,
        description: toast.body,
        status: toast.tone === "success" ? "success" : toast.tone === "error" ? "error" : toast.tone === "info" ? "info" : "neutral",
        duration: 6000,
      })),
    [toasts],
  );

  const visible = windows.filter((entry) => !entry.minimized).sort((a, b) => a.z - b.z);
  const active = windows.find((entry) => entry.app === (useGame.getState().activeApp ?? "dashboard"));

  if (!game) return null;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-paper text-ink">
      <div className="grain pointer-events-none absolute inset-0 opacity-70" />
      <div className="desktop-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute -top-24 right-1/4 size-[420px] rounded-full bg-sun/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/5 size-[320px] rounded-full bg-teal/10 blur-3xl" />

      <MenuBar speed={speed} setSpeed={setSpeed} onHelp={() => setPalette(false)} onPalette={() => setPalette(true)} />

      <main className="absolute inset-x-0 top-9 bottom-0">
        {isMobile ? (
          <div className="absolute inset-x-0 top-0 bottom-[70px] overflow-hidden">
            {active ? (
              <WindowFrame win={{ ...active, x: 0, y: 0, w: 0, h: 0, minimized: false, maximized: true }} title={t(APP_BY_ID[active.app].labelKey)} icon={APP_BY_ID[active.app].icon} mobile>
                <AppSurface app={active.app} />
              </WindowFrame>
            ) : (
              <MobileHome />
            )}
          </div>
        ) : (
          <div className="absolute inset-x-0 top-0 bottom-[84px]" data-spot="desktop">
            {visible.map((entry) => (
              <WindowFrame
                key={entry.app}
                win={entry}
                title={t(APP_BY_ID[entry.app].labelKey)}
                icon={APP_BY_ID[entry.app].icon}
              >
                <AppSurface app={entry.app} />
              </WindowFrame>
            ))}
          </div>
        )}
      </main>

      <Dock openApp={openApp} />
      <DynamicIsland
        item={island[0] ?? null}
        onDismiss={dismissIsland}
        onOpen={() => openApp(island[0]?.action === "event" ? "dashboard" : "dashboard")}
      />
      <CommandPalette open={palette} onClose={() => setPalette(false)} onOpenApp={openApp} />
      <EventModal />
      <EndingScreen />
      {island.length > 1 && !isMobile && (
        <div className="fixed top-14 right-4 z-[70] flex flex-col gap-1">
          {island.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => dismissIsland(item.id)}
              className="paper-card max-w-[240px] px-2 py-1 text-left text-[11px]"
            >
              <span className="label-mono">{item.title}</span>
              <span className="block truncate text-ink-muted">{item.body}</span>
            </button>
          ))}
        </div>
      )}

      <MinigameOverlay />
      {spotlight && <Spotlight />}

      <div className="pointer-events-none fixed right-3 bottom-2 z-[60] hidden font-mono text-[9px] tracking-widest text-ink-muted uppercase sm:block">
        {game.company.name} · build 0.9 · seed {game.seed}
      </div>

      <AnimatedToastStack toasts={toastItems} onDismiss={dismissToast} position="top-right" />
    </div>
  );
}

function MenuBar({
  speed,
  setSpeed,
  onPalette,
}: {
  speed: Speed;
  setSpeed: (speed: Speed) => void;
  onHelp: () => void;
  onPalette: () => void;
}) {
  const game = useGame((state) => state.game);
  const t = useT();
  if (!game) return null;
  const burn = Math.round(burnRate(game));
  const runway = runwayLabel(runwayMonths(game));
  const runwayTight = runwayMonths(game) < 2;

  return (
    <header className="absolute inset-x-0 top-0 z-[65] flex h-9 items-center gap-3 border-b-2 border-line bg-surface px-2 text-xs">
      <button
        type="button"
        onClick={() => useGame.getState().openApp("dashboard")}
        className="flex items-center gap-1.5"
        aria-label="Open dashboard"
      >
        <LogoMark size={22} />
        <span className="max-w-[130px] truncate font-display text-[13px] font-bold tracking-tight">
          {game.company.name}
        </span>
      </button>

      <div className="hidden items-center gap-1 sm:flex">
        <MenuItem label="File" />
        <MenuItem label="Company" />
        <MenuItem label="Help" onClick={() => useGame.getState().openSpotlight("welcome")} />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <span className="hidden font-mono text-[10px] text-ink-muted md:inline">
          {dayLabel(game.day)} · d{game.day} · W{Math.floor(game.day / 7)} · Q{game.quarter}
        </span>
        <div data-spot="cash" className="flex items-center gap-1 border border-line/40 bg-paper px-1.5 py-0.5">
          <span className="label-mono">cash</span>
          <span className={cn("font-mono text-[11px] font-bold tabular", game.res.cash < 0 && "text-alarm")}>
            {money(game.res.cash)}
          </span>
        </div>
        <div className={cn("hidden items-center gap-1 px-1.5 py-0.5 sm:flex", runwayTight && "bg-alarm/10")}>
          <span className="label-mono">runway</span>
          <span className={cn("font-mono text-[11px] tabular", runwayTight && "text-alarm")}>{runway}</span>
        </div>
        <div className="hidden items-center gap-1 lg:flex">
          <span className="label-mono">mrr</span>
          <span className="font-mono text-[11px] tabular">{money(game.kpis.mrr)}</span>
        </div>
        <div className="hidden items-center gap-1 xl:flex">
          <span className="label-mono">users</span>
          <span className="font-mono text-[11px] tabular">{compact(game.kpis.users)}</span>
        </div>
        <div className="hidden items-center gap-1 xl:flex">
          <span className="label-mono">burn</span>
          <span className={cn("font-mono text-[11px] tabular", burn > 0 ? "text-alarm" : "text-teal")}>{money(burn)}</span>
        </div>

        <div data-spot="speed" className="flex items-center gap-0.5 border border-line bg-paper p-0.5" role="group" aria-label="Time speed">
          <button
            type="button"
            onClick={() => setSpeed(0)}
            aria-label={t("hud.pause")}
            className={cn("grid size-5 place-items-center", speed === 0 && "bg-ink text-paper")}
          >
            <Pause className="size-3" />
          </button>
          {([1, 2, 4] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setSpeed(value)}
              className={cn(
                "h-5 min-w-5 px-1 font-mono text-[10px] font-bold",
                speed === value ? "bg-ink text-paper" : "hover:bg-accent",
              )}
              aria-pressed={speed === value}
            >
              {value}x
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onPalette}
          className="hidden items-center gap-1 border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] sm:flex"
          aria-label={t("nav.command")}
        >
          <Search className="size-3" /> ⌘K
        </button>
        <button
          type="button"
          onClick={() => useGame.getState().openApp("settings")}
          aria-label={t("nav.help")}
          className="grid size-6 place-items-center border border-line bg-paper"
        >
          <CircleHelp className="size-3.5" />
        </button>
      </div>
    </header>
  );
}

function MenuItem({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-1.5 py-1 font-mono text-[10px] tracking-wider text-ink-muted uppercase hover:bg-accent hover:text-ink"
    >
      {label}
    </button>
  );
}

function Dock({ openApp }: { openApp: (app: AppId) => void }) {
  const windows = useGame((state) => state.windows);
  const activeApp = useGame((state) => state.activeApp);
  const t = useT();
  const running = new Set(windows.map((entry) => entry.app));

  return (
    <nav
      data-spot="dock"
      aria-label={t("nav.dock")}
      className="absolute inset-x-0 bottom-0 z-[66] flex justify-center px-2 pb-2"
    >
      <div className="flex max-w-full items-end gap-1 overflow-x-auto border-2 border-line bg-surface/95 px-2 py-1.5 shadow-[0_6px_0_rgba(23,21,15,0.35)] backdrop-blur-[2px]">
        {DOCK_ORDER.map((id) => {
          const meta = APP_BY_ID[id];
          const Icon = meta.icon;
          const isActive = activeApp === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => openApp(id)}
              title={t(meta.labelKey)}
              aria-label={t(meta.labelKey)}
              className={cn(
                "group relative grid size-10 shrink-0 place-items-center border border-line/30 transition-transform hover:-translate-y-1 hover:border-line",
                isActive ? "bg-ink text-paper" : "bg-paper text-ink",
              )}
            >
              <Icon className="size-4" strokeWidth={1.9} />
              <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 border border-line bg-ink px-1.5 py-0.5 font-mono text-[9px] whitespace-nowrap text-paper group-hover:block">
                {t(meta.labelKey)}
              </span>
              {running.has(id) && <span className="absolute -bottom-0.5 size-1 rounded-full bg-signal" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function CommandPalette({
  open,
  onClose,
  onOpenApp,
}: {
  open: boolean;
  onClose: () => void;
  onOpenApp: (app: AppId) => void;
}) {
  const t = useT();
  const setSpeed = useGame((state) => state.setSpeed);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);

  const entries = useMemo(() => {
    const apps = DOCK_ORDER.map((id) => ({
      id: `app:${id}`,
      label: t(APP_BY_ID[id].labelKey),
      hint: "Open app",
      run: () => onOpenApp(id),
    }));
    const actions = [
      { id: "speed:0", label: "Pause time", hint: "Space", run: () => setSpeed(0) },
      { id: "speed:1", label: "Speed 1x", hint: "1", run: () => setSpeed(1) },
      { id: "speed:4", label: "Speed 4x", hint: "4", run: () => setSpeed(4) },
      { id: "tour", label: "Replay tutorial", hint: "Help", run: () => useGame.getState().openSpotlight("welcome") },
    ];
    const all = [...apps, ...actions];
    if (!query.trim()) return all;
    const needle = query.toLowerCase();
    return all.filter((entry) => entry.label.toLowerCase().includes(needle));
  }, [query, onOpenApp, setSpeed, t]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center bg-ink/45 px-4 pt-[12vh]" role="dialog" aria-modal="true">
      <div className="w-full max-w-md border-2 border-line bg-surface shadow-[6px_6px_0_var(--ink)]">
        <div className="flex items-center gap-2 border-b-2 border-line px-2.5 py-2">
          <CommandIcon className="size-3.5 text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setIndex(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setIndex((current) => Math.min(entries.length - 1, current + 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setIndex((current) => Math.max(0, current - 1));
              }
              if (event.key === "Enter" && entries[index]) {
                entries[index].run();
                onClose();
              }
            }}
            placeholder="Search apps and actions..."
            aria-label="Command palette search"
            className="w-full bg-transparent font-mono text-xs outline-none placeholder:text-ink-muted"
          />
          <kbd className="border border-line/40 px-1 font-mono text-[9px] text-ink-muted">esc</kbd>
        </div>
        <ul className="scroll-thin max-h-[46vh] overflow-y-auto py-1" role="listbox">
          {entries.map((entry, position) => (
            <li key={entry.id}>
              <button
                type="button"
                role="option"
                aria-selected={position === index}
                onMouseEnter={() => setIndex(position)}
                onClick={() => {
                  entry.run();
                  onClose();
                }}
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-xs",
                  position === index ? "bg-ink text-paper" : "hover:bg-accent",
                )}
              >
                <span>{entry.label}</span>
                <span className="font-mono text-[9px] tracking-wider uppercase opacity-70">{entry.hint}</span>
              </button>
            </li>
          ))}
          {entries.length === 0 && <li className="px-3 py-3 text-xs text-ink-muted">Nothing matches. Try “dashboard”.</li>}
        </ul>
      </div>
    </div>
  );
}

function EventModal() {
  const game = useGame((state) => state.game);
  const act = useGame((state) => state.act);
  const pending = game?.events.pending;
  const event = pending ? eventsById(pending.eventId) : undefined;
  if (!game || !event) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-ink/45 px-4" role="dialog" aria-modal="true" aria-label={event.title}>
      <div className="paper-card w-full max-w-lg animate-rise overflow-hidden">
        <div className="flex items-center gap-2 border-b-2 border-line bg-sun/25 px-3 py-1.5">
          <TriangleAlert className="size-3.5" />
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase">Decision required · day {pending?.day}</span>
          <span className="ml-auto font-mono text-[10px] text-ink-muted">{event.tone}</span>
        </div>
        <div className="p-4">
          <h3 className="font-display text-xl leading-tight">{event.title}</h3>
          <p className="mt-2 text-sm text-ink-muted">{event.body}</p>
          <div className="mt-4 space-y-2">
            {event.choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => act({ type: "event-choice", choiceId: choice.id })}
                className="w-full border border-line bg-paper px-3 py-2 text-left transition-transform hover:-translate-y-0.5 hover:bg-accent"
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{choice.label}</span>
                  <span className="font-mono text-[10px] text-signal">{choice.effect}</span>
                </span>
                <span className="mt-0.5 block text-xs text-ink-muted">{choice.detail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ENDINGS: Record<string, { title: string; body: string }> = {
  ipo: { title: "Bell Ringing", body: "You took the company public. The deck was right, which nobody expected, least of all you." },
  acquired: { title: "Acquired", body: "A platform company bought the team, the weights and the logo. The logo was the sticking point." },
  ousted: { title: "Boardroom Coup", body: "The board thanked you for your service and changed the lock on the strategy room." },
  bankrupt: { title: "Out of Runway", body: "Cash hit zero on a Tuesday. The status page went down before the company did." },
  breakthrough: { title: "AGI-ish", body: "The model is good enough that the arguments about what it is become the product. You are no longer in control of the narrative." },
  burnout: { title: "Founder Mode, Off", body: "You stopped answering messages. The company kept running, which was the most insulting part." },
  indie: { title: "Quietly Profitable", body: "No IPO, no acquisition. Just revenue, a small team and a calendar with nothing on Fridays." },
};

function EndingScreen() {
  const game = useGame((state) => state.game);
  const reset = useGame((state) => state.reset);
  if (!game?.ending) return null;
  const ending = ENDINGS[game.ending];
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-paper/95 px-4">
      <div className="paper-card w-full max-w-xl animate-rise p-6">
        <span className="label-mono">Founder post-mortem · day {game.day}</span>
        <h2 className="mt-1 font-display text-3xl leading-none">{ending?.title ?? "The End"}</h2>
        <p className="mt-2 text-sm text-ink-muted">{ending?.body}</p>
        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-line/30 pt-3 text-xs sm:grid-cols-3">
          <Stat label="Users" value={num(game.kpis.users)} />
          <Stat label="MRR" value={money(game.kpis.mrr)} />
          <Stat label="Raised" value={money(game.stats.cashRaised)} />
          <Stat label="Models shipped" value={String(game.stats.modelsShipped)} />
          <Stat label="Valuation" value={money(game.funding.rounds > 0 ? game.kpis.mrr * 12 * 20 : game.kpis.mrr * 12)} />
          <Stat label="Achievements" value={`${game.achievements.length}`} />
        </dl>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => useGame.getState().openApp("settings")} className="border border-line px-3 py-1.5 text-xs">
            Read the diary
          </button>
          <button type="button" onClick={reset} className="flex items-center gap-1.5 border border-line bg-signal px-3 py-1.5 text-xs font-semibold text-white">
            <RotateCcw className="size-3.5" /> New company
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="label-mono">{label}</dt>
      <dd className="font-mono text-sm tabular">{value}</dd>
    </div>
  );
}

function MobileHome() {
  const game = useGame((state) => state.game);
  const openApp = useGame((state) => state.openApp);
  if (!game) return null;
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6">
      <LogoMark size={64} />
      <h1 className="font-display text-2xl">{game.company.name}</h1>
      <p className="max-w-xs text-center text-sm text-ink-muted">{game.company.tagline}</p>
      <button
        type="button"
        onClick={() => openApp("dashboard")}
        className="mt-2 border-2 border-line bg-signal px-4 py-2 text-sm font-semibold text-white hard-shadow-sm"
      >
        Open dashboard
      </button>
      <p className="label-mono mt-4">tap an app in the dock</p>
    </div>
  );
}

export { Pause, Play, X };
