"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "./Brand";
import { cn } from "@/lib/utils";
import { Activity, Building2, Smartphone, Home } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: Home },
  { href: "/operator", label: "Operator", icon: Activity },
  { href: "/setu", label: "SETU · Institutions", icon: Building2 },
  { href: "/gds", label: "GDS Field App", icon: Smartphone },
];

export function Nav({ accent }: { accent?: boolean }) {
  const pathname = usePathname();
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/5 backdrop-blur-md",
        accent
          ? "bg-ink-950/70"
          : "bg-ink-950/85"
      )}
    >
      <div className="mx-auto flex h-14 max-w-[1900px] items-center justify-between px-4 lg:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <BrandMark />
          <span className="hidden text-[10px] tracking-[0.3em] uppercase text-slate-500 lg:inline">
            UPU Innovation Challenge 2026
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            const active =
              l.href === "/"
                ? pathname === "/"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition",
                  active
                    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/30"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <span className="kbd">v1.0</span>
          <span className="chip chip-info">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
            Live demo · Assam 2026
          </span>
        </div>
      </div>
    </header>
  );
}
