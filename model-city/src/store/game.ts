"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  advanceDay,
  applyEffects,
  dispatch as dispatchCommand,
  newGame,
  type Command,
  type NewGameOptions,
} from "@/lib/sim/engine";
import { ACHIEVEMENTS, checkAchievements } from "@/lib/sim/content";
import { clamp } from "@/lib/sim/rng";
import { gradeOf } from "@/lib/format";
import type { GameState, MinigameId, PipelineStage } from "@/lib/sim/types";
import { APP_BY_ID, DOCK_ORDER, type AppId } from "@/features/apps/meta";

export type Speed = 0 | 1 | 2 | 4;

export interface WindowState {
  app: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  snapped: "left" | "right" | null;
}

export interface ToastMessage {
  id: string;
  title: string;
  body?: string;
  tone: "default" | "success" | "error" | "warning" | "info";
}

export interface IslandItem {
  id: string;
  title: string;
  body: string;
  tone: "good" | "bad" | "neutral";
  action?: "event" | "weekly" | "news";
}

export interface MinigameSession {
  id: MinigameId;
  purpose: string;
  stage?: PipelineStage;
  modelId?: string;
  returnTo?: AppId;
}

interface GameStore {
  game: GameState | null;
  booted: boolean;
  speed: Speed;
  locale: "en" | "id";
  sound: boolean;
  reducedMotion: boolean;
  windows: WindowState[];
  zTop: number;
  activeApp: AppId | null;
  minigame: MinigameSession | null;
  toasts: ToastMessage[];
  island: IslandItem[];
  seenTutorials: string[];
  spotlight: { id: string; step: number } | null;
  start: (options: NewGameOptions) => void;
  setBooted: (value: boolean) => void;
  tick: () => void;
  act: (command: Command) => void;
  setSpeed: (speed: Speed) => void;
  openApp: (app: AppId) => void;
  closeApp: (app: AppId) => void;
  focusApp: (app: AppId) => void;
  minimizeApp: (app: AppId) => void;
  maximizeApp: (app: AppId) => void;
  snapApp: (app: AppId, side: "left" | "right" | null) => void;
  moveWindow: (app: AppId, x: number, y: number) => void;
  resizeWindow: (app: AppId, w: number, h: number) => void;
  startMinigame: (session: MinigameSession) => void;
  finishMinigame: (score: number, skipped: boolean) => void;
  cancelMinigame: () => void;
  pushToast: (toast: Omit<ToastMessage, "id">) => void;
  dismissToast: (id: string) => void;
  pushIsland: (item: Omit<IslandItem, "id">) => void;
  dismissIsland: (id: string) => void;
  setLocale: (locale: "en" | "id") => void;
  setSound: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
  markSeen: (id: string) => void;
  openSpotlight: (id: string) => void;
  closeSpotlight: () => void;
  setSpotlightStep: (step: number) => void;
  exportSave: () => string;
  importSave: (json: string) => { ok: boolean; error?: string };
  reset: () => void;
  clearEvent: () => void;
}

let toastCounter = 0;

const initialWindow = (app: AppId, index: number, z: number): WindowState => {
  const meta = APP_BY_ID[app];
  return {
    app,
    x: 96 + ((index * 34) % 220),
    y: 72 + ((index * 28) % 140),
    w: meta.w,
    h: meta.h,
    z,
    minimized: false,
    maximized: false,
    snapped: null,
  };
};

export const useGame = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      booted: false,
      speed: 1,
      locale: "en",
      sound: false,
      reducedMotion: false,
      windows: [],
      zTop: 20,
      activeApp: null,
      minigame: null,
      toasts: [],
      island: [],
      seenTutorials: [],
      spotlight: null,

      start: (options) => {
        const game = newGame(options);
        set({
          game,
          booted: true,
          windows: [initialWindow("dashboard", 0, 21)],
          zTop: 21,
          activeApp: "dashboard",
          speed: 1,
          minigame: null,
          toasts: [],
          island: [],
          seenTutorials: [],
          spotlight: { id: "welcome", step: 0 },
        });
      },

      setBooted: (value) => set({ booted: value }),

      tick: () => {
        const { game, speed, pushToast, pushIsland } = get();
        if (!game || speed === 0 || game.ending) return;
        let next = advanceDay(game);
        const fresh = checkAchievements(next, new Set(next.achievements));
        if (fresh.length > 0) {
          next = { ...next, achievements: [...next.achievements, ...fresh] };
          for (const id of fresh) {
            const meta = ACHIEVEMENTS.find((entry) => entry.id === id);
            if (meta) pushToast({ title: meta.name, body: meta.desc, tone: "success" });
          }
        }
        if (next.events.pending) {
          pushIsland({
            title: "Something needs a decision",
            body: "Open the Dashboard to respond. The clock is still running.",
            tone: "neutral",
            action: "event",
          });
        }
        if (next.day % 7 === 0) {
          pushToast({ title: `Week ${Math.floor(next.day / 7)} report`, body: "Numbers moved. Open the Dashboard.", tone: "info" });
        }
        const changed = next.history.at(-1);
        if (changed && next.day % 7 === 0 && changed.quality > 0) {
          pushIsland({
            title: `Week ${Math.floor(next.day / 7)}`,
            body: `${Math.round(next.kpis.users).toLocaleString("en-US")} users · $${Math.round(next.kpis.mrr).toLocaleString("en-US")} MRR`,
            tone: changed.mrr > (game.kpis.mrr ?? 0) ? "good" : "bad",
            action: "weekly",
          });
        }
        set({ game: next, speed: next.ending ? 0 : get().speed });
      },

      act: (command) => {
        const { game } = get();
        if (!game) return;
        let next = dispatchCommand(game, command);
        const fresh = checkAchievements(next, new Set(next.achievements));
        if (fresh.length > 0) {
          next = { ...next, achievements: [...next.achievements, ...fresh] };
          for (const id of fresh) {
            const meta = ACHIEVEMENTS.find((entry) => entry.id === id);
            if (meta) get().pushToast({ title: meta.name, body: meta.desc, tone: "success" });
          }
        }
        set({ game: next });
      },

      setSpeed: (speed) => set({ speed }),

      openApp: (app) => {
        const { windows, zTop } = get();
        const existing = windows.find((entry) => entry.app === app);
        if (existing) {
          set({
            windows: windows.map((entry) =>
              entry.app === app ? { ...entry, minimized: false, z: zTop + 1 } : entry,
            ),
            zTop: zTop + 1,
            activeApp: app,
          });
          return;
        }
        const z = zTop + 1;
        set({
          windows: [...windows, initialWindow(app, windows.length, z)],
          zTop: z,
          activeApp: app,
        });
        const seen = get().game?.tutorials.seen ?? [];
        if (!seen.includes(`tour:${app}`)) {
          get().openSpotlight(`tour:${app}`);
        }
      },

      closeApp: (app) => {
        const windows = get().windows.filter((entry) => entry.app !== app);
        const top = [...windows].sort((a, b) => b.z - a.z)[0];
        set({ windows, activeApp: top?.app ?? null });
      },

      focusApp: (app) => {
        const { windows, zTop } = get();
        set({
          windows: windows.map((entry) => (entry.app === app ? { ...entry, z: zTop + 1, minimized: false } : entry)),
          zTop: zTop + 1,
          activeApp: app,
        });
      },

      minimizeApp: (app) => {
        set({
          windows: get().windows.map((entry) => (entry.app === app ? { ...entry, minimized: true } : entry)),
          activeApp: null,
        });
      },

      maximizeApp: (app) => {
        set({
          windows: get().windows.map((entry) =>
            entry.app === app ? { ...entry, maximized: !entry.maximized, snapped: null } : entry,
          ),
        });
      },

      snapApp: (app, side) => {
        set({
          windows: get().windows.map((entry) => (entry.app === app ? { ...entry, snapped: side, maximized: false } : entry)),
        });
      },

      moveWindow: (app, x, y) => {
        set({ windows: get().windows.map((entry) => (entry.app === app ? { ...entry, x, y, snapped: null } : entry)) });
      },

      resizeWindow: (app, w, h) => {
        set({
          windows: get().windows.map((entry) =>
            entry.app === app ? { ...entry, w: Math.max(360, w), h: Math.max(280, h) } : entry,
          ),
        });
      },

      startMinigame: (session) => set({ minigame: session, spotlight: null }),

      finishMinigame: (rawScore, skipped) => {
        const { game, minigame, pushToast } = get();
        if (!game || !minigame) return;
        const score = clamp(Math.round(rawScore), 0, 100);
        const grade = gradeOf(score);
        let next: GameState = game;
        if (minigame.stage && minigame.modelId) {
          next = dispatchCommand(game, {
            type: "stage-result",
            modelId: minigame.modelId,
            stage: minigame.stage,
            score,
            skipped,
          });
        } else {
          next = applyEffects(game, {
            hype: (score - 65) * 0.05,
            devRep: (score - 65) * 0.035,
            cash: skipped ? 0 : -(CONFIG_RETRY),
          });
          next.minigames.played += 1;
        }
        const best = next.minigames.best[minigame.id] ?? 0;
        next.minigames.best = { ...next.minigames.best, [minigame.id]: Math.max(best, score) };
        const fresh = checkAchievements(next, new Set(next.achievements));
        if (fresh.length > 0) {
          next = { ...next, achievements: [...next.achievements, ...fresh] };
          for (const id of fresh) {
            const meta = ACHIEVEMENTS.find((entry) => entry.id === id);
            if (meta) pushToast({ title: meta.name, body: meta.desc, tone: "success" });
          }
        }
        set({ game: next, minigame: null });
        pushToast({
          title: `${grade.toUpperCase()} · ${score}`,
          body: skipped ? "Skipped. Average result, slightly cheaper." : "Result stamped into the pipeline.",
          tone: grade === "bronze" ? "warning" : "success",
        });
      },

      cancelMinigame: () => set({ minigame: null }),

      pushToast: (toast) => {
        toastCounter += 1;
        const id = `toast-${toastCounter}-${Date.now()}`;
        set({ toasts: [...get().toasts, { ...toast, id }].slice(-4) });
        window.setTimeout(() => get().dismissToast(id), 6200);
      },

      dismissToast: (id) => set({ toasts: get().toasts.filter((toast) => toast.id !== id) }),

      pushIsland: (item) => {
        toastCounter += 1;
        set({ island: [{ ...item, id: `island-${toastCounter}` }, ...get().island].slice(0, 3) });
      },

      dismissIsland: (id) => set({ island: get().island.filter((item) => item.id !== id) }),

      setLocale: (locale) => set({ locale }),
      setSound: (value) => set({ sound: value }),
      setReducedMotion: (value) => set({ reducedMotion: value }),

      markSeen: (id) => {
        const { game } = get();
        if (!game) return;
        if (game.tutorials.seen.includes(id)) return;
        set({
          game: { ...game, tutorials: { ...game.tutorials, seen: [...game.tutorials.seen, id] } },
          seenTutorials: [...get().seenTutorials, id],
        });
      },

      openSpotlight: (id) => {
        const { seenTutorials, markSeen } = get();
        const seen = get().game?.tutorials.seen ?? [];
        if (seen.includes(id) || seenTutorials.includes(id)) return;
        markSeen(id);
        set({ spotlight: { id, step: 0 } });
      },
      closeSpotlight: () => set({ spotlight: null }),
      setSpotlightStep: (step) => {
        const current = get().spotlight;
        if (!current) return;
        set({ spotlight: { ...current, step } });
      },

      exportSave: () => {
        const game = get().game;
        if (!game) return "";
        get().markSeen("save-exported");
        return JSON.stringify(game, null, 2);
      },

      importSave: (json) => {
        try {
          const parsed = JSON.parse(json) as GameState;
          if (!parsed || typeof parsed.day !== "number" || !parsed.company || !parsed.res) {
            return { ok: false, error: "That does not look like a Model City save." };
          }
          const migrated: GameState = { ...newGamePlaceholder(), ...parsed, version: 3 };
          set({ game: migrated, booted: true, speed: 1, windows: [initialWindow("dashboard", 0, 21)], activeApp: "dashboard" });
          return { ok: true };
        } catch {
          return { ok: false, error: "Could not parse that JSON." };
        }
      },

      reset: () =>
        set({
          game: null,
          booted: false,
          windows: [],
          minigame: null,
          toasts: [],
          island: [],
          spotlight: null,
          activeApp: null,
          speed: 1,
        }),

      clearEvent: () => {
        const { game } = get();
        if (!game) return;
        set({ game: { ...game, events: { ...game.events, pending: null } } });
      },
    }),
    {
      name: "model-city-save-v3",
      version: 3,
      merge: (persisted, current) => {
        const incoming = (persisted ?? {}) as Partial<GameStore>;
        return {
          ...current,
          game: incoming.game ?? current.game,
          locale: incoming.locale ?? current.locale,
          sound: incoming.sound ?? current.sound,
          reducedMotion: incoming.reducedMotion ?? current.reducedMotion,
          windows: incoming.windows ?? [],
          activeApp: incoming.activeApp ?? null,
          zTop: incoming.zTop ?? 20,
          minigame: null,
          toasts: [],
          island: [],
          spotlight: null,
        };
      },
    },
  ),
);

const CONFIG_RETRY = 1_800;

/** Used only when importing a save that predates a field. */
function newGamePlaceholder(): GameState {
  return newGame({
    seed: "IMPORT",
    difficulty: "normal",
    founderName: "Founder",
    background: "hacker",
    companyName: "Imported Co",
    tagline: "Imported from a previous timeline",
    hq: "lisbon",
    vertical: "chat",
    logo: {
      symbol: "◆",
      mask: "none",
      colors: ["#FF5A1F", "#17150F", "#F7F3EA"],
      font: "display",
      layout: "horizontal",
      wordmark: "IMPORTED",
    },
  });
}

export function appExists(app: string): app is AppId {
  return DOCK_ORDER.includes(app as AppId);
}
