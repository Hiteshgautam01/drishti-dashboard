import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-950" fill="currentColor">
          {/* Eye / drishti glyph */}
          <path d="M12 5C7 5 2.7 8.5 1 12c1.7 3.5 6 7 11 7s9.3-3.5 11-7c-1.7-3.5-6-7-11-7zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4zm0-6.7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
        </svg>
      </span>
      <span className="font-display tracking-[0.18em] text-[15px] font-semibold text-slate-100">
        DRISHTI
      </span>
    </span>
  );
}

export function BrandMarkLarge() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 shadow-glow">
        <svg viewBox="0 0 24 24" className="h-7 w-7 text-ink-950" fill="currentColor">
          <path d="M12 5C7 5 2.7 8.5 1 12c1.7 3.5 6 7 11 7s9.3-3.5 11-7c-1.7-3.5-6-7-11-7zm0 11.2A4.2 4.2 0 1 1 12 7.8a4.2 4.2 0 0 1 0 8.4zm0-6.7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
        </svg>
        <span className="absolute -inset-1 rounded-xl border border-cyan-400/30 animate-pulse-dot" />
      </span>
      <div className="flex flex-col">
        <span className="flex items-baseline gap-2.5">
          <span className="font-display tracking-[0.32em] text-[22px] font-semibold text-slate-50 leading-none">
            DRISHTI
          </span>
          <span
            className="font-deva text-[18px] font-medium leading-none text-cyan-300/80"
            aria-hidden
          >
            दृष्टि
          </span>
        </span>
        <span className="text-[10px] tracking-[0.2em] uppercase text-slate-500 mt-1.5">
          Disaster Response Intelligence System
        </span>
      </div>
    </div>
  );
}
