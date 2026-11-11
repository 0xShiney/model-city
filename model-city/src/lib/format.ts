export const money = (value: number, fractionDigits = 0): string => {
  if (!Number.isFinite(value)) return "—";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2)}M`;
  if (abs >= 10_000) return `${sign}$${Math.round(abs / 1000)}k`;
  return `${sign}$${abs.toLocaleString("en-US", { maximumFractionDigits: fractionDigits })}`;
};

export const exactMoney = (value: number): string =>
  Number.isFinite(value)
    ? `${value < 0 ? "-" : ""}$${Math.abs(Math.round(value)).toLocaleString("en-US")}`
    : "—";

export const compact = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  if (abs >= 10_000) return `${Math.round(value / 1000)}k`;
  return Math.round(value).toLocaleString("en-US");
};

export const pct = (value: number, digits = 1): string => `${(value * 100).toFixed(digits)}%`;

export const pctRaw = (value: number, digits = 1): string => `${value.toFixed(digits)}%`;

export const num = (value: number): string => Math.round(value).toLocaleString("en-US");

const BASE_DATE = Date.UTC(2026, 0, 5);
export const dayLabel = (day: number): string => {
  const date = new Date(BASE_DATE + day * 86_400_000);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });
};

export const weekdayLabel = (day: number): string =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day % 7] ?? "Mon";

export const runwayLabel = (months: number): string => {
  if (!Number.isFinite(months) || months > 60) return "profitable";
  if (months < 1) return `${Math.max(0, Math.round(months * 30))}d`;
  return `${months.toFixed(1)}mo`;
};

export const gradeOf = (score: number): "bronze" | "silver" | "gold" | "perfect" => {
  if (score >= 93) return "perfect";
  if (score >= 82) return "gold";
  if (score >= 65) return "silver";
  return "bronze";
};

export const toRoman = (value: number): string => {
  const table: [number, string][] = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let rest = Math.max(1, Math.round(value));
  let out = "";
  for (const [n, symbol] of table) {
    while (rest >= n) {
      out += symbol;
      rest -= n;
    }
  }
  return out;
};

export const plural = (count: number, one: string, many: string): string =>
  `${num(count)} ${count === 1 ? one : many}`;
