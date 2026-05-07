"use client";

import { agents } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Brain, Hand, CheckCircle2, Circle, Loader2 } from "lucide-react";

export function PipelinePanel({
  activeAgentId,
  completedAgentIds,
  awaitingApproval,
}: {
  activeAgentId: string | null;
  completedAgentIds: string[];
  awaitingApproval: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="label-mini">9-AGENT PIPELINE · LangGraph StateGraph</div>
        <span className="text-[10px] text-slate-500">
          {completedAgentIds.length}/{agents.length} complete
        </span>
      </div>

      <div className="space-y-2">
        {agents.map((a, idx) => {
          const isComplete = completedAgentIds.includes(a.id);
          const isActive = activeAgentId === a.id;
          const isHumanGate = a.id === "human_gate";
          const stalled = isHumanGate && awaitingApproval;

          return (
            <div key={a.id} className="relative">
              {/* Vertical connector line */}
              {idx < agents.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[18px] top-9 z-0 h-full w-px",
                    isComplete ? "bg-cyan-400/40" : "bg-white/5"
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 flex items-start gap-3 rounded-lg border bg-ink-900/60 px-3 py-2.5 transition",
                  isActive && "border-cyan-400/60 bg-cyan-400/5 shadow-[0_0_0_1px_rgba(34,211,238,0.4),0_0_20px_rgba(34,211,238,0.15)]",
                  stalled && "border-amber-400/50 bg-amber-400/5",
                  isComplete && !isActive && "border-emerald-400/20 bg-emerald-400/[0.02]",
                  !isActive && !isComplete && !stalled && "border-white/5"
                )}
              >
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-ink-950">
                  {isComplete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                  ) : stalled ? (
                    <Hand className="h-4 w-4 text-amber-300" />
                  ) : (
                    <Circle className="h-4 w-4 text-slate-600" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-display text-[13px] font-semibold tracking-wide",
                        isActive
                          ? "text-cyan-200"
                          : isComplete
                            ? "text-slate-100"
                            : stalled
                              ? "text-amber-200"
                              : "text-slate-400"
                      )}
                    >
                      {a.name}
                    </span>
                    {a.llmPowered && (
                      <span className="chip chip-info text-[9px] py-0">
                        <Brain className="h-2.5 w-2.5" /> LLM
                      </span>
                    )}
                    {isHumanGate && (
                      <span className="chip chip-warn text-[9px] py-0">
                        <Hand className="h-2.5 w-2.5" /> Human gate
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] text-slate-500">
                      {a.durationSec === 0 ? "—" : `${a.durationSec}s`}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-slate-500">{a.tag}</div>
                  {(isComplete || isActive || stalled) && (
                    <div
                      className={cn(
                        "mt-2 rounded-md border border-white/5 bg-black/30 px-2.5 py-1.5 font-mono text-[10.5px] leading-relaxed",
                        isComplete ? "text-emerald-200/90" : isActive ? "text-cyan-200/90" : "text-amber-200/90"
                      )}
                    >
                      {a.outputSummary}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
