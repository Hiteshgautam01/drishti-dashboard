"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapShell } from "./MapShell";
import { ScenarioBar } from "./ScenarioBar";
import { PipelinePanel } from "./PipelinePanel";
import { LiveFeed } from "./LiveFeed";
import { OrdersPanel } from "./OrdersPanel";
import { CapacityPanel } from "./CapacityPanel";
import { FinancePanel } from "./FinancePanel";
import { AlertsPanel } from "./AlertsPanel";
import { SituationRoom } from "./SituationRoom";
import { KpiStrip } from "./KpiStrip";
import { agents, liveFeed, serviceOrders } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Activity,
  Network,
  ListChecks,
  Building2,
  Wallet,
  Bell,
  Tv,
} from "lucide-react";

type TabId =
  | "pipeline"
  | "situation"
  | "feed"
  | "orders"
  | "capacity"
  | "finance"
  | "alerts";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "pipeline", label: "Pipeline", icon: Network },
  { id: "situation", label: "Situation", icon: Tv },
  { id: "feed", label: "Feed", icon: Activity },
  { id: "orders", label: "Orders", icon: ListChecks },
  { id: "capacity", label: "Capacity", icon: Building2 },
  { id: "finance", label: "Finance", icon: Wallet },
  { id: "alerts", label: "Alerts", icon: Bell },
];

// Cumulative durations to drive the pipeline animation.
function getAgentTimings() {
  let acc = 0;
  return agents.map((a) => {
    const start = acc;
    // Each second of "real" time advances 4s of demo time so the simulation feels
    // brisk but every agent is visible.
    const dur = Math.max(2, Math.round(a.durationSec / 4));
    acc = start + dur;
    return { id: a.id, start, end: acc };
  });
}

export function OperatorClient() {
  const [tab, setTab] = useState<TabId>("pipeline");
  const [elapsed, setElapsed] = useState(0); // seconds
  // Start paused so the demo begins on operator's "Play" click — sets the
  // tone for explaining the pipeline rather than running ambiently.
  const [paused, setPaused] = useState(true);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  // Wall-clock ms at which the operator made their *first* approval. Drives
  // the truck animation on the map (lerp hub→delivery over ~12s).
  const [approvedAtMs, setApprovedAtMs] = useState<number | null>(null);
  const tickRef = useRef<NodeJS.Timeout | null>(null);

  const timings = useMemo(getAgentTimings, []);
  const allApproved = approvedIds.size === serviceOrders.length;

  // First-approval-edge detection: when approvedIds goes 0 → >0, stamp it.
  useEffect(() => {
    if (approvedIds.size > 0 && approvedAtMs === null) {
      setApprovedAtMs(Date.now());
    }
    if (approvedIds.size === 0 && approvedAtMs !== null) {
      setApprovedAtMs(null);
    }
  }, [approvedIds, approvedAtMs]);

  // Determine pipeline state from elapsed time.
  const { activeAgentId, completedIds, awaitingApproval, feedCount } = useMemo(() => {
    const completed: string[] = [];
    let active: string | null = null;
    let awaiting = false;

    for (const t of timings) {
      if (elapsed >= t.end) {
        // Special-case the human gate: only "complete" once operator approves.
        if (t.id === "human_gate") {
          if (allApproved) completed.push(t.id);
          else {
            active = t.id;
            awaiting = true;
            break;
          }
        } else {
          completed.push(t.id);
        }
      } else if (elapsed >= t.start) {
        active = t.id;
        break;
      } else {
        break;
      }
    }

    // Live feed pacing: roughly 1 line per ~1.6s of demo time, capped to length.
    const fc = Math.min(liveFeed.length, Math.floor(elapsed * 1.4) + 1);

    return {
      activeAgentId: active,
      completedIds: completed,
      awaitingApproval: awaiting,
      feedCount: fc,
    };
  }, [elapsed, timings, allApproved]);

  // Tick driver
  useEffect(() => {
    if (paused) return;
    tickRef.current = setInterval(() => {
      setElapsed((e) => {
        // Once we've advanced past human gate without approval, stop ticking.
        const humanGate = timings.find((t) => t.id === "human_gate")!;
        if (e >= humanGate.end && !allApproved) return e;
        // Cap at the final agent end + small buffer
        const finalEnd = timings[timings.length - 1].end + 4;
        if (e >= finalEnd) return e;
        return e + 1;
      });
    }, 1000);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [paused, timings, allApproved]);

  function reset() {
    setElapsed(0);
    setApprovedIds(new Set());
    setRejectedIds(new Set());
    setApprovedAtMs(null);
    setPaused(false);
  }

  // Auto-jump to orders tab when matchmaker completes (first time)
  useEffect(() => {
    if (
      completedIds.includes("matchmaker") &&
      awaitingApproval &&
      tab === "pipeline" &&
      approvedIds.size === 0 &&
      rejectedIds.size === 0
    ) {
      const t = setTimeout(() => setTab("orders"), 600);
      return () => clearTimeout(t);
    }
  }, [completedIds, awaitingApproval, tab, approvedIds.size, rejectedIds.size]);

  const pendingCount = serviceOrders.length - approvedIds.size - rejectedIds.size;

  return (
    <div className="flex h-[calc(100vh-56px)] min-h-[640px] flex-col overflow-hidden">
      <ScenarioBar
        elapsedSec={elapsed}
        isPaused={paused}
        onTogglePipeline={() => setPaused((p) => !p)}
        onReset={reset}
      />

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Map (left) — explicit heights so the MapLibre container always sizes correctly */}
        <div className="relative h-[44vh] w-full shrink-0 overflow-hidden border-b border-white/5 lg:h-full lg:w-[58%] lg:shrink lg:border-b-0 lg:border-r xl:w-[66%]">
          <MapShell
            elapsed={elapsed}
            paused={paused}
            completedAgentIds={new Set(completedIds)}
            activeAgentId={activeAgentId}
            awaitingApproval={awaitingApproval}
            approvedCount={approvedIds.size}
            allApproved={allApproved}
            approvedAtMs={approvedAtMs}
          />
        </div>

        {/* Right panel — fixed width on lg+, scrolls within its tab content */}
        <div className="flex min-h-0 w-full flex-1 flex-col bg-ink-950/40 lg:h-full lg:w-[42%] lg:flex-none xl:w-[34%]">
          <Tabs
            tab={tab}
            setTab={setTab}
            awaitingApproval={awaitingApproval}
            pendingCount={pendingCount}
          />
          <div className="min-h-0 flex-1 overflow-hidden">
            {tab === "pipeline" && (
              <div className="h-full overflow-y-auto">
                <PipelinePanel
                  activeAgentId={activeAgentId}
                  completedAgentIds={completedIds}
                  awaitingApproval={awaitingApproval}
                />
              </div>
            )}
            {tab === "situation" && <SituationRoom />}
            {tab === "feed" && <LiveFeed visibleCount={feedCount} />}
            {tab === "orders" && (
              <OrdersPanel
                approvedIds={approvedIds}
                setApprovedIds={setApprovedIds}
                rejectedIds={rejectedIds}
                setRejectedIds={setRejectedIds}
              />
            )}
            {tab === "capacity" && <CapacityPanel />}
            {tab === "finance" && <FinancePanel />}
            {tab === "alerts" && <AlertsPanel />}
          </div>
        </div>
      </div>

      <KpiStrip />
    </div>
  );
}

function Tabs({
  tab,
  setTab,
  awaitingApproval,
  pendingCount,
}: {
  tab: TabId;
  setTab: (t: TabId) => void;
  awaitingApproval: boolean;
  pendingCount: number;
}) {
  return (
    <div className="flex shrink-0 overflow-x-auto border-b border-white/5 bg-ink-900/40">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.id;
        const showBadge = t.id === "orders" && awaitingApproval && pendingCount > 0;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[12px] font-medium transition whitespace-nowrap",
              active
                ? "border-cyan-400 text-cyan-200 bg-cyan-400/[0.05]"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
            {showBadge && (
              <span className="ml-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-400 px-1 text-[9px] font-semibold text-ink-950">
                {pendingCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
