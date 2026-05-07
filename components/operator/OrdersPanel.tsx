"use client";

import { useState } from "react";
import { ServiceOrder, serviceOrders } from "@/lib/mock-data";
import { cn, formatINR, formatNumber } from "@/lib/utils";
import {
  Building2,
  Brain,
  Check,
  X,
  Truck,
  Users,
  Wallet,
  ChevronDown,
  ChevronRight,
  Pill,
  Tent,
  HeartHandshake,
  Package,
} from "lucide-react";

const TYPE_ICON: Record<ServiceOrder["type"], React.ComponentType<{ className?: string }>> = {
  food_delivery: Package,
  medical: Pill,
  cash: Wallet,
  shelter: Tent,
  welfare: HeartHandshake,
};

export function OrdersPanel({
  approvedIds,
  setApprovedIds,
  rejectedIds,
  setRejectedIds,
}: {
  approvedIds: Set<string>;
  setApprovedIds: (s: Set<string>) => void;
  rejectedIds: Set<string>;
  setRejectedIds: (s: Set<string>) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>("SO-001");

  const pending = serviceOrders.filter(
    (o) => !approvedIds.has(o.id) && !rejectedIds.has(o.id)
  ).length;

  function approveAll() {
    const next = new Set(approvedIds);
    serviceOrders.forEach((o) => next.add(o.id));
    setApprovedIds(next);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-4 pb-3">
        <div className="label-mini truncate">5 orders · awaiting gate</div>
        <button
          className="btn btn-primary shrink-0 whitespace-nowrap"
          onClick={approveAll}
          disabled={pending === 0}
        >
          <Check className="h-3.5 w-3.5" />
          Approve all{pending > 0 ? ` (${pending})` : ""}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2.5">
        {serviceOrders.map((o) => {
          const Icon = TYPE_ICON[o.type];
          const isApproved = approvedIds.has(o.id);
          const isRejected = rejectedIds.has(o.id);
          const isOpen = expanded === o.id;

          return (
            <div
              key={o.id}
              className={cn(
                "rounded-xl border bg-ink-900/60 transition",
                isApproved
                  ? "border-emerald-400/40 bg-emerald-400/[0.03]"
                  : isRejected
                    ? "border-red-400/30 bg-red-400/[0.03] opacity-70"
                    : "border-white/8 hover:border-cyan-400/30"
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="flex w-full items-start gap-3 p-3.5 text-left"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">{o.id}</span>
                    <span className="chip chip-info text-[9px] py-0">{o.institution}</span>
                    {isApproved && <span className="chip chip-ok text-[9px] py-0">Approved</span>}
                    {isRejected && <span className="chip chip-bad text-[9px] py-0">Rejected</span>}
                    {!isApproved && !isRejected && (
                      <span className="chip chip-warn text-[9px] py-0">Pending</span>
                    )}
                  </div>
                  <div className="mt-1 font-display text-sm font-semibold text-slate-100">
                    {o.payload}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                    <Stat icon={<Building2 className="h-3 w-3" />} text={o.hubOfficeName} />
                    <Stat icon={<Truck className="h-3 w-3" />} text={`${o.vehicleCount} vehicles`} />
                    <Stat icon={<Users className="h-3 w-3" />} text={`${o.gdsCount} GDS`} />
                    <Stat icon={<Wallet className="h-3 w-3" />} text={formatINR(o.estimatedCostInr, { compact: true })} />
                    <span className="text-slate-300 tabular">{o.estimatedHours}h ETA</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <CoverageBar pct={o.coveragePercent} />
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Expanded */}
              {isOpen && (
                <div className="border-t border-white/5 p-4 pt-3 space-y-3 animate-fade-in">
                  <div>
                    <div className="flex items-center gap-2 label-mini">
                      <Brain className="h-3 w-3 text-cyan-400" /> MATCHMAKER reasoning
                      <span className="text-[9px] normal-case text-slate-500">claude-sonnet-4</span>
                    </div>
                    <p className="mt-2 rounded-md border border-cyan-400/15 bg-cyan-400/[0.03] p-3 text-[12px] leading-relaxed text-slate-300">
                      {o.reasoning}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <Mini label="Beneficiaries" value={formatNumber(o.beneficiaries)} />
                    <Mini label="ETA" value={`${o.estimatedHours}h`} />
                    <Mini label="Coverage" value={`${o.coveragePercent}%`} />
                    <Mini label="Cost" value={formatINR(o.estimatedCostInr, { compact: true })} />
                  </div>

                  <div>
                    <div className="label-mini mb-1.5">Delivery DigiPIN zones</div>
                    <div className="flex flex-wrap gap-1.5">
                      {o.deliveryPoints.map((d, i) => (
                        <code
                          key={i}
                          className="rounded border border-cyan-400/15 bg-cyan-400/5 px-2 py-1 font-mono text-[10px] text-cyan-300"
                        >
                          {d}
                        </code>
                      ))}
                    </div>
                  </div>

                  {!isApproved && !isRejected && (
                    <div className="flex gap-2 pt-1">
                      <button
                        className="btn btn-primary flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = new Set(approvedIds);
                          next.add(o.id);
                          setApprovedIds(next);
                        }}
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                      <button
                        className="btn btn-danger flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          const next = new Set(rejectedIds);
                          next.add(o.id);
                          setRejectedIds(next);
                        }}
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CoverageBar({ pct }: { pct: number }) {
  const color = pct > 92 ? "#10b981" : pct > 85 ? "#22d3ee" : "#f59e0b";
  return (
    <div className="flex items-center gap-2">
      <div className="text-right">
        <div className="font-display text-base font-semibold tabular leading-none" style={{ color }}>
          {pct}%
        </div>
        <div className="text-[9px] uppercase tracking-wider text-slate-500">coverage</div>
      </div>
      <div className="flex h-9 w-1.5 items-end overflow-hidden rounded-full bg-white/5">
        <div
          className="w-full rounded-full transition-all duration-500"
          style={{ background: color, height: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Stat({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-400">
      {icon}
      {text}
    </span>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-black/20 px-2.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-sm font-semibold tabular text-slate-100">{value}</div>
    </div>
  );
}
