"use client";

import { useEffect, useRef, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MinigameProps {
  onFinish: (score: number) => void;
}

export function useTimer(seconds: number, onEnd: () => void) {
  const [left, setLeft] = useState(seconds);
  const ended = useRef(false);
  const endRef = useRef(onEnd);

  useEffect(() => {
    endRef.current = onEnd;
  }, [onEnd]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          if (!ended.current) {
            ended.current = true;
            window.setTimeout(() => endRef.current(), 0);
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  return { left, total: seconds, ratio: left / seconds };
}

export function MinigameShell({
  title,
  instruction,
  left,
  total,
  children,
  footer,
  tone = "ink",
}: {
  title: string;
  instruction: string;
  left: number;
  total: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "ink" | "signal" | "teal";
}) {
  const ratio = total > 0 ? left / total : 0;
  return (
    <div className="flex min-h-0 flex-col">
      <header className="border-b-2 border-line bg-paper px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-sm leading-none">{title}</h3>
          <span className="flex items-center gap-1 font-mono text-[10px] tabular">
            <Timer className="size-3" /> {left}s
          </span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-ink-muted">{instruction}</p>
        <div className="mt-1.5 h-1 w-full border border-line/30 bg-surface">
          <div
            className={cn(
              "h-full transition-[width] duration-1000 ease-linear",
              ratio > 0.5 ? "bg-teal" : ratio > 0.2 ? "bg-sun" : "bg-alarm",
              tone === "signal" && "bg-signal",
            )}
            style={{ width: `${Math.max(0, ratio * 100)}%` }}
          />
        </div>
      </header>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
      {footer && <footer className="border-t-2 border-line bg-paper px-3 py-2">{footer}</footer>}
    </div>
  );
}

export function AnswerButton({
  children,
  onClick,
  state = "idle",
}: {
  children: React.ReactNode;
  onClick: () => void;
  state?: "idle" | "correct" | "wrong" | "selected";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full border px-2.5 py-1.5 text-left text-xs transition-colors",
        state === "idle" && "border-line/40 bg-paper hover:bg-accent",
        state === "selected" && "border-line bg-ink text-paper",
        state === "correct" && "border-teal bg-acid/30",
        state === "wrong" && "border-alarm bg-alarm/10",
      )}
    >
      {children}
    </button>
  );
}

export function ScoreMeter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[9px]">
        <span className="text-ink-muted">{label}</span>
        <span>{Math.round(value)}</span>
      </div>
      <div className="h-1 w-full border border-line/30">
        <div className="h-full bg-teal" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
