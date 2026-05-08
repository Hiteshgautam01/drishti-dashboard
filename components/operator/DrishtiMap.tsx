"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Marker,
  Popup,
  Source,
  Layer,
  NavigationControl,
  ScaleControl,
  AttributionControl,
  type MapRef,
  type LayerProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  postOffices,
  damagedRoads,
  floodPolygons,
  serviceOrders,
  districts,
  vehicles,
  gdsPositions,
  type PostOffice,
  type Vehicle,
} from "@/lib/mock-data";
import { statusColor } from "@/lib/utils";
import type { SimulationProps } from "./MapShell";

// ── Style + camera ───────────────────────────────────────────────────────

const STYLE_URL =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const ASSAM_CENTER = { longitude: 92.5, latitude: 26.4 };
const ASSAM_BOUNDS: [[number, number], [number, number]] = [
  [89.5, 24.0],
  [96.2, 28.1],
];

// ── GeoJSON builders ─────────────────────────────────────────────────────

const floodFeatureCollection = {
  type: "FeatureCollection" as const,
  features: floodPolygons.map((poly, i) => ({
    type: "Feature" as const,
    properties: { id: i },
    geometry: {
      type: "Polygon" as const,
      // Convert [lat,lon] → [lon,lat] and close the ring
      coordinates: [
        [...poly.map((p): [number, number] => [p[1], p[0]]), [poly[0][1], poly[0][0]] as [number, number]],
      ],
    },
  })),
};

function ringFeature(
  lat: number,
  lon: number,
  radiusKm: number,
  color: string,
  name: string,
  risk: string,
) {
  const steps = 64;
  const dLat = radiusKm / 111;
  const dLon = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    coords.push([lon + Math.cos(a) * dLon, lat + Math.sin(a) * dLat]);
  }
  return {
    type: "Feature" as const,
    properties: { color, name, risk },
    geometry: { type: "Polygon" as const, coordinates: [coords] },
  };
}

const riskFeatureCollection = {
  type: "FeatureCollection" as const,
  features: districts.map((d) => {
    const radiusKm =
      d.risk === "CRITICAL"
        ? 38
        : d.risk === "HIGH"
          ? 28
          : d.risk === "MODERATE"
            ? 20
            : 14;
    const color =
      d.risk === "CRITICAL"
        ? "#ef4444"
        : d.risk === "HIGH"
          ? "#f97316"
          : d.risk === "MODERATE"
            ? "#f59e0b"
            : "#10b981";
    return ringFeature(d.lat, d.lon, radiusKm, color, d.name, d.risk);
  }),
};

const routeFeatureCollection = {
  type: "FeatureCollection" as const,
  features: serviceOrders
    .filter((o) => o.hubOfficeId !== "ALL_GREEN")
    .map((order) => {
      const hub = postOffices.find((p) => p.id === order.hubOfficeId);
      if (!hub) return null;
      const targets = postOffices
        .filter((p) => p.district === order.district && p.id !== hub.id)
        .slice(0, 3);
      const coords: [number, number][] = [
        [hub.lon, hub.lat],
        ...targets.map((t): [number, number] => [t.lon, t.lat]),
      ];
      const color =
        order.type === "medical"
          ? "#fb7185"
          : order.type === "shelter"
            ? "#fb923c"
            : order.type === "cash"
              ? "#22d3ee"
              : "#a3e635";
      return {
        type: "Feature" as const,
        properties: { id: order.id, color },
        geometry: { type: "LineString" as const, coordinates: coords },
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null),
};

// ── Layer styles ─────────────────────────────────────────────────────────

const floodFillLayer: LayerProps = {
  id: "flood-fill",
  type: "fill",
  paint: {
    "fill-color": "#0ea5e9",
    "fill-opacity": 0.18,
  },
};
const floodLineLayer: LayerProps = {
  id: "flood-line",
  type: "line",
  paint: {
    "line-color": "#38bdf8",
    "line-width": 1.5,
    "line-dasharray": [3, 3],
    "line-opacity": 0.7,
  },
};
const riskRingLayer: LayerProps = {
  id: "risk-ring",
  type: "line",
  paint: {
    "line-color": ["get", "color"],
    "line-width": 1.4,
    "line-opacity": 0.55,
    "line-dasharray": [1, 3],
  },
};
const routeGlowLayer: LayerProps = {
  id: "route-glow",
  type: "line",
  paint: {
    "line-color": ["get", "color"],
    "line-width": 7,
    "line-blur": 6,
    "line-opacity": 0.35,
  },
  layout: { "line-cap": "round", "line-join": "round" },
};
const routeLineLayer: LayerProps = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": ["get", "color"],
    "line-width": 2.5,
    "line-opacity": 0.95,
    "line-dasharray": [3, 2],
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

// Pending variants used while routes await operator approval — a more uniform
// cyan pulse rather than the per-order colors.
const routeGlowLayerPending: LayerProps = {
  id: "route-glow",
  type: "line",
  paint: {
    "line-color": "#22d3ee",
    "line-width": 7,
    "line-blur": 6,
    "line-opacity": 0.45,
  },
  layout: { "line-cap": "round", "line-join": "round" },
};
const routeLineLayerPending: LayerProps = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#22d3ee",
    "line-width": 2.5,
    "line-opacity": 0.9,
    "line-dasharray": [3, 2],
  },
  layout: { "line-cap": "round", "line-join": "round" },
};

// ── Marker icon helpers ──────────────────────────────────────────────────

function officeClass(o: PostOffice) {
  return o.branchType === "Head Office"
    ? "is-head"
    : o.branchType === "Sub Office"
      ? "is-sub"
      : "is-branch";
}

function vehicleSvg(v: Vehicle) {
  if (v.type === "BOAT")
    return `<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M20 21c-1.4 0-2.4-.7-3-1.3-.6.6-1.6 1.3-3 1.3s-2.4-.7-3-1.3c-.6.6-1.6 1.3-3 1.3s-2.4-.7-3-1.3c-.6.6-1.6 1.3-3 1.3v-2c.7 0 1.4-.4 2-1l1-1 1 1c.7.7 1.3 1 2 1s1.4-.4 2-1l1-1 1 1c.7.7 1.3 1 2 1s1.4-.4 2-1l1-1 1 1c.7.7 1.3 1 2 1v2zM3.95 19l-1.5-3.6L11 11l9.5 4-1.4 4H3.95zM12 4l3.6 5.5-3.6 1.6-3.6-1.6L12 4z"/></svg>`;
  if (v.type === "BIKE")
    return `<svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor"><path d="M5 18a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm14 0a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM12 6l3 4h2l-3-4h-2zm-3 7h6V9l3 4h-3v2H9v-2z"/></svg>`;
  return `<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M3 17V7h11v10H3zm12 0v-5h3l3 3v2h-6zM6.5 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>`;
}

function vehicleClass(v: Vehicle) {
  return v.type === "BIKE"
    ? "dr-vehicle-bike"
    : v.type === "BOAT"
      ? "dr-vehicle-boat"
      : v.type === "HGV"
        ? "dr-vehicle-hgv"
        : "";
}

// ── Popup state ──────────────────────────────────────────────────────────

type PopupContent =
  | { kind: "office"; data: PostOffice }
  | { kind: "vehicle"; data: Vehicle }
  | { kind: "gds"; data: (typeof gdsPositions)[number] }
  | { kind: "damage"; data: (typeof damagedRoads)[number] };

// Used when a phase hasn't been reached yet — keeps the Source mounted but
// renders nothing.
const EMPTY_FC = { type: "FeatureCollection" as const, features: [] };

// ── Truck animation routes ───────────────────────────────────────────────
// Each service order spawns one animated truck that slides hub→delivery
// over `JOURNEY_S` seconds. Stagger 1.2s per order so they fan out visibly.

const JOURNEY_S = 12;
const STAGGER_S = 1.2;

const truckRoutes = serviceOrders
  .filter((o) => o.hubOfficeId !== "ALL_GREEN")
  .map((order, i) => {
    const hub = postOffices.find((p) => p.id === order.hubOfficeId);
    if (!hub) return null;
    // Pick the first delivery target in the same district
    const targets = postOffices.filter(
      (p) => p.district === order.district && p.id !== hub.id,
    );
    if (!targets.length) return null;
    const dest = targets[0];
    const color =
      order.type === "medical"
        ? "#fb7185"
        : order.type === "shelter"
          ? "#fb923c"
          : order.type === "cash"
            ? "#22d3ee"
            : "#a3e635";
    return {
      id: order.id,
      hubLon: hub.lon,
      hubLat: hub.lat,
      destLon: dest.lon,
      destLat: dest.lat,
      destName: dest.name,
      color,
      type: order.type,
      staggerS: i * STAGGER_S,
      payload: order.payload,
    };
  })
  .filter((x): x is NonNullable<typeof x> => x !== null);

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

// ── Main map ─────────────────────────────────────────────────────────────

export default function DrishtiMap(sim: SimulationProps) {
  const mapRef = useRef<MapRef>(null);
  const [popup, setPopup] = useState<{
    lng: number;
    lat: number;
    content: PopupContent;
  } | null>(null);

  // ── Phase gates — every layer/marker visibility is derived here ────────
  const completed = sim.completedAgentIds;
  const showFlood = completed.has("sentinel") || sim.activeAgentId === "capacity"
    || completed.has("capacity");
  const showOffices = completed.has("capacity") || sim.activeAgentId === "matchmaker"
    || completed.has("matchmaker");
  const showRoutes = completed.has("matchmaker") || sim.activeAgentId === "human_gate"
    || completed.has("human_gate") || sim.approvedCount > 0;
  const showRoadBlocks = sim.approvedCount > 0;
  const showStaticVehicles = sim.approvedCount > 0;
  const showGds = completed.has("dakiya");
  const showEpicenter = sim.elapsed >= 1 && sim.elapsed <= 6;
  // Routes are pulse-cyan during HITL; once approved they go to active colors.
  const routesPending = sim.awaitingApproval && sim.approvedCount === 0;

  // ── Truck animation — driven by rAF, frozen on pause ──────────────────
  const [truckProgress, setTruckProgress] = useState(0);
  const lastProgressRef = useRef(0);
  const startMsRef = useRef<number | null>(null);

  useEffect(() => {
    // No approvals yet — reset and idle
    if (sim.approvedAtMs === null) {
      lastProgressRef.current = 0;
      startMsRef.current = null;
      setTruckProgress(0);
      return;
    }
    // Paused — freeze at the last computed progress, do not run rAF
    if (sim.paused) return;

    // Resume / start: rebase the start so the timer picks up where we left off
    const totalDurationMs =
      (JOURNEY_S + STAGGER_S * truckRoutes.length) * 1000;
    startMsRef.current =
      Date.now() - lastProgressRef.current * totalDurationMs;

    let frame: number;
    const loop = () => {
      const now = Date.now();
      const t = (now - (startMsRef.current ?? now)) / totalDurationMs;
      const p = Math.min(1, Math.max(0, t));
      lastProgressRef.current = p;
      setTruckProgress(p);
      // Keep ticking even after p === 1 so vehicles can settle and any future
      // animation tweaks (pulse on arrival etc.) stay smooth.
      if (p < 1) {
        frame = requestAnimationFrame(loop);
      }
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [sim.approvedAtMs, sim.paused]);

  // Per-truck position
  const totalDurationS = JOURNEY_S + STAGGER_S * truckRoutes.length;
  const trucksAnimated = truckRoutes.map((r) => {
    // Convert global progress back to seconds, then per-truck offset
    const tGlobal = truckProgress * totalDurationS;
    const tLocal = (tGlobal - r.staggerS) / JOURNEY_S;
    const p = easeInOut(Math.min(1, Math.max(0, tLocal)));
    const lon = r.hubLon + (r.destLon - r.hubLon) * p;
    const lat = r.hubLat + (r.destLat - r.hubLat) * p;
    return { ...r, lon, lat, progress: p, started: tLocal > 0, arrived: p >= 1 };
  });
  const showTrucks = sim.approvedAtMs !== null;

  // Re-fit on mount + on parent resize so the camera always frames Assam
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const fit = () => {
      try {
        map.fitBounds(ASSAM_BOUNDS, {
          padding: 24,
          duration: 0,
          maxZoom: 9,
        });
        map.resize();
      } catch {
        /* map not ready yet */
      }
    };
    const ts = [60, 220, 600].map((d) => setTimeout(fit, d));
    const onWindowResize = () => map.resize();
    window.addEventListener("resize", onWindowResize);
    let ro: ResizeObserver | undefined;
    const container = map.getContainer();
    if (typeof ResizeObserver !== "undefined" && container) {
      ro = new ResizeObserver(() => map.resize());
      ro.observe(container);
    }
    return () => {
      ts.forEach(clearTimeout);
      window.removeEventListener("resize", onWindowResize);
      ro?.disconnect();
    };
  }, []);

  return (
    <Map
      ref={mapRef}
      initialViewState={{ ...ASSAM_CENTER, zoom: 7 }}
      style={{ width: "100%", height: "100%" }}
      mapStyle={STYLE_URL}
      maxZoom={11}
      minZoom={5.5}
      maxBounds={[
        [86.0, 21.0],
        [99.5, 30.5],
      ]}
      attributionControl={false}
      cooperativeGestures={false}
      onClick={() => setPopup(null)}
    >
      <NavigationControl position="top-right" showCompass={false} />
      <ScaleControl position="bottom-right" />
      <AttributionControl
        position="bottom-right"
        compact
        customAttribution="DRISHTI · Demo data"
      />

      {/* Flood zones — appear after SENTINEL completes */}
      <Source id="floods" type="geojson" data={showFlood ? floodFeatureCollection : EMPTY_FC}>
        <Layer {...floodFillLayer} />
        <Layer {...floodLineLayer} />
      </Source>

      {/* Risk rings — appear with the flood layer */}
      <Source id="risk-rings" type="geojson" data={showFlood ? riskFeatureCollection : EMPTY_FC}>
        <Layer {...riskRingLayer} />
      </Source>

      {/* Active routes — appear after MATCHMAKER. Pending routes use a cyan
          pulse; approved routes use their service-order color. */}
      <Source id="routes" type="geojson" data={showRoutes ? routeFeatureCollection : EMPTY_FC}>
        <Layer {...(routesPending ? routeGlowLayerPending : routeGlowLayer)} />
        <Layer {...(routesPending ? routeLineLayerPending : routeLineLayer)} />
      </Source>

      {/* District labels */}
      {districts.map((d) => (
        <Marker
          key={`label-${d.name}`}
          longitude={d.lon}
          latitude={d.lat}
          anchor="bottom"
          style={{ pointerEvents: "none" }}
        >
          <div className="dr-district-label" style={{ marginBottom: 30 }}>
            {d.name}
          </div>
        </Marker>
      ))}

      {/* Flood-detected epicenter pulse — appears in T+1..6 with the banner */}
      {showEpicenter && (
        <Marker longitude={92.68} latitude={26.35} anchor="center" style={{ pointerEvents: "none" }}>
          <div className="dr-epicenter">
            <span className="dr-epicenter-ring" />
            <span className="dr-epicenter-ring dr-epicenter-ring-2" />
            <span className="dr-epicenter-core" />
          </div>
        </Marker>
      )}

      {/* Damaged roads — appear after operator approval (PATHFINDER detours active) */}
      {showRoadBlocks &&
        damagedRoads.map((r) => (
          <Marker
            key={r.id}
            longitude={r.lon}
            latitude={r.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ lng: r.lon, lat: r.lat, content: { kind: "damage", data: r } });
            }}
          >
            <div className="dr-damage dr-fadein" />
          </Marker>
        ))}

      {/* Static vehicles at depots — appear after approval */}
      {showStaticVehicles &&
        vehicles.map((v) => (
          <Marker
            key={v.id}
            longitude={v.lon}
            latitude={v.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ lng: v.lon, lat: v.lat, content: { kind: "vehicle", data: v } });
            }}
          >
            <div
              className={`dr-vehicle dr-fadein ${vehicleClass(v)}`}
              dangerouslySetInnerHTML={{ __html: vehicleSvg(v) }}
            />
          </Marker>
        ))}

      {/* Animated delivery trucks — slide hub→destination after approval */}
      {showTrucks &&
        trucksAnimated.map((t) => {
          if (!t.started) return null;
          return (
            <Marker
              key={`truck-${t.id}`}
              longitude={t.lon}
              latitude={t.lat}
              anchor="center"
              style={{ pointerEvents: "none", zIndex: 5 }}
            >
              <div
                className={`dr-truck-anim ${t.arrived ? "is-arrived" : ""}`}
                style={{ color: t.color, ["--truck-color" as any]: t.color }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M3 17V7h11v10H3zm12 0v-5h3l3 3v2h-6zM6.5 19a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                </svg>
              </div>
            </Marker>
          );
        })}

      {/* GDS positions — appear after DAKIYA */}
      {showGds &&
        gdsPositions.map((g) => (
          <Marker
            key={g.id}
            longitude={g.lon}
            latitude={g.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ lng: g.lon, lat: g.lat, content: { kind: "gds", data: g } });
            }}
          >
            <div className="dr-gds dr-fadein" />
          </Marker>
        ))}

      {/* Post offices — appear after CAPACITY runs */}
      {showOffices &&
        postOffices.map((o) => (
          <Marker
            key={o.id}
            longitude={o.lon}
            latitude={o.lat}
            anchor="center"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ lng: o.lon, lat: o.lat, content: { kind: "office", data: o } });
            }}
          >
            <div
              className={`dr-office dr-fadein ${officeClass(o)}`}
              style={{ color: statusColor(o.status) }}
            />
          </Marker>
        ))}

      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          anchor="bottom"
          offset={14}
          closeButton={false}
          closeOnClick={false}
          onClose={() => setPopup(null)}
          className="dr-popup"
        >
          <PopupBody content={popup.content} />
        </Popup>
      )}
    </Map>
  );
}

// ── Popup body ───────────────────────────────────────────────────────────

function PopupBody({ content }: { content: PopupContent }) {
  switch (content.kind) {
    case "office": {
      const o = content.data;
      return (
        <div className="text-[11.5px] min-w-[220px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-100">{o.name}</span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase"
              style={{
                color: statusColor(o.status),
                background: `${statusColor(o.status)}22`,
                border: `1px solid ${statusColor(o.status)}55`,
              }}
            >
              {o.status}
            </span>
          </div>
          <div className="text-slate-400 text-[10.5px] mt-0.5">
            {o.pincode} · {o.branchType} · {o.district}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-slate-300">
            <KV label="GDS" value={`${o.gdsCount}`} />
            <KV label="Vehicles" value={`${o.vehicleCount}`} />
            <KV label="IPPB float" value={`₹${o.ippbFloatLakhs.toFixed(1)} L`} />
            <KV label="Cold storage" value={o.hasColdStorage ? "✓" : "—"} />
            <KV label="Backup power" value={o.hasBackupPower ? "✓" : "—"} />
            <KV label="IPPB" value={o.hasIPPB ? "✓" : "—"} />
          </div>
          <div className="mt-2 font-mono text-[10px] text-cyan-300">
            DigiPIN · {o.digipin}
          </div>
        </div>
      );
    }
    case "vehicle": {
      const v = content.data;
      return (
        <div className="text-[11.5px] min-w-[200px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-cyan-200">
              {v.id} · {v.type}
            </span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">
              {v.status}
            </span>
          </div>
          <div className="text-slate-300 mt-1.5">{v.payload}</div>
          <div className="mt-1.5 text-[10px] text-slate-500">
            District · {v.district}
          </div>
        </div>
      );
    }
    case "gds": {
      const g = content.data;
      return (
        <div className="text-[11.5px] min-w-[200px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-sky-200">{g.name}</span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500">
              {g.lastSeenSec}s ago
            </span>
          </div>
          <div className="text-slate-300 mt-1.5">{g.task}</div>
          <div className="mt-1.5 font-mono text-[10px] text-cyan-300">
            {g.digipin}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            District · {g.district}
          </div>
        </div>
      );
    }
    case "damage": {
      const r = content.data;
      return (
        <div className="text-[11.5px] min-w-[220px]">
          <div className="font-semibold text-red-300">{r.name}</div>
          <div className="text-slate-300 mt-1.5">{r.description}</div>
          <div className="mt-1.5 text-[10.5px] text-slate-500">
            <span className="text-slate-400">Detour: </span>
            {r.detour}
          </div>
          <div className="mt-0.5 text-[10px] text-slate-500">
            <span className="text-slate-400">Reported by: </span>
            {r.reportedBy}
          </div>
        </div>
      );
    }
  }
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <>
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </>
  );
}
