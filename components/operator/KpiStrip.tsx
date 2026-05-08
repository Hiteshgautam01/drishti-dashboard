"use client";

import { kpis } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";
import { Clock, Truck, Users, Wallet } from "lucide-react";

// 4 KPIs that map directly to the PRD OKRs. Earlier 8-tile strip duplicated
// data already shown in the right-panel tabs (welfare checks, runtime, LLM
// calls, UDP write rate) — those numbers are visible in their own panels.
export function KpiStrip() {
  return (
    <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-white/5 bg-ink-900/60 p-2.5 md:grid-cols-4">
      <K
        icon={<Clock className="h-3 w-3" />}
        label="Time to first delivery"
        value={`${kpis.responseTimeHours}h`}
        delta={`vs ${kpis.responseTimeBaselineHours}h baseline`}
        tone="info"
      />
      <K
        icon={<Users className="h-3 w-3" />}
        label="People reached"
        value="2.9M"
        delta="across 12 districts"
        tone="ok"
      />
      <K
        icon={<Truck className="h-3 w-3" />}
        label="Trucks blocked"
        value={`${kpis.trucksBlocked}`}
        delta={`${kpis.routeBlockagesAvoided} blockages avoided`}
        tone="ok"
      />
      <K
        icon={<Wallet className="h-3 w-3" />}
        label="Cash disbursed"
        value={formatNumber(kpis.cashDisbursedFamilies)}
        delta={`families · ${kpis.cashChannelsActive} channels`}
        tone="info"
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
