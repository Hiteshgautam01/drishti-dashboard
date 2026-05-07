"use client";

import { useEffect, useState } from "react";
import { gdsTasks, gdsRecentReports } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Mic,
  ListChecks,
  HeartHandshake,
  Truck,
  Cloud,
  CloudOff,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  ChevronRight,
  Package,
  MapPin,
  Bell,
  CheckCircle2,
  Clock,
  Brain,
  Languages,
  Shield,
  AlertTriangle,
  Wallet,
  Camera,
} from "lucide-react";

type Screen = "home" | "voice" | "welfare" | "deliveries" | "sync";
export type GdsLang = "en" | "hi" | "as";

const FONT_FOR_LANG: Record<GdsLang, string | undefined> = {
  en: undefined,
  hi: "Noto Sans Devanagari, Inter, sans-serif",
  as: "Noto Sans Bengali, Inter, sans-serif",
};

// Per-screen labels in 3 scripts
const SCREENS: {
  id: Screen;
  label: { en: string; hi: string; as: string };
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "home", label: { en: "Home", hi: "होम", as: "ঘৰ" }, icon: ListChecks },
  { id: "voice", label: { en: "Voice", hi: "आवाज़", as: "মাত" }, icon: Mic },
  { id: "welfare", label: { en: "Welfare", hi: "कुशल", as: "কুশল" }, icon: HeartHandshake },
  { id: "deliveries", label: { en: "Delivery", hi: "वितरण", as: "বিতৰণ" }, icon: Truck },
  { id: "sync", label: { en: "Sync", hi: "सिंक", as: "চিংক" }, icon: Cloud },
];

// Strings used by phone screens, indexed by language
const T = {
  greeting: { en: "Hello", hi: "नमस्ते", as: "নমস্কাৰ" },
  onDuty: { en: "On duty", hi: "ड्यूटी पर", as: "ডিউটিত" },
  criticalBanner: {
    en: "CRITICAL · Brahmaputra flood",
    hi: "CRITICAL · ब्रह्मपुत्र बाढ़",
    as: "CRITICAL · ব্ৰহ্মপুত্ৰ বানপানী",
  },
  criticalSub: {
    en: "12 households in your beat need urgent welfare check. Tap to start.",
    hi: "आपके बीट में 12 घरों को कुशलक्षेम जांच की ज़रूरत है। शुरू करने के लिए टैप करें।",
    as: "আপোনাৰ বিটত ১২টা পৰিয়ালৰ জৰুৰীকালীন কুশল পৰীক্ষা প্ৰয়োজন। আৰম্ভ কৰিবলৈ টেপ কৰক।",
  },
  todaysTasks: {
    en: "Today's tasks",
    hi: "आज के कार्य",
    as: "আজিৰ কাৰ্য",
  },
  voiceReport: {
    en: "Voice report",
    hi: "ध्वनि रिपोर्ट",
    as: "মাত ৰিপৰ্ট",
  },
  recording: { en: "Recording", hi: "रिकॉर्डिंग", as: "ৰেকৰ্ডিং" },
  speakAnyLang: {
    en: "Speak in any language. Auto-detect on.",
    hi: "किसी भी भाषा में बोलें। ऑटो-डिटेक्ट चालू है।",
    as: "যিকোনো ভাষাত কওক। অটো-ডিটেক্ট অন।",
  },
  liveTranscription: {
    en: "Live transcription",
    hi: "लाइव ट्रांसक्रिप्शन",
    as: "লাইভ অনুলিপি",
  },
  cancel: { en: "Cancel", hi: "रद्द करें", as: "বাতিল" },
  sendReport: { en: "Send report", hi: "भेजें", as: "পঠাওক" },
  welfareCheck: {
    en: "Welfare check",
    hi: "कुशलक्षेम",
    as: "কুশল পৰীক্ষা",
  },
  takePhoto: { en: "Take photo", hi: "फोटो लें", as: "ফটো লওক" },
  submit: {
    en: "Submit welfare check",
    hi: "जांच जमा करें",
    as: "জমা দিয়ক",
  },
};

export function GdsClient() {
  const [screen, setScreen] = useState<Screen>("home");
  // Default to Assamese for the Assam scenario — language closest to ground truth.
  const [lang, setLang] = useState<GdsLang>("as");

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 lg:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="label-mini text-cyan-400/80">GDS Field App · PWA</div>
          <h1 className="mt-1 font-display text-2xl font-semibold text-slate-100">
            One postman. 250,000 sensors.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            An offline-first PWA built for ₹5,000 Android phones with intermittent 2G connectivity.
            Voice input transcribes via Whisper and Claude turns it into structured ground truth, automatically tagged to the postman's DigiPIN.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LangToggle lang={lang} setLang={setLang} />
          <span className="chip">
            <Shield className="h-3 w-3" /> WCAG AA
          </span>
          <span className="chip chip-ok">
            <CloudOff className="h-3 w-3" /> Offline-first
          </span>
        </div>
      </div>

      {/* Screen switcher */}
      <div className="mt-6 flex flex-wrap gap-2">
        {SCREENS.map((s) => {
          const Icon = s.icon;
          const active = screen === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setScreen(s.id)}
              className={cn(
                "btn",
                active && "bg-cyan-400/10 border-cyan-400/40 text-cyan-200"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span style={{ fontFamily: FONT_FOR_LANG[lang] }}>
                {s.label[lang]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        {/* Phone mockup */}
        <div className="lg:col-span-7 flex justify-center">
          <PhoneFrame screen={screen} lang={lang} />
        </div>

        {/* Annotations */}
        <div className="lg:col-span-5">
          <Annotations screen={screen} />
        </div>
      </div>

      {/* Voice flow visualization */}
      <section className="mt-12 panel p-6">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-cyan-300" />
          <h3 className="font-display text-base font-semibold text-slate-100">
            DAKIYA voice → structured JSON · how it works
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Ramesh in Mayong village taps the red button, speaks for 8 seconds in Assamese, and 1.4 seconds later DRISHTI's risk map updates.
        </p>

        <div className="mt-6 grid gap-3 lg:grid-cols-5">
          <FlowStep
            n="1"
            title="Voice capture"
            sub="30s max · auto-language detect"
            body={`"ছাৰ, NH-২৭ ত পানী এক মিটাৰ চাবি গৈছে…"`}
            icon={<Mic className="h-4 w-4" />}
            tone="neutral"
          />
          <FlowStep
            n="2"
            title="Whisper ASR"
            sub="open-source · self-hosted"
            body="raw transcript text"
            icon={<Languages className="h-4 w-4" />}
            tone="info"
          />
          <FlowStep
            n="3"
            title="Claude NER"
            sub="claude-sonnet-4 · 220 tokens"
            body="structured JSON extraction"
            icon={<Brain className="h-4 w-4" />}
            tone="info"
          />
          <FlowStep
            n="4"
            title="DigiPIN auto-tag"
            sub="from device GPS · 4m² grid"
            body="FK4-7M3-H8XW"
            icon={<MapPin className="h-4 w-4" />}
            tone="ok"
          />
          <FlowStep
            n="5"
            title="State injection"
            sub="LangGraph re-routing"
            body="SENTINEL re-scores risk"
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone="ok"
          />
        </div>

        {/* Recent reports */}
        <div className="mt-8">
          <div className="label-mini">Recent ground reports · DAKIYA</div>
          <div className="mt-3 space-y-3">
            {gdsRecentReports.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/5 bg-ink-900/60 p-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="chip text-[9px] py-0">{r.id}</span>
                      <span className="text-[10px] text-slate-500">synced {r.syncedAt}</span>
                      <span className="chip chip-info text-[8.5px] py-0">
                        {r.transcriptOriginalLang === "as"
                          ? "অসমীয়া"
                          : r.transcriptOriginalLang}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
                      <Mic className="h-3 w-3" /> Whisper · spoken (Assamese)
                    </div>
                    <p
                      className="mt-1 rounded-md border border-white/5 bg-black/30 p-2.5 text-[12.5px] leading-relaxed text-slate-100"
                      style={{
                        fontFamily:
                          r.transcriptOriginalLang === "as"
                            ? "Noto Sans Bengali, Inter, sans-serif"
                            : undefined,
                      }}
                    >
                      "{r.transcriptOriginal}"
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[10.5px] text-slate-500">
                      <Languages className="h-3 w-3" /> EN translation
                    </div>
                    <p className="mt-1 rounded-md border border-white/5 bg-black/20 p-2 text-[11px] italic text-slate-300">
                      "{r.transcript}"
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <Brain className="h-3 w-3 text-cyan-300" /> Claude extracted JSON
                    </div>
                    <pre className="mt-1 overflow-x-auto rounded-md border border-cyan-400/15 bg-cyan-400/[0.03] p-2.5 font-mono text-[11px] leading-relaxed text-cyan-100">
{JSON.stringify(r.extracted, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── Language toggle ──────────────────────────────────────────────────────

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
                : "text-slate-400 hover:text-slate-200"
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

// ─── Phone frame ──────────────────────────────────────────────────────────

function PhoneFrame({ screen, lang }: { screen: Screen; lang: GdsLang }) {
  return (
    <div className="relative" style={{ fontFamily: FONT_FOR_LANG[lang] }}>
      {/* Glow */}
      <div className="absolute -inset-10 -z-10 rounded-[60px] bg-gradient-to-br from-cyan-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />

      <div className="relative h-[720px] w-[360px] rounded-[42px] border-[10px] border-zinc-800 bg-ink-950 shadow-[0_30px_80px_rgba(0,0,0,0.6),inset_0_2px_0_rgba(255,255,255,0.04)]">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-30 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-zinc-900" />

        {/* Status bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex h-9 items-center justify-between px-6 pt-2 text-[10px] text-slate-300">
          <span className="font-medium tabular">10:42</span>
          <div className="flex items-center gap-1.5">
            <Signal className="h-3 w-3" />
            <span className="font-mono text-[9px]">2G</span>
            <Wifi className="h-3 w-3 opacity-30" />
            <span className="font-mono text-[9px]">68%</span>
            <Battery className="h-3 w-3" />
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden rounded-[34px]">
          <div className="h-full w-full overflow-y-auto pt-9 pb-4">
            {screen === "home" && <HomeScreen lang={lang} />}
            {screen === "voice" && <VoiceScreen lang={lang} />}
            {screen === "welfare" && <WelfareScreen lang={lang} />}
            {screen === "deliveries" && <DeliveriesScreen />}
            {screen === "sync" && <SyncScreen />}
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-1.5 left-1/2 z-30 h-1 w-32 -translate-x-1/2 rounded-full bg-zinc-700" />
      </div>
    </div>
  );
}

function ScreenHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="px-5 pt-3 pb-3">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/15 text-cyan-300">
          {icon}
        </div>
        <div>
          <div className="font-display text-base font-semibold text-slate-100">{title}</div>
          {subtitle && <div className="text-[11px] text-slate-500">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({ lang }: { lang: GdsLang }) {
  return (
    <>
      <div className="px-5 pt-2 pb-3">
        <div className="text-[11px] text-slate-500">{T.greeting[lang]}</div>
        <div className="font-display text-xl font-semibold text-slate-100">
          Ramesh G. Bora
        </div>
        <div className="text-[11px] text-slate-400">
          GDS · Mayong B.O · Nagaon
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="chip chip-info text-[9px]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse-dot" />
            {T.onDuty[lang]}
          </span>
          <span className="chip text-[9px]">
            <MapPin className="h-2.5 w-2.5" />
            FK4-7M3-H8VC
          </span>
        </div>
      </div>

      <div className="px-5 pb-3">
        <div className="rounded-xl border border-red-400/25 bg-red-400/5 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span className="text-[12px] font-semibold text-red-200">
              {T.criticalBanner[lang]}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            {T.criticalSub[lang]}
          </div>
        </div>
      </div>

      <div className="px-5 pb-1">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          {T.todaysTasks[lang]} · {gdsTasks.length}
        </div>
      </div>
      <div className="px-5 pb-4 space-y-2">
        {gdsTasks.map((t) => (
          <TaskTile key={t.id} task={t} />
        ))}
      </div>

      <div className="px-5 pb-4">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-red-500 to-red-600 px-4 py-4 text-[14px] font-semibold text-white shadow-[0_4px_16px_rgba(239,68,68,0.3)]">
          <Mic className="h-5 w-5" />
          {T.voiceReport[lang]}
        </button>
      </div>
    </>
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
  return (
    <div className={cn("rounded-xl border p-3", tone)}>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-slate-200">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold text-slate-100 leading-snug">
            {task.label}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" /> {task.village} · {task.distance}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" /> {task.eta}
            </span>
            <code className="font-mono text-[9.5px] text-cyan-300">{task.digipin}</code>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}

function VoiceScreen({ lang }: { lang: GdsLang }) {
  // Live transcription text — Assamese is the canonical scenario language.
  const liveTranscriptByLang: Record<GdsLang, string> = {
    as: "ছাৰ, NH-২৭ ত পানী এক মিটাৰ চাবি গৈছে, গাড়ী যাব পৰা নাই…",
    hi: "साहब, NH-27 पर पानी एक मीटर चढ़ गया है, गाड़ी नहीं जा रही…",
    en: "Sir, water has risen one metre on NH-27, vehicles cannot pass…",
  };

  return (
    <>
      <ScreenHeader
        title={T.voiceReport[lang]}
        subtitle="30s max · auto language detect"
        icon={<Mic className="h-4 w-4" />}
      />

      <div className="px-5 pt-4 pb-4">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/8 bg-ink-900/50 px-6 py-8">
          <div className="relative">
            <button className="relative z-10 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 shadow-[0_0_0_8px_rgba(239,68,68,0.15),0_0_0_16px_rgba(239,68,68,0.06)]">
              <Mic className="h-12 w-12 text-white" />
            </button>
            <div className="absolute inset-0 rounded-full border-2 border-red-400/40 animate-pulse-dot" />
          </div>
          <div className="text-center">
            <div className="font-display text-base font-semibold text-slate-100">
              {T.recording[lang]} · 00:08
            </div>
            <div className="text-[11px] text-slate-500">
              {T.speakAnyLang[lang]}
            </div>
          </div>

          {/* Waveform */}
          <div className="flex h-12 items-center gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const h = 20 + Math.abs(Math.sin(i * 0.6) * 30) + (i % 5) * 4;
              return (
                <span
                  key={i}
                  className="w-1 rounded-full bg-red-400/70"
                  style={{ height: `${Math.min(48, h)}px` }}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          {T.liveTranscription[lang]} ·{" "}
          {lang === "as" ? "অসমীয়া" : lang === "hi" ? "हिन्दी" : "English"}
        </div>
        <div
          className="mt-1 rounded-xl border border-white/5 bg-black/30 p-3 text-[12px] leading-relaxed text-slate-200"
          style={{ fontFamily: FONT_FOR_LANG[lang] }}
        >
          "{liveTranscriptByLang[lang]}
          <span className="text-slate-500"> [recording]</span>"
        </div>
      </div>

      <div className="px-5 mt-3 flex gap-2">
        <button className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] py-2.5 text-[12px] font-medium text-slate-300">
          {T.cancel[lang]}
        </button>
        <button className="flex-1 rounded-lg bg-emerald-500 py-2.5 text-[12px] font-semibold text-emerald-950">
          {T.sendReport[lang]}
        </button>
      </div>

      <div className="mt-4 mx-5 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.03] p-3">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-cyan-300">
          <Brain className="h-3 w-3" /> Claude will extract
        </div>
        <ul className="mt-2 grid grid-cols-2 gap-1 text-[10.5px] text-slate-300">
          <li>• road_blocked</li>
          <li>• water_depth_metres</li>
          <li>• families_affected</li>
          <li>• elderly_needing_help</li>
          <li>• supplies_needed</li>
          <li>• urgency</li>
        </ul>
      </div>
    </>
  );
}

function WelfareScreen({ lang }: { lang: GdsLang }) {
  return (
    <>
      <ScreenHeader
        title={T.welfareCheck[lang]}
        subtitle="Smt. Bhuyan · Mayong"
        icon={<HeartHandshake className="h-4 w-4" />}
      />

      <div className="px-5">
        <div className="rounded-xl border border-white/5 bg-ink-900/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/15 text-amber-300 font-display font-semibold">
              SB
            </div>
            <div>
              <div className="font-display text-[13px] font-semibold text-slate-100">
                Smt. Bhuyan, 78
              </div>
              <div className="text-[10px] text-slate-500">
                Lives alone · Mayong · IPPB account active
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 mt-4 space-y-3">
        <ChecklistItem label="Person is safe and reachable" checked />
        <ChecklistItem label="Has shelter / not displaced" checked />
        <ChecklistItem label="Has food for next 48h" />
        <ChecklistItem label="Medical needs?" subInput="BP medication needed" />
        <ChecklistItem label="Cash on hand sufficient" />
        <ChecklistItem label="Mobility / disability concerns" />
      </div>

      <div className="mt-4 px-5 space-y-3">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            Photo of person & shelter (optional)
          </div>
          <button className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-white/10 bg-white/[0.02] py-3 text-[11.5px] text-slate-400">
            <Camera className="h-4 w-4" /> {T.takePhoto[lang]}
          </button>
        </div>

        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-500">
            DigiPIN · GPS auto-fill
          </div>
          <div className="mt-1 rounded-lg border border-cyan-400/20 bg-cyan-400/[0.04] px-3 py-2 font-mono text-[11.5px] text-cyan-300">
            FK4-7M3-H8XW · 4m² accuracy
          </div>
        </div>

        <button className="w-full rounded-lg bg-emerald-500 py-3 text-[13px] font-semibold text-emerald-950">
          {T.submit[lang]}
        </button>
      </div>
    </>
  );
}

function ChecklistItem({
  label,
  checked,
  subInput,
}: {
  label: string;
  checked?: boolean;
  subInput?: string;
}) {
  return (
    <div>
      <button
        className={cn(
          "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left",
          checked
            ? "border-emerald-400/30 bg-emerald-400/5"
            : "border-white/8 bg-white/[0.02]"
        )}
      >
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center rounded border-[1.5px]",
            checked
              ? "border-emerald-400 bg-emerald-400 text-emerald-950"
              : "border-white/20"
          )}
        >
          {checked && <CheckCircle2 className="h-3 w-3" />}
        </span>
        <span className="text-[12.5px] text-slate-200">{label}</span>
      </button>
      {subInput && (
        <div className="ml-7 mt-1 rounded-lg border border-amber-400/20 bg-amber-400/[0.04] px-3 py-1.5 text-[11px] text-amber-200">
          ⚑ {subInput}
        </div>
      )}
    </div>
  );
}

function DeliveriesScreen() {
  return (
    <>
      <ScreenHeader
        title="वितरण"
        subtitle="My deliveries today"
        icon={<Truck className="h-4 w-4" />}
      />
      <div className="px-5 space-y-2">
        {[
          { label: "Dry-ration packets · 18 units", to: "Ghats Mayong", digipin: "FK4-7M3-H8VC", state: "in_progress" as const },
          { label: "ORS sachets · 24 units", to: "Anganwadi #4", digipin: "FK4-7M3-J9PR", state: "pending" as const },
          { label: "IPPB cash · ₹25,000 × 4 families", to: "Doorstep", digipin: "FK4-7M3-H8XW", state: "pending" as const },
          { label: "Tarpaulin sheets · 6 units", to: "Char village", digipin: "FK4-7M4-K2VL", state: "pending" as const },
        ].map((d, i) => (
          <div key={i} className="rounded-xl border border-white/8 bg-ink-900/50 p-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-[12.5px] font-semibold text-slate-100">
                {d.label}
              </span>
              {d.state === "in_progress" ? (
                <span className="chip chip-info text-[8.5px] py-0">in route</span>
              ) : (
                <span className="chip text-[8.5px] py-0">queued</span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-400">
              <MapPin className="h-2.5 w-2.5" /> {d.to}
              <code className="ml-1 font-mono text-[9.5px] text-cyan-300">{d.digipin}</code>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 px-5">
        <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-3 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-300 text-[10px] uppercase tracking-wider">
            <Brain className="h-3 w-3" /> PATHFINDER · suggested route
          </div>
          <div className="mt-1.5">
            Mayong B.O → FK4-7M3-H8VC → FK4-7M3-J9PR → FK4-7M3-H8XW · 4.6 km · ETA 1h 12m
          </div>
          <div className="mt-1 text-[10px] text-amber-200">
            Detour · NH-27 submersion avoided via Dhing road
          </div>
        </div>
      </div>
    </>
  );
}

function SyncScreen() {
  return (
    <>
      <ScreenHeader
        title="सिंक"
        subtitle="Sync status · IndexedDB"
        icon={<Cloud className="h-4 w-4" />}
      />
      <div className="px-5">
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 text-amber-300" />
            <div className="font-display text-[13px] font-semibold text-amber-200">
              Offline mode
            </div>
          </div>
          <div className="mt-1 text-[11px] text-slate-300">
            Reports queued locally. Will sync automatically when network returns.
          </div>
        </div>
      </div>

      <div className="mt-4 px-5">
        <div className="text-[10px] uppercase tracking-wider text-slate-500">
          Queue · 3 reports
        </div>
        <div className="mt-2 space-y-2">
          {[
            { id: "RPT-098", type: "Voice report", subtitle: "NH-27 submersion · CRITICAL", state: "ready" },
            { id: "RPT-097", type: "Welfare check", subtitle: "Smt. Bhuyan · medical needs", state: "ready" },
            { id: "RPT-099", type: "Voice report", subtitle: "Mayong B.O power outage", state: "queued" },
          ].map((q) => (
            <div key={q.id} className="rounded-xl border border-white/8 bg-ink-900/50 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12px] font-medium text-slate-100">{q.type}</div>
                  <div className="text-[10px] text-slate-500">{q.subtitle}</div>
                </div>
                <span className="chip text-[8.5px] py-0 chip-warn">
                  <Clock className="h-2.5 w-2.5" /> queued
                </span>
              </div>
              <div className="mt-1 text-[9.5px] font-mono text-slate-500">{q.id} · 12 KB</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 px-5">
        <button className="w-full rounded-lg border border-cyan-400/30 bg-cyan-400/[0.06] py-2.5 text-[12px] font-medium text-cyan-200">
          Try sync now
        </button>
      </div>

      <div className="mt-4 px-5 grid grid-cols-3 gap-2 text-center text-[10px]">
        <SyncStat label="Queued" value="3" />
        <SyncStat label="Synced today" value="14" />
        <SyncStat label="Last sync" value="2h ago" />
      </div>
    </>
  );
}

function SyncStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/5 bg-white/[0.02] py-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-display text-[14px] font-semibold tabular text-slate-100">{value}</div>
    </div>
  );
}

// ─── Annotations ─────────────────────────────────────────────────────────

function Annotations({ screen }: { screen: Screen }) {
  const map: Record<Screen, { kicker: string; title: string; description: string; bullets: string[] }> = {
    home: {
      kicker: "Home",
      title: "Today, prioritised.",
      description:
        "Tasks generated by MATCHMAKER appear ranked by priority and proximity. CRITICAL work shows a red banner up top. The big red voice button is two thumbs away — Ramesh wears work gloves, every tap target is 48px+.",
      bullets: [
        "DigiPIN auto-tagged from device GPS (4m² grid)",
        "On-duty toggle pings position for the operator map",
        "All UI text mirrored in Hindi by default",
      ],
    },
    voice: {
      kicker: "Voice report",
      title: "Speak. Let Claude do the typing.",
      description:
        "30-second cap, language auto-detect, live transcription. The recording uploads to Whisper for ASR, then Claude does named-entity extraction into the GroundReport schema. The whole round-trip is sub-2 seconds on 4G; on 2G the audio is queued in IndexedDB and sent when bandwidth permits.",
      bullets: [
        "Hindi · Assamese · Bengali · English",
        "Whisper open-source ASR (self-hosted)",
        "Claude NER returns structured JSON, never free text",
      ],
    },
    welfare: {
      kicker: "Welfare check",
      title: "23,775 elderly checked. One conversation at a time.",
      description:
        "When the operator approves SO-005, every GREEN-status office pulls a list of priority households from IPPB age data + beat sheets. Each GDS gets ~25 visits. The form is a checklist not a paragraph — Ramesh can complete a check in 90 seconds.",
      bullets: [
        "Auto-flag medication or mobility needs",
        "Photo capture optional, IndexedDB-cached",
        "DigiPIN auto-fill from GPS — no typing",
      ],
    },
    deliveries: {
      kicker: "My deliveries",
      title: "PATHFINDER routes, on the postman's wrist.",
      description:
        "Each delivery has an exact DigiPIN destination (4m² resolution). The PATHFINDER agent's avoid-polygon route is rendered as a turn-by-turn list, with detour reasons surfaced when relevant — \"NH-27 submerged, going via Dhing road\".",
      bullets: [
        "Ordered by nearest-neighbour TSP from current GPS",
        "Detour notes surface flood-zone avoidance",
        "Tap any delivery to mark complete + sync ground truth",
      ],
    },
    sync: {
      kicker: "Offline-first",
      title: "Built for 2G and dropouts.",
      description:
        "The PWA assumes the network will fail. Every report writes to IndexedDB first; the Service Worker retries sync on reconnect with exponential backoff. The operator dashboard shows GDS as \"last seen at\" rather than \"online/offline\" — no false alarms.",
      bullets: [
        "IndexedDB queue, never block the UI",
        "Workbox Service Worker handles retries",
        "Text-only mode at < 64 kbps · images disabled",
      ],
    },
  };

  const a = map[screen];

  return (
    <div className="lg:sticky lg:top-20">
      <div className="label-mini text-cyan-400/80">{a.kicker}</div>
      <h3 className="mt-1 font-display text-2xl font-semibold text-slate-100">
        {a.title}
      </h3>
      <p className="mt-3 text-[14px] leading-relaxed text-slate-400">{a.description}</p>
      <ul className="mt-5 space-y-2">
        {a.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[12.5px] text-slate-300">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-6 panel p-4">
        <div className="label-mini">Device profile</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11.5px]">
          <Spec label="Target phone" value="₹5,000 Android" />
          <Spec label="Min screen" value="320 px" />
          <Spec label="Network" value="2G / 3G / patchy" />
          <Spec label="Tap targets" value="≥ 48 px" />
          <Spec label="Default lang" value="অসমীয়া" />
          <Spec label="Auth" value="JWT · gds_id" />
        </div>
      </div>

      <div className="mt-4 panel p-4">
        <div className="label-mini">Stack</div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["React 18", "Workbox", "IndexedDB", "Whisper ASR", "Claude NER", "DigiPIN local impl"].map(
            (t) => (
              <span key={t} className="chip text-[10px]">
                {t}
              </span>
            )
          )}
        </div>
      </div>
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

function FlowStep({
  n,
  title,
  sub,
  body,
  icon,
  tone,
}: {
  n: string;
  title: string;
  sub: string;
  body: string;
  icon: React.ReactNode;
  tone: "neutral" | "info" | "ok";
}) {
  const styles = {
    neutral: "border-white/8 bg-white/[0.02]",
    info: "border-cyan-400/25 bg-cyan-400/[0.04]",
    ok: "border-emerald-400/30 bg-emerald-400/[0.04]",
  }[tone];
  return (
    <div className={cn("relative rounded-xl border p-4", styles)}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/5 font-mono text-[11px] text-slate-400">
          {n}
        </span>
        <span className="text-cyan-300">{icon}</span>
      </div>
      <div className="mt-2 font-display text-sm font-semibold text-slate-100">{title}</div>
      <div className="text-[11px] text-slate-500">{sub}</div>
      <div
        className="mt-2 rounded-md bg-black/30 px-2 py-1.5 text-[11px] font-mono text-slate-300 truncate"
        style={{
          fontFamily: /[ঀ-৿]/.test(body)
            ? "Noto Sans Bengali, ui-monospace, monospace"
            : /[ऀ-ॿ]/.test(body)
              ? "Noto Sans Devanagari, ui-monospace, monospace"
              : undefined,
        }}
      >
        {body}
      </div>
    </div>
  );
}
