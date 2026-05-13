"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import StatCard from "@/components/dashboard/StatCard";
import ThroughputChart from "@/components/dashboard/ThroughputChart";
import LatencyChart from "@/components/dashboard/LatencyChart";
import { Server, Cpu, HardDrive, Zap } from "lucide-react";

type Node = {
  node_id: string;
  status: string;
  role: string;
  cpu_percent: number;
  ram_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  latency_ms: number;
  throughput_tps: number;
  active_connections: number;
  shared_with: string[];
  last_heartbeat: string;
  layer_start: number;
  layer_end: number;
};

type Assignment = { node_id: string; layer_start: number; layer_end: number };

function writeLog(level: "info" | "warn" | "error", message: string, metadata: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem("lumina_logs");
    const logs: unknown[] = raw ? JSON.parse(raw) : [];
    logs.push({ id: crypto.randomUUID(), timestamp: new Date().toISOString(), level, message, metadata });
    if (logs.length > 150) logs.splice(0, logs.length - 150);
    localStorage.setItem("lumina_logs", JSON.stringify(logs));
  } catch { /* localStorage unavailable */ }
}

export default function ClusterPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const t0 = Date.now();
      try {
        const [nr, ar] = await Promise.all([
          fetch("/api/nodes").then((r) => r.json()),
          fetch("/api/assignments").then((r) => r.json()),
        ]);
        const loadedNodes: Node[] = nr.nodes ?? [];
        setNodes(loadedNodes);
        setAssignments(ar.assignments ?? []);

        const active = loadedNodes.filter((n) => n.status === "healthy" || n.status === "active").length;
        const avgLatency = loadedNodes.length
          ? Math.round(loadedNodes.reduce((s, n) => s + n.latency_ms, 0) / loadedNodes.length)
          : 0;
        const avgThroughput = loadedNodes.length
          ? Math.round(loadedNodes.reduce((s, n) => s + n.throughput_tps, 0) / loadedNodes.length)
          : 0;

        writeLog("info", "Cluster heartbeat", {
          activeNodes: active,
          totalNodes: loadedNodes.length,
          avgLatency: `${avgLatency} ms`,
          avgThroughput: `${avgThroughput} tok/s`,
          pollDuration: `${Date.now() - t0} ms`,
        });
      } catch (err) {
        writeLog("error", "Cluster poll failed", { error: String(err) });
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  const activeCount = nodes.filter((n) => n.status === "healthy" || n.status === "active").length;
  const avgThroughput = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.throughput_tps, 0) / nodes.length)
    : 0;
  const avgLatency = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.latency_ms, 0) / nodes.length)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-heading">Cluster</h2>
        <p className="text-muted text-sm mt-1">Live node health, resource usage, and layer assignments.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Nodes" value={nodes.length} icon={<Server size={16} />} />
        <StatCard label="Active Nodes" value={activeCount} icon={<Zap size={16} />} color="success" />
        <StatCard label="Avg Throughput" value={`${avgThroughput} tok/s`} icon={<Cpu size={16} />} color="accent" />
        <StatCard label="Avg Latency" value={`${avgLatency} ms`} icon={<HardDrive size={16} />} color="warn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ThroughputChart nodes={nodes} />
        <LatencyChart nodes={nodes} />
      </div>

      <div className="bg-card border border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-subtle">
          <h3 className="font-semibold text-heading">Node Tracker</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted text-sm">Loading cluster data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle text-muted text-xs">
                  {["Node ID", "Role", "Status", "CPU", "RAM", "Latency", "Throughput", "Connections", "Layers", "Last Heartbeat"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.node_id} className="border-b border-subtle/50 hover:bg-subtle/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-body">{n.node_id}</td>
                    <td className="px-4 py-3 text-muted capitalize">{n.role}</td>
                    <td className="px-4 py-3"><StatusBadge status={n.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-accent rounded-full" style={{ width: `${n.cpu_percent}%` }} />
                        </div>
                        <span className="text-xs text-muted">{Math.round(n.cpu_percent)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-subtle rounded-full overflow-hidden">
                          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${n.ram_percent}%` }} />
                        </div>
                        <span className="text-xs text-muted">
                          {Math.round(n.ram_percent)}%
                          <span className="ml-1 opacity-60">({n.ram_used_gb}/{n.ram_total_gb} GB)</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{Math.round(n.latency_ms)} ms</td>
                    <td className="px-4 py-3 text-muted">{Math.round(n.throughput_tps)} tok/s</td>
                    <td className="px-4 py-3 text-muted">{n.active_connections}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted">
                      {n.layer_start}–{n.layer_end}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {new Date(n.last_heartbeat).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-card border border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-subtle">
          <h3 className="font-semibold text-heading">Layer Assignments</h3>
          <p className="text-xs text-muted mt-0.5">VRAM-proportional split across 28 transformer layers</p>
        </div>
        <div className="p-5">
          <div className="flex gap-2 mb-4">
            {assignments.map((a) => {
              const pct = ((a.layer_end - a.layer_start + 1) / 28) * 100;
              const colors: Record<string, string> = {
                "node-a": "bg-blue-500",
                "node-b": "bg-purple-500",
                "node-c": "bg-emerald-500",
              };
              return (
                <div
                  key={a.node_id}
                  className={`${colors[a.node_id] ?? "bg-accent"} rounded-lg flex items-center justify-center text-white text-xs font-medium py-2`}
                  style={{ width: `${pct}%` }}
                >
                  {a.node_id} ({a.layer_start}–{a.layer_end})
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>Layer 0</span>
            <div className="flex-1 h-px bg-subtle" />
            <span>Layer 27</span>
          </div>
        </div>
      </div>
    </div>
  );
}
