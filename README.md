# DRISHTI · Next.js Visualization Prototype

A command-center dark dashboard prototype that visualizes the DRISHTI 7-agent disaster response system for India's postal network — built for the **UPU Innovation Challenge 2026** (Sustainability Track).

## Run it

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Map tiles

Three free, no-API-key dark base layers, switchable from the layers control on the map:

| Layer | Provider | Notes |
|-------|----------|-------|
| **Dark Matter** *(default)* | CartoDB | Native dark theme, low-saturation, label-light |
| **Esri Dark Gray** | Esri ArcGIS | Slightly cooler grey tone |
| **Voyager** | CartoDB | Light alternative if you need more geography detail |

All three are free to use without an API key for development and reasonable production traffic. Attribution is rendered in the bottom-right of the map.

## Routes

| Path | Page | What it is |
|------|------|-----------|
| `/` | **Landing** | Story-first marketing page. Hero, problem/solution timeline, 9-agent pipeline, demo metrics, three portal CTAs, integration rails. |
| `/operator` | **Operator Dashboard** *(hero)* | Full-screen split — Leaflet map of Assam (post offices, flood polygons, damaged roads, animated routes) on the left; tabbed right panel: Pipeline, Live feed (SSE), Service orders w/ MATCHMAKER reasoning, Capacity, Finance (3-channel), Alerts. KPI strip on the bottom. The pipeline animates over ~30s; pause/reset are wired. |
| `/setu` | **Institution Portal** | NDRF coordinator view with the 3-tier fulfillment marketplace (Fast / Balanced / Economy), active service orders, coverage grid, SLA tracking. |
| `/gds` | **Field App (PWA)** | Phone-frame mockup with 5 screens (Home, Voice report, Welfare check, Deliveries, Sync), annotations, and the DAKIYA voice → Claude NER flow visualized. |

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with custom command-center palette
- **react-leaflet** + OpenStreetMap (dark-mode CSS filter)
- **Framer Motion**, **lucide-react**, **recharts** (deps available)
- 100% mock data, no API keys required (`lib/mock-data.ts`)

## What's mocked vs. real

Everything is mocked — no live API calls — but the data shape, agent pipeline timings, and UI flows mirror the PRD exactly:

- 247 post offices · 173 GREEN / 51 YELLOW / 23 RED
- 88 vehicles · 948 GDS · ₹6.8 Cr IPPB float
- 8 damaged roads, 5 service orders, 4 multilingual alerts
- Parametric trigger `flood_basic` (412mm rainfall > 200mm threshold)
- 28.1h response time vs 72h baseline · 2.6× improvement

## File map

```
app/
  page.tsx              → landing
  operator/page.tsx     → command center
  setu/page.tsx         → institution portal
  gds/page.tsx          → field app mockup
  layout.tsx, globals.css
components/
  shared/               → Brand, Nav, Stat
  operator/             → MapShell, ScenarioBar, PipelinePanel,
                          OrdersPanel, LiveFeed, CapacityPanel,
                          FinancePanel, AlertsPanel, KpiStrip,
                          OperatorClient (orchestrator)
  setu/SetuClient.tsx   → 3-option marketplace + active SOs
  gds/GdsClient.tsx     → phone frame + 5 screens + DAKIYA flow
lib/
  mock-data.ts          → all scenario data
  utils.ts              → cn, formatNumber, statusColor, riskTone
```

Built for visualization — all screens are pure UI on top of the PRD numbers.
