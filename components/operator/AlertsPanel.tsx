"use client";

import { multilingualAlerts } from "@/lib/mock-data";
import {
  Brain,
  Send,
  Smartphone,
  MessageSquare,
  Phone,
  ShieldCheck,
  Languages,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

const CHANNEL_ICON = {
  APP_PUSH: Smartphone,
  SMS: MessageSquare,
  USSD: Phone,
};

const SCRIPTS: {
  key: "en" | "hi" | "as" | "bn";
  label: string;
  native: string;
  font: string;
}[] = [
  { key: "as", label: "Assamese", native: "অসমীয়া", font: "Noto Sans Bengali, Inter, sans-serif" },
  { key: "bn", label: "Bengali", native: "বাংলা", font: "Noto Sans Bengali, Inter, sans-serif" },
  { key: "hi", label: "Hindi", native: "हिन्दी", font: "Noto Sans Devanagari, Inter, sans-serif" },
  { key: "en", label: "English", native: "ENGLISH", font: "Inter, sans-serif" },
];

export function AlertsPanel() {
  const total = multilingualAlerts.reduce((s, z) => s + z.totalRecipients, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="label-mini">SAATHI · DigiPIN-zone targeted alerts</div>
        <span className="chip chip-info text-[9px]">
          <Brain className="h-2.5 w-2.5" /> claude-sonnet-4
        </span>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-3 gap-2">
          <Mini label="Recipients" value={formatNumber(total)} sub="across 4 scripts" />
          <Mini label="Languages" value="4" sub="অস · বাং · हिं · EN" />
          <Mini label="Avg length" value="148" sub="characters / SMS" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {multilingualAlerts.map((zone) => (
          <ZoneCard key={zone.digipinZone} zone={zone} />
        ))}

        <button className="btn btn-primary w-full">
          <Send className="h-3.5 w-3.5" /> Broadcast all (test mode)
        </button>
      </div>
    </div>
  );
}

function ZoneCard({ zone }: { zone: typeof multilingualAlerts[number] }) {
  const sevTone =
    zone.severity === "CRITICAL"
      ? "chip-bad"
      : zone.severity === "HIGH"
        ? "chip-warn"
        : "chip-info";

  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/60 p-3.5">
      {/* Zone header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`chip ${sevTone} text-[9px] py-0`}>{zone.severity}</span>
          <code className="font-mono text-[11px] text-cyan-300">{zone.digipinZone}</code>
          <span className="text-[11px] text-slate-300">· {zone.district}</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <Languages className="h-3 w-3" /> 4 scripts
          <span className="text-slate-600">·</span>
          {formatNumber(zone.totalRecipients)} recipients
        </div>
      </div>

      {/* Channel chips */}
      <div className="mt-2 flex items-center gap-1.5">
        {zone.channels.map((ch) => {
          const Icon = CHANNEL_ICON[ch];
          return (
            <span
              key={ch}
              className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/[0.02] px-1.5 py-0.5 text-[9.5px] text-slate-300"
            >
              <Icon className="h-2.5 w-2.5" />
              {ch}
            </span>
          );
        })}
        <span className="ml-auto inline-flex items-center gap-1 text-[9.5px] text-emerald-300">
          <ShieldCheck className="h-2.5 w-2.5" />
          parity verified
        </span>
      </div>

      {/* 4 scripts side by side */}
      <div className="mt-3 grid gap-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
        {SCRIPTS.map((s) => {
          const text = zone.scripts[s.key];
          return (
            <div
              key={s.key}
              className="rounded-md border border-white/5 bg-black/35 p-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] uppercase tracking-wider text-cyan-300/85">
                  {s.label}
                </span>
                <span
                  className="text-[10.5px] text-slate-400"
                  style={{ fontFamily: s.font }}
                >
                  {s.native}
                </span>
              </div>
              <p
                className="mt-1.5 text-[12px] leading-snug text-slate-100"
                style={{ fontFamily: s.font }}
              >
                {text}
              </p>
              <div className="mt-1.5 flex items-center justify-between text-[9.5px] text-slate-500">
                <span>{text.length} chars</span>
                <span className="font-mono">SMS-safe</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Mini({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-base font-semibold tabular text-slate-100 leading-tight">
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
