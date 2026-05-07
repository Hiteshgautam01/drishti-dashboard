"use client";

import { kpis } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import {
  Activity,
  Brain,
  Clock,
  Database,
  Eye,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export function KpiStrip() {
  return (
    <div className="grid shrink-0 grid-cols-4 gap-2 border-t border-white/5 bg-ink-900/60 p-2.5 md:grid-cols-8">
      <K
        icon={<Clock className="h-3 w-3" />}
        label="Time to first delivery"
        value={`${kpis.responseTimeHours}h`}
        delta={`vs ${kpis.responseTimeBaselineHours}h base`}
        tone="info"
      />
      <K
        icon={<Users className="h-3 w-3" />}
        label="People reached"
        value="2.9M"
        delta="12 districts"
        tone="ok"
      />
      <K
        icon={<Truck className="h-3 w-3" />}
        label="Trucks blocked"
        value={`${kpis.trucksBlocked}`}
        delta={`${kpis.routeBlockagesAvoided} avoided`}
        tone="ok"
      />
      <K
        icon={<Wallet className="h-3 w-3" />}
        label="Cash families"
        value={formatNumber(kpis.cashDisbursedFamilies)}
        delta={`${kpis.cashChannelsActive} channels`}
        tone="info"
      />
      <K
        icon={<Eye className="h-3 w-3" />}
        label="Welfare checks"
        value={formatNumber(kpis.elderlyChecked)}
        delta={`${kpis.gdsDeployed} GDS`}
      />
      <K
        icon={<Activity className="h-3 w-3" />}
        label="Pipeline runtime"
        value={`${kpis.pipelineRuntimeSec}s`}
        delta="< 3min target"
        tone="info"
      />
      <K
        icon={<Brain className="h-3 w-3" />}
        label="LLM calls"
        value={`${kpis.llmCallsTotal}`}
        delta="claude-sonnet-4"
      />
      <K
        icon={<Database className="h-3 w-3" />}
        label="UPU UDP"
        value="100%"
        delta="logged"
      />
    </div>
  );
}

function K({
  icon,
  label,
  value,
  delta,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: string;
  tone?: "default" | "ok" | "warn" | "bad" | "info";
}) {
  const valueColor = {
    default: "text-slate-100",
    ok: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-red-300",
    info: "text-cyan-300",
  }[tone];
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5 min-w-0">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500 truncate">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className={`font-display text-[15px] font-semibold tabular leading-tight mt-0.5 ${valueColor}`}>
        {value}
      </div>
      {delta && <div className="mt-0.5 text-[10px] text-slate-500 truncate">{delta}</div>}
    </div>
  );
}
