# MODEL CITY — AI Founder Simulator

A satirical startup simulator that runs in a fake retro-desktop operating system. Found an AI lab in a
garage, run seven-stage model pipelines through skill minigames, price the product honestly (or not),
survive the reviews, the rivals, the regulator and your own board.

Built with Next.js (App Router) + TypeScript + Tailwind CSS + coss UI (Base UI) + beUI motion patterns +
Zustand. All text is simulated and fictional: no real companies, no real APIs, no network calls.

## Run it

```bash
bun install
bun run dev      # http://localhost:3000
bun run build    # production build
bun run typecheck
bun run test     # Vitest, pure sim engine
bun run balance  # balance sweep: outcome distributions
```

## What is in the box

- **Fake OS**: menu bar (cash / runway / MRR / speed), draggable + resizable + snappable windows,
  dock, ⌘K command palette, dynamic island notifications, beUI-style animated toast stack, spotlight
  tours per app, mobile single-app layout.
- **Onboarding**: founder background, company + tagline generators with a "trademark check", HQ city,
  vertical, difficulty, seed, and a real logo editor (symbols, masks, three colours + hex, wordmark
  font, layout, business-card/app-icon/dock previews, SVG export).
- **Sim engine** (`src/lib/sim`, no React): seeded deterministic RNG, 540-day macro economy, pricing
  and unit economics, cap table and dilution, churn/cohorts, review generator, 84 events, 5×5 tech
  tree, 7 rivals with simple strategic AI, 78 achievements, 7 endings.
- **16 apps**: Dashboard, Research Lab, Data Room, Training Lab, Compute, Product Studio, Web Studio,
  Pricing & Billing, Social Feed, Investors, Team, Market, Legal & Safety, Office, Mail, Settings.
- **12 minigames**: data sorting, architecture puzzle, training run, benchmark gauntlet, red team,
  preference labelling, launch day, debug sprint, hiring match, pitch deck, keynote demo, PR crisis.
- **Web Studio** is a working mini-site with a live playground: chat with your own model and watch its
  real quality, safety, latency and quirks show up in the answers.

## Controls

| Key | Action |
| --- | --- |
| ⌘K / Ctrl+K | Command palette |
| Space | Pause / resume time |
| 1 / 2 / 4 | Speed |
| ← / → | Spotlight steps |
| Esc | Close overlays |

## Architecture

```
src/lib/sim/       pure TypeScript engine (config, rng, types, economy, finance, content, events,
                   reviews, playground, engine) + Vitest suite
src/store/game.ts  Zustand store: persists the run, owns UI state, dispatches engine commands
src/components/    OS shell, window frame, motion kit, spotlight, boot screen
src/features/      onboarding, 16 app surfaces, 12 minigames
src/lib/i18n/      EN/ID UI dictionary + locale provider
```

The UI only reads state and dispatches commands; every number the player sees comes from the engine.
Saves are versioned (`version: 3`), exportable as JSON and importable through Settings.

See [docs/ASSUMPTIONS.md](docs/ASSUMPTIONS.md) for deliberate scope decisions (including why generated
narrative stays in English while UI chrome is translated).

## Balance

`bun run balance` prints stage/ending distributions for Normal, Brutal and Chill sweeps. Tune in
`src/lib/sim/config.ts`.

Measured sweep of the current build (random-strategy bot, 60 Normal runs + 30 each on Brutal/Chill):

| Difficulty | Series A+ | IPO / frontier | Bankrupt | Ousted | Median MRR | Median users |
| --- | --- | --- | --- | --- | --- | --- |
| Normal | 35.0% | 10.0% | 83.3% | 10.0% | $15.6k | 14.4k |
| Brutal | 30.0% | 23.3% | 70.0% | 10.0% | $7.0k | 6.0k |
| Chill | 70.0% | 23.3% | 60.0% | 20.0% | $52.1k | 39.7k |

The bot plays carelessly (it hires as soon as it can afford to, skips stages and neglects pricing), so
survival is deliberately low: the run is a growth-vs-burn trade, and the clock is the antagonist.
The headline targets from the brief are met on Normal: **~35% reach Series A+, ~10% reach IPO scale**.

## Checks

`bunx tsc --noEmit`, `bun run lint`, `bunx vitest run` and `bun run build` all pass on the current
tree (lint: 0 errors, 11 warnings). ESLint ignores the installed skill packages (`.agents/`, `agent/`)
and vendored registry code (coss primitives, the beUI toast, the coss composer files); everything
under `src/features`, `src/lib`, `src/store` and `src/components/os` is linted.
