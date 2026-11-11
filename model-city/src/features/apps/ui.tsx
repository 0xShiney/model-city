"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AppFrame({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full flex-col", className)} data-spot="app-body">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b-2 border-line bg-paper px-4 py-2.5">
        <div>
          <h2 className="font-display text-lg leading-none">{title}</h2>
          {subtitle && <p className="mt-0.5 max-w-xl text-[11px] text-ink-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-1.5">{actions}</div>}
      </div>
      <div className="min-h-0 flex-1 px-4 py-3">{children}</div>
    </div>
  );
}

export function Panel({
  label,
  children,
  className,
  aside,
}: {
  label?: string;
  children: ReactNode;
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <section className={cn("paper-card p-3", className)}>
      {(label || aside) && (
        <header className="mb-2 flex items-center justify-between gap-2">
          {label && <span className="label-mono">{label}</span>}
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

export function Metric({
  label,
  value,
  hint,
  tone = "ink",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "ink" | "good" | "bad" | "warn" | "muted";
}) {
  return (
    <div className="border border-line/30 bg-paper px-2 py-1.5">
      <p className="label-mono truncate">{label}</p>
      <p
        className={cn(
          "font-mono text-sm font-bold tabular",
          tone === "good" && "text-teal",
          tone === "bad" && "text-alarm",
          tone === "warn" && "text-signal",
          tone === "muted" && "text-ink-muted",
        )}
      >
        {value}
      </p>
      {hint && <p className="truncate font-mono text-[9px] text-ink-muted">{hint}</p>}
    </div>
  );
}

export function Bar({ value, max = 100, tone = "teal" }: { value: number; max?: number; tone?: "teal" | "signal" | "acid" | "alarm" | "ink" }) {
  const ratio = Math.max(0, Math.min(1, value / (max || 1)));
  const colors = {
    teal: "bg-teal",
    signal: "bg-signal",
    acid: "bg-acid",
    alarm: "bg-alarm",
    ink: "bg-ink",
  };
  return (
    <div className="h-1.5 w-full border border-line/30 bg-surface" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max}>
      <div className={cn("h-full", colors[tone])} style={{ width: `${ratio * 100}%` }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="border border-dashed border-line/40 px-3 py-4 text-center font-mono text-[11px] text-ink-muted">{children}</p>;
}

export function Row({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-3 border-b border-line/20 py-1.5 last:border-0", className)}>{children}</div>;
}

export function TextButton({
  children,
  onClick,
  tone = "default",
  disabled,
  title,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "default" | "primary" | "danger" | "quiet";
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "border border-line px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase transition-transform active:translate-y-px disabled:cursor-not-allowed disabled:opacity-40",
        tone === "primary" && "bg-signal text-white",
        tone === "danger" && "bg-alarm text-white",
        tone === "quiet" && "border-line/30 bg-transparent text-ink-muted",
        tone === "default" && "bg-paper",
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label-mono">{label}</span>
      <div className="mt-0.5">{children}</div>
      {hint && <span className="mt-0.5 block font-mono text-[9px] text-ink-muted">{hint}</span>}
    </label>
  );
}
