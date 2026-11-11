"use client";

import { SkipForward, X, Zap } from "lucide-react";
import { useGame } from "@/store/game";
import { Architecture, BenchmarkGauntlet, DataSorting, PromptCraft, RedTeam, TrainingRun } from "./games-core";
import { DebugSprint, HiringMatch, KeynoteDemo, LaunchDay, PitchDeck, PRCrisis } from "./games-biz";
import type { MinigameId } from "@/lib/sim/types";
import type { MinigameProps } from "./shell";

const GAMES: Record<MinigameId, (props: MinigameProps) => React.ReactElement> = {
  "data-sorting": DataSorting,
  architecture: Architecture,
  "training-run": TrainingRun,
  "benchmark-gauntlet": BenchmarkGauntlet,
  "red-team": RedTeam,
  "prompt-craft": PromptCraft,
  "launch-day": LaunchDay,
  "debug-sprint": DebugSprint,
  "hiring-match": HiringMatch,
  "pitch-deck": PitchDeck,
  "keynote-demo": KeynoteDemo,
  "pr-crisis": PRCrisis,
};

export function MinigameOverlay() {
  const session = useGame((state) => state.minigame);
  const finish = useGame((state) => state.finishMinigame);
  const cancel = useGame((state) => state.cancelMinigame);
  if (!session) return null;
  const Game = GAMES[session.id];
  if (!Game) return null;

  return (
    <div className="fixed inset-0 z-[92] flex items-center justify-center bg-ink/55 p-2 sm:p-4" role="dialog" aria-modal="true" aria-label={session.purpose}>
      <div className="window-shell flex w-full max-w-2xl flex-col">
        <header className="flex items-center gap-2 border-b-2 border-line bg-surface px-2 py-1.5">
          <Zap className="size-3.5 text-signal" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[10px] tracking-[0.14em] uppercase">{session.purpose}</p>
            <p className="truncate font-mono text-[9px] text-ink-muted">skill check · {session.id}</p>
          </div>
          <button
            type="button"
            onClick={() => finish(70, true)}
            className="flex items-center gap-1 border border-line bg-paper px-1.5 py-0.5 font-mono text-[9px] tracking-wider uppercase"
          >
            <SkipForward className="size-3" /> skip
          </button>
          <button type="button" onClick={cancel} aria-label="Close minigame" className="grid size-5 place-items-center border border-line bg-paper">
            <X className="size-3" />
          </button>
        </header>
        <div className="h-[min(76vh,600px)] min-h-0">
          <Game onFinish={(score) => finish(score, false)} />
        </div>
        <footer className="border-t-2 border-line bg-paper px-2 py-1 font-mono text-[9px] text-ink-muted">
          Skipping is honest mediocrity: average result, small cash saving, no retry.
        </footer>
      </div>
    </div>
  );
}
