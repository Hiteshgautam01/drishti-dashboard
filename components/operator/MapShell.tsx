"use client";
import dynamic from "next/dynamic";
import { Activity, AlertTriangle, Layers, Play, Sparkles } from "lucide-react";

const DrishtiMap = dynamic(() => import("./DrishtiMap"), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

export type SimulationProps = {
  elapsed: number;
  paused: boolean;
  completedAgentIds: Set<string>;
  activeAgentId: string | null;
  awaitingApproval: boolean;
  approvedCount: number;
  allApproved: boolean;
  approvedAtMs: number | null;
};

export function MapShell(sim: SimulationProps) {
  // Banner triggers shortly after play starts and dismisses ~5s in. We also
  // re-show it briefly on pipeline reset (elapsed drops back below trigger).
  const showFloodBanner = sim.elapsed >= 1 && sim.elapsed <= 5;
  // Standby hint sits in the middle of the map until the operator hits play.
  const isStandby = sim.elapsed === 0 && sim.paused;

  return (
    <div className="relative h-full w-full">
      <DrishtiMap {...sim} />
      <MapBadge />
      <MapLegend />
      <MapVignette />
      {showFloodBanner && <FloodDetectedBanner />}
      {isStandby && <StandbyHint />}
      <PipelinePhaseBanner sim={sim} />
    </div>
  );
}

function MapLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-ink-950">
      <div className="text-center">
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-400/10">
          <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse-dot" />
        </div>
        <div className="mt-3 text-[11px] uppercase tracking-widest text-slate-400">
          Loading geospatial layers
        </div>
      </div>
    </div>
  );
}

function MapBadge() {
  return (
    <div className="pointer-events-none absolute left-4 top-4 z-[400] flex items-center gap-2 rounded-md border border-cyan-400/30 bg-ink-950/80 px-2.5 py-1.5 text-[10.5px] uppercase tracking-widest text-cyan-200 backdrop-blur-md">
      <Activity className="h-3 w-3" />
      Operations map · Assam · 12 districts
    </div>
  );
}

// ─── Standby hint — shown until the operator hits Play ──────────────────

function StandbyHint() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2 z-[450] -translate-x-1/2 -translate-y-1/2">
      <div className="standby-hint rounded-xl border border-cyan-400/30 bg-ink-950/85 px-5 py-4 text-center shadow-[0_8px_30px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <div className="flex items-center justify-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-full bg-cyan-400/15">
            <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-400/40" />
            <Play className="relative h-3.5 w-3.5 text-cyan-200" fill="currentColor" />
          </span>
          <span className="font-display text-[13px] font-semibold tracking-wide text-cyan-100">
            Press play to start the simulation
          </span>
        </div>
        <div className="mt-1 text-[10.5px] text-slate-400">
          Watch the 9-agent pipeline respond to the Brahmaputra flood scenario in real time
        </div>
      </div>
    </div>
  );
}

// ─── FLOOD DETECTED banner ────────────────────────────────────────────────

function FloodDetectedBanner() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-16 z-[500] flood-banner -translate-x-1/2">
      <div className="flex items-center gap-3 rounded-md border border-red-500/60 bg-red-950/90 px-4 py-2.5 shadow-[0_8px_30px_rgba(239,68,68,0.35)] backdrop-blur-md">
        <span className="relative flex h-3 w-3 shrink-0 items-center justify-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
          <span className="relative h-2 w-2 rounded-full bg-red-400" />
        </span>
        <AlertTriangle className="h-5 w-5 text-red-300" />
        <div>
          <div className="font-display text-[14px] font-bold tracking-wider text-red-100">
            FLOOD DETECTED
          </div>
          <div className="text-[10.5px] text-red-200/85">
            Brahmaputra · 412mm rainfall · 12 districts · IMD/SACHET
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pipeline phase banner — small status under the operations badge ──────

function PipelinePhaseBanner({ sim }: { sim: SimulationProps }) {
  const phase = derivePhase(sim);
  if (!phase) return null;
  return (
    <div className="pointer-events-none absolute left-4 top-14 z-[400] flex items-center gap-1.5 rounded-md border border-white/8 bg-ink-950/80 px-2.5 py-1 text-[10px] backdrop-blur-md">
      <Sparkles className="h-3 w-3 text-cyan-300" />
      <span className="text-slate-400">phase</span>
      <span className={`font-mono font-semibold ${phase.tone}`}>
        {phase.label}
      </span>
    </div>
  );
}

function derivePhase(sim: SimulationProps): { label: string; tone: string } | null {
  if (sim.elapsed === 0 && sim.approvedCount === 0) {
    return { label: "STANDBY", tone: "text-slate-300" };
  }
  if (sim.awaitingApproval) {
    return { label: "AWAITING APPROVAL", tone: "text-amber-300 animate-pulse-dot" };
  }
  if (sim.allApproved && sim.completedAgentIds.has("kiran")) {
    return { label: "DEPLOYMENT COMPLETE", tone: "text-emerald-300" };
  }
  if (sim.approvedCount > 0) {
    return { label: "EXECUTING", tone: "text-cyan-300" };
  }
  if (sim.activeAgentId) {
    return {
      label: sim.activeAgentId.toUpperCase().replace("_", " "),
      tone: "text-cyan-300",
    };
  }
  return null;
}

// ─── Legend ────────────────────────────────────────────────────────────────

function MapLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-[400] panel px-3 py-2.5 text-[11px] backdrop-blur-md">
      <div className="label-mini mb-1.5 flex items-center gap-1">
        <Layers className="h-3 w-3" /> Legend
      </div>
      <div className="grid grid-cols-1 gap-1.5">
        <Row swatch={<Square color="#10b981" />} label="Office · GREEN" />
        <Row swatch={<Square color="#f59e0b" />} label="Office · YELLOW" />
        <Row swatch={<Square color="#ef4444" />} label="Office · RED" />
        <div className="my-1 h-px bg-white/5" />
        <Row swatch={<Dot color="#22d3ee" />} label="Vehicle (truck/bike/boat)" />
        <Row swatch={<Dot color="#38bdf8" pulse />} label="GDS · live position" />
        <Row swatch={<Cross />} label="Damaged road / blockage" />
        <div className="my-1 h-px bg-white/5" />
        <Row swatch={<Dash color="#0ea5e9" />} label="Flood zone" dashed />
        <Row swatch={<Dash color="#a3e635" />} label="Active route" dashed />
      </div>
    </div>
  );
}

function Row({
  swatch,
  label,
}: {
  swatch: React.ReactNode;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex h-3 w-3.5 items-center justify-center">
        {swatch}
      </span>
      <span className="text-slate-300">{label}</span>
    </div>
  );
}

function Square({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-2.5 w-2.5 rounded-[3px]"
      style={{ background: color, boxShadow: `0 0 0 1.5px ${color}55` }}
    />
  );
}
function Dot({ color, pulse }: { color: string; pulse?: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${pulse ? "animate-pulse-dot" : ""}`}
      style={{ background: color, boxShadow: `0 0 0 1.5px ${color}55` }}
    />
  );
}
function Cross() {
  return (
    <span className="relative inline-block h-3 w-3">
      <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-red-400" />
      <span className="absolute left-1/2 top-1/2 h-[2px] w-3 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-red-400" />
    </span>
  );
}
function Dash({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-[2px] w-3.5 rounded-full"
      style={{
        background: `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`,
      }}
    />
  );
}

function MapVignette() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[300]"
      style={{
        background:
          "radial-gradient(120% 80% at 50% 100%, transparent 70%, rgba(6,8,13,0.25) 100%)",
      }}
    />
  );
}
