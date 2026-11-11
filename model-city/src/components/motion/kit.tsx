"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function NumberTicker({
  value,
  format,
  className,
  duration = 420,
}: {
  value: number;
  format?: (value: number) => string;
  className?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={cn("tabular", className)}>{(format ?? ((n: number) => Math.round(n).toLocaleString("en-US")))(display)}</span>;
}

export function Marquee({
  items,
  className,
  speed = "normal",
}: {
  items: string[];
  className?: string;
  speed?: "slow" | "normal";
}) {
  const row = [...items, ...items];
  return (
    <div className={cn("group relative overflow-hidden border-y border-line bg-ink text-paper", className)}>
      <div
        className={cn(
          "flex w-max animate-marquee items-center gap-6 py-1 whitespace-nowrap font-mono text-[11px] tracking-wide group-hover:[animation-play-state:paused]",
          speed === "slow" && "[animation-duration:46s]",
        )}
      >
        {row.map((item, index) => (
          <span key={`${item}-${index}`} className="flex items-center gap-6">
            <span>{item}</span>
            <span className="text-signal">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.28, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Sparkline({
  points,
  width = 220,
  height = 48,
  tone = "teal",
  className,
}: {
  points: number[];
  width?: number;
  height?: number;
  tone?: "teal" | "signal" | "acid" | "alarm";
  className?: string;
}) {
  const colors = { teal: "var(--teal)", signal: "var(--signal)", acid: "var(--acid)", alarm: "var(--alarm)" };
  if (points.length < 2) {
    return <div className={cn("h-12 border border-dashed border-line/40", className)} aria-hidden />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = width / (points.length - 1);
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"}${(index * step).toFixed(1)},${(height - ((point - min) / span) * (height - 6) - 3).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", className)} role="img" aria-label="trend">
      <path d={path} fill="none" stroke={colors[tone]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      <path d={`${path} L${width},${height} L0,${height} Z`} fill={colors[tone]} opacity={0.12} />
    </svg>
  );
}

export function DynamicIsland({
  item,
  onDismiss,
  onOpen,
}: {
  item: { id: string; title: string; body: string; tone: "good" | "bad" | "neutral" } | null;
  onDismiss: (id: string) => void;
  onOpen?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!item) return;
    const collapse = window.setTimeout(() => setExpanded(false), 0);
    const expand = window.setTimeout(() => setExpanded(true), 160);
    return () => {
      window.clearTimeout(collapse);
      window.clearTimeout(expand);
    };
  }, [item]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-9 z-[80] flex justify-center px-4">
      <AnimatePresence>
        {item && (
          <motion.button
            type="button"
            layout
            initial={{ y: -18, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={() => {
              if (onOpen) onOpen();
              onDismiss(item.id);
            }}
            className={cn(
              "pointer-events-auto flex max-w-[min(560px,92vw)] items-center gap-3 rounded-full border-2 border-line bg-ink px-4 py-1.5 text-paper shadow-[0_6px_0_rgba(0,0,0,0.25)]",
            )}
          >
            <span
              className={cn(
                "size-2 shrink-0 rounded-full",
                item.tone === "good" && "bg-acid",
                item.tone === "bad" && "bg-alarm",
                item.tone === "neutral" && "bg-sun",
              )}
            />
            <span className="font-mono text-[10px] tracking-[0.16em] uppercase">{expanded ? item.title : "live"}</span>
            <AnimatePresence initial={false}>
              {expanded && (
                <motion.span
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "auto", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="max-w-[380px] overflow-hidden truncate text-xs text-paper/80"
                >
                  {item.body}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SimulatedChat({
  reply,
  greeting,
  placeholder = "Ask the model anything...",
  onAsk,
  className,
}: {
  reply: (prompt: string) => string;
  greeting?: string;
  placeholder?: string;
  onAsk?: (prompt: string) => void;
  className?: string;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>(
    greeting ? [{ role: "assistant", text: greeting }] : [],
  );
  const [input, setInput] = useState("");
  const [stream, setStream] = useState<{ full: string; shown: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stream) return;
    if (stream.shown >= stream.full.length) {
      const timer = window.setTimeout(() => {
        setMessages((prev) => [...prev, { role: "assistant", text: stream.full }]);
        setStream(null);
      }, 120);
      return () => window.clearTimeout(timer);
    }
    const timer = window.setTimeout(() => {
      setStream({ full: stream.full, shown: Math.min(stream.full.length, stream.shown + 3) });
    }, 18);
    return () => window.clearTimeout(timer);
  }, [stream]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [messages, stream]);

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: prompt }]);
    onAsk?.(prompt);
    setStream({ full: reply(prompt), shown: 0 });
  };

  return (
    <div className={cn("flex min-h-0 flex-col border-2 border-line bg-surface", className)}>
      <div ref={boxRef} className="scroll-thin flex-1 space-y-3 overflow-y-auto p-3">
        {messages.length === 0 && !stream && (
          <p className="label-mono">No messages yet. The model is waiting, politely.</p>
        )}
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[88%] border px-2.5 py-1.5 text-sm whitespace-pre-wrap",
              message.role === "user"
                ? "ml-auto border-line bg-ink text-paper"
                : "border-line/50 bg-paper text-ink",
            )}
          >
            {message.text}
          </div>
        ))}
        {stream && (
          <div className="max-w-[88%] border border-line/50 bg-paper px-2.5 py-1.5 text-sm whitespace-pre-wrap">
            {stream.full.slice(0, stream.shown)}
            <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-blink bg-signal align-middle" />
          </div>
        )}
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t-2 border-line bg-paper p-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={placeholder}
          aria-label="Message the model"
          className="min-w-0 flex-1 bg-transparent px-1 py-1 font-mono text-xs outline-none placeholder:text-ink-muted"
        />
        <button
          type="submit"
          className="border border-line bg-signal px-2.5 py-1 font-mono text-[10px] tracking-widest text-white uppercase transition-transform active:translate-y-px"
        >
          Send
        </button>
      </form>
    </div>
  );
}
