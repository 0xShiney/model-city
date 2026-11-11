"use client";

import { ArrowLeft, ArrowRight, Check, Dice5, Download, Sparkle } from "lucide-react";
import { useMemo, useState } from "react";
import { useGame } from "@/store/game";
import { useT } from "@/lib/i18n";
import { BACKGROUNDS, CITIES, COMPANY_A, COMPANY_B, NAME_GENERATOR_REJECTS, TAGLINE_CLOSERS, TAGLINE_OPENERS } from "@/lib/sim/world";
import { VERTICALS } from "@/lib/sim/config";
import type { BackgroundId, CityId, Difficulty, LogoSpec, VerticalId } from "@/lib/sim/types";
import { cn } from "@/lib/utils";
import { randomSeed } from "@/lib/sim/rng";

const SYMBOLS = ["◆", "●", "▲", "■", "✦", "✷", "◈", "⬢", "◐", "⬟", "⌬", "≡"];
const PALETTE = ["#FF5A1F", "#C6F432", "#0F5C54", "#FFC93C", "#E5352B", "#3FA7D6", "#17150F", "#F7F3EA"];
const FONTS: { id: LogoSpec["font"]; label: string; className: string }[] = [
  { id: "display", label: "Bricolage", className: "font-display" },
  { id: "sans", label: "Instrument", className: "font-sans" },
  { id: "mono", label: "JetBrains", className: "font-mono" },
];
const DIFFICULTIES: { id: Difficulty; name: string; blurb: string }[] = [
  { id: "chill", name: "Chill", blurb: "Forgiving economy, softer rivals. For people who like their sims pleasant." },
  { id: "normal", name: "Normal", blurb: "The intended run. Roughly a third of runs reach Series A." },
  { id: "brutal", name: "Brutal", blurb: "Events bite, rivals move, investors remember. Bring a spreadsheet." },
  { id: "sandbox", name: "Sandbox", blurb: "Money is fake, nothing hurts. Build the lab you want." },
];

const STEPS = ["Founder", "Company", "Logo", "Setup"] as const;

export function Onboarding() {
  const t = useT();
  const start = useGame((state) => state.start);
  const [step, setStep] = useState(0);
  const [founderName, setFounderName] = useState("Ada Kovač");
  const [background, setBackground] = useState<BackgroundId>("researcher");
  const [companyName, setCompanyName] = useState("Basalt Labs");
  const [tagline, setTagline] = useState("Intelligence that actually ships");
  const [hq, setHq] = useState<CityId>("lisbon");
  const [vertical, setVertical] = useState<VerticalId>("chat");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [seed, setSeed] = useState(() => randomSeed());
  const [checks, setChecks] = useState<string[]>([]);
  const [logo, setLogo] = useState<LogoSpec>({
    symbol: "◆",
    mask: "none",
    colors: ["#FF5A1F", "#17150F", "#F7F3EA"],
    font: "display",
    layout: "horizontal",
    wordmark: "BASALT",
  });

  const canContinue = useMemo(() => {
    if (step === 0) return founderName.trim().length > 1;
    if (step === 1) return companyName.trim().length > 1;
    if (step === 2) return logo.symbol.length > 0;
    return seed.trim().length > 0;
  }, [step, founderName, companyName, logo.symbol, seed]);

  const generateName = () => {
    const name = `${COMPANY_A[Math.floor(Math.random() * COMPANY_A.length)]} ${COMPANY_B[Math.floor(Math.random() * COMPANY_B.length)]}`;
    setCompanyName(name);
    setLogo((current) => ({ ...current, wordmark: name.split(" ")[0]?.toUpperCase() ?? "LAB" }));
    setChecks([]);
  };

  const checkName = () => {
    const pool = [
      `“${companyName}” is available. Suspiciously available.`,
      ...NAME_GENERATOR_REJECTS.slice(0, 2).map((reason) => `Trademark check: ${reason}.`),
    ];
    setChecks([pool[Math.floor(Math.random() * pool.length)] ?? pool[0]!]);
  };

  const generateTagline = () => {
    setTagline(
      `${TAGLINE_OPENERS[Math.floor(Math.random() * TAGLINE_OPENERS.length)]} ${TAGLINE_CLOSERS[Math.floor(Math.random() * TAGLINE_CLOSERS.length)]}`,
    );
  };

  const finish = () => {
    start({
      seed: seed.trim(),
      difficulty,
      founderName,
      background,
      companyName,
      tagline,
      hq,
      vertical,
      logo: { ...logo, wordmark: companyName.split(" ")[0]?.toUpperCase() ?? logo.wordmark },
    });
  };

  return (
    <main className="relative min-h-dvh bg-paper">
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between border-b-2 border-line pb-3">
          <div>
            <p className="label-mono">Model City · founding documents</p>
            <h1 className="font-display text-2xl leading-none sm:text-3xl">Start a company you will regret</h1>
          </div>
          <div className="hidden items-center gap-1 sm:flex">
            {STEPS.map((label, index) => (
              <span
                key={label}
                className={cn(
                  "border border-line px-2 py-1 font-mono text-[10px] tracking-widest uppercase",
                  index === step ? "bg-ink text-paper" : index < step ? "bg-acid/40" : "bg-paper text-ink-muted",
                )}
              >
                {index + 1}. {label}
              </span>
            ))}
          </div>
        </header>

        <div className="grid flex-1 gap-6 py-6 lg:grid-cols-[1fr_320px]">
          <section className="min-w-0">
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl">{t("onboard.founder")}</h2>
                <label className="block">
                  <span className="label-mono">{t("onboard.founderName")}</span>
                  <input
                    value={founderName}
                    onChange={(event) => setFounderName(event.target.value)}
                    className="mt-1 w-full border-2 border-line bg-surface px-2 py-1.5 font-display text-lg outline-none focus:bg-paper"
                  />
                </label>
                <div>
                  <span className="label-mono">{t("onboard.background")}</span>
                  <div className="mt-1 grid gap-2 sm:grid-cols-2">
                    {(Object.keys(BACKGROUNDS) as BackgroundId[]).map((id) => {
                      const item = BACKGROUNDS[id];
                      const active = background === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setBackground(id)}
                          className={cn(
                            "border-2 border-line p-2.5 text-left transition-transform hover:-translate-y-0.5",
                            active ? "bg-ink text-paper" : "bg-surface",
                          )}
                        >
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-display text-sm font-semibold">{item.name}</span>
                            {active && <Check className="size-3.5 text-acid" />}
                          </span>
                          <span className={cn("mt-1 block text-xs", active ? "text-paper/70" : "text-ink-muted")}>{item.blurb}</span>
                          <span className={cn("mt-1.5 block font-mono text-[10px]", active ? "text-acid" : "text-teal")}>{item.trait}</span>
                          <span className={cn("block font-mono text-[10px]", active ? "text-sun" : "text-signal")}>{item.flaw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl">{t("onboard.company")}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="label-mono">{t("onboard.companyName")}</span>
                    <div className="mt-1 flex gap-1">
                      <input
                        value={companyName}
                        onChange={(event) => {
                          setCompanyName(event.target.value);
                          setChecks([]);
                        }}
                        className="w-full border-2 border-line bg-surface px-2 py-1.5 font-display text-lg outline-none"
                      />
                      <button type="button" onClick={generateName} aria-label={t("onboard.generate")} className="border-2 border-line bg-paper px-2">
                        <Dice5 className="size-4" />
                      </button>
                    </div>
                  </label>
                  <label className="block">
                    <span className="label-mono">{t("onboard.tagline")}</span>
                    <div className="mt-1 flex gap-1">
                      <input
                        value={tagline}
                        onChange={(event) => setTagline(event.target.value)}
                        className="w-full border-2 border-line bg-surface px-2 py-1.5 text-sm outline-none"
                      />
                      <button type="button" onClick={generateTagline} aria-label={t("onboard.generate")} className="border-2 border-line bg-paper px-2">
                        <Sparkle className="size-4" />
                      </button>
                    </div>
                  </label>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={checkName} className="border border-line bg-paper px-2 py-1 font-mono text-[10px] tracking-widest uppercase">
                    {t("onboard.check")}
                  </button>
                  {checks.map((check) => (
                    <span key={check} className="font-mono text-[10px] text-ink-muted">
                      {check}
                    </span>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="label-mono">{t("onboard.hq")}</span>
                    <div className="mt-1 space-y-1">
                      {(Object.keys(CITIES) as CityId[]).map((id) => {
                        const city = CITIES[id];
                        const active = hq === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setHq(id)}
                            className={cn("flex w-full items-center gap-2 border px-2 py-1 text-left text-xs", active ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                          >
                            <span className="font-semibold">{city.name}</span>
                            <span className={cn("truncate text-[10px]", active ? "text-paper/60" : "text-ink-muted")}>{city.blurb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <span className="label-mono">{t("onboard.vertical")}</span>
                    <div className="mt-1 grid gap-1">
                      {(Object.keys(VERTICALS) as VerticalId[]).map((id) => {
                        const item = VERTICALS[id];
                        const active = vertical === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setVertical(id)}
                            className={cn("border px-2 py-1 text-left", active ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                          >
                            <span className="text-xs font-semibold">{item.name}</span>
                            <span className={cn("block text-[10px]", active ? "text-paper/60" : "text-ink-muted")}>{item.blurb}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && <LogoMaker logo={logo} setLogo={setLogo} companyName={companyName} />}

            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl">{t("onboard.difficulty")} &amp; {t("onboard.seed")}</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {DIFFICULTIES.map((item) => {
                    const active = difficulty === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setDifficulty(item.id)}
                        className={cn("border-2 border-line p-2.5 text-left", active ? "bg-ink text-paper" : "bg-surface")}
                      >
                        <span className="font-display text-sm font-semibold">{item.name}</span>
                        <span className={cn("mt-0.5 block text-xs", active ? "text-paper/70" : "text-ink-muted")}>{item.blurb}</span>
                      </button>
                    );
                  })}
                </div>
                <label className="block">
                  <span className="label-mono">{t("onboard.seed")}</span>
                  <div className="mt-1 flex gap-1">
                    <input
                      value={seed}
                      onChange={(event) => setSeed(event.target.value.toUpperCase())}
                      className="w-full border-2 border-line bg-surface px-2 py-1.5 font-mono text-sm outline-none"
                    />
                    <button type="button" onClick={() => setSeed(randomSeed())} className="border-2 border-line bg-paper px-2" aria-label="Random seed">
                      <Dice5 className="size-4" />
                    </button>
                  </div>
                  <span className="mt-1 block font-mono text-[10px] text-ink-muted">
                    Same seed + same decisions = same run. The daily challenge mode uses a fixed seed.
                  </span>
                </label>
                <div className="paper-card p-3">
                  <p className="label-mono">Founding brief</p>
                  <p className="mt-1 font-display text-lg">{companyName}</p>
                  <p className="text-sm text-ink-muted">{tagline}</p>
                  <p className="mt-1 font-mono text-[10px] text-ink-muted">
                    {founderName} · {BACKGROUNDS[background].name} · {CITIES[hq].name} · {VERTICALS[vertical].name} · {difficulty}
                  </p>
                </div>
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            <div className="paper-card sticky top-6 p-3">
              <p className="label-mono">Preview</p>
              <div className="mt-2 flex items-center gap-2">
                <LogoPreview logo={logo} size={44} />
                <div className="min-w-0">
                  <p className="truncate font-display text-lg leading-tight">{companyName || "Untitled Co"}</p>
                  <p className="truncate text-xs text-ink-muted">{tagline}</p>
                </div>
              </div>
              <div className="mt-3 space-y-1 border-t border-line/30 pt-2 font-mono text-[10px] text-ink-muted">
                <p>day 0 · $0 MRR · 0 users</p>
                <p>garage · 1 founder · 1 GPU</p>
                <p>seed {seed}</p>
              </div>
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between border-t-2 border-line pt-3">
          <button
            type="button"
            onClick={() => setStep((value) => Math.max(0, value - 1))}
            disabled={step === 0}
            className="flex items-center gap-1 border border-line px-3 py-1.5 text-xs disabled:opacity-40"
          >
            <ArrowLeft className="size-3.5" /> {t("onboard.back")}
          </button>
          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((value) => Math.min(3, value + 1))}
              disabled={!canContinue}
              className="flex items-center gap-1 border border-line bg-signal px-4 py-1.5 text-xs font-semibold text-white hard-shadow-sm disabled:opacity-40"
            >
              {t("onboard.next")} <ArrowRight className="size-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={finish}
              className="flex items-center gap-1 border border-line bg-acid px-4 py-1.5 text-xs font-semibold text-ink hard-shadow-sm"
            >
              {t("onboard.finish")} <ArrowRight className="size-3.5" />
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}

function maskRadius(mask: LogoSpec["mask"]): string {
  if (mask === "circle") return "999px";
  if (mask === "squircle") return "30%";
  if (mask === "hex") return "18%";
  return "3px";
}

export function LogoPreview({ logo, size = 48, showWordmark = false }: { logo: LogoSpec; size?: number; showWordmark?: boolean }) {
  const font = logo.font === "display" ? "font-display" : logo.font === "mono" ? "font-mono" : "font-sans";
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn("grid shrink-0 place-items-center border-2 border-line", font)}
        style={{
          width: size,
          height: size,
          background: logo.colors[0],
          color: logo.colors[2],
          borderRadius: maskRadius(logo.mask),
          fontSize: size * 0.5,
          lineHeight: 1,
        }}
        aria-hidden
      >
        {logo.symbol}
      </span>
      {showWordmark && (
        <span className={cn("font-bold tracking-tight", font)} style={{ color: logo.colors[1], fontSize: size * 0.42 }}>
          {logo.wordmark}
        </span>
      )}
    </span>
  );
}

function LogoMaker({
  logo,
  setLogo,
  companyName,
}: {
  logo: LogoSpec;
  setLogo: (logo: LogoSpec) => void;
  companyName: string;
}) {
  const t = useT();
  const update = (patch: Partial<LogoSpec>) => setLogo({ ...logo, ...patch });

  const exportSvg = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${logo.colors[0]}" rx="${logo.mask === "circle" ? 256 : 72}"/>
  <text x="256" y="330" font-family="system-ui, sans-serif" font-size="240" text-anchor="middle" fill="${logo.colors[2]}">${logo.symbol}</text>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(companyName || "logo").toLowerCase().replace(/\s+/g, "-")}-logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl">{t("onboard.logo")}</h2>
        <button type="button" onClick={exportSvg} className="flex items-center gap-1 border border-line bg-paper px-2 py-1 font-mono text-[10px] tracking-widest uppercase">
          <Download className="size-3" /> {t("logo.export")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <div>
            <span className="label-mono">{t("logo.symbol")}</span>
            <div className="mt-1 grid grid-cols-6 gap-1">
              {SYMBOLS.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => update({ symbol })}
                  className={cn("grid h-8 place-items-center border", logo.symbol === symbol ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                  aria-label={`Symbol ${symbol}`}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label-mono">{t("logo.mask")}</span>
            <div className="mt-1 flex gap-1">
              {(["none", "circle", "squircle", "hex"] as const).map((mask) => (
                <button
                  key={mask}
                  type="button"
                  onClick={() => update({ mask })}
                  className={cn("border px-2 py-1 font-mono text-[10px] uppercase", logo.mask === mask ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                >
                  {mask}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="label-mono">{t("logo.colors")}</span>
            <div className="mt-1 space-y-1">
              {[0, 1, 2].map((slot) => (
                <div key={slot} className="flex items-center gap-1">
                  <span className="w-14 font-mono text-[10px] text-ink-muted">{["mark", "ink", "glyph"][slot]}</span>
                  {PALETTE.map((color) => (
                    <button
                      key={`${slot}-${color}`}
                      type="button"
                      onClick={() => {
                        const colors = [...logo.colors] as [string, string, string];
                        colors[slot] = color;
                        update({ colors });
                      }}
                      style={{ background: color }}
                      className={cn("size-4 border", logo.colors[slot] === color ? "border-line ring-1 ring-signal" : "border-line/40")}
                      aria-label={`Colour ${color}`}
                    />
                  ))}
                  <input
                    value={logo.colors[slot]}
                    onChange={(event) => {
                      const colors = [...logo.colors] as [string, string, string];
                      colors[slot] = event.target.value;
                      update({ colors });
                    }}
                    className="w-16 border border-line/40 bg-surface px-1 font-mono text-[9px]"
                    aria-label={`Custom hex ${slot}`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="label-mono">{t("logo.font")}</span>
              <div className="mt-1 flex gap-1">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => update({ font: font.id })}
                    className={cn("border px-1.5 py-0.5 text-[10px]", logo.font === font.id ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                  >
                    <span className={font.className}>{font.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label-mono">{t("logo.layout")}</span>
              <div className="mt-1 flex gap-1">
                {(["horizontal", "stacked"] as const).map((layout) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => update({ layout })}
                    className={cn("border px-1.5 py-0.5 text-[10px] uppercase", logo.layout === layout ? "border-line bg-ink text-paper" : "border-line/40 bg-surface")}
                  >
                    {layout}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="paper-card p-3">
            <p className="label-mono">{t("logo.preview")} · business card</p>
            <div className="mt-2 border border-line bg-surface p-3">
              <div className={cn("flex items-center gap-2", logo.layout === "stacked" && "flex-col items-start")}>
                <LogoPreview logo={logo} size={40} />
                <div>
                  <p className={cn("text-sm font-bold", logo.font === "display" ? "font-display" : logo.font === "mono" ? "font-mono" : "font-sans")} style={{ color: logo.colors[1] }}>
                    {logo.wordmark}
                  </p>
                  <p className="font-mono text-[9px] text-ink-muted">{companyName}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-center">
              <div className="grid size-14 place-items-center border border-line bg-paper" style={{ borderRadius: maskRadius(logo.mask) }}>
                <LogoPreview logo={logo} size={44} />
              </div>
              <p className="mt-1 font-mono text-[9px] text-ink-muted">app icon</p>
            </div>
            <div className="text-center">
              <div className="grid size-10 place-items-center border border-line bg-paper">
                <LogoPreview logo={logo} size={28} />
              </div>
              <p className="mt-1 font-mono text-[9px] text-ink-muted">dock</p>
            </div>
            <label className="flex-1">
              <span className="label-mono">wordmark</span>
              <input
                value={logo.wordmark}
                onChange={(event) => update({ wordmark: event.target.value.toUpperCase() })}
                className="mt-1 w-full border border-line bg-surface px-1.5 py-1 font-mono text-xs"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
