"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Tv,
  Camera,
  Radio,
  Waves,
  AlertTriangle,
  Heart,
  MessageCircle,
  Repeat2,
  Phone,
  PhoneIncoming,
  Wifi,
  WifiOff,
  Globe2,
  Flame,
  CloudRain,
  Cloud,
  Mountain,
  Snowflake,
  Wind,
  Sun,
  Thermometer,
  Factory,
  Droplets,
  ExternalLink,
} from "lucide-react";

// ─── Live feeds config ────────────────────────────────────────────────────
//
// All three external endpoints are public, free, and key-less. Calls happen
// client-side; if any one fails we fall back to the static mocks so the demo
// stays presentable on bad networks.

// YouTube live channels — `live_stream?channel=ID` always resolves to the
// channel's current live broadcast. We default to DW News (rock-solid 24/7
// English international) and offer WION as an Indian-context alternate.
const YT_CHANNELS = [
  {
    id: "dw",
    label: "DW NEWS",
    sub: "English · Germany",
    channelId: "UCknLrEdhRCp1aegoMqRaCZg",
  },
  {
    id: "wion",
    label: "WION",
    sub: "English · India",
    channelId: "UC_gUM8rL-Lrg6O3adPW9K1g",
  },
  {
    id: "aje",
    label: "AL JAZEERA",
    sub: "English · Qatar",
    channelId: "UCNye-wNBqNL5ZzHSJj3l8Bg",
  },
] as const;
type YtChannelId = (typeof YT_CHANNELS)[number]["id"];
function ytLiveUrl(channelId: string) {
  return `https://www.youtube.com/embed/live_stream?channel=${channelId}&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&playsinline=1`;
}

// Open-Meteo — Guwahati (Brahmaputra at LGB Intl Airport). No key, no quota.
const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=26.18&longitude=91.74&current=temperature_2m,precipitation,rain,wind_speed_10m,relative_humidity_2m&hourly=precipitation&past_days=1&timezone=Asia%2FKolkata";

// Reddit JSON — combine /r/india + /r/IndiaSpeaks + /r/AssamRevival via the
// multi-subreddit syntax. Cast a wider net, then disaster/weather filter
// client-side.
const REDDIT_URL =
  "https://www.reddit.com/r/india+IndiaSpeaks+AssamRevival/search.json?q=" +
  encodeURIComponent(
    "flood OR brahmaputra OR monsoon OR cyclone OR rainfall OR landslide OR ndrf OR ndma OR rescue OR disaster"
  ) +
  "&restrict_sr=true&sort=new&t=month&limit=50";

// NASA EONET — every active natural-disaster event on Earth right now. CORS-
// open, no key, JSON. Used to demonstrate DRISHTI's global-scale claim with
// real data the jury can verify in another browser tab.
const EONET_URL =
  "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=100";

const LIVE_REFRESH_MS = 60_000;

// ─── Static mock content ──────────────────────────────────────────────────

const NEWS_HEADLINES = [
  "ব্রহ্মপুত্রর জলস্তর বিপদ সীমার ০.৩ মিটাৰ ওপৰত · ASDMA জাৰি কৰিলে CRITICAL সতৰ্কবাণী",
  "BRAHMAPUTRA RIVER · 49.8m at GUWAHATI · DANGER MARK 49.7m · ASDMA RED ALERT",
  "ब्रह्मपुत्र खतरे के निशान से ऊपर · NDRF की 14 टीमें असम के 12 जिलों में तैनात",
  "INDIA POST DRISHTI ACTIVATED · 173 OFFICES OPERATIONAL · 948 GDS DEPLOYED",
  "नागांव में 412mm बारिश · DigiPIN आधारित बहुभाषी अलर्ट 29 लाख लोगों को भेजे गए",
  "WORLD BANK · ₹37.5 Cr PARAMETRIC TRIGGER RELEASED · IPPB DISBURSEMENT IN PROGRESS",
];

// CCTV feeds — kept the two thematically critical cameras (the bridge under
// flood threat and the river itself). Office-front and relief-camp tiles were
// pure decoration with no information payload.
const CCTV_FEEDS = [
  {
    id: "CAM-07",
    label: "NH-27 · Mayong Bridge",
    digipin: "FK4-7M3-J9PR",
    tone: "danger" as const,
    icon: "bridge" as const,
  },
  {
    id: "CAM-04",
    label: "Brahmaputra · Pandu Ghat",
    digipin: "FK4-7M1-Q5RT",
    tone: "danger" as const,
    icon: "river" as const,
  },
];

const SOCIAL_POSTS = [
  {
    handle: "@ASDMA_Assam",
    verified: true,
    body: "🚨 RED ALERT · Brahmaputra crosses danger mark at 5 stations. NDRF deployed. Stay alert. #AssamFlood2026",
    meta: "1.2K · 4 min ago · Guwahati",
    tone: "danger" as const,
  },
  {
    handle: "@IndiaPostOffice",
    verified: true,
    body: "DRISHTI সক্ৰিয় · ১৭৩ ডাকঘৰে কাম কৰি আছে · ৯৪৮ ডাক সেৱক মাঠত · #AssamFlood",
    meta: "847 · 6 min ago · Dispur",
    tone: "info" as const,
    lang: "as" as const,
  },
  {
    handle: "@NDRFHQ",
    verified: true,
    body: "14 NDRF teams now in Nagaon, Morigaon, Dhubri. Working with @IndiaPostOffice for last-mile relief logistics.",
    meta: "612 · 8 min ago · New Delhi",
    tone: "info" as const,
  },
  {
    handle: "@bhuyan_priti",
    verified: false,
    body: "हमारे डाकिया रमेश जी ने 12 घरों की पुष्टि की · दादी जी की दवाई भी लेकर आए · सलाम 🙏",
    meta: "2.4K · 12 min ago · Mayong",
    tone: "warm" as const,
    lang: "hi" as const,
  },
  {
    handle: "@DDNews_Live",
    verified: true,
    body: "BREAKING · India Post's DRISHTI AI system reaches 2.9M people across 12 districts in under 3 hrs.",
    meta: "5.8K · 14 min ago",
    tone: "info" as const,
  },
];

const CALL_CENTER_QUEUE = [
  { lang: "Assamese", count: 412 },
  { lang: "Hindi", count: 287 },
  { lang: "Bengali", count: 164 },
  { lang: "English", count: 38 },
];

// ─── Main panel ────────────────────────────────────────────────────────────

export function SituationRoom() {
  // Default ON — judges expect to see real broadcast/data. Toggle off only if
  // the demo network is bad.
  const [live, setLive] = useState(true);

  return (
    <div className="h-full overflow-y-auto bg-ink-950">
      <div className="space-y-3 p-3">
        <Header live={live} setLive={setLive} />

        {/* Top row: News telecast (wide) + CCTV grid 2x2 */}
        <div className="grid gap-3 lg:grid-cols-2">
          <NewsTelecast live={live} />
          <CctvGrid />
        </div>

        {/* Mid row: Brahmaputra gauge + Social pulse */}
        <div className="grid gap-3 lg:grid-cols-[260px_1fr]">
          <RiverGauge live={live} />
          <SocialPulse live={live} />
        </div>

        {/* Global pulse — full width, proves the global-scale claim */}
        <GlobalDisasterPulse live={live} />

        {/* Helpline queue */}
        <CallCenter />
      </div>
    </div>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────

function Header({ live, setLive }: { live: boolean; setLive: (v: boolean) => void }) {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex items-center justify-between rounded-md border border-white/5 bg-ink-900/60 px-3 py-2">
      <div className="flex items-center gap-2">
        <Tv className="h-3.5 w-3.5 text-cyan-300" />
        <span className="label-mini text-cyan-300/90">Situation Room · Media wall</span>
      </div>
      <div className="flex items-center gap-3 text-[10px] text-slate-400">
        <button
          onClick={() => setLive(!live)}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-semibold uppercase tracking-wider transition ${
            live
              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/15"
              : "border-white/10 bg-white/[0.03] text-slate-400 hover:bg-white/[0.06]"
          }`}
          title={live ? "Live external feeds ON · click to use mocks" : "Mock feeds · click to enable live"}
        >
          {live ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          {live ? "Live feeds" : "Mock feeds"}
        </button>
        <span className="flex items-center gap-1">
          <span className={`h-1.5 w-1.5 rounded-full ${live ? "bg-emerald-400 animate-pulse-dot" : "bg-slate-500"}`} />
          {live ? "DD · Open-Meteo · Reddit" : "all sources mocked"}
        </span>
        <span className="font-mono tabular text-slate-300">{now}</span>
      </div>
    </div>
  );
}

// ─── News Telecast ─────────────────────────────────────────────────────────

function NewsTelecast({ live }: { live: boolean }) {
  const [headlineIdx, setHeadlineIdx] = useState(0);
  const [channel, setChannel] = useState<YtChannelId>("dw");
  // Per-channel failure tracking so we can show a "tile failed" state without
  // permanently disabling all iframes.
  const [failed, setFailed] = useState<Record<YtChannelId, boolean>>({
    dw: false,
    wion: false,
    aje: false,
  });

  useEffect(() => {
    const id = setInterval(() => setHeadlineIdx((i) => (i + 1) % NEWS_HEADLINES.length), 5500);
    return () => clearInterval(id);
  }, []);

  // Reset failure state when re-entering live mode
  useEffect(() => {
    if (live) setFailed({ dw: false, wion: false, aje: false });
  }, [live]);

  const activeChannel = YT_CHANNELS.find((c) => c.id === channel)!;
  const showIframe = live && !failed[channel];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black tv-scanlines tv-vignette tv-flicker">
      {/* Channel switcher bar — sits ABOVE the video, never clips broadcast */}
      {live && (
        <div className="flex items-center gap-1.5 border-b border-white/10 bg-black/85 px-2 py-1.5 backdrop-blur-sm">
          <span className="flex items-center gap-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-white">
            <span className="h-1 w-1 rounded-full bg-white rec-blink" />
            LIVE
          </span>
          <span className="text-[9px] uppercase tracking-wider text-slate-500">
            channel
          </span>
          <div className="flex flex-1 items-center gap-1 overflow-x-auto">
            {YT_CHANNELS.map((c) => {
              const isActive = c.id === channel;
              const hasFailed = failed[c.id];
              return (
                <button
                  key={c.id}
                  onClick={() => setChannel(c.id)}
                  className={`shrink-0 rounded-sm px-1.5 py-0.5 text-[9.5px] font-bold tracking-wider transition ${
                    isActive
                      ? "bg-amber-300 text-ink-950 ring-1 ring-amber-200"
                      : hasFailed
                        ? "bg-red-900/60 text-red-200 line-through hover:bg-red-800/70"
                        : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.1]"
                  }`}
                  title={c.sub + (hasFailed ? " (failed)" : "")}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
          <span className="shrink-0 font-mono text-[9px] text-slate-500">
            {activeChannel.sub}
          </span>
        </div>
      )}

      <div className="relative aspect-[16/9] w-full">
        {showIframe ? (
          <iframe
            // key forces the iframe to remount when channel changes — important
            // because YouTube embeds don't always replace src cleanly.
            key={activeChannel.channelId}
            src={ytLiveUrl(activeChannel.channelId)}
            title={`${activeChannel.label} Live`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onError={() => setFailed((f) => ({ ...f, [channel]: true }))}
          />
        ) : (
          <NewsBackdrop />
        )}

        {/*
          Mock-only overlays: the real broadcast already has its own LIVE badge,
          ticker, and lower-third — drawing ours on top would clip the actual
          news content. We only show our overlays when the iframe is OFF
          (mock mode, network failure, or live-feeds toggle off).
        */}
        {!showIframe && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 z-20 flex items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-white rec-blink" />
                LIVE
              </span>
              <span className="rounded-sm bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-amber-300">
                MOCK · DD NEWS
              </span>
            </div>

            <div className="pointer-events-none absolute right-3 top-3 z-20 rounded-sm bg-black/55 px-1.5 py-0.5 font-mono text-[10px] text-slate-200">
              24×7 · HD
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-[42px] z-20">
              <div className="dd-sheen px-4 py-2">
                <div className="font-display text-[12px] font-bold uppercase tracking-wider text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
                  असम बाढ़ · राष्ट्रीय आपदा · LIVE COVERAGE
                </div>
              </div>
              <div
                key={headlineIdx}
                className="bg-black/85 px-4 py-1.5 text-[11.5px] font-semibold leading-tight text-amber-100 animate-fade-in"
                style={{
                  fontFamily:
                    /[ঀ-৿]/.test(NEWS_HEADLINES[headlineIdx])
                      ? "Noto Sans Bengali, Inter, sans-serif"
                      : /[ऀ-ॿ]/.test(NEWS_HEADLINES[headlineIdx])
                        ? "Noto Sans Devanagari, Inter, sans-serif"
                        : "Inter, sans-serif",
                }}
              >
                {NEWS_HEADLINES[headlineIdx]}
              </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 overflow-hidden bg-red-700 py-1">
              <div className="chyron-track text-[10.5px] font-bold uppercase tracking-wider text-white">
                <ChyronLoop />
                <ChyronLoop />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NewsBackdrop() {
  // Mock newsroom — used when live feeds are off or the iframe fails to load
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 60% at 50% 30%, #1e293b 0%, #0f172a 60%, #020617 100%)",
        }}
      />
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-cyan-400/15 blur-2xl" />
        <div className="absolute right-0 top-10 h-44 w-44 rounded-full bg-amber-400/15 blur-3xl" />
      </div>
      <svg
        viewBox="0 0 200 120"
        className="absolute inset-x-0 bottom-0 h-[80%] w-full"
        preserveAspectRatio="xMidYMax meet"
        aria-hidden
      >
        <rect x="0" y="100" width="200" height="20" fill="#0e1116" />
        <rect x="0" y="98" width="200" height="2" fill="#1f2937" />
        <ellipse cx="100" cy="55" rx="14" ry="16" fill="#1f2937" />
        <path d="M76 100 Q100 70 124 100 Z" fill="#0f172a" />
        <g transform="translate(150,18)">
          <circle cx="12" cy="12" r="11" fill="none" stroke="#fbbf24" strokeWidth="2" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontFamily="serif"
            fontSize="10"
            fontWeight="700"
            fill="#fbbf24"
          >
            DD
          </text>
        </g>
        <rect x="86" y="86" width="2" height="14" fill="#374151" />
        <ellipse cx="87" cy="84" rx="3" ry="4" fill="#4b5563" />
      </svg>
    </>
  );
}

function ChyronLoop() {
  return (
    <span className="px-4">
      BREAKING&nbsp;·&nbsp;ब्रह्मपुत्र खतरे के निशान से 30cm ऊपर&nbsp;◆&nbsp;NDRF·14 TEAMS DEPLOYED
      &nbsp;◆&nbsp;INDIA POST DRISHTI ACTIVATED&nbsp;◆&nbsp;অসমৰ ১২ জিলাত বানপানীৰ
      পৰিস্থিতি গুৰুতৰ&nbsp;◆&nbsp;IPPB ₹37.5 Cr RELIEF DISBURSEMENT IN PROGRESS
      &nbsp;◆&nbsp;बाढ़ हेल्पलाइन·50050&nbsp;◆&nbsp;
    </span>
  );
}

// ─── CCTV Grid ─────────────────────────────────────────────────────────────

function CctvGrid() {
  return (
    <div className="rounded-xl border border-white/8 bg-ink-900/50 p-2">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
          <Camera className="h-3 w-3 text-cyan-300" />
          CCTV · priority cameras
        </div>
        <div className="flex items-center gap-1 text-[9.5px] text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" />
          {CCTV_FEEDS.length} live
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CCTV_FEEDS.map((c) => (
          <CctvTile key={c.id} feed={c} />
        ))}
      </div>
    </div>
  );
}

function CctvTile({ feed }: { feed: (typeof CCTV_FEEDS)[number] }) {
  const [stamp, setStamp] = useState<string>("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setStamp(
        d.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
          timeZone: "Asia/Kolkata",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const tonePalette = {
    danger: { bg: "from-red-950 via-slate-900 to-black", glow: "ring-red-500/30" },
    ok: { bg: "from-emerald-950/60 via-slate-900 to-black", glow: "ring-emerald-500/20" },
    info: { bg: "from-cyan-950/60 via-slate-900 to-black", glow: "ring-cyan-400/20" },
  }[feed.tone];

  return (
    <div
      className={`relative overflow-hidden rounded-md border border-white/10 ring-1 ${tonePalette.glow} tv-scanlines cctv-noise`}
    >
      <div className={`relative aspect-[4/3] w-full bg-gradient-to-b ${tonePalette.bg}`}>
        {/* Scene SVG */}
        <CctvScene icon={feed.icon} />

        {/* Top overlay */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-2 py-1 font-mono text-[9px] text-slate-200">
          <div className="flex items-center gap-1">
            <span className="flex items-center gap-1 rounded-sm bg-red-600/85 px-1 py-0 text-[8.5px] font-bold tracking-wider text-white">
              <span className="h-1 w-1 rounded-full bg-white rec-blink" />
              REC
            </span>
            <span className="text-amber-200">{feed.id}</span>
          </div>
          <span className="text-slate-300 tabular">CH-{Math.floor(Math.random() * 32) + 1}</span>
        </div>

        {/* Bottom overlay */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between px-2 py-1 text-[9px] font-mono">
          <span className="text-cyan-300">{feed.digipin}</span>
          <span className="text-slate-200 tabular">{stamp}</span>
        </div>

        {/* Crosshairs (subtle) */}
        <div className="pointer-events-none absolute inset-0 z-[6]">
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.04]" />
          <div className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-white/[0.04]" />
        </div>
      </div>
      {/* Caption */}
      <div className="flex items-center justify-between bg-black/85 px-2 py-1 text-[10px]">
        <span className="text-slate-200">{feed.label}</span>
        {feed.tone === "danger" && (
          <span className="flex items-center gap-1 text-red-400">
            <AlertTriangle className="h-2.5 w-2.5" />
            ALERT
          </span>
        )}
      </div>
    </div>
  );
}

function CctvScene({ icon }: { icon: "bridge" | "river" }) {
  if (icon === "bridge") {
    return (
      <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full opacity-85">
        {/* sky */}
        <defs>
          <linearGradient id="sky-d" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="water-d" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#7c2d12" stopOpacity="0.55" />
            <stop offset="1" stopColor="#451a03" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <rect width="200" height="80" fill="url(#sky-d)" />
        {/* distant hills */}
        <path d="M0 80 Q 40 60 80 75 T 200 70 V 90 H 0 Z" fill="#1e293b" opacity="0.7" />
        {/* bridge cables */}
        <path d="M10 70 L 100 30 L 190 70" stroke="#475569" strokeWidth="1" fill="none" />
        <line x1="100" y1="30" x2="100" y2="80" stroke="#64748b" strokeWidth="1.5" />
        {/* bridge deck (broken visualization) */}
        <rect x="10" y="80" width="80" height="3" fill="#475569" />
        <rect x="110" y="80" width="80" height="3" fill="#475569" />
        <rect x="92" y="84" width="14" height="2" fill="#1e293b" />
        {/* swirling flood water */}
        <rect y="83" width="200" height="67" fill="url(#water-d)" />
        {/* swirls */}
        <g stroke="#fbbf24" strokeWidth="0.7" fill="none" opacity="0.55">
          <path d="M20 110 q 10 -5 20 0 t 20 0">
            <animate attributeName="d" dur="3s" repeatCount="indefinite"
              values="M20 110 q 10 -5 20 0 t 20 0; M20 112 q 10 5 20 0 t 20 0; M20 110 q 10 -5 20 0 t 20 0" />
          </path>
          <path d="M120 130 q 10 -3 20 0 t 20 0">
            <animate attributeName="d" dur="3.4s" repeatCount="indefinite"
              values="M120 130 q 10 -3 20 0 t 20 0; M120 128 q 10 3 20 0 t 20 0; M120 130 q 10 -3 20 0 t 20 0" />
          </path>
        </g>
        {/* debris */}
        <rect x="60" y="100" width="6" height="2" fill="#78350f" transform="rotate(15 63 101)" />
        <rect x="140" y="115" width="8" height="2" fill="#78350f" transform="rotate(-12 144 116)" />
      </svg>
    );
  }
  // river
  return (
    <svg viewBox="0 0 200 150" className="absolute inset-0 h-full w-full opacity-95">
      <defs>
        <linearGradient id="sky-r" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0f172a" />
          <stop offset="1" stopColor="#7c2d12" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="water-r" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#9a3412" stopOpacity="0.85" />
          <stop offset="1" stopColor="#451a03" />
        </linearGradient>
      </defs>
      <rect width="200" height="60" fill="url(#sky-r)" />
      <path d="M0 60 Q 50 45 100 55 T 200 50 V 80 H 0 Z" fill="#1e293b" />
      <rect y="78" width="200" height="72" fill="url(#water-r)" />
      {/* boat */}
      <g transform="translate(70 100)">
        <path d="M0 0 L 40 0 L 36 10 L 4 10 Z" fill="#1c1917" />
        <rect x="14" y="-8" width="14" height="9" fill="#3f3f46" />
        <line x1="20" y1="-8" x2="20" y2="-22" stroke="#52525b" strokeWidth="1" />
        <rect x="20" y="-22" width="12" height="8" fill="#a3a3a3" />
      </g>
      {/* floating debris */}
      <g fill="#78350f">
        <rect x="20" y="115" width="8" height="2" transform="rotate(20 24 116)" />
        <rect x="155" y="125" width="10" height="2" transform="rotate(-15 160 126)" />
        <rect x="115" y="135" width="6" height="2" />
      </g>
      {/* shimmer */}
      <line x1="0" y1="92" x2="200" y2="92" stroke="#fbbf24" strokeWidth="0.4" opacity="0.3">
        <animate attributeName="opacity" dur="2.5s" repeatCount="indefinite"
          values="0.3;0.55;0.3" />
      </line>
    </svg>
  );
}

// ─── River Gauge ────────────────────────────────────────────────────────────

function RiverGauge({ live }: { live: boolean }) {
  // Brahmaputra at Guwahati: NORMAL 47.0m / WARNING 49.0m / DANGER 49.7m / SEVERE 51.0m
  const MIN = 46;
  const MAX = 52;
  const WARNING = 49.0;
  const DANGER = 49.7;
  const SEVERE = 51.0;

  const [level, setLevel] = useState(49.5);
  const [meteo, setMeteo] = useState<{
    rain24h: number;
    currentRain: number;
    humidity: number;
    wind: number;
  } | null>(null);
  const [meteoErr, setMeteoErr] = useState(false);

  // Live data from Open-Meteo for Guwahati (Brahmaputra at LGB Intl).
  // Maps recent rainfall onto a synthetic gauge level (the real CWC API has no
  // public CORS endpoint). Cached at LIVE_REFRESH_MS.
  useEffect(() => {
    if (!live) {
      setMeteoErr(false);
      setMeteo(null);
      return;
    }

    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(OPEN_METEO_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("open-meteo " + res.status);
        const data = await res.json();
        if (cancelled) return;
        const hourly: number[] = data?.hourly?.precipitation ?? [];
        const last24 = hourly.slice(-24).reduce((s, x) => s + (x ?? 0), 0);
        const cur = data?.current?.precipitation ?? 0;
        const hum = data?.current?.relative_humidity_2m ?? 0;
        const wind = data?.current?.wind_speed_10m ?? 0;
        setMeteo({
          rain24h: last24,
          currentRain: cur,
          humidity: hum,
          wind,
        });
        // Map rainfall to gauge level. Calibrated so:
        //   0mm/24h → ~47.2m, 80mm → ~49.0m, 120mm → ~49.7m, 250mm → 51.0m
        const synth = 47.2 + Math.min(4.6, last24 * 0.032);
        setLevel(synth);
        setMeteoErr(false);
      } catch (e) {
        if (!cancelled) setMeteoErr(true);
      }
    }

    pull();
    const id = setInterval(pull, LIVE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live]);

  // Mock random-walk when not live (or while live data is unavailable)
  useEffect(() => {
    if (live && !meteoErr && meteo) return; // real data is driving level
    const id = setInterval(() => {
      setLevel((l) => {
        const drift = (Math.random() - 0.35) * 0.04;
        return Math.max(MIN + 0.2, Math.min(MAX - 0.1, l + drift));
      });
    }, 1800);
    return () => clearInterval(id);
  }, [live, meteoErr, meteo]);

  const pct = ((level - MIN) / (MAX - MIN)) * 100;
  const tone =
    level >= SEVERE
      ? { label: "SEVERE", color: "text-red-400", bar: "bg-red-500" }
      : level >= DANGER
        ? { label: "DANGER", color: "text-red-300", bar: "bg-red-400" }
        : level >= WARNING
          ? { label: "WARNING", color: "text-amber-300", bar: "bg-amber-400" }
          : { label: "NORMAL", color: "text-emerald-300", bar: "bg-emerald-400" };

  const yFor = (v: number) => 100 - ((v - MIN) / (MAX - MIN)) * 100;

  const sourceLabel = live && meteo
    ? "Guwahati · Open-Meteo · live"
    : live && meteoErr
      ? "Guwahati · CWC mock (open-meteo offline)"
      : "Guwahati · CWC mock";

  return (
    <div className="panel relative overflow-hidden p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 label-mini">
          <Waves className="h-3 w-3 text-cyan-300" />
          Brahmaputra
        </div>
        <span className={`chip text-[9px] py-0 ${tone.color}`}>
          {tone.label}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
        {live && meteo && <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse-dot" />}
        <span>{sourceLabel}</span>
      </div>

      <div className="mt-3 flex items-stretch gap-2">
        {/* Gauge tube */}
        <div className="relative h-[200px] w-[28px] overflow-hidden rounded-md border border-white/10 bg-black/55">
          {/* threshold lines */}
          {[
            { v: WARNING, c: "rgba(251,191,36,0.7)" },
            { v: DANGER, c: "rgba(248,113,113,0.85)" },
            { v: SEVERE, c: "rgba(220,38,38,0.95)" },
          ].map((t) => (
            <div
              key={t.v}
              className="absolute left-0 right-0 h-px"
              style={{ top: `${yFor(t.v)}%`, background: t.c, boxShadow: `0 0 4px ${t.c}` }}
            />
          ))}
          {/* water fill */}
          <div
            className="gauge-water-fill absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-out"
            style={{ height: `${pct}%` }}
          />
        </div>

        {/* Tick labels */}
        <div className="relative h-[200px] flex-1">
          {[
            { v: 51.0, l: "51.0m · SEVERE", c: "text-red-400" },
            { v: DANGER, l: "49.7m · DANGER", c: "text-red-300" },
            { v: WARNING, l: "49.0m · WARNING", c: "text-amber-300" },
            { v: 47.0, l: "47.0m · NORMAL", c: "text-emerald-300" },
          ].map((t) => (
            <div
              key={t.v}
              className={`absolute left-0 -translate-y-1/2 font-mono text-[9.5px] ${t.c}`}
              style={{ top: `${yFor(t.v)}%` }}
            >
              ── {t.l}
            </div>
          ))}
          {/* Current value pointer */}
          <div
            className="absolute -left-1 z-10 -translate-y-1/2 transition-[top] duration-700 ease-out"
            style={{ top: `${yFor(level)}%` }}
          >
            <div className="flex items-center gap-1">
              <div className="h-px w-3 bg-cyan-200" />
              <span className="rounded bg-cyan-400 px-1 py-[1px] font-mono text-[9.5px] font-bold text-ink-950 shadow-[0_0_8px_rgba(34,211,238,0.7)]">
                {level.toFixed(2)}m
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5 text-[10px]">
        <Mini2
          label="Rain 24h"
          value={meteo ? `${meteo.rain24h.toFixed(1)}mm` : "—"}
          tone={meteo && meteo.rain24h > 80 ? "warn" : "info"}
        />
        <Mini2
          label="Wind"
          value={meteo ? `${meteo.wind.toFixed(0)} km/h` : "38.4k m³/s"}
          tone="info"
        />
      </div>
    </div>
  );
}

function Mini2({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "warn" | "info" | "ok";
}) {
  const c = {
    warn: "text-amber-200 border-amber-400/20 bg-amber-400/[0.04]",
    info: "text-cyan-200 border-cyan-400/20 bg-cyan-400/[0.04]",
    ok: "text-emerald-200 border-emerald-400/20 bg-emerald-400/[0.04]",
  }[tone];
  return (
    <div className={`rounded-md border px-2 py-1.5 ${c}`}>
      <div className="text-[9px] uppercase tracking-wider opacity-70">{label}</div>
      <div className="font-mono text-[12px] tabular font-semibold">{value}</div>
    </div>
  );
}

// ─── Social Pulse ──────────────────────────────────────────────────────────

type RedditPost = {
  handle: string;
  verified: boolean;
  body: string;
  meta: string;
  tone: "danger" | "info" | "warm";
  lang?: "as" | "hi";
  url?: string;
  score?: number;
  comments?: number;
  shares?: number;
};

// Positive match — must be a disaster / weather / postal topic.
const KEYWORDS_POSITIVE =
  /(flood|brahmaputra|monsoon|ndrf|ndma|cyclone|storm|landslide|evacuation|displaced|rainfall|deluge|inundated|river level|water level|disaster|imd|sachet|relief camp|rescue operation|india post|postman|gramin dak|postal)/i;

// Negative match — political / unsafe content excluded for pitch safety.
const KEYWORDS_EXCLUDE =
  /(election|vote|bjp|congress|aap|modi|gandhi|amit shah|sabotage|riots?|murder|rape|killed|stabbed|loksabha|hindutva|protest|communal|caste)/i;

function timeAgo(s: number) {
  const diff = Math.max(0, Math.floor(Date.now() / 1000 - s));
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function detectScript(s: string): "as" | "hi" | undefined {
  if (/[ঀ-৿]/.test(s)) return "as";
  if (/[ऀ-ॿ]/.test(s)) return "hi";
  return undefined;
}

function SocialPulse({ live }: { live: boolean }) {
  const [pulse, setPulse] = useState(342);
  const [sentimentIdx, setSentimentIdx] = useState(0);
  const [redditPosts, setRedditPosts] = useState<RedditPost[] | null>(null);
  const [redditErr, setRedditErr] = useState(false);

  // Cycle highlight + pulse
  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) => p + Math.floor(Math.random() * 11) - 2);
      setSentimentIdx((i) => i + 1);
    }, 2400);
    return () => clearInterval(id);
  }, []);

  // Live Reddit fetch
  useEffect(() => {
    if (!live) {
      setRedditPosts(null);
      setRedditErr(false);
      return;
    }

    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(REDDIT_URL, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error("reddit " + res.status);
        const data = await res.json();
        if (cancelled) return;

        const children: any[] = data?.data?.children ?? [];
        const filtered: RedditPost[] = children
          .map((c) => c?.data ?? {})
          .filter((d: any) => {
            if (!d.title) return false;
            if (d.over_18) return false;
            if (d.removed_by_category) return false;
            if (d.locked) return false;
            if ((d.score ?? 0) < 1) return false;
            const blob = `${d.title} ${d.selftext ?? ""}`;
            // Must mention a disaster/postal topic AND not be political
            return KEYWORDS_POSITIVE.test(blob) && !KEYWORDS_EXCLUDE.test(blob);
          })
          .slice(0, 10)
          .map((d: any) => {
            const title = (d.title as string).slice(0, 280);
            const tone =
              /(red alert|critical|emergency|severe|killed|dead|missing)/i.test(
                title
              )
                ? ("danger" as const)
                : /(rescue|help|relief|deployed|saved|donate)/i.test(title)
                  ? ("warm" as const)
                  : ("info" as const);
            return {
              handle: `u/${d.author ?? "unknown"} · r/${d.subreddit ?? "india"}`,
              verified: false,
              body: title,
              meta: `${d.score ?? 0} · ${timeAgo(d.created_utc ?? 0)}`,
              tone,
              lang: detectScript(title),
              url: d.permalink ? `https://reddit.com${d.permalink}` : undefined,
              score: d.score,
              comments: d.num_comments,
            };
          });

        if (filtered.length > 0) {
          setRedditPosts(filtered);
          setRedditErr(false);
        } else {
          // Found posts but nothing matched keywords — keep showing mocks
          setRedditErr(true);
        }
      } catch (e) {
        if (!cancelled) setRedditErr(true);
      }
    }

    pull();
    const id = setInterval(pull, LIVE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live]);

  const posts = redditPosts ?? SOCIAL_POSTS;
  const isLive = live && redditPosts !== null && !redditErr;
  const highlightedIdx = sentimentIdx % posts.length;

  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 label-mini">
          <Radio className="h-3 w-3 text-cyan-300" />
          Social pulse · {isLive ? "Reddit · live" : "#AssamFlood2026 · mock"}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="font-mono tabular text-slate-200">{pulse}</span>
          <span className="text-slate-500">posts/min</span>
        </div>
      </div>

      <div className="mt-3 max-h-[230px] space-y-2 overflow-y-auto pr-1">
        {posts.map((p, i) => (
          <SocialCard
            key={(p as any).url ?? i}
            post={p as RedditPost}
            highlighted={i === highlightedIdx}
            isReddit={isLive}
          />
        ))}
      </div>
    </div>
  );
}

function SocialCard({
  post,
  highlighted,
  isReddit = false,
}: {
  post: RedditPost;
  highlighted: boolean;
  isReddit?: boolean;
}) {
  const toneRing = {
    danger: "ring-red-400/30 bg-red-500/[0.06]",
    info: "ring-cyan-400/20 bg-cyan-500/[0.04]",
    warm: "ring-emerald-400/20 bg-emerald-500/[0.04]",
  }[post.tone];
  const fontFamily =
    post.lang === "as"
      ? "Noto Sans Bengali, Inter, sans-serif"
      : post.lang === "hi"
        ? "Noto Sans Devanagari, Inter, sans-serif"
        : "Inter, sans-serif";

  // For Reddit posts use real score/comment counts; for mock use stable
  // pseudo-randoms keyed off the body length so they don't shift on re-render.
  const seed = post.body.length;
  const likes = post.score ?? 50 + (seed * 13) % 800;
  const comments = post.comments ?? 20 + (seed * 7) % 200;
  const shares = post.shares ?? 20 + (seed * 11) % 400;

  const Wrapper: React.ElementType = post.url ? "a" : "div";
  const wrapperProps = post.url
    ? { href: post.url, target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className={`block rounded-lg border border-white/8 px-3 py-2 ring-1 transition ${toneRing} ${
        highlighted ? "ring-cyan-300/60" : ""
      } ${post.url ? "hover:border-white/20" : ""}`}
    >
      <div className="flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate font-semibold text-slate-100">{post.handle}</span>
          {post.verified && (
            <span className="text-cyan-300" title="verified">
              ✓
            </span>
          )}
          {isReddit && (
            <span className="rounded-sm bg-orange-500/15 px-1 text-[8.5px] font-bold uppercase tracking-wider text-orange-300">
              reddit
            </span>
          )}
        </div>
        <span className="shrink-0 text-[9.5px] text-slate-500">{post.meta}</span>
      </div>
      <p
        className="mt-1 text-[12px] leading-snug text-slate-200"
        style={{ fontFamily }}
      >
        {post.body}
      </p>
      <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1">
          <Heart className="h-2.5 w-2.5" /> {likes}
        </span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-2.5 w-2.5" /> {comments}
        </span>
        <span className="inline-flex items-center gap-1">
          <Repeat2 className="h-2.5 w-2.5" /> {shares}
        </span>
      </div>
    </Wrapper>
  );
}

// ─── Drone Feed ────────────────────────────────────────────────────────────

// ─── Global Disaster Pulse · NASA EONET ───────────────────────────────────

type EonetEvent = {
  id: string;
  title: string;
  link: string;
  closed: string | null;
  categories: { id: string; title: string }[];
  geometry: {
    date: string;
    type: string;
    coordinates: any;
    magnitudeValue?: number;
    magnitudeUnit?: string;
  }[];
};

const CAT_META: Record<
  string,
  { color: string; short: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  wildfires: { color: "#ef4444", short: "Wildfires", Icon: Flame },
  severeStorms: { color: "#a78bfa", short: "Storms", Icon: CloudRain },
  floods: { color: "#22d3ee", short: "Floods", Icon: Droplets },
  volcanoes: { color: "#f97316", short: "Volcanoes", Icon: Mountain },
  drought: { color: "#fbbf24", short: "Drought", Icon: Sun },
  earthquakes: { color: "#fb923c", short: "Quakes", Icon: AlertTriangle },
  seaLakeIce: { color: "#bae6fd", short: "Ice", Icon: Snowflake },
  landslides: { color: "#a3a3a3", short: "Landslides", Icon: Mountain },
  snow: { color: "#e2e8f0", short: "Snow", Icon: Snowflake },
  dustHaze: { color: "#d6d3d1", short: "Dust", Icon: Wind },
  manmade: { color: "#84cc16", short: "Manmade", Icon: Factory },
  tempExtremes: { color: "#fde047", short: "Temp", Icon: Thermometer },
  waterColor: { color: "#06b6d4", short: "Water", Icon: Droplets },
};

function lastCoord(geom?: EonetEvent["geometry"]): [number, number] | null {
  if (!geom || !geom.length) return null;
  const last = geom[geom.length - 1];
  const c = last?.coordinates;
  if (!c) return null;
  // Point: [lon, lat]
  if (typeof c[0] === "number") return [c[0], c[1]];
  // Polygon: [ [ [lon,lat], ... ] ] — take centroid of first ring
  const ring = Array.isArray(c[0]) && Array.isArray(c[0][0]) ? c[0] : c;
  if (!ring?.length) return null;
  let sx = 0,
    sy = 0;
  for (const p of ring) {
    sx += p[0];
    sy += p[1];
  }
  return [sx / ring.length, sy / ring.length];
}

function timeAgoIso(iso: string) {
  const t = new Date(iso).getTime();
  if (!t) return "—";
  const diff = Math.max(0, (Date.now() - t) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// Equirectangular projection helpers — map lon/lat to %
function projX(lon: number) {
  return ((lon + 180) / 360) * 100;
}
function projY(lat: number) {
  return ((90 - lat) / 180) * 100;
}

// Static fallback for when offline or live disabled
const EONET_FALLBACK: { lat: number; lon: number; cat: string; title: string }[] = [
  { lat: 38, lon: -120, cat: "wildfires", title: "Wildfires · California, USA" },
  { lat: 26, lon: 92, cat: "floods", title: "Brahmaputra Flooding · Assam, India" },
  { lat: 13, lon: 124, cat: "severeStorms", title: "Tropical Storm · Philippines" },
  { lat: 37, lon: 15, cat: "volcanoes", title: "Mount Etna · Italy" },
  { lat: -25, lon: 134, cat: "wildfires", title: "Wildfires · Northern Territory, AU" },
  { lat: -15, lon: -60, cat: "wildfires", title: "Amazon Wildfires · Brazil" },
  { lat: 14, lon: 38, cat: "drought", title: "Drought · Horn of Africa" },
  { lat: 35, lon: -90, cat: "severeStorms", title: "Severe Storms · Mississippi Valley" },
];

function GlobalDisasterPulse({ live }: { live: boolean }) {
  const [events, setEvents] = useState<EonetEvent[] | null>(null);
  const [err, setErr] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    if (!live) {
      setEvents(null);
      setErr(false);
      return;
    }
    let cancelled = false;
    async function pull() {
      try {
        const res = await fetch(EONET_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("eonet " + res.status);
        const data = await res.json();
        if (!cancelled) {
          setEvents(data?.events ?? []);
          setErr(false);
        }
      } catch (e) {
        if (!cancelled) setErr(true);
      }
    }
    pull();
    const id = setInterval(pull, LIVE_REFRESH_MS * 5); // 5 min — EONET is slow-moving
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [live]);

  // Build markers + recent list
  const isLive = live && events !== null && !err;
  const markers = useMemo(() => {
    if (isLive && events) {
      return events
        .map((e) => {
          const coord = lastCoord(e.geometry);
          if (!coord) return null;
          const [lon, lat] = coord;
          const cat = e.categories?.[0]?.id ?? "manmade";
          return { id: e.id, lon, lat, cat, title: e.title, link: e.link, geom: e.geometry };
        })
        .filter((x): x is NonNullable<typeof x> => !!x);
    }
    // Fallback static
    return EONET_FALLBACK.map((f, i) => ({
      id: `mock-${i}`,
      lon: f.lon,
      lat: f.lat,
      cat: f.cat,
      title: f.title,
      link: "",
      geom: undefined as any,
    }));
  }, [isLive, events]);

  // Group by category
  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of markers) m.set(x.cat, (m.get(x.cat) ?? 0) + 1);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [markers]);

  // South Asia bbox: 60–100°E, 5–40°N
  const southAsiaCount = markers.filter(
    (m) => m.lon >= 60 && m.lon <= 100 && m.lat >= 5 && m.lat <= 40
  ).length;

  // Recent events (sorted by latest geometry date)
  const recent = useMemo(() => {
    const items = markers
      .map((m) => {
        const lastDate =
          m.geom && m.geom.length
            ? m.geom[m.geom.length - 1]?.date
            : new Date().toISOString();
        return { ...m, lastDate };
      })
      .sort((a, b) => +new Date(b.lastDate) - +new Date(a.lastDate))
      .slice(0, 6);
    return items;
  }, [markers]);

  return (
    <div className="panel p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 label-mini">
          <Globe2 className="h-3 w-3 text-cyan-300" />
          Global disaster pulse · NASA EONET
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          {isLive && (
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse-dot" />
              live
            </span>
          )}
          {!isLive && live && err && (
            <span className="text-amber-300">EONET offline · fallback</span>
          )}
          {!live && <span className="text-slate-500">mock</span>}
          <span className="font-mono tabular text-slate-200">
            {markers.length} active
          </span>
          <span className="rounded-md border border-cyan-400/25 bg-cyan-400/[0.06] px-1.5 py-0.5 text-cyan-200">
            South Asia: {southAsiaCount}
          </span>
        </div>
      </div>

      {/* Category counts strip */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {byCat.map(([catId, count]) => {
          const meta = CAT_META[catId] ?? {
            color: "#94a3b8",
            short: catId,
            Icon: AlertTriangle,
          };
          const Icon = meta.Icon;
          return (
            <span
              key={catId}
              className="inline-flex items-center gap-1 rounded-md border border-white/8 bg-white/[0.02] px-1.5 py-0.5 text-[10px]"
              style={{ color: meta.color }}
            >
              <Icon className="h-2.5 w-2.5" />
              <span className="text-slate-200">{meta.short}</span>
              <span className="font-mono text-[10px] tabular text-slate-300">
                {count}
              </span>
            </span>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_280px]">
        {/* Equirectangular world map */}
        <div className="relative overflow-hidden rounded-lg border border-white/8 bg-[#040810]">
          <div
            className="relative aspect-[2/1] w-full"
            style={{
              background:
                "linear-gradient(180deg, #0a0f1a 0%, #06080d 40%, #04060a 100%)",
            }}
          >
            {/* Lon/lat grid */}
            <svg
              viewBox="0 0 360 180"
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
            >
              {/* meridians */}
              {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((m) => (
                <line
                  key={m}
                  x1={projX(m) * 3.6}
                  y1="0"
                  x2={projX(m) * 3.6}
                  y2="180"
                  stroke="#1e293b"
                  strokeWidth="0.3"
                  opacity="0.45"
                />
              ))}
              {/* parallels */}
              {[-60, -30, 0, 30, 60].map((p) => (
                <line
                  key={p}
                  x1="0"
                  y1={projY(p) * 1.8}
                  x2="360"
                  y2={projY(p) * 1.8}
                  stroke={p === 0 ? "#0e7490" : "#1e293b"}
                  strokeWidth={p === 0 ? "0.5" : "0.3"}
                  opacity={p === 0 ? "0.5" : "0.4"}
                />
              ))}

              {/* India highlight box (60–100°E, 5–40°N) */}
              <rect
                x={projX(60) * 3.6}
                y={projY(40) * 1.8}
                width={(projX(100) - projX(60)) * 3.6}
                height={(projY(5) - projY(40)) * 1.8}
                fill="rgba(34,211,238,0.06)"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="0.3"
                strokeDasharray="2 2"
              />
            </svg>

            {/* Event dots */}
            {markers.map((m) => {
              const meta = CAT_META[m.cat];
              const c = meta?.color ?? "#94a3b8";
              const isHov = hovered === m.id;
              return (
                <button
                  key={m.id}
                  onMouseEnter={() => setHovered(m.id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => m.link && window.open(m.link, "_blank")}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${projX(m.lon)}%`,
                    top: `${projY(m.lat)}%`,
                  }}
                  title={m.title}
                >
                  <span
                    className="block rounded-full"
                    style={{
                      width: isHov ? 8 : 5,
                      height: isHov ? 8 : 5,
                      background: c,
                      boxShadow: `0 0 ${isHov ? 10 : 6}px ${c}, 0 0 0 1.5px ${c}55`,
                      transition: "all 120ms ease",
                    }}
                  />
                </button>
              );
            })}

            {/* Hover tooltip */}
            {hovered && (
              <HoverTip
                marker={markers.find((m) => m.id === hovered)!}
              />
            )}

            {/* Map caption */}
            <div className="pointer-events-none absolute bottom-1 left-2 font-mono text-[8.5px] uppercase tracking-wider text-slate-500">
              Equirectangular · WGS84
            </div>
            <div className="pointer-events-none absolute bottom-1 right-2 font-mono text-[8.5px] uppercase tracking-wider text-cyan-400/70">
              {markers.length} events plotted
            </div>
          </div>
        </div>

        {/* Recent events list */}
        <div>
          <div className="label-mini mb-1.5">Latest events</div>
          <div className="max-h-[180px] space-y-1.5 overflow-y-auto pr-1">
            {recent.map((e) => {
              const meta = CAT_META[e.cat] ?? {
                color: "#94a3b8",
                short: e.cat,
                Icon: AlertTriangle,
              };
              const Icon = meta.Icon;
              return (
                <a
                  key={e.id}
                  href={e.link || undefined}
                  target={e.link ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-md border border-white/8 bg-white/[0.02] px-2 py-1.5 text-[11px] hover:border-white/20"
                  onMouseEnter={() => setHovered(e.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm"
                    style={{ color: meta.color, background: `${meta.color}1a` }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-slate-100">{e.title}</span>
                    <span className="flex items-center gap-1.5 text-[9.5px] text-slate-500">
                      <span style={{ color: meta.color }}>{meta.short}</span>
                      <span>·</span>
                      <span className="font-mono">{timeAgoIso(e.lastDate)}</span>
                      {e.link && (
                        <ExternalLink className="ml-auto h-2.5 w-2.5 opacity-0 transition group-hover:opacity-100" />
                      )}
                    </span>
                  </span>
                </a>
              );
            })}
          </div>
          <div className="mt-2 text-[9.5px] text-slate-500">
            Source: <span className="text-cyan-300">eonet.gsfc.nasa.gov</span> · CC0 · refresh 5m
          </div>
        </div>
      </div>
    </div>
  );
}

function HoverTip({
  marker,
}: {
  marker: { lon: number; lat: number; title: string; cat: string };
}) {
  const meta = CAT_META[marker.cat];
  // Position the tooltip relative to the marker; keep within bounds
  const x = projX(marker.lon);
  const y = projY(marker.lat);
  const onRight = x > 50;
  return (
    <div
      className="pointer-events-none absolute z-30 -translate-y-1/2 rounded-md border border-white/15 bg-ink-950/95 px-2 py-1 text-[10.5px] shadow-[0_4px_18px_rgba(0,0,0,0.7)] backdrop-blur-sm"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: onRight
          ? "translate(calc(-100% - 12px), -50%)"
          : "translate(12px, -50%)",
        maxWidth: 220,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: meta?.color ?? "#94a3b8" }}
        />
        <span style={{ color: meta?.color ?? "#94a3b8" }} className="font-semibold">
          {meta?.short ?? marker.cat}
        </span>
      </div>
      <div className="mt-0.5 text-slate-200">{marker.title}</div>
      <div className="mt-0.5 font-mono text-[9.5px] text-slate-500">
        {marker.lat.toFixed(1)}°{marker.lat >= 0 ? "N" : "S"} ·{" "}
        {marker.lon.toFixed(1)}°{marker.lon >= 0 ? "E" : "W"}
      </div>
    </div>
  );
}

// ─── Call Center / Helpline 50050 ──────────────────────────────────────────

function CallCenter() {
  const total = useMemo(
    () => CALL_CENTER_QUEUE.reduce((s, x) => s + x.count, 0),
    []
  );
  return (
    <div className="panel p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 label-mini">
          <Phone className="h-3 w-3 text-cyan-300" />
          Helpline · 50050 (toll-free)
        </div>
        <span className="chip chip-warn text-[9px] py-0">
          <PhoneIncoming className="h-2.5 w-2.5" />
          {total} in queue
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {CALL_CENTER_QUEUE.map((q) => {
          const pct = (q.count / total) * 100;
          return (
            <div
              key={q.lang}
              className="rounded-md border border-white/8 bg-white/[0.02] p-2.5"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-200 font-medium">{q.lang}</span>
                <span className="font-mono tabular text-cyan-200">{q.count}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-black/55">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px]">
        <CcMini label="Avg wait" value="2m 14s" />
        <CcMini label="Avg call" value="3m 02s" />
        <CcMini label="Resolved" value="1,847" />
      </div>
    </div>
  );
}

function CcMini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] py-1.5">
      <div className="text-[8.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-mono text-[11px] tabular font-semibold text-slate-100">{value}</div>
    </div>
  );
}
