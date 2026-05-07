"use client";

import { finance } from "@/lib/mock-data";
import { cn, formatINR } from "@/lib/utils";
import {
  Smartphone,
  Wallet,
  Phone,
  ShieldCheck,
  Cloud,
  Zap,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  smartphone: Smartphone,
  wallet: Wallet,
  phone: Phone,
};

export function FinancePanel() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="label-mini">VITTIYA · 3-channel emergency disbursement</div>
        <span className="font-display text-base font-semibold text-emerald-300 tabular">
          {formatINR(finance.totalDisbursementInr, { compact: true })}
        </span>
      </div>

      {/* Parametric trigger card */}
      <div className="mx-4 rounded-xl border border-emerald-400/30 bg-emerald-400/5 p-3.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15">
            <ShieldCheck className="h-4 w-4 text-emerald-300" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-[13px] font-semibold text-emerald-200">
                Parametric trigger ACTIVATED
              </span>
              <span className="chip chip-ok text-[9px] py-0">{finance.parametricTrigger.name}</span>
            </div>
            <div className="text-[11px] text-slate-300">
              Threshold: <code className="font-mono text-emerald-300">{finance.parametricTrigger.threshold}</code>
              {" · "}
              Measured: <span className="font-semibold text-amber-300">{finance.parametricTrigger.measured}</span>
            </div>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-[11px]">
          <KV label="Payout / family" value={formatINR(finance.parametricTrigger.payoutPerFamilyInr)} />
          <KV label="Auto-disburse" value={finance.parametricTrigger.autoDisburse ? "Yes" : "No"} />
          <KV label="Activated" value={finance.parametricTrigger.activatedAt} mono />
        </div>
      </div>

      {/* Channels */}
      <div className="mt-4 px-4 pb-4 space-y-3 overflow-y-auto">
        <div className="label-mini">3 channels</div>
        {finance.channels.map((c, i) => {
          const Icon = ICON_MAP[c.icon] ?? Wallet;
          const pct = (c.completedFamilies / c.coverageFamilies) * 100;
          const isLive = c.status === "in_progress";
          return (
            <div
              key={i}
              className={cn(
                "rounded-xl border bg-ink-900/60 p-3.5 transition",
                isLive
                  ? "border-cyan-400/30 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.1)]"
                  : "border-white/8"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      isLive ? "bg-cyan-400/15 text-cyan-300" : "bg-white/5 text-slate-400"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-display text-[13px] font-semibold text-slate-100">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500">ETA {c.etaHours}h · {c.coverageFamilies.toLocaleString()} families</div>
                  </div>
                </div>
                {isLive ? (
                  <span className="chip chip-info text-[9px]">
                    <span className="h-1 w-1 rounded-full bg-cyan-300 animate-pulse-dot" />
                    Live
                  </span>
                ) : (
                  <span className="chip text-[9px]">Queued</span>
                )}
              </div>

              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Disbursed</span>
                  <span className="tabular text-slate-200">
                    {c.completedFamilies.toLocaleString()} / {c.coverageFamilies.toLocaleString()}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      isLive
                        ? "bg-gradient-to-r from-cyan-400 to-emerald-400"
                        : "bg-slate-600"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-300" />
            <span className="text-slate-300 font-medium">15,000 families</span>
            <span>covered across all channels · {finance.channels.length} active</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Cloud className="h-3 w-3 text-cyan-300" />
            <span>UPU UDP outcome record will be written by KIRAN at T+complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-emerald-400/15 bg-black/30 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div
        className={cn(
          "font-display text-[12.5px] font-semibold tabular text-slate-100",
          mono && "font-mono"
        )}
      >
        {value}
      </div>
    </div>
  );
}
