"use client";

import { liveFeed } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

function fontFor(text: string) {
  if (/[ঀ-৿]/.test(text)) return "Noto Sans Bengali, Inter, sans-serif";
  if (/[ऀ-ॿ]/.test(text)) return "Noto Sans Devanagari, Inter, sans-serif";
  return undefined;
}

export function LiveFeed({ visibleCount }: { visibleCount: number }) {
  const events = liveFeed.slice(0, Math.max(visibleCount, 1));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="label-mini">SSE Live feed · agent telemetry</div>
        <span className="chip chip-info text-[10px]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" /> connected
        </span>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="font-mono text-[11.5px] leading-relaxed">
          {events.map((e, i) => {
            const dotColor =
              e.level === "ok"
                ? "bg-emerald-400"
                : e.level === "warn"
                  ? "bg-amber-400"
                  : e.level === "bad"
                    ? "bg-red-400"
                    : "bg-cyan-400";
            const textColor =
              e.level === "ok"
                ? "text-emerald-200"
                : e.level === "warn"
                  ? "text-amber-200"
                  : e.level === "bad"
                    ? "text-red-300"
                    : "text-slate-300";
            return (
              <div
                key={i}
                className={cn(
                  "group grid grid-cols-[68px_92px_1fr] gap-3 border-l-2 border-transparent px-2 py-1 hover:border-cyan-400/40 hover:bg-white/[0.02]",
                  i === events.length - 1 && "animate-fade-in"
                )}
              >
                <span className="text-slate-500">{e.ts}</span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
                  {e.agent}
                </span>
                <span className={textColor} style={{ fontFamily: fontFor(e.message) }}>
                  {e.message}
                </span>
              </div>
            );
          })}
          {/* Cursor */}
          <div className="mt-1 flex items-center gap-2 px-2 text-slate-500">
            <span className="text-cyan-400">$</span>
            <span className="inline-block h-3 w-1.5 animate-pulse-dot bg-cyan-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
