"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gdsTasks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Mic,
  HeartHandshake,
  Truck,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  ChevronRight,
  Package,
  MapPin,
  Bell,
  CheckCircle2,
  Brain,
  Languages,
  AlertTriangle,
  Wallet,
  Play,
  Pause,
  RotateCw,
  ArrowLeft,
  Send,
  CloudOff,
  Cloud,
  Sparkles,
  Activity,
} from "lucide-react";

// ─── Language ──────────────────────────────────────────────────────────────

export type GdsLang = "en" | "hi" | "as";

const FONT_FOR_LANG: Record<GdsLang, string | undefined> = {
  en: undefined,
  hi: "Noto Sans Devanagari, Inter, sans-serif",
  as: "Noto Sans Bengali, Inter, sans-serif",
};

const T = {
  greeting: { en: "Hello", hi: "नमस्ते", as: "নমস্কাৰ" },
  onDuty: { en: "On duty", hi: "ड्यूटी पर", as: "ডিউটিত" },
  todaysTasks: { en: "Today's tasks", hi: "आज के कार्य", as: "আজিৰ কাৰ্য" },
  voiceReport: { en: "Voice report", hi: "ध्वनि रिपोर्ट", as: "মাত ৰিপৰ্ট" },
  recording: { en: "Recording", hi: "रिकॉर्डिंग", as: "ৰেকৰ্ডিং" },
  cancel: { en: "Cancel", hi: "रद्द", as: "বাতিল" },
  send: { en: "Send", hi: "भेजें", as: "পঠাওক" },
  newAlert: {
    en: "🚨 New critical task",
    hi: "🚨 नया अति आवश्यक कार्य",
    as: "🚨 নতুন জৰুৰীকালীন কাৰ্য",
  },
  newAlertSub: {
    en: "12 households · NH-27 inspection",
    hi: "12 परिवार · NH-27 निरीक्षण",
    as: "১২টা পৰিয়াল · NH-২৭ পৰিদৰ্শন",
  },
};

// ─── Simulation timeline ───────────────────────────────────────────────────

type Scene =
  | "standby"
  | "alert"
  | "tap"
  | "recording"
  | "ner"
  | "sync"
  | "done";

const SCENES: { id: Scene; start: number; end: number; label: string }[] = [
  { id: "standby", start: 0, end: 1, label: "Standby" },
  { id: "alert", start: 1, end: 4, label: "Alert" },
  { id: "tap", start: 4, end: 7, label: "Tap voice" },
  { id: "recording", start: 7, end: 14, label: "Whisper ASR" },
  { id: "ner", start: 14, end: 18, label: "Claude NER" },
  { id: "sync", start: 18, end: 22, label: "Sync" },
  { id: "done", start: 22, end: 30, label: "Synced" },
];

const SIM_END_S = 30;

// Authentic Assamese transcript that types out during the recording scene.
const TRANSCRIPT_AS =
  "ছাৰ, NH-২৭ ত পানী এক মিটাৰ চাবি গৈছে, গাড়ী যাব পৰা নাই। মায়ংত ১২টা ঘৰ আবদ্ধ হৈ আছে।";
const TRANSCRIPT_EN =
  "Sir, water has risen one metre on NH-27, vehicles cannot pass. 12 households trapped in Mayong.";

// JSON fields appear staggered during the NER scene.
const JSON_FIELDS = [
  { key: "road_blocked", value: "true", appearAt: 0.3 },
  { key: "water_depth_metres", value: "1.4", appearAt: 0.9 },
  { key: "families_affected", value: "12", appearAt: 1.5 },
  { key: "urgency", value: '"CRITICAL"', appearAt: 2.1 },
  { key: "village", value: '"Mayong"', appearAt: 2.7 },
  { key: "digipin", value: '"FK4-7M3-H8XW"', appearAt: 3.2 },
] as const;

// ─── Main client ───────────────────────────────────────────────────────────

export function GdsClient() {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(true);
  const [lang, setLang] = useState<GdsLang>("as");
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

  // Auto-pause at end of simulation
  useEffect(() => {
    if (elapsed >= SIM_END_S && !paused) setPaused(true);
  }, [elapsed, paused]);

  const scene: Scene = useMemo(() => {
    if (elapsed >= SIM_END_S) return "done";
    return SCENES.find((s) => elapsed >= s.start && elapsed < s.end)?.id ?? "standby";
  }, [elapsed]);

  const sceneStart = SCENES.find((s) => s.id === scene)?.start ?? 0;
  const sceneElapsed = elapsed - sceneStart;

  function reset() {
    setElapsed(0);
    setPaused(true);
  }

  const isFinished = elapsed >= SIM_END_S;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="label-mini text-cyan-400/80">GDS Field App · PWA</div>
          <h1 className="mt-1 font-display text-2xl font-semibold text-slate-100">
            One postman. 250,000 sensors.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Watch Ramesh Bora — Gramin Dak Sevak in Mayong — report flood ground truth in
            Assamese. Whisper transcribes; Claude extracts structured fields; the operator's
            map updates in 1.4 seconds.
          </p>
        </div>
        <LangToggle lang={lang} setLang={setLang} />
      </div>

      {/* ─── Sim controls ──────────────────────────────────────────── */}
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

      {/* ─── Phone + story ─────────────────────────────────────────── */}
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 flex justify-center">
          <PhoneFrame scene={scene} sceneElapsed={sceneElapsed} lang={lang} />
        </div>
        <div className="lg:col-span-5">
          <StoryPanel
            scene={scene}
            sceneElapsed={sceneElapsed}
            elapsed={elapsed}
            lang={lang}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Language toggle ───────────────────────────────────────────────────────

function LangToggle({ lang, setLang }: { lang: GdsLang; setLang: (l: GdsLang) => void }) {
  const opts: { id: GdsLang; label: string; native: string }[] = [
    { id: "as", label: "AS", native: "অসমীয়া" },
    { id: "hi", label: "HI", native: "हिन्दी" },
    { id: "en", label: "EN", native: "English" },
  ];
  return (
    <div className="inline-flex items-center rounded-md border border-cyan-400/30 bg-cyan-400/[0.04] p-0.5">
      <Languages className="h-3 w-3 ml-1.5 text-cyan-300" />
      {opts.map((o) => {
        const active = lang === o.id;
        return (
          <button
            key={o.id}
            onClick={() => setLang(o.id)}
            className={cn(
              "px-2 py-1 text-[10.5px] font-semibold tracking-wider rounded-[5px] transition",
              active
                ? "bg-cyan-400/20 text-cyan-100 ring-1 ring-cyan-300/40"
                : "text-slate-400 hover:text-slate-200",
            )}
            title={o.native}
            style={{ fontFamily: FONT_FOR_LANG[o.id] }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Scene timeline ────────────────────────────────────────────────────────

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

// ─── Phone frame ───────────────────────────────────────────────────────────

function PhoneFrame({
  scene,
  sceneElapsed,
  lang,
}: {
  scene: Scene;
  sceneElapsed: number;
  lang: GdsLang;
}) {
  return (
    <div className="relative" style={{ fontFamily: FONT_FOR_LANG[lang] }}>
      <div className="absolute -inset-12 -z-10 rounded-[60px] bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/10 to-transparent blur-3xl" />

      <div className="relative h-[720px] w-[360px] rounded-[42px] border-[10px] border-zinc-800 bg-ink-950 shadow-[0_40px_80px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.04)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />

        {/* Status bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex h-9 items-center justify-between px-6 pt-2 text-[10px] text-slate-300">
          <span className="font-medium tabular">10:42</span>
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3" />
            <span className="font-mono text-[9px]">2G</span>
            {scene === "sync" || scene === "done" ? (
              <Wifi className="h-3 w-3 text-emerald-400" />
            ) : (
              <WifiOff className="h-3 w-3 opacity-40" />
            )}
            <span className="font-mono text-[9px]">68%</span>
            <Battery className="h-3 w-3" />
          </div>
        </div>

        {/* Scene content */}
        <div className="absolute inset-0 overflow-hidden rounded-[34px]">
          <div className="relative h-full w-full pt-9">
            <SceneStack scene={scene} sceneElapsed={sceneElapsed} lang={lang} />
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-32 -translate-x-1/2 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}

function SceneStack({
  scene,
  sceneElapsed,
  lang,
}: {
  scene: Scene;
  sceneElapsed: number;
  lang: GdsLang;
}) {
  return (
    <div key={scene} className="dr-scene-fade h-full w-full">
      {scene === "standby" && <HomeScreen lang={lang} alertVisible={false} />}
      {scene === "alert" && (
        <HomeScreen lang={lang} alertVisible={true} alertElapsed={sceneElapsed} />
      )}
      {scene === "tap" && <VoiceTapScreen lang={lang} sceneElapsed={sceneElapsed} />}
      {scene === "recording" && (
        <RecordingScreen lang={lang} sceneElapsed={sceneElapsed} />
      )}
      {scene === "ner" && <NerScreen lang={lang} sceneElapsed={sceneElapsed} />}
      {scene === "sync" && <SyncScreen lang={lang} sceneElapsed={sceneElapsed} />}
      {scene === "done" && <DoneScreen lang={lang} />}
    </div>
  );
}

// ─── Home screen ───────────────────────────────────────────────────────────

function HomeScreen({
  lang,
  alertVisible,
  alertElapsed = 0,
}: {
  lang: GdsLang;
  alertVisible: boolean;
  alertElapsed?: number;
}) {
  return (
    <div className="relative h-full w-full overflow-y-auto pb-32">
      {/* Profile card */}
      <div className="px-5 pt-3 pb-4">
        <div className="rounded-2xl border border-white/8 bg-gradient-to-br from-cyan-400/[0.06] to-cyan-500/[0.02] p-3.5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 font-display text-[15px] font-bold text-ink-950">
                RB
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-ink-950" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[10px] uppercase tracking-wider text-slate-500">
                {T.greeting[lang]}
              </div>
              <div className="font-display text-[16px] font-semibold leading-tight text-slate-100">
                Ramesh G. Bora
              </div>
              <div className="text-[10px] text-slate-400">
                GDS · Mayong B.O · Nagaon
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="chip chip-info text-[8.5px] py-0">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
              {T.onDuty[lang]}
            </span>
            <span className="chip text-[8.5px] py-0">
              <MapPin className="h-2.5 w-2.5" />
              <code className="font-mono">FK4-7M3-H8VC</code>
            </span>
          </div>
        </div>
      </div>

      {/* Alert toast */}
      {alertVisible && <AlertToast lang={lang} sceneElapsed={alertElapsed} />}

      {/* Standing critical banner */}
      <div className="px-5 pb-3">
        <div className="rounded-xl border border-red-400/25 bg-gradient-to-br from-red-400/10 to-red-500/[0.02] p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-[12px] font-semibold text-red-200">
              CRITICAL · Brahmaputra flood
            </span>
          </div>
          <div
            className="mt-1 text-[11px] text-slate-300"
            style={{ fontFamily: FONT_FOR_LANG[lang] }}
          >
            {lang === "as"
              ? "১২টা পৰিয়ালৰ জৰুৰীকালীন কুশল পৰীক্ষা প্ৰয়োজন।"
              : lang === "hi"
                ? "12 परिवारों की कुशलक्षेम जांच ज़रूरी है।"
                : "12 households need urgent welfare check."}
          </div>
        </div>
      </div>

      {/* Tasks list */}
      <div className="px-5 pb-1">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
          <span className="text-slate-500">{T.todaysTasks[lang]}</span>
          <span className="text-cyan-300 font-mono">{gdsTasks.length}</span>
        </div>
      </div>
      <div className="px-5 pb-4 space-y-2">
        {gdsTasks.map((t) => (
          <TaskTile key={t.id} task={t} />
        ))}
      </div>

      {/* FAB - voice button */}
      <FAB lang={lang} glow />
    </div>
  );
}

function AlertToast({
  lang,
  sceneElapsed,
}: {
  lang: GdsLang;
  sceneElapsed: number;
}) {
  // Toast visible from sceneElapsed 0..2.4, fading slightly after
  const visible = sceneElapsed < 3;
  if (!visible) return null;
  return (
    <div className="absolute left-3 right-3 top-12 z-30 dr-alert-toast">
      <div className="flex items-start gap-3 rounded-2xl border border-red-400/40 bg-red-950/90 px-3 py-3 shadow-[0_8px_30px_rgba(239,68,68,0.35)] backdrop-blur-md">
        <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-red-500/20">
          <span className="absolute h-full w-full animate-ping rounded-xl bg-red-500/50" />
          <Bell className="relative h-4 w-4 text-red-200" />
        </span>
        <div className="min-w-0 flex-1">
          <div
            className="font-display text-[12px] font-bold text-red-100"
            style={{ fontFamily: FONT_FOR_LANG[lang] }}
          >
            {T.newAlert[lang]}
          </div>
          <div
            className="mt-0.5 text-[10.5px] text-red-200/85"
            style={{ fontFamily: FONT_FOR_LANG[lang] }}
          >
            {T.newAlertSub[lang]}
          </div>
        </div>
        <span className="shrink-0 font-mono text-[9px] text-red-300/70">now</span>
      </div>
    </div>
  );
}

function TaskTile({ task }: { task: typeof gdsTasks[number] }) {
  const Icon =
    task.type === "delivery"
      ? Package
      : task.type === "welfare"
        ? HeartHandshake
        : task.type === "cash"
          ? Wallet
          : Mic;
  const tone =
    task.priority === "CRITICAL"
      ? "border-red-400/30 bg-red-400/5"
      : task.priority === "HIGH"
        ? "border-amber-400/30 bg-amber-400/5"
        : "border-white/8 bg-white/[0.02]";
  const iconTone =
    task.priority === "CRITICAL"
      ? "text-red-300 bg-red-400/15"
      : task.priority === "HIGH"
        ? "text-amber-300 bg-amber-400/15"
        : "text-slate-300 bg-white/5";
  return (
    <div className={cn("rounded-xl border p-3 transition", tone)}>
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconTone,
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-slate-100 leading-snug">
            {task.label}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {task.village} · {task.distance}
            </span>
            <code className="font-mono text-[9.5px] text-cyan-300">{task.digipin}</code>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}

function FAB({ lang, glow }: { lang: GdsLang; glow?: boolean }) {
  return (
    <div className="pointer-events-none absolute bottom-5 right-5 z-20">
      <div className="relative">
        {glow && (
          <span className="absolute inset-0 -m-1 rounded-full bg-red-500/40 blur-md animate-pulse-dot" />
        )}
        <button className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-[0_8px_24px_rgba(239,68,68,0.45)]">
          <Mic className="h-6 w-6 text-white" />
        </button>
      </div>
      <span
        className="absolute -left-3 -top-1 -translate-y-full whitespace-nowrap rounded-md border border-white/10 bg-ink-950/90 px-2 py-1 text-[9px] uppercase tracking-wider text-cyan-200 backdrop-blur-md"
        style={{ fontFamily: FONT_FOR_LANG[lang] }}
      >
        {T.voiceReport[lang]}
      </span>
    </div>
  );
}

// ─── Voice tap (transition) screen ────────────────────────────────────────

function VoiceTapScreen({ lang, sceneElapsed }: { lang: GdsLang; sceneElapsed: number }) {
  // Big mic appearing in center, "tap to speak" prompt
  const fingerTapVisible = sceneElapsed > 1.5 && sceneElapsed < 2.5;
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-ink-950 via-red-950/20 to-ink-950">
      <div className="relative">
        <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />
        <span className="absolute inset-[-12px] animate-pulse-dot rounded-full border-2 border-red-400/40" />
        <button className="relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_0_8px_rgba(239,68,68,0.18),0_0_60px_rgba(239,68,68,0.5)]">
          <Mic className="h-14 w-14 text-white" />
        </button>
        {fingerTapVisible && <FingerTap />}
      </div>
      <div className="mt-8 text-center">
        <div
          className="font-display text-[15px] font-semibold text-slate-100"
          style={{ fontFamily: FONT_FOR_LANG[lang] }}
        >
          {lang === "as"
            ? "মাত ৰিপৰ্ট কৰিবলৈ টেপ কৰক"
            : lang === "hi"
              ? "ध्वनि रिपोर्ट के लिए टैप करें"
              : "Tap to record voice report"}
        </div>
        <div className="mt-1.5 flex items-center justify-center gap-1 text-[10.5px] text-slate-400">
          <Languages className="h-3 w-3" />
          <span style={{ fontFamily: FONT_FOR_LANG[lang] }}>
            অসমীয়া · हिन्दी · বাংলা · English
          </span>
        </div>
      </div>
    </div>
  );
}

function FingerTap() {
  return (
    <div className="dr-finger-tap pointer-events-none absolute -bottom-4 right-2 z-10">
      <span className="block h-7 w-7 rounded-full border-2 border-cyan-300 bg-cyan-300/40 shadow-[0_0_12px_rgba(34,211,238,0.7)]" />
    </div>
  );
}

// ─── Recording screen ─────────────────────────────────────────────────────

function RecordingScreen({
  lang,
  sceneElapsed,
}: {
  lang: GdsLang;
  sceneElapsed: number;
}) {
  // Recording phase is 0-7s. Transcript types out during 0.5-6s.
  const recDuration = 7;
  const timerS = Math.min(8, Math.max(0, sceneElapsed * 1.3));
  const timerSecs = String(Math.floor(timerS)).padStart(2, "0");

  // Type the Assamese transcript over 0.6..6.0s
  const typeStart = 0.6;
  const typeEnd = 6.0;
  const typeProgress = Math.min(
    1,
    Math.max(0, (sceneElapsed - typeStart) / (typeEnd - typeStart)),
  );
  const typedChars = Math.floor(typeProgress * TRANSCRIPT_AS.length);
  const visibleTranscript = TRANSCRIPT_AS.slice(0, typedChars);
  const showCursor = typeProgress < 1 && typeProgress > 0;

  return (
    <div className="flex h-full w-full flex-col px-5 pt-2">
      <div className="flex items-center gap-2 pb-2">
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
          <ArrowLeft className="h-3.5 w-3.5 text-slate-300" />
        </button>
        <span
          className="text-[12px] font-semibold text-slate-100"
          style={{ fontFamily: FONT_FOR_LANG[lang] }}
        >
          {lang === "as" ? "মাত ৰিপৰ্ট" : lang === "hi" ? "ध्वनि रिपोर्ट" : "Voice report"}
        </span>
        <span className="ml-auto chip chip-bad text-[8.5px] py-0">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse-dot" />
          REC
        </span>
      </div>

      {/* Big circular mic with concentric audio rings */}
      <div className="relative mx-auto mt-3 flex items-center justify-center">
        <span className="absolute h-44 w-44 rounded-full bg-red-500/8 dr-mic-ring" />
        <span
          className="absolute h-36 w-36 rounded-full bg-red-500/15 dr-mic-ring"
          style={{ animationDelay: "0.4s" }}
        />
        <button className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_0_8px_rgba(239,68,68,0.18),0_0_50px_rgba(239,68,68,0.4)]">
          <Mic className="h-12 w-12 text-white" />
        </button>
      </div>

      {/* Timer */}
      <div className="mt-4 flex flex-col items-center">
        <div className="font-mono text-[20px] font-bold tabular text-slate-100">
          00:{timerSecs}
        </div>
        <div className="mt-1 h-1 w-32 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-600"
            style={{ width: `${Math.min(100, (sceneElapsed / recDuration) * 100)}%` }}
          />
        </div>
      </div>

      {/* Live waveform */}
      <div className="mt-3 flex h-10 items-center justify-center gap-[2px]">
        {Array.from({ length: 38 }).map((_, i) => {
          const phase = sceneElapsed * 4 + i * 0.4;
          const h = 6 + Math.abs(Math.sin(phase) * 22) + (i % 5) * 2;
          return (
            <span
              key={i}
              className="w-[3px] rounded-full bg-gradient-to-t from-red-500 to-red-300"
              style={{ height: `${Math.min(40, h)}px` }}
            />
          );
        })}
      </div>

      {/* Live transcription */}
      <div className="mt-4 flex-1 overflow-y-auto rounded-xl border border-white/8 bg-black/45 p-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="uppercase tracking-wider text-slate-500">Whisper · live</span>
          <span className="font-mono text-cyan-300">
            অসমীয়া · 95% confidence
          </span>
        </div>
        <p
          className="mt-1.5 text-[12.5px] leading-relaxed text-slate-100"
          style={{ fontFamily: "Noto Sans Bengali, Inter, sans-serif" }}
        >
          {visibleTranscript || (
            <span className="text-slate-600">listening...</span>
          )}
          {showCursor && (
            <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse-dot bg-cyan-300 align-baseline" />
          )}
        </p>
      </div>

      {/* Action buttons */}
      <div className="mt-3 mb-4 flex gap-2">
        <button className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-[12px] font-medium text-slate-300">
          {T.cancel[lang]}
        </button>
        <button
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-[12px] font-semibold transition",
            sceneElapsed > 5
              ? "bg-emerald-500 text-emerald-950 shadow-[0_4px_16px_rgba(16,185,129,0.35)]"
              : "bg-emerald-500/30 text-emerald-200",
          )}
        >
          <Send className="h-3.5 w-3.5" />
          {T.send[lang]}
        </button>
      </div>
    </div>
  );
}

// ─── Claude NER screen ────────────────────────────────────────────────────

function NerScreen({ lang, sceneElapsed }: { lang: GdsLang; sceneElapsed: number }) {
  const tokenCount = Math.min(220, Math.floor(sceneElapsed * 90));

  return (
    <div className="flex h-full w-full flex-col px-5 pt-2 pb-4">
      <div className="flex items-center gap-2 pb-2">
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
          <ArrowLeft className="h-3.5 w-3.5 text-slate-300" />
        </button>
        <span className="text-[12px] font-semibold text-slate-100">DAKIYA</span>
        <span className="ml-auto chip chip-info text-[8.5px] py-0">
          <Brain className="h-2.5 w-2.5" />
          claude-sonnet-4
        </span>
      </div>

      {/* Original transcript (compact) */}
      <div className="rounded-xl border border-white/5 bg-black/30 p-2.5">
        <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-slate-500">
          <Mic className="h-2.5 w-2.5" />
          Whisper transcript · অসমীয়া
        </div>
        <p
          className="mt-1 text-[11.5px] leading-relaxed text-slate-200"
          style={{ fontFamily: "Noto Sans Bengali, Inter, sans-serif" }}
        >
          "{TRANSCRIPT_AS}"
        </p>
      </div>

      {/* Claude reasoning indicator */}
      <div className="mt-3 flex items-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.05] px-3 py-2">
        <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-400/20">
          <Brain className="h-3.5 w-3.5 text-cyan-200" />
          <span className="absolute h-full w-full animate-ping rounded-lg bg-cyan-400/30" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold text-cyan-100">
            Claude extracting structure...
          </div>
          <div className="text-[9.5px] text-slate-400">
            {tokenCount} tokens · ~₹{(tokenCount * 0.00055).toFixed(2)}
          </div>
        </div>
      </div>

      {/* JSON fields appearing one by one */}
      <div className="mt-3 flex-1 overflow-y-auto rounded-xl border border-emerald-400/15 bg-emerald-400/[0.04] p-3">
        <div className="flex items-center gap-1.5 text-[9.5px] uppercase tracking-wider text-emerald-300">
          <Sparkles className="h-2.5 w-2.5" />
          GroundReport schema
        </div>
        <pre className="mt-1.5 font-mono text-[11.5px] leading-relaxed text-slate-100">
          {"{\n"}
          {JSON_FIELDS.map((f, i) => {
            const visible = sceneElapsed >= f.appearAt;
            if (!visible) return null;
            const isLatest =
              sceneElapsed >= f.appearAt && sceneElapsed < f.appearAt + 0.3;
            return (
              <span
                key={f.key}
                className={cn(
                  "block transition-opacity",
                  isLatest && "dr-json-row-new",
                )}
              >
                {"  "}
                <span className="text-cyan-300">{f.key}</span>
                <span className="text-slate-500">: </span>
                <span className="text-amber-200">{f.value}</span>
                {i < JSON_FIELDS.length - 1 ? "," : ""}
              </span>
            );
          })}
          {sceneElapsed > JSON_FIELDS[JSON_FIELDS.length - 1].appearAt + 0.3 && (
            <span className="block">{"}"}</span>
          )}
        </pre>
      </div>
    </div>
  );
}

// ─── Sync screen ──────────────────────────────────────────────────────────

function SyncScreen({ lang, sceneElapsed }: { lang: GdsLang; sceneElapsed: number }) {
  const stage1 = sceneElapsed > 0.4;
  const stage2 = sceneElapsed > 1.6;
  const stage3 = sceneElapsed > 2.8;

  return (
    <div className="flex h-full w-full flex-col px-5 pt-2 pb-4">
      <div className="flex items-center gap-2 pb-2">
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.04]">
          <ArrowLeft className="h-3.5 w-3.5 text-slate-300" />
        </button>
        <span className="text-[12px] font-semibold text-slate-100">Sync</span>
        <span className="ml-auto chip chip-ok text-[8.5px] py-0">
          <Cloud className="h-2.5 w-2.5" />
          online
        </span>
      </div>

      <div className="mt-2 space-y-2.5">
        <SyncStep
          done={stage1}
          label="Saved to IndexedDB"
          sub="report-098.json · 1.2 KB"
          icon={<CloudOff className="h-3.5 w-3.5" />}
        />
        <SyncStep
          done={stage2}
          label="Posted to LangGraph state"
          sub="DrishtiState.ground_reports[]"
          icon={<Activity className="h-3.5 w-3.5" />}
        />
        <SyncStep
          done={stage3}
          label="SENTINEL re-scoring risk"
          sub="Mayong sub-zone → CRITICAL"
          icon={<Sparkles className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Big success card when all done */}
      {stage3 && (
        <div className="dr-sync-success mt-4 rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-400/10 to-emerald-500/[0.02] p-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <div className="font-display text-[13px] font-semibold text-emerald-100">
                Operator notified
              </div>
              <div className="text-[10px] text-emerald-200/80">
                12 households flagged for relief
              </div>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2 text-center text-[10px]">
            <Stat label="Round-trip" value="1.4s" />
            <Stat label="Tokens" value="220" />
            <Stat label="Cost" value="₹0.12" />
          </div>
        </div>
      )}
    </div>
  );
}

function SyncStep({
  done,
  label,
  sub,
  icon,
}: {
  done: boolean;
  label: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
        done
          ? "border-emerald-400/30 bg-emerald-400/[0.06]"
          : "border-white/8 bg-white/[0.02]",
      )}
    >
      <span
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg transition",
          done
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-white/5 text-slate-400",
        )}
      >
        {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
      </span>
      <div className="flex-1">
        <div
          className={cn(
            "text-[12px] font-semibold",
            done ? "text-emerald-100" : "text-slate-300",
          )}
        >
          {label}
        </div>
        <div className="text-[10px] text-slate-500">{sub}</div>
      </div>
      {!done && (
        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse-dot" />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-emerald-400/20 bg-emerald-400/[0.04] py-1">
      <div className="text-[8.5px] uppercase tracking-wider text-emerald-300/70">
        {label}
      </div>
      <div className="font-mono text-[12px] tabular font-bold text-emerald-100">
        {value}
      </div>
    </div>
  );
}

// ─── Done screen ──────────────────────────────────────────────────────────

function DoneScreen({ lang }: { lang: GdsLang }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center px-5 pb-8">
      <div className="dr-done-success relative">
        <span className="absolute inset-0 -m-3 rounded-full bg-emerald-400/30 blur-2xl" />
        <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_0_8px_rgba(16,185,129,0.18),0_12px_40px_rgba(16,185,129,0.5)]">
          <CheckCircle2 className="h-12 w-12 text-emerald-950" strokeWidth={2.4} />
        </span>
      </div>
      <h2
        className="mt-6 font-display text-[20px] font-bold text-slate-100"
        style={{ fontFamily: FONT_FOR_LANG[lang] }}
      >
        {lang === "as"
          ? "ৰিপৰ্ট পঠোৱা হ'ল"
          : lang === "hi"
            ? "रिपोर्ट भेज दी गई"
            : "Report sent"}
      </h2>
      <p
        className="mt-1 text-center text-[12px] text-slate-400"
        style={{ fontFamily: FONT_FOR_LANG[lang] }}
      >
        {lang === "as"
          ? "অপাৰেটৰে মেপত দেখি আছে"
          : lang === "hi"
            ? "ऑपरेटर मानचित्र पर देख रहा है"
            : "Operator can see this on the map"}
      </p>

      <div className="mt-6 w-full max-w-[260px] space-y-2">
        <DoneStat label="Recording" value="8 seconds" />
        <DoneStat label="Round-trip" value="1.4 seconds" />
        <DoneStat label="Households flagged" value="12" />
        <DoneStat label="Sub-zone updated" value="Mayong → CRITICAL" />
      </div>
    </div>
  );
}

function DoneStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
      <span className="text-[10.5px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="font-mono text-[11.5px] tabular text-slate-100">{value}</span>
    </div>
  );
}

// ─── Story panel beside phone ─────────────────────────────────────────────

const STORY: Record<
  Scene,
  { kicker: string; title: string; body: string; tone: string }
> = {
  standby: {
    kicker: "T+0 · Standby",
    title: "Press Play to follow Ramesh",
    body: "Ramesh Bora is on duty in Mayong. Today is 7 May 2026. The Brahmaputra has crossed the danger mark. He is one of 948 GDS deployed in the Assam scenario.",
    tone: "text-slate-300",
  },
  alert: {
    kicker: "T+1s · Notification",
    title: "Critical task pushed to his beat",
    body: "MATCHMAKER's Service Order SO-001 lists 12 households needing urgent welfare check on NH-27. The notification arrives even on 2G — payload is 1.2 KB.",
    tone: "text-red-300",
  },
  tap: {
    kicker: "T+4s · Voice tap",
    title: "Voice is fastest in the field",
    body: "Typing on a touchscreen with wet hands is impractical. Whisper handles 95+ languages with auto-detect — Ramesh just speaks.",
    tone: "text-cyan-300",
  },
  recording: {
    kicker: "T+7s · Whisper ASR",
    title: "Streaming Assamese transcription",
    body: "Audio captured at 16 kHz. Whisper streams transcription with 95% confidence on Assamese. Original language is preserved alongside translation.",
    tone: "text-cyan-300",
  },
  ner: {
    kicker: "T+14s · Claude NER",
    title: "Free-form speech becomes structured ground truth",
    body: "Claude Sonnet extracts the GroundReport schema: road_blocked, water_depth_metres, families_affected, urgency, digipin. ~220 tokens. ₹0.12 per report.",
    tone: "text-cyan-300",
  },
  sync: {
    kicker: "T+18s · LangGraph state",
    title: "Reports posted into the agent pipeline",
    body: "GroundReport written to DrishtiState. SENTINEL re-scores Mayong sub-zone. The operator's map updates in real time. KIRAN logs the outcome record to UPU UDP.",
    tone: "text-emerald-300",
  },
  done: {
    kicker: "T+22s · Round-trip complete",
    title: "Voice → AI pipeline → operator's map · 1.4 seconds",
    body: "From a postman speaking 8 seconds in Assamese to the operator dashboard updating: under 2 seconds. This is the loop that turns 250,000 GDS into AI sensors.",
    tone: "text-emerald-300",
  },
};

function StoryPanel({
  scene,
  sceneElapsed,
  elapsed,
  lang,
}: {
  scene: Scene;
  sceneElapsed: number;
  elapsed: number;
  lang: GdsLang;
}) {
  const story = STORY[scene];
  return (
    <div className="lg:sticky lg:top-20 space-y-4">
      <div key={scene} className="dr-story-fade panel p-5">
        <div className={cn("label-mini", story.tone)}>{story.kicker}</div>
        <h3 className="mt-2 font-display text-[18px] font-semibold leading-snug text-slate-100">
          {story.title}
        </h3>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-400">{story.body}</p>
      </div>

      {/* Live data stream during the active scenes */}
      {(scene === "recording" || scene === "ner" || scene === "sync") && (
        <LiveData scene={scene} sceneElapsed={sceneElapsed} />
      )}

      {/* Stack-level reminder */}
      <div className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
        <div className="label-mini">Tech stack</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[
            "React 18",
            "Workbox SW",
            "IndexedDB",
            "Whisper ASR",
            "Claude Sonnet",
            "DigiPIN",
            "JWT · gds_id",
          ].map((t) => (
            <span key={t} className="chip text-[10px]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <Spec label="Target phone" value="₹5,000 Android" />
          <Spec label="Network" value="2G / patchy" />
          <Spec label="Tap targets" value="≥ 48 px" />
          <Spec label="Default lang" value="অসমীয়া" />
        </div>
      </div>
    </div>
  );
}

function LiveData({
  scene,
  sceneElapsed,
}: {
  scene: Scene;
  sceneElapsed: number;
}) {
  if (scene === "recording") {
    const charsTotal = TRANSCRIPT_AS.length;
    const typeProgress = Math.min(1, Math.max(0, (sceneElapsed - 0.6) / 5.4));
    const chars = Math.floor(typeProgress * charsTotal);
    return (
      <div className="rounded-xl border border-cyan-400/25 bg-cyan-400/[0.03] p-4">
        <div className="flex items-center justify-between">
          <span className="label-mini text-cyan-300/85">Live transcription</span>
          <span className="font-mono text-[10px] text-slate-400">
            {chars}/{charsTotal} chars
          </span>
        </div>
        <p
          className="mt-2 text-[12px] leading-relaxed text-slate-100"
          style={{ fontFamily: "Noto Sans Bengali, Inter, sans-serif" }}
        >
          {TRANSCRIPT_AS.slice(0, chars) || (
            <span className="text-slate-500">listening...</span>
          )}
        </p>
        <p className="mt-2 text-[10.5px] italic text-slate-500">
          en: "{TRANSCRIPT_EN.slice(0, Math.floor(typeProgress * TRANSCRIPT_EN.length))}"
        </p>
      </div>
    );
  }
  if (scene === "ner") {
    return (
      <div className="rounded-xl border border-emerald-400/25 bg-emerald-400/[0.04] p-4">
        <div className="flex items-center justify-between">
          <span className="label-mini text-emerald-300/85">Extracted fields</span>
          <span className="font-mono text-[10px] text-slate-400">
            {JSON_FIELDS.filter((f) => sceneElapsed >= f.appearAt).length}/
            {JSON_FIELDS.length}
          </span>
        </div>
        <ul className="mt-2 space-y-1">
          {JSON_FIELDS.map((f) => {
            const visible = sceneElapsed >= f.appearAt;
            return (
              <li
                key={f.key}
                className={cn(
                  "flex items-center gap-2 text-[11.5px] transition-opacity",
                  visible ? "opacity-100" : "opacity-30",
                )}
              >
                <CheckCircle2
                  className={cn(
                    "h-3 w-3 shrink-0",
                    visible ? "text-emerald-400" : "text-slate-600",
                  )}
                />
                <span className="font-mono text-cyan-300">{f.key}</span>
                <span className="text-slate-500">=</span>
                <span className="font-mono text-amber-200">{f.value}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
  if (scene === "sync") {
    return (
      <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/[0.05] p-4">
        <div className="label-mini text-emerald-300/85">Pipeline events</div>
        <div className="mt-2 space-y-1.5 font-mono text-[10.5px]">
          <LogLine
            visible={sceneElapsed > 0.4}
            ts="T+18.4s"
            text="GroundReport written to DrishtiState"
            color="text-emerald-200"
          />
          <LogLine
            visible={sceneElapsed > 1.0}
            ts="T+18.9s"
            text="SENTINEL.rescore(Mayong) → CRITICAL"
            color="text-amber-200"
          />
          <LogLine
            visible={sceneElapsed > 1.8}
            ts="T+19.2s"
            text="OperatorClient.map.invalidate()"
            color="text-cyan-200"
          />
          <LogLine
            visible={sceneElapsed > 2.6}
            ts="T+19.8s"
            text="KIRAN.udpWrite(rpt-098)"
            color="text-slate-300"
          />
        </div>
      </div>
    );
  }
  return null;
}

function LogLine({
  visible,
  ts,
  text,
  color,
}: {
  visible: boolean;
  ts: string;
  text: string;
  color: string;
}) {
  if (!visible) return null;
  return (
    <div className="dr-logline grid grid-cols-[60px_1fr] gap-2">
      <span className="text-slate-500">{ts}</span>
      <span className={color}>{text}</span>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] px-2 py-1.5">
      <div className="text-[9.5px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-[12.5px] font-semibold text-slate-100">{value}</div>
    </div>
  );
}
