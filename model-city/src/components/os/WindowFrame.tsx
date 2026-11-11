"use client";

import { Maximize2, Minus, X } from "lucide-react";
import { useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { useGame, type WindowState } from "@/store/game";
import { cn } from "@/lib/utils";

export function WindowFrame({
  win,
  title,
  icon: Icon,
  children,
  mobile = false,
}: {
  win: WindowState;
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  mobile?: boolean;
}) {
  const moveWindow = useGame((state) => state.moveWindow);
  const resizeWindow = useGame((state) => state.resizeWindow);
  const focusApp = useGame((state) => state.focusApp);
  const closeApp = useGame((state) => state.closeApp);
  const minimizeApp = useGame((state) => state.minimizeApp);
  const maximizeApp = useGame((state) => state.maximizeApp);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const resizing = useRef<{ w: number; h: number; x: number; y: number } | null>(null);

  const onDragStart = (event: React.PointerEvent) => {
    if (win.maximized) return;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    drag.current = { dx: event.clientX - win.x, dy: event.clientY - win.y };
    focusApp(win.app);
  };
  const onDragMove = (event: React.PointerEvent) => {
    if (!drag.current) return;
    const x = Math.max(-win.w + 140, Math.min(window.innerWidth - 120, event.clientX - drag.current.dx));
    const y = Math.max(30, Math.min(window.innerHeight - 90, event.clientY - drag.current.dy));
    moveWindow(win.app, x, y);
  };
  const onDragEnd = (event: React.PointerEvent) => {
    drag.current = null;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* pointer capture already released */
    }
  };

  const onResizeStart = (event: React.PointerEvent) => {
    event.stopPropagation();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    resizing.current = { w: win.w, h: win.h, x: event.clientX, y: event.clientY };
  };
  const onResizeMove = (event: React.PointerEvent) => {
    if (!resizing.current) return;
    const { w, h, x, y } = resizing.current;
    resizeWindow(win.app, w + (event.clientX - x), h + (event.clientY - y));
  };
  const onResizeEnd = (event: React.PointerEvent) => {
    resizing.current = null;
    try {
      (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {
      /* pointer capture already released */
    }
  };

  const style: React.CSSProperties = mobile
    ? { position: "absolute", inset: 0, width: "100%", height: "100%" }
    : win.maximized
      ? { position: "absolute", left: 8, top: 36, right: 8, bottom: 84 }
      : win.snapped === "left"
        ? { position: "absolute", left: 8, top: 40, bottom: 84, width: "calc(50vw - 14px)" }
        : win.snapped === "right"
          ? { position: "absolute", right: 8, top: 40, bottom: 84, width: "calc(50vw - 14px)" }
          : { position: "absolute", left: win.x, top: win.y, width: win.w, height: win.h };

  return (
    <section
      aria-label={title}
      style={{ ...style, zIndex: win.z }}
      onPointerDown={() => focusApp(win.app)}
      className={cn("window-shell flex min-h-0 flex-col overflow-hidden", mobile && "border-x-0 border-b-0 shadow-none")}
    >
      <header
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
        onDoubleClick={() => maximizeApp(win.app)}
        className={cn("window-titlebar flex shrink-0 touch-none items-center gap-2 px-2 py-1.5", mobile ? "cursor-default" : "cursor-grab active:cursor-grabbing")}
      >
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Close window"
            onClick={() => closeApp(win.app)}
            className="grid size-4 place-items-center rounded-full border border-line bg-alarm text-white transition-transform hover:scale-110"
          >
            <X className="size-2.5" strokeWidth={3} />
          </button>
          <button
            type="button"
            aria-label="Minimize window"
            onClick={() => minimizeApp(win.app)}
            className="grid size-4 place-items-center rounded-sm border border-line bg-sun text-ink transition-transform hover:scale-110"
          >
            <Minus className="size-2.5" strokeWidth={3} />
          </button>
          <button
            type="button"
            aria-label="Maximize window"
            onClick={() => maximizeApp(win.app)}
            className="grid size-4 place-items-center rounded-[3px] border border-line bg-acid text-ink transition-transform hover:scale-110"
          >
            <Maximize2 className="size-2.5" strokeWidth={3} />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-center gap-1.5">
          <Icon className="size-3.5 shrink-0 text-ink-muted" strokeWidth={2} />
          <span className="truncate font-mono text-[10px] tracking-[0.16em] uppercase">{title}</span>
        </div>
        <span className="hidden font-mono text-[9px] text-ink-muted sm:block">{win.app}</span>
      </header>
      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto bg-surface">{children}</div>
      {!win.maximized && !mobile && (
        <button
          type="button"
          aria-label="Resize window"
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          className="absolute right-0 bottom-0 size-4 cursor-nwse-resize touch-none border-t border-l border-line/60 bg-[repeating-linear-gradient(45deg,var(--ink-muted)_0_1px,transparent_1px_4px)] opacity-60"
        />
      )}
    </section>
  );
}
