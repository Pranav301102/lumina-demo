"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/dashboard/StatusBadge";
import StatCard from "@/components/dashboard/StatCard";
import { Activity, Server, Cpu, Clock, CheckCircle, Radio } from "lucide-react";

type Health = {
  tracker_status: string;
  inference_api_status: string;
  cluster_status: string;
  active_nodes: number;
  total_nodes: number;
  requests_served: number;
  uptime_seconds: number;
  model: string;
  split_config: { node_a: string; node_b: string; node_c: string };
};

function formatUptime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function HealthPage() {
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const r = await fetch("/api/health");
        setData(await r.json());
      } catch {
        // silently retry
      } finally {
        setLoading(false);
      }
    }
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-heading">Health</h2>
        <p className="text-muted text-sm mt-1">Monitor global service health, readiness, and cluster activity.</p>
      </div>

      {loading && (
        <div className="text-muted text-sm">Loading health data...</div>
      )}

      {data && (
        <>
          {/* Service status */}
          <div className="bg-card border border-subtle rounded-2xl p-5">
            <h3 className="font-semibold text-heading mb-4">Service Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <ServiceRow icon={<Radio size={15} />} label="Tracker" status={data.tracker_status} />
              <ServiceRow icon={<Cpu size={15} />} label="Inference API" status={data.inference_api_status} />
              <ServiceRow icon={<Server size={15} />} label="Cluster" status={data.cluster_status} />
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Active Nodes" value={data.active_nodes} icon={<CheckCircle size={16} />} color="success" />
            <StatCard label="Total Nodes" value={data.total_nodes} icon={<Server size={16} />} />
            <StatCard label="Requests Served" value={data.requests_served.toLocaleString()} icon={<Activity size={16} />} color="accent" />
            <StatCard label="Uptime" value={formatUptime(data.uptime_seconds)} icon={<Clock size={16} />} color="warn" />
          </div>

          {/* Model info */}
          <div className="bg-card border border-subtle rounded-2xl p-5">
            <h3 className="font-semibold text-heading mb-4">Model Configuration</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <Row label="Model" value={data.model} />
                <Row label="Total Layers" value="28" />
                <Row label="Architecture" value="Qwen2" />
              </div>
              <div className="space-y-3">
                <Row label="Node A Layers" value={data.split_config.node_a} />
                <Row label="Node B Layers" value={data.split_config.node_b} />
                <Row label="Node C Layers" value={data.split_config.node_c} />
              </div>
            </div>
          </div>

          {/* Node health indicators */}
          <div className="bg-card border border-subtle rounded-2xl p-5">
            <h3 className="font-semibold text-heading mb-4">Node Health Indicators</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: "node-a", port: "8001", role: "Head", color: "blue" },
                { id: "node-b", port: "8002", role: "Mid", color: "purple" },
                { id: "node-c", port: "8004", role: "Tail", color: "emerald" },
              ].map((n) => (
                <NodeHealthCard key={n.id} {...n} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ServiceRow({ icon, label, status }: { icon: React.ReactNode; label: string; status: string }) {
  return (
    <div className="flex items-center justify-between bg-deep rounded-xl px-4 py-3">
      <div className="flex items-center gap-2 text-muted text-sm">
        {icon}
        {label}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-subtle/40">
      <span className="text-muted">{label}</span>
      <span className="text-body font-mono text-xs">{value}</span>
    </div>
  );
}

function NodeHealthCard({
  id,
  port,
  role,
  color,
}: {
  id: string;
  port: string;
  role: string;
  color: string;
}) {
  const dotColor = {
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    emerald: "bg-emerald-400",
  }[color] ?? "bg-accent";
  const borderColor = {
    blue: "border-blue-500/30",
    purple: "border-purple-500/30",
    emerald: "border-emerald-500/30",
  }[color] ?? "border-accent/30";

  return (
    <div className={`bg-deep border ${borderColor} rounded-xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${dotColor} animate-pulse`} />
        <span className="font-medium text-heading text-sm">{id}</span>
      </div>
      <div className="text-xs text-muted space-y-1">
        <div>Role: {role}</div>
        <div>Port: {port}</div>
        <div className="text-success">● Healthy</div>
      </div>
    </div>
  );
}
