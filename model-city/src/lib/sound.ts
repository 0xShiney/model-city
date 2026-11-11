"use client";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

type Cue = "click" | "good" | "bad" | "coin" | "stamp" | "alarm";

const CUES: Record<Cue, { freq: number; type: OscillatorType; dur: number; gain: number }[]> = {
  click: [{ freq: 520, type: "square", dur: 0.04, gain: 0.03 }],
  good: [
    { freq: 440, type: "triangle", dur: 0.08, gain: 0.05 },
    { freq: 660, type: "triangle", dur: 0.1, gain: 0.05 },
  ],
  bad: [
    { freq: 200, type: "sawtooth", dur: 0.12, gain: 0.04 },
    { freq: 140, type: "sawtooth", dur: 0.16, gain: 0.04 },
  ],
  coin: [
    { freq: 880, type: "square", dur: 0.05, gain: 0.03 },
    { freq: 1320, type: "square", dur: 0.07, gain: 0.03 },
  ],
  stamp: [{ freq: 90, type: "sine", dur: 0.14, gain: 0.09 }],
  alarm: [
    { freq: 720, type: "sawtooth", dur: 0.09, gain: 0.03 },
    { freq: 520, type: "sawtooth", dur: 0.09, gain: 0.03 },
    { freq: 720, type: "sawtooth", dur: 0.09, gain: 0.03 },
  ],
};

/** Tiny Web Audio cues, generated — no asset files, no network. */
export function playCue(cue: Cue, enabled: boolean): void {
  if (!enabled) return;
  const context = audio();
  if (!context) return;
  if (context.state === "suspended") void context.resume();
  let offset = 0;
  for (const step of CUES[cue]) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = step.type;
    osc.frequency.value = step.freq;
    const start = context.currentTime + offset;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(step.gain, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + step.dur);
    osc.connect(gain).connect(context.destination);
    osc.start(start);
    osc.stop(start + step.dur + 0.02);
    offset += step.dur * 0.9;
  }
}
