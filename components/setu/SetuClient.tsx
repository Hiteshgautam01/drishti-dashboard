"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { institutionRequests } from "@/lib/mock-data";
import { cn, formatINR } from "@/lib/utils";
import {
  Building2,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Truck,
  Users,
  Wallet,
  Zap,
  Target,
  Map as MapIcon,
  Play,
  Pause,
  RotateCw,
  Sparkles,
  Send,
  Hourglass,
  TrendingUp,
  AlertTriangle,
  Network,
  FileText,
  Activity,
} from "lucide-react";

// ─── Persona ──────────────────────────────────────────────────────────────

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

// ─── Simulation timeline ──────────────────────────────────────────────────

type Scene =
  | "standby"
  | "submit"
  | "matchmaking"
  | "options"
  | "approve"
  | "injected"
  | "tracking"
  | "done";

const SCENES: { id: Scene; start: number; end: number; label: string }[] = [
  { id: "standby", start: 0, end: 1, label: "Standby" },
  { id: "submit", start: 1, end: 4, label: "Submit" },
  { id: "matchmaking", start: 4, end: 9, label: "MATCHMAKER" },
  { id: "options", start: 9, end: 15, label: "3 options" },
  { id: "approve", start: 15, end: 19, label: "Approve" },
  { id: "injected", start: 19, end: 22, label: "Injected" },
  { id: "tracking", start: 22, end: 32, label: "Live tracking" },
  { id: "done", start: 32, end: 38, label: "Complete" },
];

const SIM_END_S = 38;

// ─── Main client ──────────────────────────────────────────────────────────

export function SetuClient() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(true);
  const [selectedTier, setSelectedTier] = useState<"Fast" | "Balanced" | "Economy">(
    "Balanced",
  );
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => {
      setElapsed((e) => {
        if (e >= SIM_END_S) return e;
        return Math.round((e + 0.1) * 10) / 10;
      });
    }, 100);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [paused]);

  useEffect(() => {
    if (elapsed >= SIM_END_S && !paused) setPaused(true);
  }, [elapsed, paused]);

  const scene: Scene = useMemo(() => {
    if (elapsed >= SIM_END_S) return "done";
    return SCENES.find((s) => elapsed >= s.start && elapsed < s.end)?.id ?? "standby";
  }, [elapsed]);

  const sceneStart = SCENES.find((s) => s.id === scene)?.start ?? 0;
  const sceneElapsed = elapsed - sceneStart;
  const isFinished = elapsed >= SIM_END_S;
  const req = institutionRequests[0];

  function reset() {
    setElapsed(0);
    setPaused(true);
    setSelectedTier("Balanced");
  }

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
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

        {/* Compact org stats */}
        <div className="flex flex-wrap items-center gap-2">
          <CompactStat label="Budget used" value={formatINR(ORG.budgetUsedInr, { compact: true })} sub={`of ${formatINR(ORG.budgetTotalInr, { compact: true })}`} />
          <CompactStat label="Active" value={`${ORG.activeRequests}`} sub="requests" />
          <CompactStat label="SLA" value="98.2%" sub="this year" tone="ok" />
        </div>
      </div>

      {/* ─── Sim controls ────────────────────────────────────────────── */}
      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-white/8 bg-ink-900/70 px-3 py-2">
        <button
          onClick={() => setPaused((p) => !p)}
          disabled={isFinished}
          className={cn(
            "btn",
            !paused && "bg-emerald-400/10 border-emerald-400/40 text-emerald-200",
            paused && !isFinished && "btn-primary",
            isFinished && "opacity-50 cursor-not-allowed",
          )}
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          {paused ? (elapsed === 0 ? "Play simulation" : "Resume") : "Pause"}
        </button>
        <button onClick={reset} className="btn btn-ghost">
          <RotateCw className="h-3.5 w-3.5" />
          Reset
        </button>
        <SceneTimeline currentScene={scene} elapsed={elapsed} />
      </div>

      {/* ─── Hero scene + story ────────────────────────────────────── */}
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div key={scene} className="dr-scene-fade">
            {scene === "standby" && <StandbyScene />}
            {scene === "submit" && <SubmitScene sceneElapsed={sceneElapsed} />}
            {scene === "matchmaking" && (
              <MatchmakingScene sceneElapsed={sceneElapsed} />
            )}
            {scene === "options" && (
              <OptionsScene
                sceneElapsed={sceneElapsed}
                selectedTier={selectedTier}
                setSelectedTier={setSelectedTier}
                req={req}
              />
            )}
            {scene === "approve" && (
              <ApproveScene
                sceneElapsed={sceneElapsed}
                selectedTier={selectedTier}
                req={req}
              />
            )}
            {scene === "injected" && (
              <InjectedScene sceneElapsed={sceneElapsed} selectedTier={selectedTier} req={req} />
            )}
            {scene === "tracking" && (
              <TrackingScene sceneElapsed={sceneElapsed} selectedTier={selectedTier} req={req} />
            )}
            {scene === "done" && <DoneScene selectedTier={selectedTier} req={req} />}
          </div>
        </div>

        <div className="lg:col-span-4">
          <StoryPanel scene={scene} sceneElapsed={sceneElapsed} />
        </div>
      </div>
    </div>
  );
}

// ─── Compact stat in header ───────────────────────────────────────────────

function CompactStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "ok" | "warn";
}) {
  const valueColor = tone === "ok" ? "text-emerald-300" : "text-slate-100";
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("font-display text-[15px] font-semibold tabular leading-none", valueColor)}>
        {value}
      </div>
      <div className="text-[9.5px] text-slate-500">{sub}</div>
    </div>
  );
}

// ─── Scene timeline ───────────────────────────────────────────────────────

function SceneTimeline({ currentScene, elapsed }: { currentScene: Scene; elapsed: number }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <span className="font-mono tabular text-[11px] text-slate-400">
        {elapsed.toFixed(1)}s / {SIM_END_S}s
      </span>
      <div className="hidden items-center gap-1 md:flex">
        {SCENES.map((s) => {
          const isActive = s.id === currentScene;
          const isComplete = elapsed >= s.end;
          return (
            <div
              key={s.id}
              className={cn(
                "h-1.5 rounded-full transition-all",
                isActive
                  ? "w-8 bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                  : isComplete
                    ? "w-3 bg-cyan-500/50"
                    : "w-3 bg-white/10",
              )}
              title={s.label}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── STANDBY ──────────────────────────────────────────────────────────────

function StandbyScene() {
  return (
    <div className="panel relative overflow-hidden p-8">
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-cyan-600 font-display text-[16px] font-bold text-ink-950">
            P
          </div>
          <div>
            <div className="font-display text-[18px] font-semibold text-slate-100">
              Priya Sharma
            </div>
            <div className="text-[12px] text-slate-400">
              Relief Coordinator · NDRF · Hyderabad
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="font-display text-[20px] font-bold leading-tight text-slate-100">
            Submit relief requirements. Get three executable plans in 18 seconds.
          </h2>
          <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-slate-400">
            SETU is the institution-side marketplace. NDRF, IFRC, WHO, state SDMAs file
            structured aid requests. MATCHMAKER returns Fast / Balanced / Economy options
            from live India Post capacity. One click commits a Service Order into the
            operator's pipeline.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <Capability icon={<Zap className="h-4 w-4" />} title="< 18s" sub="MATCHMAKER response" tone="amber" />
          <Capability icon={<ShieldCheck className="h-4 w-4" />} title="JWT-scoped" sub="per organisation" tone="cyan" />
          <Capability icon={<Activity className="h-4 w-4" />} title="Audit trail" sub="every commit logged" tone="emerald" />
        </div>

        <div className="mt-7 inline-flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[12px] text-cyan-200">
          <Play className="h-3.5 w-3.5" fill="currentColor" />
          Press <span className="font-semibold">Play</span> to follow Priya's flood-relief request
        </div>
      </div>
    </div>
  );
}

function Capability({
  icon,
  title,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tone: "amber" | "cyan" | "emerald";
}) {
  const c = {
    amber: "border-amber-400/30 bg-amber-400/[0.05] text-amber-200",
    cyan: "border-cyan-400/30 bg-cyan-400/[0.05] text-cyan-200",
    emerald: "border-emerald-400/30 bg-emerald-400/[0.05] text-emerald-200",
  }[tone];
  return (
    <div className={cn("rounded-lg border p-3", c)}>
      <div className="flex items-center gap-1.5">{icon}<span className="font-display text-[14px] font-bold">{title}</span></div>
      <div className="mt-0.5 text-[10.5px] uppercase tracking-wider opacity-70">{sub}</div>
    </div>
  );
}

// ─── SUBMIT (form auto-fills) ─────────────────────────────────────────────

const SUBMIT_FIELDS = [
  { key: "title", label: "Aid request title", value: "48,000 dry-ration packets — Nagaon district", appearAt: 0 },
  { key: "type", label: "Service type", value: "Logistics · food", appearAt: 0.5 },
  { key: "district", label: "Target district", value: "Nagaon · Assam", appearAt: 1.0 },
  { key: "beneficiaries", label: "Beneficiaries", value: "48,000 households", appearAt: 1.5 },
  { key: "deadline", label: "Required by", value: "12 hours · CRITICAL", appearAt: 2.0 },
  { key: "budget_cap", label: "Budget cap", value: "₹15.00 L (FY26 envelope)", appearAt: 2.5 },
];

function SubmitScene({ sceneElapsed }: { sceneElapsed: number }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="label-mini text-cyan-400/80">POST /api/setu/requests</div>
          <h2 className="mt-1 font-display text-[18px] font-semibold text-slate-100">
            Filing relief request
          </h2>
        </div>
        <span className="chip chip-info text-[10px]">
          <FileText className="h-3 w-3" />
          Form fields auto-typing
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {SUBMIT_FIELDS.map((f) => {
          const visible = sceneElapsed >= f.appearAt;
          const isLatest =
            sceneElapsed >= f.appearAt && sceneElapsed < f.appearAt + 0.4;
          return (
            <div
              key={f.key}
              className={cn(
                "rounded-lg border bg-black/25 px-3.5 py-2.5 transition-all",
                visible
                  ? isLatest
                    ? "border-cyan-400/50 bg-cyan-400/[0.06]"
                    : "border-white/8"
                  : "border-white/5 opacity-30",
              )}
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-500">{f.label}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="font-display text-[14px] font-semibold text-slate-100">
                  {visible ? f.value : "—"}
                </span>
                {isLatest && (
                  <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse-dot bg-cyan-300 align-baseline" />
                )}
                {visible && !isLatest && (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MATCHMAKING (steps tick over) ────────────────────────────────────────

const MM_STEPS = [
  { label: "Authenticating JWT", sub: "ndrf.govt.in", appearAt: 0.0, doneAt: 0.4 },
  { label: "Querying CAPACITY agent", sub: "247 offices in operator scope", appearAt: 0.5, doneAt: 1.4 },
  { label: "Filtering by district", sub: "31 hubs in Nagaon", appearAt: 1.5, doneAt: 2.4 },
  { label: "Computing fulfillment paths", sub: "Greedy optimization · 5 plans", appearAt: 2.5, doneAt: 3.4 },
  { label: "Calling Claude for recommendations", sub: "claude-sonnet-4 · 320 tokens", appearAt: 3.5, doneAt: 4.4 },
  { label: "Plans ranked & returned", sub: "3 viable options", appearAt: 4.5, doneAt: 4.9 },
];

function MatchmakingScene({ sceneElapsed }: { sceneElapsed: number }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="label-mini text-cyan-400/80">MATCHMAKER · agent pipeline</div>
          <h2 className="mt-1 font-display text-[18px] font-semibold text-slate-100">
            Optimising fulfilment plans
          </h2>
        </div>
        <span className="chip chip-info text-[10px]">
          <Network className="h-3 w-3" />
          live
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/8">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 transition-all"
          style={{ width: `${Math.min(100, (sceneElapsed / 4.9) * 100)}%` }}
        />
      </div>

      <div className="mt-5 space-y-2">
        {MM_STEPS.map((s) => {
          const visible = sceneElapsed >= s.appearAt;
          const done = sceneElapsed >= s.doneAt;
          if (!visible) return null;
          return (
            <div
              key={s.label}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all dr-mm-step",
                done
                  ? "border-emerald-400/30 bg-emerald-400/[0.04]"
                  : "border-cyan-400/30 bg-cyan-400/[0.04]",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md",
                  done ? "bg-emerald-400/20 text-emerald-300" : "bg-cyan-400/20 text-cyan-300",
                )}
              >
                {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Hourglass className="h-3.5 w-3.5 animate-pulse-dot" />}
              </span>
              <div className="flex-1">
                <div className={cn("text-[12.5px] font-semibold", done ? "text-emerald-100" : "text-slate-100")}>
                  {s.label}
                </div>
                <div className="text-[10px] text-slate-500">{s.sub}</div>
              </div>
              {!done && (
                <span className="font-mono text-[10px] text-cyan-300">running...</span>
              )}
            </div>
          );
        })}
      </div>

      {sceneElapsed > 4.6 && (
        <div className="dr-mm-step mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/[0.07] p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
            <span className="font-display text-[13px] font-bold text-emerald-100">
              3 plans returned · revealing options
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OPTIONS (3 tier cards stagger in) ────────────────────────────────────

type Req = typeof institutionRequests[0];

function OptionsScene({
  sceneElapsed,
  selectedTier,
  setSelectedTier,
  req,
}: {
  sceneElapsed: number;
  selectedTier: "Fast" | "Balanced" | "Economy";
  setSelectedTier: (t: "Fast" | "Balanced" | "Economy") => void;
  req: Req;
}) {
  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <div className="label-mini text-cyan-400/80">{req.id} · 3 plans · 18.4s</div>
          <h2 className="mt-1 font-display text-[18px] font-semibold text-slate-100">
            {req.title}
          </h2>
          <div className="mt-1 text-[12px] text-slate-500">
            Priority <span className="text-red-300 font-medium">{req.priority}</span> · Deadline {req.deadlineHours}h
          </div>
        </div>
        <span className="chip chip-info text-[10px]">
          <Zap className="h-3 w-3" /> sub-30s response
        </span>
      </div>

      <div className="mt-5 grid items-stretch gap-3 md:grid-cols-3">
        {req.options.map((opt, i) => {
          const appearAt = i * 0.6;
          const visible = sceneElapsed >= appearAt;
          if (!visible) {
            return <div key={opt.tier} className="md:min-h-[280px]" />;
          }
          const isSelected = selectedTier === opt.tier;
          return (
            <TierCard
              key={opt.tier}
              opt={opt}
              isSelected={isSelected}
              onSelect={() => setSelectedTier(opt.tier as "Fast" | "Balanced" | "Economy")}
              animateIn
            />
          );
        })}
      </div>
    </div>
  );
}

function TierCard({
  opt,
  isSelected,
  onSelect,
  animateIn,
  highlighted,
}: {
  opt: Req["options"][number];
  isSelected: boolean;
  onSelect: () => void;
  animateIn?: boolean;
  highlighted?: boolean;
}) {
  const tone =
    opt.tier === "Fast"
      ? { glow: "from-amber-400/25 to-amber-500/0", border: "border-amber-400/40", bar: "bg-amber-400" }
      : opt.tier === "Balanced"
        ? { glow: "from-cyan-400/30 to-cyan-500/0", border: "border-cyan-400/50", bar: "bg-cyan-400" }
        : { glow: "from-emerald-400/25 to-emerald-500/0", border: "border-emerald-400/40", bar: "bg-emerald-400" };
  const perBenef = Math.round(opt.costInr / 48000);

  return (
    <button
      onClick={onSelect}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-ink-900/70 p-4 text-left transition",
        isSelected ? `${tone.border} ring-2 ring-offset-0 ring-${opt.tier === "Fast" ? "amber" : opt.tier === "Balanced" ? "cyan" : "emerald"}-300/30 shadow-glow` : "border-white/8 hover:border-white/15",
        animateIn && "dr-tier-reveal",
        highlighted && "ring-2 ring-cyan-300/70 shadow-glow",
      )}
    >
      <div className={cn("absolute inset-x-0 -top-12 h-24 bg-gradient-to-b blur-2xl", tone.glow)} />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display text-[18px] font-semibold text-slate-100">
              {opt.tier}
            </span>
            {opt.recommended && (
              <span className="chip chip-info text-[8.5px] py-0">
                <Sparkles className="h-2.5 w-2.5" />
                recommended
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="font-display text-[24px] font-bold tabular text-slate-100 leading-none">
              {opt.etaHours}h
            </div>
            <div className="mt-0.5 text-[9.5px] uppercase tracking-wider text-slate-500">
              ETA
            </div>
          </div>
        </div>

        {/* Coverage bar — most prominent */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-[10.5px]">
            <span className="text-slate-500">Coverage</span>
            <span className={cn("font-mono tabular font-bold", opt.tier === "Fast" ? "text-amber-300" : opt.tier === "Balanced" ? "text-cyan-300" : "text-emerald-300")}>
              {opt.coveragePercent}%
            </span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className={cn("h-full rounded-full", tone.bar)}
              style={{ width: `${opt.coveragePercent}%` }}
            />
          </div>
        </div>

        {/* Stats grid */}
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          <Stat icon={<Wallet className="h-2.5 w-2.5" />} label="Cost" value={formatINR(opt.costInr, { compact: true })} />
          <Stat icon={<TrendingUp className="h-2.5 w-2.5" />} label="Per benef." value={`₹${perBenef}`} />
          <Stat icon={<Building2 className="h-2.5 w-2.5" />} label="Hubs" value={`${opt.offices}`} />
          <Stat icon={<Truck className="h-2.5 w-2.5" />} label="Vehicles" value={`${opt.vehicles}`} />
        </div>

        {/* Selected indicator */}
        <div className="mt-4 flex items-center gap-1.5 text-[11px]">
          {isSelected ? (
            <>
              <CheckCircle2 className={cn("h-3.5 w-3.5", opt.tier === "Fast" ? "text-amber-300" : opt.tier === "Balanced" ? "text-cyan-300" : "text-emerald-300")} />
              <span className={cn("font-semibold", opt.tier === "Fast" ? "text-amber-200" : opt.tier === "Balanced" ? "text-cyan-200" : "text-emerald-200")}>
                Selected
              </span>
            </>
          ) : (
            <span className="text-slate-500">click to select</span>
          )}
        </div>
      </div>
    </button>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-black/25 px-2 py-1.5">
      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 font-display text-[14px] font-semibold tabular text-slate-100 leading-none">
        {value}
      </div>
    </div>
  );
}

// ─── APPROVE ──────────────────────────────────────────────────────────────

function ApproveScene({
  sceneElapsed,
  selectedTier,
  req,
}: {
  sceneElapsed: number;
  selectedTier: "Fast" | "Balanced" | "Economy";
  req: Req;
}) {
  const opt = req.options.find((o) => o.tier === selectedTier)!;
  const clickPulse = sceneElapsed > 2.5 && sceneElapsed < 3.4;

  return (
    <div className="space-y-4">
      <div className="grid items-stretch gap-3 md:grid-cols-3">
        {req.options.map((o) => (
          <TierCard
            key={o.tier}
            opt={o}
            isSelected={o.tier === selectedTier}
            onSelect={() => {}}
            highlighted={o.tier === selectedTier}
          />
        ))}
      </div>

      <div className="panel relative overflow-hidden p-5">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-transparent" />
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="label-mini text-cyan-400/80">commit decision</div>
            <div className="mt-1 font-display text-[15px] font-semibold text-slate-100">
              Approve <span className="text-cyan-200">{selectedTier}</span> plan ({opt.etaHours}h · {opt.coveragePercent}% coverage)
            </div>
            <div className="mt-0.5 text-[11.5px] text-slate-500">
              Audit-trail logged · Service Order will be injected into operator's pipeline
            </div>
          </div>
          <button
            className={cn(
              "btn btn-primary text-[13px] px-5 py-2.5",
              clickPulse && "dr-approve-click",
            )}
          >
            Approve & inject
            <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── INJECTED (success) ──────────────────────────────────────────────────

function InjectedScene({
  sceneElapsed,
  selectedTier,
  req,
}: {
  sceneElapsed: number;
  selectedTier: "Fast" | "Balanced" | "Economy";
  req: Req;
}) {
  const opt = req.options.find((o) => o.tier === selectedTier)!;
  return (
    <div className="panel relative overflow-hidden p-7">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 via-transparent to-cyan-500/8" />
      <div className="relative">
        <div className="dr-injected-success flex items-center gap-4">
          <div className="relative">
            <span className="absolute inset-0 -m-2 rounded-full bg-emerald-400/30 blur-xl" />
            <span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_0_6px_rgba(16,185,129,0.18),0_8px_28px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="h-7 w-7 text-emerald-950" strokeWidth={2.4} />
            </span>
          </div>
          <div>
            <div className="font-display text-[20px] font-bold text-slate-100">
              Service Order injected
            </div>
            <div className="text-[12px] text-emerald-200/80">
              {req.id} · {selectedTier} plan committed at {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <InjectedStat label="ETA" value={`${opt.etaHours}h`} icon={<Clock className="h-3.5 w-3.5" />} />
          <InjectedStat label="Coverage target" value={`${opt.coveragePercent}%`} icon={<Target className="h-3.5 w-3.5" />} />
          <InjectedStat label="Beneficiaries" value="48,000" icon={<Users className="h-3.5 w-3.5" />} />
        </div>

        {sceneElapsed > 1.5 && (
          <div className="dr-injected-line mt-5 flex items-center gap-2 rounded-lg border border-cyan-400/25 bg-cyan-400/[0.05] px-3 py-2 text-[11.5px]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
            <span className="text-slate-200">Operator dashboard notified · routes locking</span>
            <span className="ml-auto font-mono text-[10px] text-cyan-300">→ /operator</span>
          </div>
        )}
      </div>
    </div>
  );
}

function InjectedStat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-emerald-300/85">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-display text-[20px] font-bold tabular text-emerald-100 leading-none">
        {value}
      </div>
    </div>
  );
}

// ─── TRACKING (live coverage + SLA) ──────────────────────────────────────

function TrackingScene({
  sceneElapsed,
  selectedTier,
  req,
}: {
  sceneElapsed: number;
  selectedTier: "Fast" | "Balanced" | "Economy";
  req: Req;
}) {
  const opt = req.options.find((o) => o.tier === selectedTier)!;

  return (
    <div className="space-y-4">
      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="label-mini text-cyan-400/80">live tracking · DigiPIN coverage</div>
            <h3 className="mt-1 font-display text-[15px] font-semibold text-slate-100">
              {opt.coveragePercent}% target · {selectedTier} plan in flight
            </h3>
          </div>
          <span className="chip chip-info text-[10px]">
            <MapIcon className="h-3 w-3" />
            updates every 30s
          </span>
        </div>
        <CoverageGrid sceneElapsed={sceneElapsed} target={opt.coveragePercent} />
      </div>

      <div className="panel p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-[14px] font-semibold text-slate-100">
            SLA · planned vs actual
          </h3>
          <span className="font-mono text-[10px] text-slate-500">live · 4 deliveries in flight</span>
        </div>
        <div className="mt-4 space-y-2.5">
          <SlaRow label="Food delivery · NDRF SO-001" planned={opt.etaHours} actual={Math.min(opt.etaHours, sceneElapsed * 1.0)} unit="h" sceneElapsed={sceneElapsed} />
          <SlaRow label="Medical aid · partial" planned={9.2} actual={Math.min(9.2, sceneElapsed * 0.9)} unit="h" sceneElapsed={sceneElapsed} />
          <SlaRow label="Cash · IPPB rails" planned={4.0} actual={Math.min(4.0, sceneElapsed * 0.45)} unit="h" sceneElapsed={sceneElapsed} />
          <SlaRow label="GDS doorstep cash" planned={48.0} actual={null} unit="h" sceneElapsed={sceneElapsed} />
        </div>
      </div>
    </div>
  );
}

function CoverageGrid({ sceneElapsed, target }: { sceneElapsed: number; target: number }) {
  // 12x18 grid representing DigiPIN zones — light up over time as sceneElapsed grows
  const cols = 18;
  const rows = 12;
  const total = cols * rows;
  // Cap at target (e.g. 91% of 216 = 196 zones eventually served).
  const totalToServe = Math.floor((target / 100) * total);
  // Reveal speed: full coverage by end of tracking phase (10s)
  const revealProgress = Math.min(1, sceneElapsed / 8);
  const servedCount = Math.floor(revealProgress * totalToServe);

  // Pre-compute deterministic ordering (so cells light in a stable pattern)
  const order = useMemo(() => {
    const arr = Array.from({ length: total }, (_, i) => i);
    // Shuffle deterministically
    for (let i = arr.length - 1; i > 0; i--) {
      const seed = (i * 9301 + 49297) % 233280;
      const j = Math.floor((seed / 233280) * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [total]);

  const servedSet = useMemo(() => new Set(order.slice(0, servedCount)), [order, servedCount]);
  const inProgressSet = useMemo(() => new Set(order.slice(servedCount, servedCount + 8)), [order, servedCount]);
  const outOfScopeSet = useMemo(() => new Set(order.slice(totalToServe)), [order, totalToServe]);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[11px] mb-2">
        <span className="text-slate-500">{servedCount} / {totalToServe} zones served</span>
        <span className="font-mono tabular text-cyan-300">
          {Math.round((servedCount / total) * 100)}% complete
        </span>
      </div>
      <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {Array.from({ length: total }, (_, i) => {
          const isServed = servedSet.has(i);
          const isProgress = inProgressSet.has(i);
          const isOutOfScope = outOfScopeSet.has(i);
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-[2px] transition-colors",
                isServed
                  ? "bg-emerald-400/80 dr-zone-served"
                  : isProgress
                    ? "bg-cyan-400/60 animate-pulse-dot"
                    : isOutOfScope
                      ? "bg-white/5"
                      : "bg-amber-400/20",
              )}
            />
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[10.5px] text-slate-500">
        <Legend dot="bg-emerald-400/80" label="Served" />
        <Legend dot="bg-cyan-400/60" label="In progress" />
        <Legend dot="bg-amber-400/20" label="Pending" />
        <Legend dot="bg-white/5" label="Out of scope" border />
      </div>
    </div>
  );
}

function Legend({ dot, label, border }: { dot: string; label: string; border?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block h-2.5 w-2.5 rounded-sm", dot, border && "border border-white/10")} />
      {label}
    </span>
  );
}

function SlaRow({
  label,
  planned,
  actual,
  unit,
  sceneElapsed,
}: {
  label: string;
  planned: number;
  actual: number | null;
  unit: string;
  sceneElapsed: number;
}) {
  const ratio = actual === null ? null : actual / planned;
  const onTrack = ratio === null ? null : ratio <= 1.05;

  return (
    <div>
      <div className="flex items-center justify-between text-[12px]">
        <span className="text-slate-300">{label}</span>
        {actual === null ? (
          <span className="chip text-[9px] py-0">queued</span>
        ) : onTrack ? (
          <span className="chip chip-ok text-[9px] py-0">
            <CheckCircle2 className="h-2.5 w-2.5" />
            on track
          </span>
        ) : (
          <span className="chip chip-warn text-[9px] py-0">
            <AlertTriangle className="h-2.5 w-2.5" />
            slipping
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-[11px]">
        <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              onTrack === false ? "bg-amber-400" : "bg-cyan-400",
            )}
            style={{
              width: `${actual !== null ? Math.min(100, (actual / planned) * 100) : 0}%`,
            }}
          />
        </div>
        <span className="font-mono tabular text-slate-400">
          {actual !== null ? actual.toFixed(1) : "—"} / {planned.toFixed(1)} {unit}
        </span>
      </div>
    </div>
  );
}

// ─── DONE (final summary) ────────────────────────────────────────────────

function DoneScene({
  selectedTier,
  req,
}: {
  selectedTier: "Fast" | "Balanced" | "Economy";
  req: Req;
}) {
  const opt = req.options.find((o) => o.tier === selectedTier)!;
  const totalBudget = ORG.budgetTotalInr;
  const newUsed = ORG.budgetUsedInr + opt.costInr;

  return (
    <div className="panel relative overflow-hidden p-7">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-transparent" />
      <div className="relative">
        <div className="dr-done-success flex flex-col items-center text-center">
          <div className="relative">
            <span className="absolute inset-0 -m-3 rounded-full bg-emerald-400/30 blur-2xl" />
            <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_0_8px_rgba(16,185,129,0.18),0_12px_40px_rgba(16,185,129,0.5)]">
              <CheckCircle2 className="h-10 w-10 text-emerald-950" strokeWidth={2.4} />
            </span>
          </div>
          <h2 className="mt-5 font-display text-[22px] font-bold text-slate-100">
            Relief delivered
          </h2>
          <p className="mt-1 max-w-md text-[13px] text-slate-400">
            {selectedTier} plan completed within SLA · 100% audit trail logged · UPU UDP record written
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <DoneStat label="ETA achieved" value={`${(opt.etaHours - 0.6).toFixed(1)}h`} sub={`vs ${opt.etaHours}h plan`} tone="ok" />
          <DoneStat label="Coverage" value={`${opt.coveragePercent}%`} sub={`${Math.round((opt.coveragePercent / 100) * 48000).toLocaleString()} reached`} tone="ok" />
          <DoneStat label="Cost" value={formatINR(opt.costInr, { compact: true })} sub={`₹${Math.round(opt.costInr / 48000)} / benef.`} />
          <DoneStat label="SLA" value="100%" sub="all on track" tone="ok" />
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
            <div className="label-mini">Budget envelope</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="font-display text-[14px] font-semibold text-slate-100">{formatINR(newUsed, { compact: true })}</span>
              <span className="text-[10.5px] text-slate-500">of {formatINR(totalBudget, { compact: true })}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                style={{ width: `${(newUsed / totalBudget) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.04] p-3">
            <div className="label-mini text-emerald-300/85">Audit trail</div>
            <div className="mt-2 space-y-1 text-[11px]">
              <AuditLine ts="T+18.4s" text="Request filed · JWT verified" />
              <AuditLine ts="T+18.6s" text="MATCHMAKER returned 3 plans" />
              <AuditLine ts="T+19.1s" text="Balanced plan committed by Priya Sharma" />
              <AuditLine ts="T+30.5s" text={`SLA breach: 0 · ${opt.coveragePercent}% beneficiaries served`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DoneStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "ok";
}) {
  const valueColor = tone === "ok" ? "text-emerald-300" : "text-slate-100";
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
      <div className="label-mini">{label}</div>
      <div className={cn("mt-1 font-display text-[18px] font-bold tabular leading-none", valueColor)}>
        {value}
      </div>
      <div className="mt-1 text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}

function AuditLine({ ts, text }: { ts: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="font-mono text-[9.5px] text-slate-500 shrink-0">{ts}</span>
      <span className="text-emerald-100">{text}</span>
    </div>
  );
}

// ─── Story panel beside hero ──────────────────────────────────────────────

const STORY: Record<Scene, { kicker: string; title: string; body: string; tone: string }> = {
  standby: {
    kicker: "T+0 · Standby",
    title: "Press Play to follow Priya's flood-relief request",
    body: "NDRF coordinator Priya Sharma needs 48,000 dry-ration packets in Nagaon within 12 hours. SETU is the institution-side marketplace where she files the request.",
    tone: "text-slate-300",
  },
  submit: {
    kicker: "T+1s · POST /api/setu/requests",
    title: "Structured aid request, JWT-scoped",
    body: "Form submission is authenticated against ndrf.govt.in JWT. Every field is structured — no free text. The request is queued for MATCHMAKER agent processing.",
    tone: "text-cyan-300",
  },
  matchmaking: {
    kicker: "T+4s · MATCHMAKER",
    title: "247 offices analysed in 5 seconds",
    body: "CAPACITY agent returns live India Post data. Greedy optimization computes 5 fulfillment paths. Claude ranks them and writes the recommended plan. Total: ~18 seconds.",
    tone: "text-cyan-300",
  },
  options: {
    kicker: "T+9s · 3 plans returned",
    title: "Fast / Balanced / Economy — institution chooses the trade-off",
    body: "Each plan is fully costed and audit-traceable. Fast: 8.4h, 76% coverage, ₹11.4L. Balanced: 11.5h, 91%, ₹8.7L (recommended). Economy: 16h, 96%, ₹6.5L.",
    tone: "text-amber-300",
  },
  approve: {
    kicker: "T+15s · Commit",
    title: "One click commits a Service Order into the operator's pipeline",
    body: "JWT-signed approval logged. Service Order is injected into the operator's LangGraph state. Routes lock, GDS get task lists, IPPB cash transfers begin.",
    tone: "text-cyan-300",
  },
  injected: {
    kicker: "T+19s · Injected",
    title: "Cross-system handoff — Priya → Operator Rajiv",
    body: "The same Service Order Priya just approved now appears in the operator dashboard. PATHFINDER computes detours; trucks slide along routes on the map.",
    tone: "text-emerald-300",
  },
  tracking: {
    kicker: "T+22s · Live tracking",
    title: "Coverage zones light up · SLA bars fill in real time",
    body: "Each green cell is a DigiPIN zone (4m² grid) where dry rations have been delivered. SLA bars track planned vs actual against the 11.5h target.",
    tone: "text-cyan-300",
  },
  done: {
    kicker: "T+32s · Round-trip complete",
    title: "Relief delivered · 100% audit-traceable",
    body: "From request to last-mile delivery: 11.5h. UPU UDP record written. Other countries' postal operators can learn from this run. Priya's budget tracker updates automatically.",
    tone: "text-emerald-300",
  },
};

function StoryPanel({ scene, sceneElapsed }: { scene: Scene; sceneElapsed: number }) {
  const story = STORY[scene];
  return (
    <div className="lg:sticky lg:top-20 space-y-3">
      <div key={scene} className="dr-scene-fade panel p-4">
        <div className={cn("label-mini", story.tone)}>{story.kicker}</div>
        <h3 className="mt-2 font-display text-[15px] font-semibold leading-snug text-slate-100">
          {story.title}
        </h3>
        <p className="mt-2.5 text-[12px] leading-relaxed text-slate-400">{story.body}</p>
      </div>

      {/* Live data panels per scene */}
      {scene === "submit" && <LiveSubmit sceneElapsed={sceneElapsed} />}
      {scene === "matchmaking" && <LiveMatchmaking sceneElapsed={sceneElapsed} />}
      {scene === "options" && <LiveOptions />}
      {scene === "tracking" && <LiveTracking sceneElapsed={sceneElapsed} />}

      <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
        <div className="label-mini">SETU stack</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["Next.js 14", "JWT auth", "OpenAPI", "MATCHMAKER", "LangGraph", "Audit log"].map(
            (t) => (
              <span key={t} className="chip text-[10px]">
                {t}
              </span>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function LiveSubmit({ sceneElapsed }: { sceneElapsed: number }) {
  const filled = SUBMIT_FIELDS.filter((f) => sceneElapsed >= f.appearAt).length;
  return (
    <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.04] p-3">
      <div className="flex items-center justify-between">
        <span className="label-mini text-cyan-300/85">Form payload</span>
        <span className="font-mono text-[10px] text-slate-400">{filled}/{SUBMIT_FIELDS.length} fields</span>
      </div>
      <div className="mt-2 space-y-1 font-mono text-[10.5px]">
        {SUBMIT_FIELDS.map((f) => {
          const visible = sceneElapsed >= f.appearAt;
          return (
            <div key={f.key} className={cn("flex gap-1", visible ? "opacity-100" : "opacity-30")}>
              <span className="text-slate-500">{f.key}:</span>
              <span className="text-cyan-200 truncate">{visible ? f.value : "..."}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LiveMatchmaking({ sceneElapsed }: { sceneElapsed: number }) {
  const doneCount = MM_STEPS.filter((s) => sceneElapsed >= s.doneAt).length;
  return (
    <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-3">
      <div className="flex items-center justify-between">
        <span className="label-mini text-emerald-300/85">Pipeline progress</span>
        <span className="font-mono text-[10px] text-slate-400">{doneCount}/{MM_STEPS.length} done</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/5">
        <div className="h-full bg-emerald-400 transition-all" style={{ width: `${(doneCount / MM_STEPS.length) * 100}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
        <Tiny label="Offices" value="247" />
        <Tiny label="Plans" value="3" />
        <Tiny label="Tokens" value="320" />
      </div>
    </div>
  );
}

function LiveOptions() {
  return (
    <div className="rounded-xl border border-amber-400/25 bg-amber-400/[0.04] p-3">
      <div className="label-mini text-amber-300/85">Trade-off space</div>
      <div className="mt-2 space-y-1.5 text-[10.5px]">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="text-slate-300">Fast: most expensive, narrowest reach</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="text-slate-300">Balanced: best ETA-to-coverage ratio</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-slate-300">Economy: cheapest, slowest, max reach</span>
        </div>
      </div>
    </div>
  );
}

function LiveTracking({ sceneElapsed }: { sceneElapsed: number }) {
  const pct = Math.min(100, Math.round((sceneElapsed / 8) * 91));
  return (
    <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.04] p-3">
      <div className="flex items-center justify-between">
        <span className="label-mini text-cyan-300/85">Live coverage</span>
        <span className="font-mono text-[10px] tabular text-cyan-300">{pct}%</span>
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
        <Tiny label="Trucks" value="12" />
        <Tiny label="GDS" value="184" />
        <Tiny label="Hubs" value="5" />
      </div>
      <div className="mt-2 text-[10px] text-slate-500">
        Operator's map shows trucks moving · open <span className="font-mono text-cyan-300">/operator</span>
      </div>
    </div>
  );
}

function Tiny({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] py-1.5 text-center">
      <div className="text-[8.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-mono text-[12px] tabular font-bold text-slate-100">{value}</div>
    </div>
  );
}
