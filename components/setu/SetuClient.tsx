"use client";

import { useState } from "react";
import { institutionRequests, serviceOrders } from "@/lib/mock-data";
import { cn, formatINR, formatNumber } from "@/lib/utils";
import {
  Building2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Users,
  Wallet,
  Zap,
  Target,
  Coins,
  TrendingUp,
  Map,
  FileText,
  Plus,
  Bell,
  Filter,
  Activity,
} from "lucide-react";

const ORG = {
  shortName: "NDRF",
  fullName: "National Disaster Response Force",
  user: "Priya Sharma · Relief Coordinator",
  jwt: "ndrf.govt.in · scope: org=NDRF",
  budgetUsedInr: 89_42_000,
  budgetTotalInr: 5_00_00_000,
  activeRequests: 4,
  completedThisYear: 18,
};

export function SetuClient() {
  const [selectedTier, setSelectedTier] = useState<"Fast" | "Balanced" | "Economy">("Balanced");
  const req = institutionRequests[0];
  const [committed, setCommitted] = useState(false);

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="chip chip-info">
              <Shield className="h-3 w-3" /> SETU · Institution Marketplace
            </span>
            <span className="chip text-[10px]">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              JWT verified · {ORG.jwt}
            </span>
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold text-slate-100">
            {ORG.fullName}
          </h1>
          <div className="text-sm text-slate-400">{ORG.user}</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn">
            <Bell className="h-3.5 w-3.5" /> 3 updates
          </button>
          <button className="btn btn-primary">
            <Plus className="h-3.5 w-3.5" /> New service request
          </button>
        </div>
      </div>

      {/* Org KPIs */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <OrgStat
          icon={<Activity className="h-4 w-4" />}
          label="Active requests"
          value={`${ORG.activeRequests}`}
          sub="3 in progress · 1 awaiting options"
        />
        <OrgStat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Completed this year"
          value={`${ORG.completedThisYear}`}
          sub="98.2% SLA achieved"
          tone="ok"
        />
        <OrgStat
          icon={<Coins className="h-4 w-4" />}
          label="Budget used"
          value={formatINR(ORG.budgetUsedInr, { compact: true })}
          sub={`of ${formatINR(ORG.budgetTotalInr, { compact: true })} FY26 envelope`}
        />
        <OrgStat
          icon={<Target className="h-4 w-4" />}
          label="Avg cost / beneficiary"
          value="₹318"
          sub="below ₹420 sector avg"
          tone="ok"
        />
      </div>

      {/* Active request — 3 options */}
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-mini text-cyan-400/80">REQ-2026-0042 · MATCHMAKER returned 3 options</div>
            <h2 className="mt-1 font-display text-xl font-semibold text-slate-100">
              {req.title}
            </h2>
            <div className="mt-1 text-sm text-slate-500">
              Submitted {req.submittedAt} · Priority{" "}
              <span className="text-red-300 font-medium">{req.priority}</span> ·
              Deadline {req.deadlineHours}h
            </div>
          </div>
          <span className="chip chip-info">
            <Zap className="h-3 w-3" /> Live · sub-30s response
          </span>
        </div>

        <div className="mt-5 grid items-stretch gap-4 md:grid-cols-3">
          {req.options.map((opt) => {
            const isSelected = selectedTier === opt.tier;
            const tierColor =
              opt.tier === "Fast"
                ? "from-amber-400/20 to-amber-500/0 border-amber-400/40"
                : opt.tier === "Balanced"
                  ? "from-cyan-400/25 to-cyan-500/0 border-cyan-400/40"
                  : "from-emerald-400/20 to-emerald-500/0 border-emerald-400/40";
            return (
              <button
                key={opt.tier}
                onClick={() => setSelectedTier(opt.tier as any)}
                className={cn(
                  "relative overflow-hidden rounded-xl border bg-ink-900/70 p-5 text-left transition",
                  isSelected ? `${tierColor.split(" ")[2]} shadow-glow` : "border-white/5 hover:border-white/15"
                )}
              >
                <div className={cn("absolute inset-x-0 -top-12 h-24 bg-gradient-to-b blur-2xl", tierColor.split(" ").slice(0, 2).join(" "))} />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-semibold text-slate-100">
                        {opt.tier}
                      </span>
                      {opt.recommended && (
                        <span className="chip chip-info text-[9px] py-0">Recommended</span>
                      )}
                    </div>
                    <div className="font-display text-2xl font-semibold tabular text-slate-100">
                      {opt.etaHours}h
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">ETA from approval</div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
                    <Tile label="Coverage" value={`${opt.coveragePercent}%`} icon={<Target className="h-3 w-3" />} />
                    <Tile label="Cost" value={formatINR(opt.costInr, { compact: true })} icon={<Wallet className="h-3 w-3" />} />
                    <Tile label="Hubs" value={`${opt.offices}`} icon={<Building2 className="h-3 w-3" />} />
                    <Tile label="Vehicles" value={`${opt.vehicles}`} icon={<Truck className="h-3 w-3" />} />
                    <Tile label="GDS" value={`${opt.gds}`} icon={<Users className="h-3 w-3" />} />
                    <Tile label="Per benef." value={`₹${Math.round(opt.costInr / 48000)}`} icon={<TrendingUp className="h-3 w-3" />} />
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        opt.tier === "Fast"
                          ? "bg-amber-400"
                          : opt.tier === "Balanced"
                            ? "bg-cyan-400"
                            : "bg-emerald-400"
                      )}
                      style={{ width: `${opt.coveragePercent}%` }}
                    />
                  </div>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-cyan-300">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Selected
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Commit row */}
        <div className="mt-4 panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm text-slate-300">
              {committed ? (
                <span className="inline-flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> Approved · Service Order injected into pipeline
                </span>
              ) : (
                <>
                  Selected tier: <span className="text-slate-100 font-medium">{selectedTier}</span>{" · "}
                  <span className="text-slate-500">
                    one click commits this request as an active Service Order
                  </span>
                </>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn">
                <FileText className="h-3.5 w-3.5" /> Download PDF
              </button>
              <button
                className={cn("btn", committed ? "" : "btn-primary")}
                onClick={() => setCommitted(true)}
              >
                {committed ? "Committed" : <>Approve & inject <CheckCircle2 className="h-3.5 w-3.5" /></>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Active SOs from this org's perspective */}
      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-slate-100">
            Active service orders
          </h2>
          <button className="btn">
            <Filter className="h-3.5 w-3.5" /> Filter
          </button>
        </div>

        <div className="mt-4 panel overflow-x-auto">
          <table className="w-full min-w-[820px] text-[12.5px]">
            <thead className="bg-white/[0.02] text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Order</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Hub</th>
                <th className="px-4 py-3 text-right font-medium">Beneficiaries</th>
                <th className="px-4 py-3 text-right font-medium">ETA</th>
                <th className="px-4 py-3 text-right font-medium">Cost</th>
                <th className="px-4 py-3 text-left font-medium">Coverage</th>
                <th className="px-4 py-3 text-left font-medium">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {serviceOrders.slice(0, 4).map((o, i) => {
                const slaPct = [82, 94, 98, 71][i] ?? 80;
                return (
                  <tr key={o.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-[11px] text-cyan-300">{o.id}</td>
                    <td className="px-4 py-3 capitalize text-slate-200">
                      {o.type.replace("_", " ")}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{o.hubOfficeName}</td>
                    <td className="px-4 py-3 text-right tabular text-slate-200">
                      {formatNumber(o.beneficiaries)}
                    </td>
                    <td className="px-4 py-3 text-right tabular text-slate-300">
                      {o.estimatedHours}h
                    </td>
                    <td className="px-4 py-3 text-right tabular text-slate-300">
                      {formatINR(o.estimatedCostInr, { compact: true })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/5">
                          <div
                            className="h-full rounded-full bg-cyan-400"
                            style={{ width: `${o.coveragePercent}%` }}
                          />
                        </div>
                        <span className="tabular text-[11px] text-slate-400">
                          {o.coveragePercent}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "chip text-[9px] py-0",
                          slaPct > 90
                            ? "chip-ok"
                            : slaPct > 75
                              ? "chip-info"
                              : "chip-warn"
                        )}
                      >
                        {slaPct}% on track
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Coverage map placeholder */}
      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 panel p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-slate-100">
              Coverage map · DigiPIN zones served vs pending
            </h3>
            <span className="chip chip-info text-[10px]">
              <Map className="h-3 w-3" /> live
            </span>
          </div>
          <CoverageGrid />
        </div>

        <div className="panel p-5">
          <h3 className="font-display text-sm font-semibold text-slate-100">
            SLA · planned vs actual
          </h3>
          <div className="mt-4 space-y-3">
            <SlaRow label="Food delivery" planned={11.5} actual={9.8} unit="h" />
            <SlaRow label="Medical" planned={9.2} actual={8.6} unit="h" />
            <SlaRow label="Cash · IPPB" planned={4.0} actual={3.2} unit="h" />
            <SlaRow label="Cash · doorstep" planned={48.0} actual={44.0} unit="h" />
            <SlaRow label="Shelter" planned={14.8} actual={null} unit="h" />
          </div>
        </div>
      </section>
    </div>
  );
}

function OrgStat({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone?: "ok" | "warn" | "bad";
}) {
  const valueColor = {
    ok: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-red-300",
    default: "text-slate-100",
  }[tone ?? "default"];
  return (
    <div className="panel p-4">
      <div className="flex items-center justify-between">
        <div className="label-mini">{label}</div>
        <div className="text-slate-500">{icon}</div>
      </div>
      <div className={cn("mt-2 font-display text-2xl font-semibold tabular leading-none", valueColor)}>
        {value}
      </div>
      <div className="mt-1.5 text-[11px] text-slate-500">{sub}</div>
    </div>
  );
}

function Tile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-white/5 bg-black/20 px-2 py-1.5">
      <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-display text-base font-semibold tabular text-slate-100">
        {value}
      </div>
    </div>
  );
}

function CoverageGrid() {
  // 12x18 grid representing DigiPIN zones — colored by status
  const cols = 18;
  const rows = 12;
  const cells = Array.from({ length: cols * rows }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    if (r > 0.86) return "bad";
    if (r > 0.62) return "ok";
    if (r > 0.32) return "warn";
    return "neutral";
  });

  return (
    <div className="mt-4">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((c, i) => (
          <div
            key={i}
            className={cn(
              "aspect-square rounded-[2px]",
              c === "ok" && "bg-emerald-400/70",
              c === "warn" && "bg-cyan-400/40",
              c === "bad" && "bg-amber-400/40",
              c === "neutral" && "bg-white/5"
            )}
            title={`Zone ${i}`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px] text-slate-500">
        <Legend dot="bg-emerald-400" label="Served (90%+)" />
        <Legend dot="bg-cyan-400" label="In progress" />
        <Legend dot="bg-amber-400" label="Pending dispatch" />
        <Legend dot="bg-white/5" label="Out of scope" border />
      </div>
    </div>
  );
}

function Legend({ dot, label, border }: { dot: string; label: string; border?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-sm",
          dot,
          border && "border border-white/10"
        )}
      />
      {label}
    </span>
  );
}

function SlaRow({
  label,
  planned,
  actual,
  unit,
}: {
  label: string;
  planned: number;
  actual: number | null;
  unit: string;
}) {
  const ratio = actual === null ? null : actual / planned;
  const onTrack = ratio === null ? null : ratio <= 1.05;

  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-slate-300">{label}</span>
        {actual === null ? (
          <span className="chip text-[9px] py-0">in progress</span>
        ) : onTrack ? (
          <span className="chip chip-ok text-[9px] py-0">
            <CheckCircle2 className="h-2.5 w-2.5" /> on track
          </span>
        ) : (
          <span className="chip chip-warn text-[9px] py-0">slipping</span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-cyan-400/70"
            style={{ width: `${(actual !== null ? Math.min(100, (actual / planned) * 100) : 0)}%` }}
          />
        </div>
        <span className="font-mono tabular text-slate-400">
          {actual !== null ? actual.toFixed(1) : "—"} / {planned.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
}
