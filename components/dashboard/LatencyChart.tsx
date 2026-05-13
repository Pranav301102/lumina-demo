"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Node = { node_id: string; latency_ms: number };

const COLORS: Record<string, string> = {
  "node-a": "#3b82f6",
  "node-b": "#a855f7",
  "node-c": "#10b981",
};

export default function LatencyChart({ nodes }: { nodes: Node[] }) {
  const data = nodes.map((n) => ({
    name: n.node_id,
    latency: Math.round(n.latency_ms),
  }));

  return (
    <div className="bg-card border border-subtle rounded-2xl p-5">
      <h3 className="font-semibold text-heading mb-4">Node Latency (ms)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 11 }} tickLine={false} />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#9ca3af" }}
            formatter={(v: number) => [`${v} ms`, "latency"]}
          />
          <Bar dataKey="latency" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#2563eb"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
