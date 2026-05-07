"use client";

import { postOffices, postOfficeStats, districts } from "@/lib/mock-data";
import { cn, riskTone } from "@/lib/utils";
import {
  Snowflake,
  BatteryCharging,
  Banknote,
  Building2,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

export function CapacityPanel() {
  const totalGds = postOffices.reduce((s, o) => s + o.gdsCount, 0);
  const totalVeh = postOffices.reduce((s, o) => s + o.vehicleCount, 0);
  const totalIppb = postOffices.reduce((s, o) => s + o.ippbFloatLakhs, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="label-mini">CAPACITY · live api.postalpincode.in inventory</div>
        <span className="font-mono text-[10px] text-slate-500">
          poll: 7.2s · cache: 30s
        </span>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-3 gap-2">
          <CapStat
            icon={<Building2 className="h-3.5 w-3.5" />}
            label="Offices"
            value={`${postOfficeStats.green}/${postOfficeStats.total}`}
            sub="GREEN / total"
          />
          <CapStat
            icon={<Truck className="h-3.5 w-3.5" />}
            label="Vehicles"
            value="88"
            sub="HGV + LGV"
          />
          <CapStat
            icon={<Users className="h-3.5 w-3.5" />}
            label="GDS deployed"
            value="948"
            sub="of 1,247 in zone"
          />
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <CapStat
            icon={<Wallet className="h-3.5 w-3.5" />}
            label="IPPB float"
            value="₹6.8 Cr"
            sub="across hubs"
          />
          <CapStat
            icon={<Snowflake className="h-3.5 w-3.5" />}
            label="Cold chain"
            value="9"
            sub="head offices"
          />
          <CapStat
            icon={<BatteryCharging className="h-3.5 w-3.5" />}
            label="Backup power"
            value="22"
            sub="hubs ready"
          />
        </div>

        {/* Status bar */}
        <div className="mt-3">
          <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
            <div
              className="bg-emerald-400/80"
              style={{ width: `${(postOfficeStats.green / postOfficeStats.total) * 100}%` }}
            />
            <div
              className="bg-amber-400/80"
              style={{ width: `${(postOfficeStats.yellow / postOfficeStats.total) * 100}%` }}
            />
            <div
              className="bg-red-400/80"
              style={{ width: `${(postOfficeStats.red / postOfficeStats.total) * 100}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-500">
            <span><span className="text-emerald-300">{postOfficeStats.green}</span> operational</span>
            <span><span className="text-amber-300">{postOfficeStats.yellow}</span> partial</span>
            <span><span className="text-red-300">{postOfficeStats.red}</span> offline</span>
          </div>
        </div>
      </div>

      {/* District table */}
      <div className="mt-3 px-4">
        <div className="label-mini mb-1.5">By district · 12 affected</div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <table className="w-full text-[11.5px]">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <th className="pb-2 font-medium">District</th>
              <th className="pb-2 font-medium">Risk</th>
              <th className="pb-2 font-medium text-right">Pop.</th>
              <th className="pb-2 font-medium text-right">Rain</th>
              <th className="pb-2 font-medium text-right">Displaced</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {districts.map((d) => {
              const tone = riskTone(d.risk);
              return (
                <tr key={d.name} className="hover:bg-white/[0.02]">
                  <td className="py-1.5 font-medium text-slate-200">{d.name}</td>
                  <td className="py-1.5">
                    <span className={cn("chip text-[9px] py-0", tone.chip)}>{d.risk}</span>
                  </td>
                  <td className="py-1.5 text-right tabular text-slate-400">
                    {(d.population / 1e6).toFixed(1)}M
                  </td>
                  <td className="py-1.5 text-right tabular text-slate-300">
                    {d.rainfall_72h_mm}mm
                  </td>
                  <td className="py-1.5 text-right tabular text-amber-200">
                    {(d.displacementEstimate / 1000).toFixed(1)}k
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CapStat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-slate-500">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-display text-base font-semibold tabular text-slate-100 leading-tight">
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{sub}</div>
    </div>
  );
}
