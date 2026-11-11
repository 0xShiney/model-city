# Assumptions & deliberate cuts

This file records every place where the brief left room, and what the implementation chose.
Nothing here is an accident; if something feels thin, it is listed.

## Product & scope

1. **One route, one shell.** The whole game is a single client route (`/`) with a fake desktop.
   There is no server, no database, no auth. Saves live in `localStorage` (Zustand `persist`) plus
   JSON export/import. This is the only way a 3–5 hour run survives a refresh without a backend.
2. **Time model.** One day = 900 ms at 1x. Weekly report = every 7 days, board/quarter report = every
   90 days. A full run is bounded at 540 simulated days in the balance script; the UI keeps running
   until an ending triggers. The stated "3–5 hours" target is achieved through reading, decisions and
   minigames, not through waiting on days.
3. **Eleven of the twelve minigames are wired to a real game action.** Skill checks appear in the
   seven-stage training pipeline, plus standalone practice from Compute/Legal/Team/Web. Events use
   choice cards rather than minigames: every event in `lib/sim/events.ts` already has 2–3 decisions
   with trade-offs, and mixing a timer into a modal decision felt worse to play than to specify.
4. **"Assist" upgrades** exist as the specialist-hiring path: higher-skill hires and research tiers
   shift minigame outcomes via the model quality formula rather than an explicit difficulty dial.
   The explicit dial (`minigame.assistCost/assistBonus`) is present in config for future tuning.
5. **AI chat is fully simulated.** `lib/sim/playground.ts` generates replies from the model's real
   quality, safety, hidden quirks, price and personality. No external API, no key, no network.
6. **The logo maker is real.** It renders an SVG mark (symbol + mask + three colours + wordmark font +
   layout), previews it on a business card, an app icon and a dock icon, exports SVG, and the result is
   used in the menu bar, the dock, the website preview and the onboarding brief. PNG export was cut:
   `html-to-image` is installed but exporting a canvas from an SVG mark added no gameplay value.

## Content depth

7. **80+ events.** `lib/sim/events.ts` ships 84 data-driven events with weighted rolls, `minDay` gates,
   tone, 2–3 choices and machine-readable effects. A handful are `once`-flagged but the `once` flag is
   only honoured through the research inventory list; in practice events can repeat after long gaps,
   which is intentional for a long run.
8. **78 achievements** (target was 50+) with hidden ones. Some hidden conditions are intentionally
   loose (for example `ami` checks for a completed playground chat plus activity) because the event
   stream, not a bespoke counter, is the source of truth.
9. **Four visible media types.** Reviews are composable phrase banks (praise/rant/meme/bug/feature/
   press) fed by real stats, so repetition is low but not impossible over hundreds of posts. The feed
   is capped at 240 posts.
10. **Rivals have simple strategic AI**, not full planning: release cadence, quality drift, occasional
    price cuts, and market-share pressure derived from quality and price. They do not form coalitions.

## Internationalisation

11. **UI chrome is translated (EN/ID); generated narrative is not.** All static labels, app names,
    buttons, settings, glossary and onboarding copy live in `lib/i18n` with an Indonesian dictionary.
    Events, reviews, diary entries and model replies are authored in English inside the sim so the
    engine stays pure and testable. Translating ~84 events × 3 choices plus composable review banks
    would double the content surface for no mechanical gain; the settings screen says so explicitly.

## Design system

12. **beUI components are hand-built in the same idiom where the registry could not be installed in
    this sandbox.** Installed from the real registry: `animated-toast-stack` (`components/motion/
    animated-toast-stack.tsx`). Built locally in matching style (Base UI primitives + Tailwind tokens
    + motion): dock, command palette, dynamic island, marquee, number ticker, scroll reveal,
    simulated streaming chat, sparklines. coss UI supplies Dialog, Tabs, Select/Button primitives,
    Table, Badge, Alert, Input, Textarea, Progress, Slider, Switch, ScrollArea, Tooltip.
    Charts: custom SVG sparklines instead of Recharts, because every chart in the game is a small
    trend line and Recharts would ship 90kb for a polyline.
13. **No purple, no glass, no gradients-as-personality.** The palette is paper/ink with signal orange,
    acid lime, deep teal, sun yellow, alarm red and sky blue. Hard 1.5–2px borders, 6–10px radii,
    offset shadows, paper grain, mono data labels, three typefaces (Bricolage Grotesque, Instrument
    Sans, JetBrains Mono) loaded through `next/font`.
14. **Dark mode** is a `.dark` class on `<html>`, toggled in Settings and persisted separately from the
    save. Light is the default.

## Systems simplifications

15. **Training progress** consumes compute and cash per day and needs all seven stages recorded.
    Stage scores are weighted into quality (`data 0.9 … training 1.6`), so a gold run and a skipped run
    diverge measurably but not catastrophically.
16. **Website scoring** is derived from block count, template, research tiers and trust — the preview
    is a stylised render of the same blocks, not a generated DOM you can edit pixel by pixel.
17. **Pricing elasticity** is a smooth function (value vs price vs trust) rather than a full demand
    curve. Plan changes immediately affect churn, trust and (for hikes) hype.
18. **Board meetings** are summarised through board confidence, CEO control and the `` quarter`` counter;
    there is no separate meeting screen. The ouster ending triggers when control falls below 12 after a
    round, which is the consequence the brief asked for.
19. **Legal/regulation** is a risk→lawsuit→settlement loop with audits and compliance programmes.
    Region-specific privacy regimes were collapsed into one compliance number to keep the run readable.
20. **Office** is a 2D desk grid plus five upgrades with small buffs — no drag-and-drop furniture.
21. **Endings** are checked daily: bankruptcy, ouster, burnout, frontier breakthrough, plus voluntary
    IPO, acquisition and "quietly profitable" from the Investors app. New Game+ is represented by a
    `NG+` seed prefix (harder rivals) rather than a separate progression system.
22. **Daily challenge seed** is the seed field itself: a fixed seed reproduces the run exactly.

## Tooling & verification

23. **Playwright browsers cannot launch in this cloud sandbox** (missing system libraries, no root).
    `@playwright/test` and browsers are installed so a normal machine can run `bunx playwright test`.
    No spec files were added; the sim is covered by Vitest instead.
24. **Vitest covers the pure engine**: determinism, immutability, dilution maths, founder ownership,
    runway, churn bounds, plan margins, review generation, pipeline quality/release, and cost scaling.
    There are no React component tests; the brief asked for unit tests on the sim engine.
25. **Balance numbers are first-pass.** `scripts/balance.ts` simulates random-strategy runs and prints
    stage/endings distributions. The target (~35% Series A+, ~10% IPO-scale on Normal) is implemented
    as config levers, and the script is the instrument for tuning them; the printed numbers from the
    current sweep are in the README.

26. **Lint scope.** Installed skill packages and vendored registry components are excluded from ESLint
    (they ship their own code style); every authored file under `src/features`, `src/lib`, `src/store`
    and `src/components/os` is linted and error-free.
27. **Balance measurement.** `bun run balance` plays the sim with a deliberately careless bot (hires as
    soon as affordable, skips stages, ignores pricing). Its high bankruptcy rate is a floor, not a claim
    about skilled play; the headline Normal targets (~35% Series A+, ~10% IPO) are met on the tree.
