"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
} from "react";

export type Messages = Record<string, string>;
export type LocaleMessages = Record<string, Partial<Messages>>;

type LocaleContextValue = {
  locale?: string;
  messages: LocaleMessages;
};

const NO_MESSAGES: LocaleMessages = {};

const LocaleContext = createContext<LocaleContextValue>({ messages: NO_MESSAGES });

export function formatNumber(value: number, locale?: string) {
  return locale ? new Intl.NumberFormat(locale).format(value) : String(value);
}

export interface LocaleProviderProps {
  locale: string;
  messages?: LocaleMessages;
  children: ReactNode;
}

export function LocaleProvider({ locale, messages = NO_MESSAGES, children }: LocaleProviderProps) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): { locale?: string } {
  return { locale: useContext(LocaleContext).locale };
}

export function useMessages<T extends Messages>(
  namespace: string,
  defaults: T,
  labels?: Partial<T>,
) {
  const { locale, messages } = useContext(LocaleContext);
  const provided = messages[namespace];
  const labelsKey = labels ? JSON.stringify(labels) : "";
  const stableLabels = useMemo(
    () => (labelsKey ? (JSON.parse(labelsKey) as Partial<T>) : undefined),
    [labelsKey],
  );

  return useCallback(
    (key: keyof T & string, values?: Record<string, string | number>) => {
      const template = stableLabels?.[key] ?? provided?.[key] ?? defaults[key];
      if (!values) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) => {
        const value = values[name];
        if (value === undefined) return match;
        return typeof value === "number" ? formatNumber(value, locale) : value;
      });
    },
    [defaults, stableLabels, locale, provided],
  );
}

/* ------------------------------------------------------------------ */
/* MODEL CITY strings. Every piece of UI chrome the player reads lives */
/* here; generated narrative (reviews, events, diary) is authored in   */
/* English inside the sim content, which is documented in              */
/* docs/ASSUMPTIONS.md.                                                */
/* ------------------------------------------------------------------ */

export type Lang = "en" | "id";

export const EN = {
  "game.title": "Model City",
  "game.subtitle": "AI Founder Simulator",
  "boot.loading": "Booting garage...",
  "boot.tagline": "One GPU. One idea. One suspiciously confident founder.",
  "boot.start": "New game",
  "boot.continue": "Continue save",
  "boot.import": "Import save",
  "boot.version": "Build v0.9 · deterministic seed engine",
  "onboard.founder": "Who are you?",
  "onboard.founderName": "Founder name",
  "onboard.background": "Background",
  "onboard.company": "Name the company",
  "onboard.companyName": "Company name",
  "onboard.tagline": "Tagline",
  "onboard.hq": "HQ city",
  "onboard.vertical": "First vertical",
  "onboard.logo": "Make a logo",
  "onboard.difficulty": "Difficulty",
  "onboard.seed": "Seed",
  "onboard.next": "Continue",
  "onboard.back": "Back",
  "onboard.finish": "Open the garage",
  "onboard.generate": "Generate",
  "onboard.check": "Check availability",
  "onboard.trademark": "Trademark check",
  "logo.symbol": "Symbol",
  "logo.mask": "Shape",
  "logo.colors": "Colours",
  "logo.font": "Wordmark font",
  "logo.layout": "Layout",
  "logo.export": "Export SVG",
  "logo.preview": "Live preview",
  "nav.dock": "Dock",
  "nav.command": "Command palette",
  "nav.help": "Help",
  "hud.cash": "Cash",
  "hud.burn": "Burn / day",
  "hud.runway": "Runway",
  "hud.mrr": "MRR",
  "hud.users": "Users",
  "hud.val": "Valuation",
  "hud.hype": "Hype",
  "hud.morale": "Morale",
  "hud.safety": "Safety",
  "hud.day": "Day",
  "hud.speed": "Speed",
  "hud.pause": "Pause",
  "hud.week": "Week",
  "hud.quarter": "Q",
  "app.dashboard": "Dashboard",
  "app.research": "Research Lab",
  "app.data": "Data Room",
  "app.training": "Training Lab",
  "app.compute": "Compute",
  "app.product": "Product Studio",
  "app.web": "Web Studio",
  "app.pricing": "Pricing & Billing",
  "app.social": "Social Feed",
  "app.investors": "Investors",
  "app.team": "Team",
  "app.market": "Market",
  "app.legal": "Legal & Safety",
  "app.office": "Office",
  "app.mail": "Mail",
  "app.settings": "Settings",
  "action.close": "Close",
  "action.minimize": "Minimize",
  "action.maximize": "Maximize",
  "action.retry": "Retry",
  "action.skip": "Skip minigame",
  "action.accept": "Accept result",
  "action.confirm": "Confirm",
  "action.cancel": "Cancel",
  "action.hire": "Hire",
  "action.fire": "Let go",
  "action.release": "Release",
  "action.research": "Research",
  "action.invest": "Invest",
  "action.reply": "Reply",
  "dash.kpis": "Key numbers",
  "dash.todo": "Waiting on you",
  "dash.upcoming": "Upcoming",
  "dash.runwayAlert": "Runway under two months. Cut costs or raise.",
  "empty.none": "Nothing here yet. Give it a day.",
  "empty.noModel": "No model in production. The website is a brochure.",
  "minigame.title": "Skill check",
  "minigame.bronze": "Bronze",
  "minigame.silver": "Silver",
  "minigame.gold": "Gold",
  "minigame.perfect": "Perfect",
  "minigame.score": "Score",
  "minigame.time": "Time",
  "minigame.result": "Result stamped",
  "minigame.tutorial": "Drag, click, or use the keyboard. Skip costs quality, not time.",
  "settings.language": "Language",
  "settings.sound": "Sound",
  "settings.motion": "Reduce motion",
  "settings.save": "Save & archive",
  "settings.export": "Export save JSON",
  "settings.import": "Import save JSON",
  "settings.replay": "Replay tutorials",
  "settings.achievements": "Achievements",
  "settings.glossary": "Glossary",
  "settings.postmortem": "Post-mortem",
  "settings.newGame": "New game",
  "toast.achievement": "Achievement unlocked",
  "toast.weekend": "Weekly report ready",
  "tutorial.next": "Next",
  "tutorial.back": "Back",
  "tutorial.skip": "Skip tour",
  "tutorial.done": "Got it",
} as const;

export type StringKey = keyof typeof EN;

export const ID: Partial<Record<StringKey, string>> = {
  "game.title": "Model City",
  "game.subtitle": "Simulator Pendiri AI",
  "boot.loading": "Menyalakan garasi...",
  "boot.tagline": "Satu GPU. Satu ide. Satu pendiri yang terlalu percaya diri.",
  "boot.start": "Game baru",
  "boot.continue": "Lanjutkan save",
  "boot.import": "Impor save",
  "onboard.founder": "Siapa kamu?",
  "onboard.founderName": "Nama pendiri",
  "onboard.background": "Latar belakang",
  "onboard.company": "Beri nama perusahaannya",
  "onboard.companyName": "Nama perusahaan",
  "onboard.tagline": "Tagline",
  "onboard.hq": "Kota HQ",
  "onboard.vertical": "Vertikal pertama",
  "onboard.logo": "Buat logo",
  "onboard.difficulty": "Kesulitan",
  "onboard.seed": "Seed",
  "onboard.next": "Lanjut",
  "onboard.back": "Kembali",
  "onboard.finish": "Buka garasi",
  "onboard.generate": "Acak",
  "onboard.check": "Cek ketersediaan",
  "onboard.trademark": "Cek merek",
  "logo.symbol": "Simbol",
  "logo.mask": "Bentuk",
  "logo.colors": "Warna",
  "logo.font": "Font wordmark",
  "logo.layout": "Tata letak",
  "logo.export": "Ekspor SVG",
  "logo.preview": "Pratinjau langsung",
  "hud.cash": "Kas",
  "hud.burn": "Bakar / hari",
  "hud.runway": "Runway",
  "hud.mrr": "MRR",
  "hud.users": "Pengguna",
  "hud.val": "Valuasi",
  "hud.hype": "Hype",
  "hud.morale": "Moral",
  "hud.safety": "Keamanan",
  "hud.day": "Hari",
  "hud.speed": "Kecepatan",
  "hud.pause": "Jeda",
  "hud.week": "Minggu",
  "hud.quarter": "K",
  "app.dashboard": "Dasbor",
  "app.research": "Lab Riset",
  "app.data": "Ruang Data",
  "app.training": "Lab Pelatihan",
  "app.compute": "Komputasi",
  "app.product": "Studio Produk",
  "app.web": "Studio Web",
  "app.pricing": "Harga & Tagihan",
  "app.social": "Feed Sosial",
  "app.investors": "Investor",
  "app.team": "Tim",
  "app.market": "Pasar",
  "app.legal": "Legal & Keamanan",
  "app.office": "Kantor",
  "app.mail": "Surat",
  "app.settings": "Pengaturan",
  "action.close": "Tutup",
  "action.minimize": "Perkecil",
  "action.maximize": "Perbesar",
  "action.retry": "Coba lagi",
  "action.skip": "Lewati minigame",
  "action.accept": "Terima hasil",
  "action.confirm": "Konfirmasi",
  "action.cancel": "Batal",
  "action.hire": "Re krut",
  "action.fire": "Berhentikan",
  "action.release": "Rilis",
  "action.research": "Riset",
  "action.invest": "Investasi",
  "action.reply": "Balas",
  "dash.kpis": "Angka kunci",
  "dash.todo": "Menunggu kamu",
  "dash.upcoming": "Berikutnya",
  "dash.runwayAlert": "Runway di bawah dua bulan. Pangkas biaya atau cari dana.",
  "empty.none": "Belum ada apa-apa. Beri waktu sehari.",
  "empty.noModel": "Belum ada model di produksi. Website masih brosur.",
  "minigame.title": "Uji keterampilan",
  "minigame.bronze": "Perunggu",
  "minigame.silver": "Perak",
  "minigame.gold": "Emas",
  "minigame.perfect": "Sempurna",
  "minigame.score": "Skor",
  "minigame.time": "Waktu",
  "minigame.result": "Hasil dicap",
  "minigame.tutorial": "Geser, klik, atau pakai keyboard. Lewati berarti kualitas turun, bukan waktu.",
  "settings.language": "Bahasa",
  "settings.sound": "Suara",
  "settings.motion": "Kurangi animasi",
  "settings.save": "Simpan & arsip",
  "settings.export": "Ekspor JSON save",
  "settings.import": "Impor JSON save",
  "settings.replay": "Putar ulang tutorial",
  "settings.achievements": "Pencapaian",
  "settings.glossary": "Glosarium",
  "settings.postmortem": "Post-mortem",
  "settings.newGame": "Game baru",
  "toast.achievement": "Pencapaian terbuka",
  "toast.weekend": "Laporan mingguan siap",
};

const LangContext = createContext<{ lang: Lang; setLang: (lang: Lang) => void }>({
  lang: "en",
  setLang: () => {},
});

export function LangProvider({
  lang,
  setLang,
  children,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

export function t(lang: Lang, key: StringKey, values?: Record<string, string | number>): string {
  const template = (lang === "id" ? ID[key] : undefined) ?? EN[key] ?? key;
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) => {
    const value = values[name];
    return value === undefined ? match : String(value);
  });
}

export function useT() {
  const { lang } = useLang();
  return useCallback(
    (key: StringKey, values?: Record<string, string | number>) => t(lang, key, values),
    [lang],
  );
}
