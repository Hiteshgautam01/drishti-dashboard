import Link from "next/link";
import { Nav } from "@/components/shared/Nav";
import { BrandMarkLarge } from "@/components/shared/Brand";
import {
  ArrowRight,
  Activity,
  Building2,
  Smartphone,
  Sparkles,
  Radio,
  Map,
  Wallet,
  Bell,
  Database,
  Eye,
  Zap,
  Network,
  Truck,
  Users,
  Brain,
} from "lucide-react";
import { agents, kpis, scenario } from "@/lib/mock-data";
import { formatNumber } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950">
      <Nav accent />

      {/* HERO */}
      <section className="relative overflow-hidden bg-field scanlines">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute -right-32 top-40 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1400px] px-6 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-3 py-1 text-xs text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
                UPU Innovation Challenge 2026 · Sustainability Track
              </div>

              <BrandMarkLarge />

              <h1 className="mt-8 font-display text-[44px] font-semibold leading-[1.02] text-slate-50 sm:text-5xl lg:text-[68px]">
                <span className="block">From <span className="text-red-400">7&nbsp;days</span>,</span>
                <span className="block">to <span className="text-gradient">2&nbsp;hours.</span></span>
              </h1>

              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-slate-400 lg:text-[16px]">
                DRISHTI transforms India's <span className="text-slate-100 font-medium">164,999 post offices</span> from a passive
                mail network into an always-ready, AI-powered disaster response infrastructure — automatically matching
                real-time relief demand from public institutions with available postal capacity.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/operator" className="btn btn-primary">
                  <Activity className="h-4 w-4" />
                  Open the live demo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#story" className="btn">
                  <Sparkles className="h-4 w-4" />
                  How it works
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-4 max-w-2xl">
                <NumberStat label="Post offices" value="164,999" hint="90% rural" />
                <NumberStat label="GDS postmen" value="250K+" hint="village-level" />
                <NumberStat label="IPPB accounts" value="98.8M" hint="last-mile rails" />
              </div>
            </div>

            {/* Right column — live trigger card */}
            <div className="lg:col-span-5">
              <ScenarioCard />
            </div>
          </div>
        </div>
      </section>

      {/* STORY — Without vs With DRISHTI */}
      <section id="story" className="relative border-y border-white/5 bg-ink-950">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <SectionLabel kicker="The paradox" title="The world's largest postal network — sitting idle when disaster strikes." />

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <TimelineCard
              title="Without DRISHTI"
              tone="bad"
              rows={[
                { t: "Day 0", text: "Flood strikes. Postal network has no activation trigger." },
                { t: "Day 2", text: "Officials drive to area. Manual damage assessment begins." },
                { t: "Day 4", text: "Relief materials organised at distant warehouse." },
                { t: "Day 7", text: "First trucks move. Some get stuck — bridge collapse not communicated." },
                { t: "Day 10+", text: "Remote villages receive nothing. Elderly living alone forgotten." },
              ]}
            />
            <TimelineCard
              title="With DRISHTI"
              tone="ok"
              rows={[
                { t: "T+5m", text: "SENTINEL reads IMD/SACHET alert. Risk map generated." },
                { t: "T+10m", text: "CAPACITY queries live PIN code API. 173 offices active, 88 vehicles available." },
                { t: "T+15m", text: "MATCHMAKER generates 5 executable Service Orders via LLM reasoning." },
                { t: "T+20m", text: "PATHFINDER routes around all 8 road blockages via OpenRouteService." },
                { t: "T+30m", text: "VITTIYA triggers IPPB cash to 15,000 families via 3 channels." },
                { t: "T+60m", text: "SAATHI broadcasts multilingual alerts to 2.9M people by DigiPIN zone." },
                { t: "T+2h", text: "GDS postmen deployed with structured task lists." },
              ]}
            />
          </div>
        </div>
      </section>

      {/* AGENT PIPELINE */}
      <section className="relative bg-grid-only">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <SectionLabel kicker="Core layer" title="A single LangGraph state, threaded through 10 agents." />
          <p className="mt-3 max-w-3xl text-sm text-slate-400">
            Every agent reads from and writes to one shared <code className="font-mono text-cyan-300">DrishtiState</code> object.
            Three are LLM-powered (VAANI voice intake, MATCHMAKER reasoning, SAATHI multilingual). One is a human approval gate. The rest are deterministic Python.
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <Legend dot="bg-cyan-400" label="LLM-powered (Claude)" />
            <Legend dot="bg-emerald-400" label="Deterministic Python" />
            <Legend dot="bg-amber-400" label="Human approval gate" />
          </div>
        </div>
      </section>

      {/* DEMO METRICS */}
      <section className="border-y border-white/5 bg-ink-950">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <SectionLabel
            kicker="Demo · Assam Brahmaputra Flood 2026"
            title="What the demo proves, in numbers."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricBig
              label="Time to first delivery"
              value="28.1h"
              compare="vs 72h+ baseline"
              improvement="2.6× faster"
              icon={<Zap className="h-5 w-5" />}
              tone="info"
            />
            <MetricBig
              label="People reached"
              value="2.9M"
              compare="across 12 districts"
              improvement="Targeted multilingual"
              icon={<Users className="h-5 w-5" />}
              tone="ok"
            />
            <MetricBig
              label="Trucks blocked"
              value="0"
              compare="all 8 blockages pre-routed"
              improvement="Zero failed routes"
              icon={<Truck className="h-5 w-5" />}
              tone="ok"
            />
            <MetricBig
              label="Cash disbursed"
              value="15,000"
              compare="families · 3 channels"
              improvement="Auto-trigger ≤4h"
              icon={<Wallet className="h-5 w-5" />}
              tone="info"
            />
            <MetricBig
              label="Welfare checks"
              value={formatNumber(kpis.elderlyChecked)}
              compare={`${kpis.gdsDeployed} GDS deployed`}
              improvement="Door-to-door"
              icon={<Eye className="h-5 w-5" />}
              tone="default"
            />
            <MetricBig
              label="Pipeline runtime"
              value={`${kpis.pipelineRuntimeSec}s`}
              compare="trigger → service orders"
              improvement="< 3 min target"
              icon={<Activity className="h-5 w-5" />}
              tone="info"
            />
            <MetricBig
              label="LLM calls (Claude)"
              value={`${kpis.llmCallsTotal}`}
              compare="2 per scenario base + 1/lang"
              improvement="Sonnet-4 · ~₹2.40"
              icon={<Brain className="h-5 w-5" />}
              tone="default"
            />
            <MetricBig
              label="UPU UDP records"
              value="100%"
              compare="of deployments"
              improvement="cross-country learning"
              icon={<Database className="h-5 w-5" />}
              tone="default"
            />
          </div>
        </div>
      </section>

      {/* THREE PORTALS */}
      <section className="relative bg-grid-only">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <SectionLabel kicker="Three portals" title="One pipeline, three audiences." />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            <PortalCard
              href="/operator"
              icon={<Activity className="h-5 w-5" />}
              tag="Hero"
              title="Operator Dashboard"
              persona="Rajiv · District Superintendent of Post"
              description="Full-screen split — interactive map of post offices, flood zones, damaged roads, live routes — with the 10-agent pipeline streaming results into right-hand tabs."
              bullets={[
                "Live agent log (SSE)",
                "Approve / reject Service Orders",
                "Capacity, finance, multilingual alerts",
              ]}
              accent="from-cyan-400/20 to-cyan-500/0"
            />
            <PortalCard
              href="/setu"
              icon={<Building2 className="h-5 w-5" />}
              tag="Demand side"
              title="SETU Marketplace"
              persona="Priya · NDRF Relief Coordinator"
              description="Where institutions submit aid requirements and get back three fulfilment options — Fast / Balanced / Economy — each with ETA, coverage, and cost."
              bullets={[
                "JWT-scoped per organisation",
                "One-click commitment",
                "Live SLA tracking with maps",
              ]}
              accent="from-fuchsia-400/20 to-fuchsia-500/0"
            />
            <PortalCard
              href="/gds"
              icon={<Smartphone className="h-5 w-5" />}
              tag="Ground layer"
              title="GDS Field App"
              persona="Ramesh · Gramin Dak Sevak, Nagaon"
              description="Offline-first PWA for ₹5,000 Android phones. Voice reports become structured ground truth (Whisper + Claude NER) tagged to the postman's DigiPIN."
              bullets={[
                "Hindi-first UI",
                "30-second voice → JSON",
                "IndexedDB sync on reconnect",
              ]}
              accent="from-emerald-400/20 to-emerald-500/0"
            />
          </div>
        </div>
      </section>

      {/* INTEGRATIONS */}
      <section className="border-t border-white/5 bg-ink-950">
        <div className="mx-auto max-w-[1400px] px-6 py-20">
          <SectionLabel kicker="External rails" title="Built on open APIs that already exist." />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <IntegrationCard icon={<Radio />} title="India Post PIN API" sub="api.postalpincode.in" body="Live office-by-district lookup. No auth, 1k req/h. Drives CAPACITY agent." />
            <IntegrationCard icon={<Map />} title="DigiPIN" sub="open algorithm · 4m² grid" body="10-char hierarchical addresses. Encoded locally, no network call. Powers DAKIYA + SAATHI." />
            <IntegrationCard icon={<Network />} title="OpenRouteService" sub="avoid_polygons HGV routing" body="Flood-aware HGV truck routes. 2k free req/day. Drives PATHFINDER detour generation." />
            <IntegrationCard icon={<Bell />} title="Open-Meteo" sub="rainfall · 72h forecast" body="Free weather API. Powers PREDICTOR pre-positioning + SENTINEL real-time risk." />
            <IntegrationCard icon={<Wallet />} title="IPPB rails" sub="98.8M accounts" body="Postal-bank account network. VITTIYA disburses parametric insurance payouts in 4h." />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-ink-950">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-6 py-8 text-xs text-slate-500">
          <div>
            DRISHTI v1.0 · Built for the UPU Innovation Challenge 2026 · Sustainability Track
          </div>
          <div className="flex gap-3">
            <span className="kbd">Demo data</span>
            <span className="kbd">No live PII</span>
            <span className="kbd">{scenario.id}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── components ──────────────────────────────────────────────────────────

function NumberStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="border-l border-white/10 pl-4">
      <div className="font-display text-[26px] font-semibold leading-tight text-slate-100 lg:text-[30px]">{value}</div>
      <div className="mt-1 text-[10.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="text-[10.5px] text-slate-600">{hint}</div>
    </div>
  );
}

function ScenarioCard() {
  return (
    <div className="panel relative overflow-hidden p-5 lg:p-6">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="flex items-center justify-between">
        <span className="chip chip-bad">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse-dot" /> CRITICAL
        </span>
        <span className="text-[10px] uppercase tracking-widest text-slate-500">Active scenario</span>
      </div>
      <div className="mt-4">
        <div className="text-[10.5px] uppercase tracking-widest text-slate-500">Disaster event</div>
        <div className="mt-1 font-display text-[19px] font-semibold leading-tight text-slate-100">
          Assam Brahmaputra Flood
        </div>
        <div className="mt-1 text-[11.5px] text-slate-500">
          Triggered 2026-05-07 · 06:42 IST · IMD / SACHET
        </div>
      </div>

      <div className="mt-5 divider" />

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <ScenarioStat label="Affected" value="2.9M" />
        <ScenarioStat label="Districts" value="12" />
        <ScenarioStat label="Rainfall 72h" value="412mm" />
        <ScenarioStat label="Displaced" value="484K" />
      </div>

      <div className="mt-5 divider" />

      <div className="mt-4 space-y-2">
        <Tick text="173 GREEN-status offices located" />
        <Tick text="88 vehicles + 948 GDS available" />
        <Tick text="5 Service Orders awaiting approval" />
        <Tick text="Parametric trigger active · ₹37.5 Cr ready" />
      </div>

      <Link href="/operator" className="mt-6 btn btn-primary w-full">
        <Activity className="h-4 w-4" />
        Enter command centre
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function ScenarioStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-3 py-2">
      <div className="text-[9.5px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-0.5 font-display text-[18px] font-semibold leading-tight text-slate-100 tabular">{value}</div>
    </div>
  );
}

function Tick({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-xs text-slate-300">
      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
      <span>{text}</span>
    </div>
  );
}

function SectionLabel({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <div className="label-mini text-cyan-400/80">{kicker}</div>
      <h2 className="mt-2 font-display text-2xl font-semibold text-slate-100 lg:text-3xl max-w-3xl">
        {title}
      </h2>
    </div>
  );
}

function TimelineCard({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "ok" | "bad";
  rows: { t: string; text: string }[];
}) {
  const colorClass = tone === "ok" ? "from-emerald-400/40" : "from-red-400/40";
  const dotColor = tone === "ok" ? "bg-emerald-400" : "bg-red-400";
  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor} animate-pulse-dot`}
        />
        <h3 className="font-display text-base font-semibold text-slate-100">{title}</h3>
      </div>
      <div className={`my-4 h-px bg-gradient-to-r ${colorClass} via-transparent to-transparent`} />
      <div className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-[80px_1fr] items-start gap-3 text-sm">
            <div className="font-mono text-xs text-slate-500 tabular pt-0.5">{r.t}</div>
            <div className="text-slate-300">{r.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: (typeof agents)[number] }) {
  const groupLabel = {
    pre: "PRE-DISASTER",
    reactive: "REACTIVE",
    post: "POST-EVENT",
  }[agent.group];
  const accent = agent.llmPowered
    ? "border-cyan-400/30 hover:border-cyan-400/60"
    : agent.id === "human_gate"
      ? "border-amber-400/30 hover:border-amber-400/60"
      : "border-emerald-400/20 hover:border-emerald-400/40";
  const dot = agent.llmPowered
    ? "bg-cyan-400"
    : agent.id === "human_gate"
      ? "bg-amber-400"
      : "bg-emerald-400";

  return (
    <div
      className={`group relative rounded-xl border ${accent} bg-ink-900/60 p-5 transition`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${dot}`} />
            <span className="label-mini">{groupLabel}</span>
            {agent.llmPowered && (
              <span className="chip chip-info text-[9px] py-0">LLM</span>
            )}
          </div>
          <div className="mt-2 font-display text-lg font-semibold tracking-wide text-slate-100">
            {agent.name}
          </div>
        </div>
        <div className="font-mono text-xs text-slate-500">{agent.durationSec}s</div>
      </div>
      <div className="mt-1 text-xs text-slate-400">{agent.tag}</div>
      <div className="mt-3 text-[12.5px] leading-relaxed text-slate-300/90">
        {agent.description}
      </div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

function MetricBig({
  label,
  value,
  compare,
  improvement,
  icon,
  tone,
}: {
  label: string;
  value: string;
  compare: string;
  improvement: string;
  icon: React.ReactNode;
  tone: "ok" | "warn" | "bad" | "info" | "default";
}) {
  const valueColor = {
    ok: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-red-400",
    info: "text-cyan-300",
    default: "text-slate-100",
  }[tone];

  return (
    <div className="panel p-5">
      <div className="flex items-center justify-between">
        <div className="label-mini">{label}</div>
        <div className="text-slate-500">{icon}</div>
      </div>
      <div className={`mt-3 font-display text-3xl font-semibold ${valueColor} tabular leading-none`}>
        {value}
      </div>
      <div className="mt-3 text-xs text-slate-500">{compare}</div>
      <div className="mt-1 text-xs text-cyan-300">{improvement}</div>
    </div>
  );
}

function PortalCard({
  href,
  icon,
  title,
  persona,
  description,
  bullets,
  tag,
  accent,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  persona: string;
  description: string;
  bullets: string[];
  tag: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-xl border border-white/5 bg-ink-900/70 p-6 transition hover:border-white/15`}
    >
      <div className={`absolute inset-x-0 -top-16 h-32 bg-gradient-to-b ${accent} pointer-events-none blur-2xl`} />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="chip chip-info">{tag}</span>
          <ArrowRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-300" />
        </div>
        <div className="mt-5 flex items-center gap-2 text-cyan-300">{icon}<span className="font-display text-lg font-semibold text-slate-100">{title}</span></div>
        <div className="mt-1 text-xs uppercase tracking-widest text-slate-500">{persona}</div>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">{description}</p>
        <ul className="mt-5 space-y-1.5 text-xs">
          {bullets.map((b) => (
            <li key={b} className="flex items-center gap-2 text-slate-300">
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              {b}
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}

function IntegrationCard({
  icon,
  title,
  sub,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/70 p-4 transition hover:border-cyan-400/30">
      <div className="flex items-center gap-2 text-cyan-300">{icon}<span className="font-display text-sm font-semibold text-slate-100">{title}</span></div>
      <div className="mt-1 font-mono text-[11px] text-slate-500">{sub}</div>
      <p className="mt-3 text-xs leading-relaxed text-slate-400">{body}</p>
    </div>
  );
}
