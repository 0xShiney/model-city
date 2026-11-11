import { CONFIG } from "./config";
import { clamp } from "./rng";
import type { CapTableRow, GameState, StageId, TermSheet } from "./types";

export function totalShares(rows: CapTableRow[]): number {
  return rows.reduce((sum, row) => sum + row.shares, 0);
}

export function percentOf(rows: CapTableRow[], id: string): number {
  const total = totalShares(rows);
  if (total === 0) return 0;
  const row = rows.find((entry) => entry.id === id);
  return row ? (row.shares / total) * 100 : 0;
}

export function founderPercent(rows: CapTableRow[]): number {
  return rows
    .filter((row) => row.kind === "founder")
    .reduce((sum, row) => sum + percentOf(rows, row.id), 0);
}

export function investorPercent(rows: CapTableRow[]): number {
  return rows
    .filter((row) => row.kind === "investor")
    .reduce((sum, row) => sum + percentOf(rows, row.id), 0);
}

export function valuation(state: GameState): number {
  const arr = state.kpis.mrr * 12;
  const revenueValue = arr * 24;
  const tractionValue =
    state.kpis.users * 14 + Math.max(0, state.res.hype) * 45_000 + state.res.devRep * 25_000;
  const cashFloor = state.res.cash * 0.8;
  return Math.round(Math.max(revenueValue + tractionValue, cashFloor, 150_000));
}

export function stageForValuation(value: number): StageId {
  const thresholds = CONFIG.funding.stageThresholds;
  if (value >= thresholds.frontier) return "frontier";
  if (value >= thresholds.unicorn) return "unicorn";
  if (value >= thresholds.scaleup) return "scaleup";
  if (value >= thresholds.seed) return "seed";
  return "garage";
}

export function sharesForInvestment(amount: number, preMoney: number, currentShares: number): number {
  const pricePerShare = preMoney / Math.max(1, currentShares);
  return Math.round(amount / Math.max(0.0001, pricePerShare));
}

export function dilutionPercent(amount: number, preMoney: number): number {
  return (amount / (preMoney + amount)) * 100;
}

export function previewTermSheet(state: GameState, sheet: TermSheet): {
  dilution: number;
  postMoney: number;
  founderAfter: number;
} {
  const rows = state.funding.capTable;
  const current = totalShares(rows);
  const newShares = sharesForInvestment(sheet.amount, sheet.preMoney, current);
  const post = totalShares([...rows, { id: "tmp", name: "tmp", kind: "investor", shares: newShares, invested: sheet.amount }]);
  return {
    dilution: (newShares / post) * 100,
    postMoney: sheet.preMoney + sheet.amount,
    founderAfter: founderPercent([
      ...rows,
      { id: "tmp", name: "tmp", kind: "investor", shares: newShares, invested: sheet.amount },
    ]),
  };
}

export function applyTermSheet(state: GameState, sheet: TermSheet): CapTableRow[] {
  const rows = [...state.funding.capTable.map((row) => ({ ...row }))];
  const current = totalShares(rows);
  const newShares = sharesForInvestment(sheet.amount, sheet.preMoney, current);
  rows.push({
    id: `inv-${sheet.investorId}-${state.day}`,
    name: sheet.investorName,
    kind: "investor",
    shares: newShares,
    invested: sheet.amount,
  });
  return rows;
}

/** Founder control erodes with dilution and with a board that dislikes the strategy. */
export function ceoControl(state: GameState): number {
  const founders = founderPercent(state.funding.capTable);
  const boardSeats = state.funding.capTable.filter((row) => row.kind === "investor").length;
  const boardPenalty = Math.max(0, boardSeats - 1) * 4.5;
  const confidenceBonus = (state.funding.boardConfidence - 50) * 0.22;
  return clamp(founders - boardPenalty + confidenceBonus, 0, 100);
}

export function boardPressure(state: GameState): number {
  return clamp(
    state.funding.boardConfidence -
      (state.res.cash < 0 ? 40 : 0) -
      state.legal.lawsuits * 6 -
      Math.max(0, state.quarter - 4) * 1.5,
    0,
    100,
  );
}

export function whiteboardValuation(state: GameState): { low: number; high: number } {
  const base = valuation(state);
  return { low: Math.round(base * 0.72), high: Math.round(base * 1.35) };
}
