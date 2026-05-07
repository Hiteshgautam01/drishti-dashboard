import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function Stat({
  label,
  value,
  unit,
  delta,
  tone = "default",
  icon,
  hint,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  delta?: string;
  tone?: "default" | "ok" | "warn" | "bad" | "info";
  icon?: ReactNode;
  hint?: string;
}) {
  const toneClass = {
    default: "text-slate-100",
    ok: "text-emerald-300",
    warn: "text-amber-300",
    bad: "text-red-400",
    info: "text-cyan-300",
  }[tone];

  return (
    <div className="panel-tight px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="label-mini">{label}</div>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="mt-1.5 flex items-baseline gap-1.5">
        <div className={cn("font-display text-2xl font-semibold tabular leading-none", toneClass)}>
          {value}
        </div>
        {unit && <div className="text-xs text-slate-500">{unit}</div>}
      </div>
      {(delta || hint) && (
        <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500">
          {delta && <span className="text-emerald-300">{delta}</span>}
          {hint && <span>{hint}</span>}
        </div>
      )}
    </div>
  );
}
