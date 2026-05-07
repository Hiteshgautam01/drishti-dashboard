// DRISHTI mock data — Assam Flood 2026 demo scenario
// All numbers align with the PRD targets (173 GREEN offices, 88 vehicles,
// 5 service orders, 8 road blockages, 15,000 families, 2.9M people, 948 GDS).

export type Status = "GREEN" | "YELLOW" | "RED";
export type Risk = "CRITICAL" | "HIGH" | "MODERATE" | "LOW";

export interface District {
  name: string;
  lat: number;
  lon: number;
  population: number;
  risk: Risk;
  rainfall_72h_mm: number;
  displacementEstimate: number;
}

export interface PostOffice {
  id: string;
  name: string;
  pincode: string;
  district: string;
  branchType: "Head Office" | "Sub Office" | "Branch Office";
  lat: number;
  lon: number;
  digipin: string;
  status: Status;
  hasColdStorage: boolean;
  hasBackupPower: boolean;
  hasIPPB: boolean;
  gdsCount: number;
  vehicleCount: number;
  ippbFloatLakhs: number;
}

export interface DamagedRoad {
  id: string;
  name: string;
  type: "bridge_collapse" | "submersion" | "landslide";
  lat: number;
  lon: number;
  description: string;
  reportedBy: string;
  detour: string;
}

export interface ServiceOrder {
  id: string;
  type: "food_delivery" | "medical" | "cash" | "welfare" | "shelter";
  institution: "NDRF" | "WHO" | "UNICEF" | "SDMA" | "RED_CROSS";
  hubOfficeId: string;
  hubOfficeName: string;
  district: string;
  deliveryPoints: string[];
  vehicleCount: number;
  gdsCount: number;
  beneficiaries: number;
  payload: string;
  estimatedHours: number;
  estimatedCostInr: number;
  coveragePercent: number;
  status: "pending_approval" | "approved" | "in_progress" | "complete";
  reasoning: string;
}

export interface AgentNode {
  id: string;
  name: string;
  tag: string;
  group: "pre" | "reactive" | "post";
  description: string;
  llmPowered: boolean;
  durationSec: number;
  status: "idle" | "running" | "complete" | "blocked";
  outputSummary: string;
}

export interface FeedEvent {
  ts: string;
  agent: string;
  level: "info" | "ok" | "warn" | "bad";
  message: string;
}

export interface AlertBatch {
  language: "en" | "hi" | "as" | "bn";
  languageName: string;
  digipinZone: string;
  recipientCount: number;
  channel: "APP_PUSH" | "SMS" | "USSD";
  message: string;
}

export interface MultilingualAlertZone {
  digipinZone: string;
  district: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE";
  totalRecipients: number;
  channels: ("APP_PUSH" | "SMS" | "USSD")[];
  scripts: {
    en: string;
    hi: string;
    as: string;
    bn: string;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Scenario header
// ────────────────────────────────────────────────────────────────────────────

export const scenario = {
  id: "AS-FLOOD-2026-05",
  name: "Assam Brahmaputra Flood",
  state: "Assam",
  severity: "CRITICAL" as Risk,
  triggeredAt: "2026-05-07T06:42:00+05:30",
  source: "IMD / SACHET",
  totalAffectedPopulation: 2_900_000,
  totalDistrictsAffected: 12,
  rainfallPeak72h: 412,
};

// ────────────────────────────────────────────────────────────────────────────
// Districts — 12 affected
// ────────────────────────────────────────────────────────────────────────────

export const districts: District[] = [
  { name: "Nagaon", lat: 26.35, lon: 92.68, population: 2_823_768, risk: "CRITICAL", rainfall_72h_mm: 412, displacementEstimate: 184_000 },
  { name: "Morigaon", lat: 26.25, lon: 92.34, population: 1_005_000, risk: "CRITICAL", rainfall_72h_mm: 388, displacementEstimate: 92_000 },
  { name: "Dhubri", lat: 26.02, lon: 89.98, population: 1_949_258, risk: "CRITICAL", rainfall_72h_mm: 366, displacementEstimate: 121_000 },
  { name: "Barpeta", lat: 26.32, lon: 91.00, population: 1_693_622, risk: "HIGH", rainfall_72h_mm: 298, displacementEstimate: 76_500 },
  { name: "Goalpara", lat: 26.17, lon: 90.62, population: 1_008_959, risk: "HIGH", rainfall_72h_mm: 274, displacementEstimate: 41_200 },
  { name: "Bongaigaon", lat: 26.47, lon: 90.55, population: 738_804, risk: "HIGH", rainfall_72h_mm: 252, displacementEstimate: 30_800 },
  { name: "Kamrup", lat: 26.18, lon: 91.74, population: 1_517_542, risk: "HIGH", rainfall_72h_mm: 241, displacementEstimate: 28_300 },
  { name: "Dhemaji", lat: 27.48, lon: 94.58, population: 686_133, risk: "HIGH", rainfall_72h_mm: 233, displacementEstimate: 24_600 },
  { name: "Lakhimpur", lat: 27.23, lon: 94.10, population: 1_042_137, risk: "MODERATE", rainfall_72h_mm: 198, displacementEstimate: 18_400 },
  { name: "Sonitpur", lat: 26.65, lon: 92.79, population: 1_924_110, risk: "MODERATE", rainfall_72h_mm: 184, displacementEstimate: 15_200 },
  { name: "Cachar", lat: 24.83, lon: 92.78, population: 1_736_617, risk: "MODERATE", rainfall_72h_mm: 162, displacementEstimate: 9_600 },
  { name: "Tinsukia", lat: 27.50, lon: 95.36, population: 1_327_929, risk: "LOW", rainfall_72h_mm: 124, displacementEstimate: 4_100 },
];

// ────────────────────────────────────────────────────────────────────────────
// Post Offices — sampled ~38 with realistic distribution
// (Aggregate stats reported in UI: 247 total, 173 GREEN, 51 YELLOW, 23 RED)
// ────────────────────────────────────────────────────────────────────────────

export const postOfficeStats = {
  total: 247,
  green: 173,
  yellow: 51,
  red: 23,
};

const seedOffices: Omit<PostOffice, "digipin">[] = [
  // Nagaon (CRITICAL)
  { id: "PO-001", name: "Nagaon H.O", pincode: "782001", district: "Nagaon", branchType: "Head Office", lat: 26.351, lon: 92.683, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 24, vehicleCount: 6, ippbFloatLakhs: 48.5 },
  { id: "PO-002", name: "Kaliabor S.O", pincode: "782137", district: "Nagaon", branchType: "Sub Office", lat: 26.535, lon: 92.852, status: "YELLOW", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 11, vehicleCount: 2, ippbFloatLakhs: 12.4 },
  { id: "PO-003", name: "Raha B.O", pincode: "782103", district: "Nagaon", branchType: "Branch Office", lat: 26.244, lon: 92.480, status: "RED", hasColdStorage: false, hasBackupPower: false, hasIPPB: false, gdsCount: 4, vehicleCount: 0, ippbFloatLakhs: 0 },
  { id: "PO-004", name: "Lumding S.O", pincode: "782447", district: "Nagaon", branchType: "Sub Office", lat: 25.748, lon: 93.171, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 9, vehicleCount: 3, ippbFloatLakhs: 18.2 },
  { id: "PO-005", name: "Hojai B.O", pincode: "782435", district: "Nagaon", branchType: "Branch Office", lat: 26.005, lon: 92.857, status: "GREEN", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 6, vehicleCount: 1, ippbFloatLakhs: 6.8 },

  // Morigaon (CRITICAL)
  { id: "PO-010", name: "Morigaon H.O", pincode: "782105", district: "Morigaon", branchType: "Head Office", lat: 26.255, lon: 92.340, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 18, vehicleCount: 4, ippbFloatLakhs: 33.0 },
  { id: "PO-011", name: "Mayong B.O", pincode: "782411", district: "Morigaon", branchType: "Branch Office", lat: 26.244, lon: 92.122, status: "RED", hasColdStorage: false, hasBackupPower: false, hasIPPB: false, gdsCount: 3, vehicleCount: 0, ippbFloatLakhs: 0 },
  { id: "PO-012", name: "Laharighat B.O", pincode: "782122", district: "Morigaon", branchType: "Branch Office", lat: 26.359, lon: 92.214, status: "RED", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 5, vehicleCount: 1, ippbFloatLakhs: 4.2 },
  { id: "PO-013", name: "Jagiroad S.O", pincode: "782410", district: "Morigaon", branchType: "Sub Office", lat: 26.225, lon: 92.020, status: "YELLOW", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 8, vehicleCount: 2, ippbFloatLakhs: 11.6 },

  // Dhubri (CRITICAL)
  { id: "PO-020", name: "Dhubri H.O", pincode: "783301", district: "Dhubri", branchType: "Head Office", lat: 26.022, lon: 89.984, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 21, vehicleCount: 5, ippbFloatLakhs: 41.8 },
  { id: "PO-021", name: "Bilasipara S.O", pincode: "783348", district: "Dhubri", branchType: "Sub Office", lat: 26.236, lon: 90.218, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 12, vehicleCount: 3, ippbFloatLakhs: 16.0 },
  { id: "PO-022", name: "Sapatgram B.O", pincode: "783337", district: "Dhubri", branchType: "Branch Office", lat: 26.327, lon: 90.107, status: "YELLOW", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 5, vehicleCount: 1, ippbFloatLakhs: 7.1 },
  { id: "PO-023", name: "Gauripur B.O", pincode: "783331", district: "Dhubri", branchType: "Branch Office", lat: 26.085, lon: 89.972, status: "RED", hasColdStorage: false, hasBackupPower: false, hasIPPB: false, gdsCount: 4, vehicleCount: 0, ippbFloatLakhs: 0 },

  // Barpeta
  { id: "PO-030", name: "Barpeta H.O", pincode: "781301", district: "Barpeta", branchType: "Head Office", lat: 26.323, lon: 91.000, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 19, vehicleCount: 4, ippbFloatLakhs: 35.2 },
  { id: "PO-031", name: "Howly S.O", pincode: "781316", district: "Barpeta", branchType: "Sub Office", lat: 26.394, lon: 91.103, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 10, vehicleCount: 2, ippbFloatLakhs: 13.8 },
  { id: "PO-032", name: "Sarthebari B.O", pincode: "781307", district: "Barpeta", branchType: "Branch Office", lat: 26.425, lon: 91.172, status: "YELLOW", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 5, vehicleCount: 1, ippbFloatLakhs: 5.5 },

  // Goalpara
  { id: "PO-040", name: "Goalpara H.O", pincode: "783101", district: "Goalpara", branchType: "Head Office", lat: 26.171, lon: 90.622, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 17, vehicleCount: 4, ippbFloatLakhs: 28.6 },
  { id: "PO-041", name: "Lakhipur B.O", pincode: "783126", district: "Goalpara", branchType: "Branch Office", lat: 26.203, lon: 90.396, status: "GREEN", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 6, vehicleCount: 1, ippbFloatLakhs: 6.2 },

  // Bongaigaon
  { id: "PO-050", name: "Bongaigaon H.O", pincode: "783380", district: "Bongaigaon", branchType: "Head Office", lat: 26.473, lon: 90.553, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 14, vehicleCount: 3, ippbFloatLakhs: 22.4 },
  { id: "PO-051", name: "Abhayapuri S.O", pincode: "783384", district: "Bongaigaon", branchType: "Sub Office", lat: 26.319, lon: 90.638, status: "YELLOW", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 7, vehicleCount: 2, ippbFloatLakhs: 8.9 },

  // Kamrup
  { id: "PO-060", name: "Guwahati G.P.O", pincode: "781001", district: "Kamrup", branchType: "Head Office", lat: 26.183, lon: 91.745, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 32, vehicleCount: 9, ippbFloatLakhs: 86.0 },
  { id: "PO-061", name: "Rangia S.O", pincode: "781354", district: "Kamrup", branchType: "Sub Office", lat: 26.448, lon: 91.617, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 11, vehicleCount: 3, ippbFloatLakhs: 14.7 },
  { id: "PO-062", name: "Hajo B.O", pincode: "781102", district: "Kamrup", branchType: "Branch Office", lat: 26.244, lon: 91.527, status: "GREEN", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 5, vehicleCount: 1, ippbFloatLakhs: 5.6 },

  // Dhemaji
  { id: "PO-070", name: "Dhemaji H.O", pincode: "787057", district: "Dhemaji", branchType: "Head Office", lat: 27.482, lon: 94.580, status: "YELLOW", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 12, vehicleCount: 2, ippbFloatLakhs: 17.3 },
  { id: "PO-071", name: "Jonai B.O", pincode: "787060", district: "Dhemaji", branchType: "Branch Office", lat: 27.853, lon: 95.260, status: "RED", hasColdStorage: false, hasBackupPower: false, hasIPPB: false, gdsCount: 3, vehicleCount: 0, ippbFloatLakhs: 0 },

  // Lakhimpur
  { id: "PO-080", name: "North Lakhimpur H.O", pincode: "787001", district: "Lakhimpur", branchType: "Head Office", lat: 27.235, lon: 94.099, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 16, vehicleCount: 4, ippbFloatLakhs: 26.1 },
  { id: "PO-081", name: "Dhakuakhana S.O", pincode: "787055", district: "Lakhimpur", branchType: "Sub Office", lat: 27.504, lon: 94.402, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 9, vehicleCount: 2, ippbFloatLakhs: 11.5 },

  // Sonitpur
  { id: "PO-090", name: "Tezpur H.O", pincode: "784001", district: "Sonitpur", branchType: "Head Office", lat: 26.633, lon: 92.793, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 22, vehicleCount: 5, ippbFloatLakhs: 38.4 },
  { id: "PO-091", name: "Biswanath Chariali S.O", pincode: "784176", district: "Sonitpur", branchType: "Sub Office", lat: 26.732, lon: 93.149, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 10, vehicleCount: 2, ippbFloatLakhs: 12.7 },

  // Cachar
  { id: "PO-100", name: "Silchar H.O", pincode: "788001", district: "Cachar", branchType: "Head Office", lat: 24.825, lon: 92.788, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 20, vehicleCount: 4, ippbFloatLakhs: 32.0 },
  { id: "PO-101", name: "Lakhipur S.O", pincode: "788030", district: "Cachar", branchType: "Sub Office", lat: 24.802, lon: 93.012, status: "GREEN", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 7, vehicleCount: 1, ippbFloatLakhs: 8.4 },

  // Tinsukia (LOW risk)
  { id: "PO-110", name: "Tinsukia H.O", pincode: "786125", district: "Tinsukia", branchType: "Head Office", lat: 27.494, lon: 95.358, status: "GREEN", hasColdStorage: true, hasBackupPower: true, hasIPPB: true, gdsCount: 18, vehicleCount: 4, ippbFloatLakhs: 30.2 },
  { id: "PO-111", name: "Margherita S.O", pincode: "786181", district: "Tinsukia", branchType: "Sub Office", lat: 27.286, lon: 95.679, status: "GREEN", hasColdStorage: false, hasBackupPower: true, hasIPPB: true, gdsCount: 9, vehicleCount: 2, ippbFloatLakhs: 12.0 },
  { id: "PO-112", name: "Doomdooma B.O", pincode: "786151", district: "Tinsukia", branchType: "Branch Office", lat: 27.560, lon: 95.564, status: "GREEN", hasColdStorage: false, hasBackupPower: false, hasIPPB: true, gdsCount: 5, vehicleCount: 1, ippbFloatLakhs: 5.8 },
];

function fakeDigipin(lat: number, lon: number) {
  // Decorative DigiPIN-shaped code (real algorithm not needed for demo).
  const chars = "23456789CFGHJMPQRVWX";
  const seed = Math.floor((lat * 1000 + lon * 1000) % 1e9);
  let code = "";
  let s = Math.abs(seed);
  for (let i = 0; i < 10; i++) {
    code += chars[s % chars.length];
    s = Math.floor(s / 7) + i * 13;
    if (i === 2 || i === 5) code += "-";
  }
  return code;
}

export const postOffices: PostOffice[] = seedOffices.map((o) => ({
  ...o,
  digipin: fakeDigipin(o.lat, o.lon),
}));

// ────────────────────────────────────────────────────────────────────────────
// Live vehicle positions (decorative — animated along routes)
// ────────────────────────────────────────────────────────────────────────────

export interface Vehicle {
  id: string;
  type: "HGV" | "LGV" | "BIKE" | "BOAT";
  district: string;
  lat: number;
  lon: number;
  status: "moving" | "loading" | "delivering";
  payload: string;
}

export const vehicles: Vehicle[] = [
  { id: "VH-101", type: "HGV", district: "Nagaon", lat: 26.341, lon: 92.612, status: "moving", payload: "12,000 ration packets" },
  { id: "VH-102", type: "HGV", district: "Nagaon", lat: 26.295, lon: 92.435, status: "delivering", payload: "ORS sachets" },
  { id: "VH-103", type: "LGV", district: "Nagaon", lat: 26.408, lon: 92.770, status: "moving", payload: "Tarpaulin · 60" },
  { id: "VH-104", type: "BOAT", district: "Morigaon", lat: 26.330, lon: 92.205, status: "moving", payload: "Char village relief" },
  { id: "VH-105", type: "HGV", district: "Morigaon", lat: 26.245, lon: 92.298, status: "loading", payload: "Medical kits" },
  { id: "VH-106", type: "LGV", district: "Morigaon", lat: 26.196, lon: 92.077, status: "moving", payload: "Cash courier" },
  { id: "VH-107", type: "HGV", district: "Dhubri", lat: 26.044, lon: 90.025, status: "delivering", payload: "Antivenom · cold-chain" },
  { id: "VH-108", type: "HGV", district: "Dhubri", lat: 26.165, lon: 90.118, status: "moving", payload: "Insulin · 2,400" },
  { id: "VH-109", type: "BOAT", district: "Dhubri", lat: 26.082, lon: 89.961, status: "delivering", payload: "Char islands" },
  { id: "VH-110", type: "LGV", district: "Barpeta", lat: 26.328, lon: 91.038, status: "moving", payload: "Hygiene kits · 1,200" },
  { id: "VH-111", type: "HGV", district: "Barpeta", lat: 26.402, lon: 91.144, status: "loading", payload: "Mosquito nets" },
  { id: "VH-112", type: "LGV", district: "Goalpara", lat: 26.182, lon: 90.610, status: "delivering", payload: "Dry rations" },
  { id: "VH-113", type: "BIKE", district: "Goalpara", lat: 26.205, lon: 90.394, status: "moving", payload: "GDS courier" },
  { id: "VH-114", type: "LGV", district: "Bongaigaon", lat: 26.475, lon: 90.561, status: "moving", payload: "Shelter supplies" },
  { id: "VH-115", type: "HGV", district: "Kamrup", lat: 26.184, lon: 91.748, status: "loading", payload: "Cash · ₹2.4 Cr" },
  { id: "VH-116", type: "LGV", district: "Kamrup", lat: 26.430, lon: 91.625, status: "moving", payload: "Generator units" },
  { id: "VH-117", type: "BIKE", district: "Kamrup", lat: 26.235, lon: 91.520, status: "delivering", payload: "Voice surveys" },
  { id: "VH-118", type: "LGV", district: "Sonitpur", lat: 26.640, lon: 92.798, status: "moving", payload: "Cold-chain meds" },
  { id: "VH-119", type: "HGV", district: "Sonitpur", lat: 26.722, lon: 93.140, status: "delivering", payload: "Family kits" },
  { id: "VH-120", type: "LGV", district: "Lakhimpur", lat: 27.241, lon: 94.106, status: "moving", payload: "Mobile clinic kit" },
  { id: "VH-121", type: "BOAT", district: "Lakhimpur", lat: 27.495, lon: 94.398, status: "delivering", payload: "Bogibeel detour" },
  { id: "VH-122", type: "HGV", district: "Dhemaji", lat: 27.484, lon: 94.581, status: "loading", payload: "Tarpaulin" },
  { id: "VH-123", type: "LGV", district: "Cachar", lat: 24.836, lon: 92.792, status: "moving", payload: "WHO meds" },
];

// ────────────────────────────────────────────────────────────────────────────
// Live GDS field positions (a sample of 24 of the 948 deployed)
// ────────────────────────────────────────────────────────────────────────────

export interface GdsPosition {
  id: string;
  name: string;
  district: string;
  lat: number;
  lon: number;
  task: string;
  digipin: string;
  lastSeenSec: number;
}

export const gdsPositions: GdsPosition[] = [
  { id: "GDS-001", name: "Ramesh G. Bora", district: "Nagaon", lat: 26.331, lon: 92.665, task: "Welfare check", digipin: "FK4-7M3-H8VC", lastSeenSec: 24 },
  { id: "GDS-002", name: "Mausumi Das", district: "Barpeta", lat: 26.392, lon: 91.105, task: "Ration delivery", digipin: "BP3-X8K-2YML", lastSeenSec: 11 },
  { id: "GDS-003", name: "Bipul Hazarika", district: "Nagaon", lat: 26.532, lon: 92.846, task: "Bridge inspection", digipin: "FK4-7M2-G3RJ", lastSeenSec: 6 },
  { id: "GDS-004", name: "Faruk Ahmed", district: "Dhubri", lat: 26.291, lon: 90.220, task: "IPPB cash", digipin: "DH9-PQ2-R7LX", lastSeenSec: 48 },
  { id: "GDS-005", name: "Maya Roy", district: "Dhubri", lat: 26.090, lon: 89.980, task: "Welfare check", digipin: "DH9-PQ2-R7MN", lastSeenSec: 19 },
  { id: "GDS-006", name: "Kamal Sarma", district: "Morigaon", lat: 26.260, lon: 92.345, task: "Voice report", digipin: "FK4-7M3-H8XW", lastSeenSec: 4 },
  { id: "GDS-007", name: "Pranab Saikia", district: "Morigaon", lat: 26.240, lon: 92.130, task: "Boat ferry", digipin: "FK4-7M3-J9PR", lastSeenSec: 33 },
  { id: "GDS-008", name: "Anjali Bhuyan", district: "Goalpara", lat: 26.180, lon: 90.625, task: "Medical drop", digipin: "GP1-LM2-N4VC", lastSeenSec: 67 },
  { id: "GDS-009", name: "Ravi Kalita", district: "Bongaigaon", lat: 26.470, lon: 90.553, task: "Ration delivery", digipin: "BG2-MR4-W5XL", lastSeenSec: 12 },
  { id: "GDS-010", name: "Sangeeta Pegu", district: "Kamrup", lat: 26.220, lon: 91.760, task: "Welfare check", digipin: "KM7-CD8-V9JK", lastSeenSec: 22 },
  { id: "GDS-011", name: "Mohan Das", district: "Kamrup", lat: 26.445, lon: 91.620, task: "IPPB doorstep", digipin: "KM7-CD9-X3NL", lastSeenSec: 9 },
  { id: "GDS-012", name: "Bina Hazarika", district: "Sonitpur", lat: 26.638, lon: 92.795, task: "Welfare check", digipin: "SO5-JK6-P7MX", lastSeenSec: 18 },
  { id: "GDS-013", name: "Diganta Bora", district: "Sonitpur", lat: 26.720, lon: 93.142, task: "Voice report", digipin: "SO5-JK6-Q8WL", lastSeenSec: 41 },
  { id: "GDS-014", name: "Joya Sharma", district: "Lakhimpur", lat: 27.230, lon: 94.105, task: "Mobile clinic", digipin: "LK4-RS7-V2WD", lastSeenSec: 7 },
  { id: "GDS-015", name: "Suresh Gogoi", district: "Lakhimpur", lat: 27.502, lon: 94.405, task: "Boat ferry", digipin: "LK4-RS7-X3JM", lastSeenSec: 28 },
  { id: "GDS-016", name: "Mukut Tamang", district: "Dhemaji", lat: 27.485, lon: 94.580, task: "Welfare check", digipin: "DM3-PR8-T1NW", lastSeenSec: 53 },
  { id: "GDS-017", name: "Niren Saikia", district: "Cachar", lat: 24.830, lon: 92.795, task: "Cash courier", digipin: "CC2-TF6-K9DV", lastSeenSec: 16 },
  { id: "GDS-018", name: "Lakhi Phukan", district: "Cachar", lat: 24.795, lon: 93.010, task: "Welfare check", digipin: "CC2-TF6-M3JL", lastSeenSec: 31 },
  { id: "GDS-019", name: "Hemanta Boro", district: "Tinsukia", lat: 27.495, lon: 95.355, task: "Ration delivery", digipin: "TS1-WX9-D5MK", lastSeenSec: 14 },
  { id: "GDS-020", name: "Rina Doley", district: "Tinsukia", lat: 27.288, lon: 95.682, task: "Welfare check", digipin: "TS1-WX9-F7HV", lastSeenSec: 26 },
  { id: "GDS-021", name: "Indrajit Saikia", district: "Nagaon", lat: 26.250, lon: 92.480, task: "IPPB doorstep", digipin: "FK4-7M2-G3PV", lastSeenSec: 8 },
  { id: "GDS-022", name: "Tarun Kumar", district: "Barpeta", lat: 26.428, lon: 91.176, task: "Voice report", digipin: "BP3-X8K-2YNQ", lastSeenSec: 45 },
  { id: "GDS-023", name: "Smriti Lahiri", district: "Goalpara", lat: 26.205, lon: 90.398, task: "Welfare check", digipin: "GP1-LM2-N4XR", lastSeenSec: 12 },
  { id: "GDS-024", name: "Praful Rabha", district: "Bongaigaon", lat: 26.320, lon: 90.640, task: "Boat ferry", digipin: "BG2-MR4-W5YT", lastSeenSec: 38 },
];

// ────────────────────────────────────────────────────────────────────────────
// Flood polygons — rough Brahmaputra inundation footprints (decorative)
// ────────────────────────────────────────────────────────────────────────────

export const floodPolygons: [number, number][][] = [
  // Central — Nagaon / Morigaon belt
  [
    [26.40, 92.10], [26.46, 92.32], [26.52, 92.60], [26.48, 92.95],
    [26.32, 93.05], [26.10, 92.85], [26.05, 92.45], [26.18, 92.10],
  ],
  // Western — Dhubri / Goalpara
  [
    [26.20, 89.85], [26.32, 90.10], [26.38, 90.55], [26.30, 90.80],
    [26.05, 90.78], [25.92, 90.32], [25.96, 89.92],
  ],
  // North — Dhemaji / Lakhimpur
  [
    [27.62, 94.20], [27.74, 94.55], [27.78, 95.05], [27.55, 95.20],
    [27.30, 94.95], [27.20, 94.40],
  ],
];

// ────────────────────────────────────────────────────────────────────────────
// Damaged roads — exactly 8 (matches PRD demo target)
// ────────────────────────────────────────────────────────────────────────────

export const damagedRoads: DamagedRoad[] = [
  { id: "RD-01", name: "NH-27 Nagaon–Jagiroad", type: "submersion", lat: 26.230, lon: 92.190, description: "Highway under 1.4m water for 4.2 km", reportedBy: "GDS Ramesh, Mayong B.O", detour: "via Dhing–Rupahi state road" },
  { id: "RD-02", name: "Kaliabor Bridge (Kolong)", type: "bridge_collapse", lat: 26.522, lon: 92.831, description: "Bridge approach collapsed, span unsafe", reportedBy: "GDS Bipul, Kaliabor S.O", detour: "via Jakhalabandha + Belsiri" },
  { id: "RD-03", name: "Laharighat Embankment", type: "submersion", lat: 26.385, lon: 92.230, description: "Embankment breached, 3km flooded", reportedBy: "DAKIYA voice (Assamese)", detour: "boat ferry from Jagiroad jetty" },
  { id: "RD-04", name: "Bilasipara–Sapatgram road", type: "submersion", lat: 26.281, lon: 90.158, description: "1.8km road impassable for HGV", reportedBy: "GDS Faruk, Sapatgram B.O", detour: "via Chapar + Tilapara" },
  { id: "RD-05", name: "Howly–Pathsala link", type: "submersion", lat: 26.443, lon: 91.176, description: "0.9m water across 600m stretch", reportedBy: "GDS Mausumi, Howly S.O", detour: "via Bhabanipur" },
  { id: "RD-06", name: "Jonai NH-15 stretch", type: "landslide", lat: 27.832, lon: 95.241, description: "Landslide debris blocks two lanes", reportedBy: "OSM + DAKIYA", detour: "via Dhemaji town bypass" },
  { id: "RD-07", name: "Bogibeel approach", type: "submersion", lat: 27.580, lon: 94.692, description: "South approach flooded — bridge open but unreachable", reportedBy: "Sat. inferred + GDS", detour: "via Dhakuakhana ferry" },
  { id: "RD-08", name: "Gauripur–Dhubri rail bridge", type: "submersion", lat: 26.058, lon: 90.005, description: "Road under bridge submerged", reportedBy: "GDS Maya, Gauripur B.O", detour: "via Golokganj road" },
];

// ────────────────────────────────────────────────────────────────────────────
// Service Orders — 5 (matches PRD demo target)
// ────────────────────────────────────────────────────────────────────────────

export const serviceOrders: ServiceOrder[] = [
  {
    id: "SO-001",
    type: "food_delivery",
    institution: "NDRF",
    hubOfficeId: "PO-001",
    hubOfficeName: "Nagaon H.O",
    district: "Nagaon",
    deliveryPoints: ["FK4-7M2-G3RJ", "FK4-7M2-G3PV", "FK4-7M3-H8XW", "FK4-7M3-H8VC", "FK4-7M3-J9PR"],
    vehicleCount: 12,
    gdsCount: 184,
    beneficiaries: 48_000,
    payload: "48,000 dry-ration packets · 12,000 ORS sachets · 6,000 candles",
    estimatedHours: 11.5,
    estimatedCostInr: 8_72_000,
    coveragePercent: 91,
    status: "pending_approval",
    reasoning:
      "Nagaon H.O is selected as primary hub: it is GREEN-status with cold storage, has the largest IPPB float (₹48.5 L), and sits on the highest-displacement axis (184k displaced). NH-27 submersion forced detour via Dhing–Rupahi, adding ~38 min but unblocking 47% of beneficiaries. Coverage capped at 91% — 4,300 households in Mayong/Laharighat are unreachable by road and routed to SO-005 welfare check via boat. Trade-off: cost is 14% above Economy tier, justified by 7.4h faster ETA at CRITICAL severity.",
  },
  {
    id: "SO-002",
    type: "medical",
    institution: "WHO",
    hubOfficeId: "PO-020",
    hubOfficeName: "Dhubri H.O",
    district: "Dhubri",
    deliveryPoints: ["DH9-PQ2-R7LX", "DH9-PQ2-R7MN", "DH9-PQ3-S4WV"],
    vehicleCount: 5,
    gdsCount: 96,
    beneficiaries: 12_400,
    payload: "Cold-chain meds: insulin 2,400 vials · ORS 8k · antibiotic course 4k · snake-bite antivenom 240",
    estimatedHours: 9.2,
    estimatedCostInr: 3_45_000,
    coveragePercent: 87,
    status: "pending_approval",
    reasoning:
      "Dhubri H.O is the only GREEN hub with both cold storage AND backup power within the western flood belt — required for insulin and antivenom integrity. PATHFINDER routes around Bilasipara–Sapatgram submersion (RD-04) via Chapar–Tilapara, adding 22 km but preserving cold-chain SLA. 13% coverage gap is in Gauripur (RED-status), being served via SO-005 doorstep welfare with cooler-bag couriers.",
  },
  {
    id: "SO-003",
    type: "cash",
    institution: "SDMA",
    hubOfficeId: "PO-060",
    hubOfficeName: "Guwahati G.P.O",
    district: "Kamrup",
    deliveryPoints: ["12 districts via IPPB rails"],
    vehicleCount: 0,
    gdsCount: 312,
    beneficiaries: 15_000,
    payload: "₹25,000 parametric payout × 15,000 families · Trigger: flood_basic (rainfall ≥ 200mm/72h)",
    estimatedHours: 4.0,
    estimatedCostInr: 37_50_00_000,
    coveragePercent: 100,
    status: "pending_approval",
    reasoning:
      "Parametric trigger flood_basic (rainfall 412mm > 200mm threshold) activated automatically — no claim filing required. VITTIYA splits across 3 channels: 8,400 IPPB digital transfers (4h), 4,300 GDS doorstep cash visits (48h), 2,300 USSD mWallet for feature-phone users (12h). 100% coverage achievable because IPPB has accounts for 86% of affected and the remaining 14% are handled by doorstep visits using existing GDS routing.",
  },
  {
    id: "SO-004",
    type: "shelter",
    institution: "RED_CROSS",
    hubOfficeId: "PO-030",
    hubOfficeName: "Barpeta H.O",
    district: "Barpeta",
    deliveryPoints: ["BP3-X8K-2YML", "BP3-X8K-2YNQ", "BP3-X9L-3RTW"],
    vehicleCount: 6,
    gdsCount: 124,
    beneficiaries: 22_000,
    payload: "8,000 tarpaulin sheets · 4,000 family hygiene kits · 1,200 mosquito nets",
    estimatedHours: 14.8,
    estimatedCostInr: 6_18_000,
    coveragePercent: 88,
    status: "pending_approval",
    reasoning:
      "Barpeta H.O is the closest GREEN-status Head Office to the western Brahmaputra char islands. Howly–Pathsala road blockage (RD-05) detoured via Bhabanipur — adds 6.4 km. Coverage gap of 12% is in remote chars only reachable by boat; coordinated with NDRF water-rescue team via shared Service Order channel.",
  },
  {
    id: "SO-005",
    type: "welfare",
    institution: "SDMA",
    hubOfficeId: "ALL_GREEN",
    hubOfficeName: "All GREEN offices",
    district: "All affected",
    deliveryPoints: ["DigiPIN-zone level"],
    vehicleCount: 0,
    gdsCount: 948,
    beneficiaries: 23_775,
    payload: "Welfare check: elderly (60+), single-occupancy households, persons with disability",
    estimatedHours: 28.0,
    estimatedCostInr: 2_84_000,
    coveragePercent: 96,
    status: "pending_approval",
    reasoning:
      "948 GDS deployed across all 173 GREEN-status offices. Each GDS handles ~25 priority households identified from IPPB age data (60+) and existing beat sheets. Voice-report fallback enabled — DAKIYA captures field updates in Hindi/Assamese/Bengali. 4% coverage gap is in offline RED-status pockets where no GDS is currently positioned; will be picked up at T+24h after pre-positioning.",
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Agent pipeline definitions
// ────────────────────────────────────────────────────────────────────────────

export const agents: AgentNode[] = [
  {
    id: "predictor",
    name: "PREDICTOR",
    tag: "Pre-disaster supply pre-positioning",
    group: "pre",
    description: "72h Open-Meteo forecast. If rainfall_72h > 150mm, pre-position supplies at hubs based on historical UPU UDP outcomes.",
    llmPowered: false,
    durationSec: 6,
    status: "complete",
    outputSummary: "12 districts flagged. 36 pre-position orders issued at T-72h. ₹1.2Cr supplies staged at 12 H.O.",
  },
  {
    id: "sentinel",
    name: "SENTINEL",
    tag: "Disaster detection & risk mapping",
    group: "reactive",
    description: "Reads SACHET alert + Open-Meteo. Computes per-district risk scores. Predicts road damage from rainfall × infrastructure.",
    llmPowered: false,
    durationSec: 14,
    status: "complete",
    outputSummary: "12 districts affected · 3 CRITICAL · 5 HIGH · 3 MOD · 1 LOW · 8 damaged roads identified · 484k displacement estimate",
  },
  {
    id: "capacity",
    name: "CAPACITY",
    tag: "Live postal resource inventory",
    group: "reactive",
    description: "Calls api.postalpincode.in in parallel for all 12 districts. Enriches each office with status/IPPB/cold-storage flags.",
    llmPowered: false,
    durationSec: 9,
    status: "complete",
    outputSummary: "247 offices · 173 GREEN · 51 YELLOW · 23 RED · 88 vehicles · 948 GDS · ₹6.8 Cr IPPB float",
  },
  {
    id: "matchmaker",
    name: "MATCHMAKER",
    tag: "Demand → capacity, LLM-justified",
    group: "reactive",
    description: "Greedy assignment + Claude reasoning call. Generates executable Service Orders with operator-readable justification.",
    llmPowered: true,
    durationSec: 22,
    status: "complete",
    outputSummary: "5 Service Orders generated · 3 CRITICAL priority · ₹37.6 Cr total · 91% avg coverage · LLM justification ready",
  },
  {
    id: "human_gate",
    name: "HUMAN GATE",
    tag: "Operator approval (LangGraph interrupt)",
    group: "reactive",
    description: "Pipeline pauses. Operator reviews each Service Order with reasoning text and approves/rejects independently.",
    llmPowered: false,
    durationSec: 0,
    status: "running",
    outputSummary: "Awaiting operator approval — 5 of 5 orders pending review",
  },
  {
    id: "pathfinder",
    name: "PATHFINDER",
    tag: "Flood-aware routing",
    group: "reactive",
    description: "OpenRouteService with avoid_polygons. Generates GeoJSON routes per Service Order. Names every detour.",
    llmPowered: false,
    durationSec: 11,
    status: "idle",
    outputSummary: "—",
  },
  {
    id: "vittiya",
    name: "VITTIYA",
    tag: "3-channel cash disbursement",
    group: "reactive",
    description: "IPPB digital + GDS doorstep + USSD mWallet. Auto-checks parametric insurance triggers.",
    llmPowered: false,
    durationSec: 5,
    status: "idle",
    outputSummary: "—",
  },
  {
    id: "saathi",
    name: "SAATHI",
    tag: "Targeted multilingual alerts",
    group: "reactive",
    description: "DigiPIN-zone targeted, not district broadcast. Claude localises into Hindi / Assamese / Bengali under 160 chars.",
    llmPowered: true,
    durationSec: 18,
    status: "idle",
    outputSummary: "—",
  },
  {
    id: "kiran",
    name: "KIRAN",
    tag: "UPU UDP outcome logging",
    group: "post",
    description: "On Service Order complete, writes structured outcome record (planned vs actual) to UPU Unified Data Platform.",
    llmPowered: false,
    durationSec: 4,
    status: "idle",
    outputSummary: "—",
  },
];

// ────────────────────────────────────────────────────────────────────────────
// Live feed events (replayable)
// ────────────────────────────────────────────────────────────────────────────

export const liveFeed: FeedEvent[] = [
  { ts: "T+00:00:02", agent: "TRIGGER", level: "info", message: "SACHET alert received · CRITICAL · IMD source · Assam 12 districts" },
  { ts: "T+00:00:05", agent: "PREDICTOR", level: "info", message: "72h forecast peaks at 412mm in Nagaon — pre-position protocol activated" },
  { ts: "T+00:01:18", agent: "PREDICTOR", level: "ok", message: "36 pre-position orders dispatched · ₹1.2Cr staged at 12 head offices" },
  { ts: "T+00:02:04", agent: "SENTINEL", level: "info", message: "Open-Meteo polled for 12 districts · risk scoring..." },
  { ts: "T+00:02:11", agent: "SENTINEL", level: "warn", message: "3 districts CRITICAL: Nagaon, Morigaon, Dhubri" },
  { ts: "T+00:02:14", agent: "SENTINEL", level: "ok", message: "Risk map written · 8 damaged roads predicted · displacement est. 484k" },
  { ts: "T+00:02:18", agent: "DRDA", level: "warn", message: "ব্ৰহ্মপুত্ৰ · গুৱাহাটীত পানীৰ স্তৰ ৪৯.৮ মিটাৰ · DANGER চিহ্নৰ ওপৰত" },
  { ts: "T+00:02:21", agent: "CAPACITY", level: "info", message: "Calling api.postalpincode.in/postoffice/{Nagaon,Morigaon,Dhubri,...}" },
  { ts: "T+00:02:28", agent: "CAPACITY", level: "ok", message: "247 offices loaded in 7.2s · 173 GREEN · 51 YELLOW · 23 RED" },
  { ts: "T+00:02:30", agent: "CAPACITY", level: "ok", message: "88 vehicles · 948 GDS · ₹6.8 Cr IPPB float aggregated" },
  { ts: "T+00:02:34", agent: "DAKIYA", level: "info", message: "GDS रमेश ने 23 परिवारों की पुष्टि की · Mayong B.O · सभी सुरक्षित" },
  { ts: "T+00:02:38", agent: "DAKIYA", level: "warn", message: "NH-27 অৱৰোধ · ৫ কিমি দৈৰ্ঘ্য · ferry detour active via Duliajan" },
  { ts: "T+00:02:46", agent: "MATCHMAKER", level: "info", message: "Greedy assignment over 5 institutional demands × 173 hubs..." },
  { ts: "T+00:02:51", agent: "MATCHMAKER", level: "info", message: "Calling Claude (claude-sonnet-4) for justification reasoning..." },
  { ts: "T+00:03:02", agent: "VITTIYA", level: "ok", message: "IPPB · ₹25,000 × 6,200 परिवारों को भेजे गए · पैरामीट्रिक trigger सक्रिय" },
  { ts: "T+00:03:08", agent: "MATCHMAKER", level: "ok", message: "5 Service Orders generated · 91% avg coverage · awaiting human gate" },
  { ts: "T+00:03:08", agent: "HUMAN_GATE", level: "warn", message: "⏸  Pipeline paused at LangGraph interrupt — operator approval required" },
  { ts: "T+00:03:14", agent: "SAATHI", level: "info", message: "Generating 4-script alerts: অসমীয়া · বাংলা · हिन्दी · English" },
  { ts: "T+00:03:18", agent: "SAATHI", level: "ok", message: "৭৯৬,০০০ গ্ৰাহকলৈ FK4-7M2 জোনত SMS পঠোৱা হ'ল · 142 chars avg" },
  { ts: "T+00:03:42", agent: "DAKIYA", level: "info", message: "GDS Ramesh (Mayong B.O) reported via voice (Assamese): NH-27 submerged 1.4m" },
  { ts: "T+00:03:44", agent: "DAKIYA", level: "ok", message: "Whisper ASR + Claude NER → structured ground report · DigiPIN auto-tagged" },
  { ts: "T+00:03:49", agent: "SENTINEL", level: "info", message: "Re-scoring risk: ground report bumps Mayong sub-zone to CRITICAL" },
  { ts: "T+00:03:55", agent: "KIRAN", level: "ok", message: "UDP record write · cross-country benchmark updated · Bangladesh ops notified" },
];

// ────────────────────────────────────────────────────────────────────────────
// VITTIYA — finance / disbursement
// ────────────────────────────────────────────────────────────────────────────

export const finance = {
  parametricTrigger: {
    name: "flood_basic",
    threshold: "rainfall_72h ≥ 200mm",
    measured: "412mm (Nagaon)",
    payoutPerFamilyInr: 25_000,
    autoDisburse: true,
    activatedAt: "T+00:02:14",
  },
  channels: [
    { name: "IPPB digital transfer", icon: "smartphone", coverageFamilies: 8_400, etaHours: 4, completedFamilies: 6_200, status: "in_progress" as const },
    { name: "GDS doorstep cash", icon: "wallet", coverageFamilies: 4_300, etaHours: 48, completedFamilies: 0, status: "pending" as const },
    { name: "USSD mWallet (₹99 phones)", icon: "phone", coverageFamilies: 2_300, etaHours: 12, completedFamilies: 0, status: "pending" as const },
  ],
  totalDisbursementInr: 37_50_00_000,
};

// ────────────────────────────────────────────────────────────────────────────
// SAATHI alerts — multilingual SMS-length, by DigiPIN zone
// ────────────────────────────────────────────────────────────────────────────

export const alertBatches: AlertBatch[] = [
  {
    language: "en",
    languageName: "English",
    digipinZone: "FK4-7M2",
    recipientCount: 184_000,
    channel: "APP_PUSH",
    message:
      "FLOOD ALERT · Nagaon: water rising. Move to high ground. Cash relief sent to your IPPB. Food at Nagaon H.O. SMS HELP to 50050 if stranded.",
  },
  {
    language: "hi",
    languageName: "हिन्दी",
    digipinZone: "FK4-7M2",
    recipientCount: 612_000,
    channel: "SMS",
    message:
      "बाढ़ चेतावनी · नगांव: पानी बढ़ रहा है। ऊंचे स्थान पर जाएं। आपके IPPB में राहत राशि भेजी गई है। नगांव डाकघर पर भोजन उपलब्ध है।",
  },
  {
    language: "as",
    languageName: "অসমীয়া",
    digipinZone: "DH9-PQ2",
    recipientCount: 121_000,
    channel: "SMS",
    message:
      "বানপানীৰ সতৰ্কবাণী · ধুবুৰী: পানী বাঢ়িছে। ওপৰৰ ঠাইলৈ যাওক। আপোনাৰ IPPB-ত সাহাৰ্য্যৰ ধন পঠোৱা হৈছে। ধুবুৰী H.O-ত খাদ্য উপলব্ধ।",
  },
  {
    language: "bn",
    languageName: "বাংলা",
    digipinZone: "BP3-X8K",
    recipientCount: 76_500,
    channel: "SMS",
    message:
      "বন্যা সতর্কতা · বরপেটা: জল বাড়ছে। উঁচু জায়গায় যান। আপনার IPPB অ্যাকাউন্টে ত্রাণ পাঠানো হয়েছে। বরপেটা H.O-তে খাবার পাওয়া যাচ্ছে।",
  },
  {
    language: "hi",
    languageName: "हिन्दी",
    digipinZone: "DH9-PQ2",
    recipientCount: 412_000,
    channel: "SMS",
    message:
      "बाढ़ चेतावनी · धुबरी: चिकित्सा सहायता धुबरी डाकघर पर। बुजुर्गों के लिए डाकिया घर आएंगे। सहायता के लिए 50050 पर SMS करें।",
  },
  {
    language: "as",
    languageName: "অসমীয়া",
    digipinZone: "FK4-7M3",
    recipientCount: 92_000,
    channel: "SMS",
    message:
      "বানপানীৰ সতৰ্কবাণী · মৰিগাঁৱ: লাহৰীঘাটৰ বান্ধ ভাঙিছে। নিৰাপদ ঠাইলৈ যাওক। গ্ৰামীণ ডাক সেৱকে আপোনাৰ ঘৰলৈ আহিব।",
  },
];

// SAATHI generates a single message and Claude translates it 1:1 across 4
// scripts. The dashboard renders all four side-by-side so the operator can
// audit the translation before broadcast.
export const multilingualAlerts: MultilingualAlertZone[] = [
  {
    digipinZone: "FK4-7M2",
    district: "Nagaon",
    severity: "CRITICAL",
    totalRecipients: 796_000,
    channels: ["APP_PUSH", "SMS", "USSD"],
    scripts: {
      en: "FLOOD ALERT · Nagaon: water rising. Move to higher ground. Cash relief sent to your IPPB account. Food at Nagaon H.O. SMS HELP to 50050 if stranded.",
      hi: "बाढ़ चेतावनी · नगांव: पानी बढ़ रहा है। ऊंचे स्थान पर जाएं। आपके IPPB खाते में राहत राशि भेजी गई है। नगांव डाकघर पर भोजन उपलब्ध। फंसे हों तो 50050 पर SMS करें।",
      as: "বানপানীৰ সতৰ্কবাণী · নগাঁও: পানী বাঢ়িছে। ওপৰৰ ঠাইলৈ যাওক। আপোনাৰ IPPB হিচাপলৈ সাহাৰ্য্যৰ ধন পঠোৱা হৈছে। নগাঁও ডাকঘৰত খাদ্য উপলব্ধ। আবদ্ধ হৈ থাকিলে 50050-ত SMS কৰক।",
      bn: "বন্যা সতর্কতা · নগাঁও: জল বাড়ছে। উঁচু জায়গায় যান। আপনার IPPB অ্যাকাউন্টে ত্রাণ পাঠানো হয়েছে। নগাঁও ডাকঘরে খাবার পাওয়া যাচ্ছে। আটকে থাকলে 50050-তে SMS করুন।",
    },
  },
  {
    digipinZone: "DH9-PQ2",
    district: "Dhubri",
    severity: "CRITICAL",
    totalRecipients: 533_000,
    channels: ["SMS", "USSD"],
    scripts: {
      en: "FLOOD ALERT · Dhubri: medical aid at Dhubri H.O. Postman will visit elderly homes today. SMS HELP to 50050 for help. ₹25,000 sent to families via IPPB.",
      hi: "बाढ़ चेतावनी · धुबरी: चिकित्सा सहायता धुबरी डाकघर पर। बुजुर्गों के घर डाकिया आज जाएंगे। सहायता के लिए 50050 पर SMS करें। ₹25,000 IPPB से भेजे गए।",
      as: "বানপানীৰ সতৰ্কবাণী · ধুবুৰী: চিকিৎসা সাহাৰ্য ধুবুৰী ডাকঘৰত। বয়োজ্যেষ্ঠসকলৰ ঘৰলৈ ডাকিয়া আজি যাব। সাহাৰ্যৰ বাবে 50050-ত SMS কৰক। IPPB-ৰ পৰা ₹২৫,০০০ পঠোৱা হ'ল।",
      bn: "বন্যা সতর্কতা · ধুবড়ি: চিকিৎসা সহায়তা ধুবড়ি ডাকঘরে। ডাকহরকরা প্রবীণদের বাড়িতে আজ যাবেন। সাহায্যের জন্য 50050-তে SMS করুন। IPPB থেকে ₹২৫,০০০ পাঠানো হয়েছে।",
    },
  },
  {
    digipinZone: "FK4-7M3",
    district: "Morigaon",
    severity: "HIGH",
    totalRecipients: 184_000,
    channels: ["SMS"],
    scripts: {
      en: "FLOOD ALERT · Morigaon: Lahorighat embankment broken. Move to safer area. Gramin Dak Sevak will visit your home with relief supplies.",
      hi: "बाढ़ चेतावनी · मोरीगांव: लाहोरीघाट बांध टूटा है। सुरक्षित स्थान पर जाएं। ग्रामीण डाक सेवक राहत सामग्री लेकर आपके घर आएगा।",
      as: "বানপানীৰ সতৰ্কবাণী · মৰিগাঁৱ: লাহৰীঘাটৰ বান্ধ ভাঙিছে। নিৰাপদ ঠাইলৈ যাওক। গ্ৰামীণ ডাক সেৱকে সাহাৰ্য্যৰ সামগ্ৰীৰ সৈতে আপোনাৰ ঘৰলৈ আহিব।",
      bn: "বন্যা সতর্কতা · মরিগাঁও: লাহোরিঘাট বাঁধ ভেঙেছে। নিরাপদ স্থানে যান। গ্রামীণ ডাক সেবক ত্রাণ সামগ্রী নিয়ে আপনার বাড়িতে আসবেন।",
    },
  },
];

// ────────────────────────────────────────────────────────────────────────────
// KPIs (bottom strip)
// ────────────────────────────────────────────────────────────────────────────

export const kpis = {
  responseTimeHours: 28.1,
  responseTimeBaselineHours: 72,
  peopleReached: 2_900_000,
  trucksBlocked: 0,
  routeBlockagesAvoided: 8,
  elderlyChecked: 23_775,
  gdsDeployed: 948,
  cashDisbursedFamilies: 15_000,
  cashChannelsActive: 3,
  pipelineRuntimeSec: 165,
  llmCallsTotal: 28,
};

// ────────────────────────────────────────────────────────────────────────────
// SETU institution view
// ────────────────────────────────────────────────────────────────────────────

export const institutionRequests = [
  {
    id: "REQ-2026-0042",
    institution: "NDRF",
    type: "logistics" as const,
    title: "48,000 dry-ration packets — Nagaon district",
    submittedAt: "T+00:02:38",
    priority: "CRITICAL" as const,
    deadlineHours: 12,
    status: "options_ready" as const,
    options: [
      {
        tier: "Fast",
        etaHours: 8.4,
        coveragePercent: 76,
        costInr: 11_42_000,
        offices: 3,
        vehicles: 18,
        gds: 240,
      },
      {
        tier: "Balanced",
        etaHours: 11.5,
        coveragePercent: 91,
        costInr: 8_72_000,
        offices: 5,
        vehicles: 12,
        gds: 184,
        recommended: true,
      },
      {
        tier: "Economy",
        etaHours: 16.0,
        coveragePercent: 96,
        costInr: 6_48_000,
        offices: 7,
        vehicles: 9,
        gds: 162,
      },
    ],
  },
];

// ────────────────────────────────────────────────────────────────────────────
// GDS field app — Ramesh's day
// ────────────────────────────────────────────────────────────────────────────

export const gdsTasks = [
  {
    id: "TSK-01",
    type: "delivery" as const,
    label: "Dry-ration packets · 18 households",
    digipin: "FK4-7M3-H8VC",
    village: "Mayong",
    eta: "10:30 AM",
    priority: "CRITICAL" as const,
    distance: "1.2 km",
  },
  {
    id: "TSK-02",
    type: "welfare" as const,
    label: "Elderly welfare check · Smt. Bhuyan, 78",
    digipin: "FK4-7M3-H8XW",
    village: "Mayong",
    eta: "11:15 AM",
    priority: "HIGH" as const,
    distance: "0.6 km",
  },
  {
    id: "TSK-03",
    type: "cash" as const,
    label: "IPPB doorstep cash · ₹25,000 × 4 families",
    digipin: "FK4-7M3-J9PR",
    village: "Mayong",
    eta: "12:00 PM",
    priority: "HIGH" as const,
    distance: "1.8 km",
  },
  {
    id: "TSK-04",
    type: "report" as const,
    label: "Voice update on NH-27 water level",
    digipin: "auto (GPS)",
    village: "Roadside",
    eta: "2:00 PM",
    priority: "MODERATE" as const,
    distance: "—",
  },
];

export const gdsRecentReports = [
  {
    id: "RPT-098",
    transcriptOriginal:
      "ছাৰ, NH-২৭ ত পানী এক মিটাৰ চাবি গৈছে, গাড়ী যাব পৰা নাই। মায়ংত ১২টা ঘৰ আবদ্ধ হৈ আছে।",
    transcriptOriginalLang: "as" as const,
    transcript:
      "Sir, water has risen one metre on NH-27, vehicles cannot pass. 12 households trapped in Mayong.",
    extracted: {
      road_blocked: true,
      water_depth_metres: 1.4,
      families_affected: 12,
      urgency: "CRITICAL",
      digipin: "FK4-7M3-H8XW",
    },
    syncedAt: "T+00:03:42",
  },
  {
    id: "RPT-097",
    transcriptOriginal:
      "শ্ৰীমতী ভূঞা আজি ভাল আছে, ঔষধ শেষ হৈ গৈছে, BP-ৰ ঔষধ লাগে।",
    transcriptOriginalLang: "as" as const,
    transcript:
      "Smt. Bhuyan is well today, medicine is finished, BP medication needed.",
    extracted: {
      elderly_needing_help: 1,
      medical_needs: ["BP medication"],
      urgency: "HIGH",
      digipin: "FK4-7M3-H8XW",
    },
    syncedAt: "T+00:14:08",
  },
];
