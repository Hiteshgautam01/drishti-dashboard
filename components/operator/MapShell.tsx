"use client";
import dynamic from "next/dynamic";
import { Layers, Activity } from "lucide-react";

const DrishtiMap = dynamic(() => import("./DrishtiMap"), {
  ssr: false,
  loading: () => <MapLoadingState />,
});

export function MapShell() {
  return (
    <div className="relative h-full w-full">
      <DrishtiMap />
      <MapBadge />
      <MapLegend />
      <MapVignette />
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
