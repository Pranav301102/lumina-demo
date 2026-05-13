"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type Node = { node_id: string; throughput_tps: number };
type Point = { t: string; "node-a": number; "node-b": number; "node-c": number };

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function ThroughputChart({ nodes }: { nodes: Node[] }) {
  const [history, setHistory] = useState<Point[]>([]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const point: Point = {
      t: nowLabel(),
      "node-a": Math.round(nodes.find((n) => n.node_id === "node-a")?.throughput_tps ?? 0),
      "node-b": Math.round(nodes.find((n) => n.node_id === "node-b")?.throughput_tps ?? 0),
      "node-c": Math.round(nodes.find((n) => n.node_id === "node-c")?.throughput_tps ?? 0),
    };
    setHistory((prev) => [...prev.slice(-19), point]);
  }, [nodes]);

  return (
    <div className="bg-card border border-subtle rounded-2xl p-5">
      <h3 className="font-semibold text-heading mb-4">Throughput (tok/s)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis dataKey="t" tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: "#9ca3af", fontSize: 10 }} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "#111827", border: "1px solid #1f2937", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#9ca3af" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#9ca3af" }} />
          <Area type="monotone" dataKey="node-a" stroke="#3b82f6" fill="url(#ga)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="node-b" stroke="#a855f7" fill="url(#gb)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="node-c" stroke="#10b981" fill="url(#gc)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
