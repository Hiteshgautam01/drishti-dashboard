"use client";

import { scenario, postOfficeStats } from "@/lib/mock-data";
import {
  AlertTriangle,
  Clock,
  Users,
  Building2,
  MapPin,
  Play,
  RotateCw,
  Pause,
} from "lucide-react";

export function ScenarioBar({
  elapsedSec,
  isPaused,
  onTogglePipeline,
  onReset,
}: {
  elapsedSec: number;
  isPaused: boolean;
  onTogglePipeline: () => void;
  onReset: () => void;
}) {
  const m = String(Math.floor(elapsedSec / 60)).padStart(2, "0");
  const s = String(elapsedSec % 60).padStart(2, "0");

  return (
    <div className="flex h-14 items-center gap-3 border-b border-white/5 bg-ink-900/70 px-4">
      <span className="chip chip-bad shrink-0">
        <AlertTriangle className="h-3 w-3" />
        {scenario.severity}
      </span>
      <div className="min-w-0 flex flex-col">
        <span className="font-display text-sm font-semibold text-slate-100 truncate leading-tight">
          {scenario.name}
        </span>
        <span className="hidden text-[10.5px] text-slate-500 truncate xl:inline leading-tight">
          {scenario.id} · IMD/SACHET · {new Date(scenario.triggeredAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" })}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Mini icon={<MapPin className="h-3 w-3" />} label="Districts" value={`${scenario.totalDistrictsAffected}`} />
        <Mini icon={<Users className="h-3 w-3" />} label="Affected" value="2.9M" />
        <Mini icon={<Building2 className="h-3 w-3" />} label="Offices" value={`${postOfficeStats.green}/${postOfficeStats.total}`} hint="GREEN" />
        <Mini icon={<Clock className="h-3 w-3" />} label="Elapsed" value={`${m}:${s}`} mono />

        <div className="mx-1 h-7 w-px bg-white/10" aria-hidden />

        <button onClick={onTogglePipeline} className="btn">
          {isPaused ? (
            <>
              <Play className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Resume</span>
            </>
          ) : (
            <>
              <Pause className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Pause</span>
            </>
          )}
        </button>
        <button onClick={onReset} className="btn btn-ghost" title="Reset demo">
          <RotateCw className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Reset</span>
        </button>
      </div>
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
  hint,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-2.5 py-1 hidden md:block">
      <div className="flex items-center gap-1 text-[9.5px] uppercase tracking-wider text-slate-500 leading-none">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className={`text-[13px] font-semibold tabular text-slate-100 leading-none ${mono ? "font-mono" : ""}`}>
          {value}
        </span>
        {hint && <span className="text-[9px] uppercase text-slate-500">{hint}</span>}
      </div>
    </div>
  );
}
