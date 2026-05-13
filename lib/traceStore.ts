/* In-memory trace store — lives for the duration of the dev server process (~15-20+ min).
   Module-level singleton: shared across all Next.js API routes in the same process. */

export type TraceStep = { name: string; latency_ms: number };

export type StoredTrace = {
  request_id: string;
  status: "in_progress" | "completed" | "failed";
  total_latency_ms: number;
  started_at: string;
  prompt_preview: string;
  steps: TraceStep[];
};

const MAX = 20;
const store: StoredTrace[] = [];
const inProgress = new Map<string, { startMs: number; prompt: string }>();

function simSteps(totalMs: number): TraceStep[] {
  const recv  = Math.round(totalMs * 0.012);
  const track = Math.round(totalMs * 0.025);
  const nodeA = Math.round(totalMs * 0.28);
  const nodeB = Math.round(totalMs * 0.42);
  const dec   = totalMs - recv - track - nodeA - nodeB;
  return [
    { name: "prompt_received",    latency_ms: recv  },
    { name: "tracker_assignment", latency_ms: track },
    { name: "node_a_forward",     latency_ms: nodeA },
    { name: "node_b_forward",     latency_ms: nodeB },
    { name: "decode_output",      latency_ms: Math.max(dec, 50) },
  ];
}

export function startTrace(requestId: string, prompt: string) {
  inProgress.set(requestId, { startMs: Date.now(), prompt });
}

export function completeTrace(requestId: string, ok: boolean) {
  const entry = inProgress.get(requestId);
  if (!entry) return;
  inProgress.delete(requestId);

  const totalMs = Date.now() - entry.startMs;
  const trace: StoredTrace = {
    request_id:       requestId,
    status:           ok ? "completed" : "failed",
    total_latency_ms: totalMs,
    started_at:       new Date(entry.startMs).toISOString(),
    prompt_preview:   entry.prompt.slice(0, 60) + (entry.prompt.length > 60 ? "…" : ""),
    steps:            simSteps(totalMs),
  };

  store.unshift(trace);
  if (store.length > MAX) store.pop();
}

export function getTraces(): StoredTrace[] {
  return store;
}
