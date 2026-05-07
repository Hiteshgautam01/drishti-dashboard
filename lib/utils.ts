import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    return new Intl.NumberFormat("en-IN", {
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(n);
  }
  return new Intl.NumberFormat("en-IN").format(n);
}

export function formatINR(rs: number, opts: { compact?: boolean } = {}) {
  if (opts.compact) {
    // Use Indian crore/lakh terminology with a clean space
    if (rs >= 1e7) return `₹${(rs / 1e7).toFixed(rs >= 1e8 ? 0 : 1)} Cr`;
    if (rs >= 1e5) return `₹${(rs / 1e5).toFixed(rs >= 1e6 ? 0 : 1)} L`;
    if (rs >= 1e3) return `₹${(rs / 1e3).toFixed(0)}k`;
    return `₹${rs}`;
  }
  return "₹" + new Intl.NumberFormat("en-IN").format(rs);
}

export function statusColor(status: "GREEN" | "YELLOW" | "RED" | string) {
  switch (status) {
    case "GREEN":
      return "#10b981";
    case "YELLOW":
      return "#f59e0b";
    case "RED":
      return "#ef4444";
    default:
      return "#64748b";
  }
}

export function riskTone(level: "CRITICAL" | "HIGH" | "MODERATE" | "LOW" | string) {
  switch (level) {
    case "CRITICAL":
      return { color: "#ef4444", chip: "chip-bad" };
    case "HIGH":
      return { color: "#f97316", chip: "chip-bad" };
    case "MODERATE":
      return { color: "#f59e0b", chip: "chip-warn" };
    case "LOW":
      return { color: "#10b981", chip: "chip-ok" };
    default:
      return { color: "#64748b", chip: "chip" };
  }
}

export function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
