"use client";

import { useEffect, useState } from "react";
import { Clock, ChevronDown, ChevronRight } from "lucide-react";

type Step = { name: string; latency_ms: number };
type Trace = {
  request_id: string;
  status: string;
  total_latency_ms: number;
  started_at: string;
  prompt_preview: string;
  steps: Step[];
};

const STEP_COLORS: Record<string, string> = {
  prompt_received: "bg-blue-500",
  tracker_assignment: "bg-purple-500",
  node_a_forward: "bg-blue-400",
  node_b_forward: "bg-purple-400",
  node_c_forward: "bg-emerald-400",
  decode_output: "bg-emerald-500",
};

export default function TracePage() {
  const [traces, setTraces] = useState<Trace[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/traces");
        const d = await r.json();
        setTraces(d.traces ?? []);
      } catch {
        // silently retry
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-heading">Traces</h2>
        <p className="text-muted text-sm mt-1">Request lifecycle and per-step latency breakdown across all nodes.</p>
      </div>

      <div className="bg-card border border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
          <h3 className="font-semibold text-heading">Recent Requests</h3>
          <span className="text-xs text-muted">Refreshes every 5s</span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading traces...</div>
        ) : (
          <div>
            {traces.map((t) => (
              <div key={t.request_id} className="border-b border-subtle/50 last:border-0">
                <button
                  onClick={() => setExpanded(expanded === t.request_id ? null : t.request_id)}
                  className="w-full text-left px-5 py-4 hover:bg-subtle/20 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {expanded === t.request_id ? (
                      <ChevronDown size={14} className="text-muted shrink-0" />
                    ) : (
                      <ChevronRight size={14} className="text-muted shrink-0" />
                    )}
                    <span className="font-mono text-xs text-muted shrink-0">{t.request_id.slice(0, 12)}...</span>
                    <span className="text-sm text-body truncate">{t.prompt_preview}</span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      t.status === "completed" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                    }`}>
                      {t.status}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted">
                      <Clock size={11} />
                      {t.total_latency_ms} ms
                    </span>
                    <span className="text-xs text-muted">{new Date(t.started_at).toLocaleTimeString()}</span>
                  </div>
                </button>

                {expanded === t.request_id && (
                  <div className="px-5 pb-5 bg-deep/50">
                    <div className="pt-3 space-y-3">
                      <p className="text-xs text-muted mb-4">Latency breakdown — total {t.total_latency_ms} ms</p>
                      {t.steps.map((step) => {
                        const pct = Math.min(100, (step.latency_ms / t.total_latency_ms) * 100);
                        const color = STEP_COLORS[step.name] ?? "bg-accent";
                        return (
                          <div key={step.name} className="flex items-center gap-3 text-sm">
                            <span className="w-40 text-xs text-muted shrink-0">{step.name.replace(/_/g, " ")}</span>
                            <div className="flex-1 h-5 bg-subtle rounded-md overflow-hidden">
                              <div
                                className={`h-full ${color} rounded-md flex items-center px-2 transition-all duration-500`}
                                style={{ width: `${Math.max(pct, 4)}%` }}
                              >
                                <span className="text-white text-xs font-medium whitespace-nowrap">{step.latency_ms} ms</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
