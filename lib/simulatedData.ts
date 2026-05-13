/* Deterministic drift: values change every 3 s but look organic */
function wave(seed: number, range: number): number {
  const t = Math.floor(Date.now() / 3000);
  return Math.sin(seed + t * 0.71) * range;
}

function clamp(v: number, min: number, max: number) {
  return Math.round(Math.max(min, Math.min(max, v)));
}

export type SimNode = {
  node_id: string;
  status: string;
  role: string;
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  vram: string;
  latency_ms: number;
  throughput_tps: number;
  active_connections: number;
  shared_with: string[];
  last_heartbeat: string;
  layer_start: number;
  layer_end: number;
};

const BASES = [
  { node_id: "node-a", role: "head",  cpu: 62, ram: 54, vramRaw: 24, lat: 12, tps: 42, layers: [0,  8],  seed: 1.1 },
  { node_id: "node-b", role: "mid",   cpu: 71, ram: 67, vramRaw: 16, lat: 18, tps: 36, layers: [9,  18], seed: 2.3 },
  { node_id: "node-c", role: "tail",  cpu: 48, ram: 51, vramRaw: 8,  lat: 14, tps: 44, layers: [19, 27], seed: 3.7 },
];

export function getSimNodes(): SimNode[] {
  return BASES.map((b) => {
    const cpu    = clamp(b.cpu  + wave(b.seed,      12), 30, 95);
    const ram    = clamp(b.ram  + wave(b.seed + 1,  8),  35, 88);
    const lat    = clamp(b.lat  + wave(b.seed + 2,  5),  6,  45);
    const tps    = clamp(b.tps  + wave(b.seed + 3,  8),  20, 60);
    const conns  = clamp(1      + wave(b.seed + 4,  1),  0,  4);
    const total  = b.vramRaw;
    const used   = parseFloat(((b.vramRaw * ram) / 100).toFixed(1));

    return {
      node_id:            b.node_id,
      status:             "healthy",
      role:               b.role,
      cpu_percent:        cpu,
      ram_percent:        ram,
      ram_used_gb:        used,
      ram_total_gb:       total,
      vram:               `${b.vramRaw} GB`,
      latency_ms:         lat,
      throughput_tps:     tps,
      active_connections: conns,
      shared_with:        BASES.filter((x) => x.node_id !== b.node_id).map((x) => x.node_id),
      last_heartbeat:     new Date().toISOString(),
      layer_start:        b.layers[0],
      layer_end:          b.layers[1],
    };
  });
}

/* Monotonically increasing request counter persisted in memory */
let requestsServed = 1247;
let lastTick = Date.now();

export function getRequestsServed() {
  const now = Date.now();
  const delta = Math.floor((now - lastTick) / 3000);
  if (delta > 0) {
    requestsServed += delta * clamp(1 + wave(5.5, 1), 0, 3);
    lastTick = now;
  }
  return requestsServed;
}

const START_TIME = Date.now();
export function getUptimeSeconds() {
  return Math.floor((Date.now() - START_TIME) / 1000) + 86400 * 2; // pretend 2d uptime
}

/* Trace history */
const PROMPT_PREVIEWS = [
  "Explain quantum entanglement simply",
  "Write a Python quicksort",
  "What is the Lumina architecture?",
  "Summarize transformer attention",
  "How does VRAM-aware splitting work?",
  "Compare GPT-4 and Gemini",
  "Debug my React useEffect hook",
  "What is split inference?",
];

export function generateTraces(count = 20) {
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const seed  = i * 1.3 + 0.5;
    const nodeA = clamp(220 + wave(seed,      60), 120, 400);
    const nodeB = clamp(340 + wave(seed + 1,  80), 200, 550);
    const nodeC = clamp(180 + wave(seed + 2,  50), 100, 320);
    const recv  = clamp(10  + wave(seed + 3,  5),  5,   20);
    const track = clamp(22  + wave(seed + 4,  8),  10,  40);
    const dec   = clamp(200 + wave(seed + 5,  50), 100, 380);
    const total = recv + track + nodeA + nodeB + dec;

    return {
      request_id:       `req-${(0xabcdef + i * 7919).toString(16).padStart(8, "0")}`,
      status:           "completed",
      total_latency_ms: total,
      started_at:       new Date(now - (count - i) * 14000 - 3000).toISOString(),
      prompt_preview:   PROMPT_PREVIEWS[i % PROMPT_PREVIEWS.length],
      steps: [
        { name: "prompt_received",    latency_ms: recv },
        { name: "tracker_assignment", latency_ms: track },
        { name: "node_a_forward",     latency_ms: nodeA },
        { name: "node_b_forward",     latency_ms: nodeB },
        { name: "decode_output",      latency_ms: dec },
      ],
    };
  });
}
