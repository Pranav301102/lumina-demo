import Link from "next/link";
import {
  Cpu,
  GitBranch,
  Activity,
  Zap,
  Server,
  ArrowRight,
  BarChart3,
  Network,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base text-body overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-subtle/50 bg-base/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <Zap size={14} className="text-white" />
            </div>
            <span className="text-heading font-semibold text-lg tracking-tight">Lumina</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/cluster"
              className="text-muted hover:text-body text-sm transition-colors px-3 py-1.5"
            >
              Cluster
            </Link>
            <Link
              href="/dashboard/health"
              className="text-muted hover:text-body text-sm transition-colors px-3 py-1.5"
            >
              Health
            </Link>
            <Link
              href="/dashboard/chat"
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Gradient orbs */}
        <div className="orb w-96 h-96 bg-blue-600/20 top-20 -left-32" style={{ animationDelay: "0s" }} />
        <div className="orb w-80 h-80 bg-purple-600/15 top-40 right-10" style={{ animationDelay: "2s" }} />
        <div className="orb w-64 h-64 bg-emerald-600/10 bottom-32 left-1/3" style={{ animationDelay: "4s" }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-card border border-subtle rounded-full px-4 py-1.5 text-sm text-muted mb-8">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Live Demo — 3 nodes active
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-heading mb-6 leading-tight tracking-tight">
            Distributed LLM{" "}
            <span className="gradient-text">Inference</span>
            <br />
            at Scale
          </h1>
          <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Lumina splits transformer layers across physically separate machines, dynamically
            reallocating boundaries based on each node&apos;s available VRAM — no wasted memory,
            no idle compute.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/dashboard/chat"
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
            >
              Try Live Inference
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/dashboard/cluster"
              className="flex items-center justify-center gap-2 bg-card hover:bg-subtle/40 border border-subtle text-body font-semibold px-8 py-4 rounded-xl transition-all hover:scale-105"
            >
              View Cluster
              <Network size={18} />
            </Link>
          </div>

          {/* Architecture Flow Diagram */}
          <ArchDiagram />
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-subtle bg-card/50">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: "28", label: "Transformer Layers", unit: "" },
            { value: "3", label: "Active Nodes", unit: "" },
            { value: "~42", label: "Throughput", unit: "tok/s" },
            { value: "<15", label: "Inter-node Latency", unit: "ms" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-4xl font-bold text-heading">
                {s.value}
                <span className="text-accent text-2xl">{s.unit}</span>
              </div>
              <div className="text-muted text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">How It Works</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Each node loads only the layers it executes. Unused weights are never materialized.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <NodeCard
              label="Node A — Head"
              port="8001"
              layers="0–8"
              color="blue"
              icon={<Layers size={20} />}
              description="Tokenizes input, runs embedding + first 9 layers, serializes hidden states as base64 tensors and forwards to Node B."
              badge="Tokenize + Embed"
            />
            <NodeCard
              label="Node B — Mid"
              port="8002"
              layers="9–18"
              color="purple"
              icon={<GitBranch size={20} />}
              description="Receives hidden states, processes the middle transformer block, and relays to Node C."
              badge="Relay Node"
            />
            <NodeCard
              label="Node C — Tail"
              port="8004"
              layers="19–27"
              color="emerald"
              icon={<Cpu size={20} />}
              description="Runs final layers, applies ln_f and lm_head, returns the next token. Loop continues for max_new_tokens."
              badge="Decode + Generate"
            />
          </div>

          <div className="mt-10 p-6 bg-card border border-subtle rounded-2xl">
            <div className="flex items-start gap-3">
              <Server size={18} className="text-accent mt-0.5 shrink-0" />
              <div>
                <span className="text-heading font-semibold">Tracker (port 8003)</span>
                <span className="text-muted text-sm ml-2">— recalculates split boundaries every heartbeat</span>
                <p className="text-muted text-sm mt-1">
                  <code className="bg-deep px-1.5 py-0.5 rounded text-xs text-body">
                    split_a = round((vram_a / total_vram) × 28)
                  </code>
                  {" "}VRAM-proportional layer allocation ensures no node is over- or under-loaded.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-card/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">Built for Real Hardware</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">
              Designed to run across cloud VMs, local GPUs, and CPU-only machines simultaneously.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-3xl p-12 relative overflow-hidden">
            <div className="orb w-64 h-64 bg-accent/20 -top-16 -right-16" style={{ animationDelay: "1s" }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-heading mb-4">
                Open the Operator Dashboard
              </h2>
              <p className="text-muted text-lg mb-8">
                Monitor live node health, throughput charts, request traces, and run inference directly from the browser.
              </p>
              <Link
                href="/dashboard/chat"
                className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white font-semibold px-10 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-accent/30"
              >
                Launch Dashboard
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle py-8 px-6 text-center text-muted text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
            <Zap size={11} className="text-white" />
          </div>
          <span className="text-body font-medium">Lumina</span>
        </div>
        Distributed Split Inference · Qwen2.5-1.5B · 3 Nodes · CMPE 273
      </footer>
    </div>
  );
}

function ArchDiagram() {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <ArchNode label="Node A" sublabel="Head · layers 0–8" color="blue" port="8001" />
        <FlowArrow label="hidden states (base64)" />
        <ArchNode label="Node B" sublabel="Mid · layers 9–18" color="purple" port="8002" />
        <FlowArrow label="hidden states (base64)" />
        <ArchNode label="Node C" sublabel="Tail · layers 19–27" color="emerald" port="8004" />
      </div>
      <div className="mt-6 pt-4 border-t border-subtle flex items-center justify-center gap-8 text-xs text-muted">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-success" />
          Heartbeat every 20s
        </div>
        <div className="flex items-center gap-1.5">
          <BarChart3 size={12} className="text-accent" />
          Dynamic VRAM split
        </div>
        <div className="flex items-center gap-1.5">
          <Server size={12} className="text-purple-400" />
          Tracker · port 8003
        </div>
      </div>
    </div>
  );
}

function ArchNode({
  label,
  sublabel,
  color,
  port,
}: {
  label: string;
  sublabel: string;
  color: "blue" | "purple" | "emerald";
  port: string;
}) {
  const colors = {
    blue: "border-blue-500/50 bg-blue-500/10 text-blue-400",
    purple: "border-purple-500/50 bg-purple-500/10 text-purple-400",
    emerald: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
  };
  const dotColors = {
    blue: "bg-blue-400",
    purple: "bg-purple-400",
    emerald: "bg-emerald-400",
  };
  return (
    <div className={`rounded-xl border p-4 text-center min-w-[120px] ${colors[color]}`}>
      <div className="flex items-center justify-center gap-1.5 mb-1">
        <div className={`w-2 h-2 rounded-full animate-pulse ${dotColors[color]}`} />
        <span className="font-semibold text-sm">{label}</span>
      </div>
      <div className="text-xs opacity-75">{sublabel}</div>
      <div className="text-xs opacity-50 mt-1">:{port}</div>
    </div>
  );
}

function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-muted">
      <div className="text-xs text-center max-w-[80px] leading-tight opacity-60">{label}</div>
      <div className="text-accent">→</div>
    </div>
  );
}

function NodeCard({
  label,
  port,
  layers,
  color,
  icon,
  description,
  badge,
}: {
  label: string;
  port: string;
  layers: string;
  color: "blue" | "purple" | "emerald";
  icon: React.ReactNode;
  description: string;
  badge: string;
}) {
  const border = {
    blue: "hover:border-blue-500/50",
    purple: "hover:border-purple-500/50",
    emerald: "hover:border-emerald-500/50",
  }[color];
  const iconColor = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
  }[color];
  const badgeColor = {
    blue: "bg-blue-500/10 text-blue-400",
    purple: "bg-purple-500/10 text-purple-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
  }[color];

  return (
    <div
      className={`bg-card border border-subtle rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-lg ${border}`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${iconColor}`}>
        {icon}
      </div>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-heading">{label}</h3>
        <span className="text-xs text-muted">:{port}</span>
      </div>
      <div className="text-xs text-muted mb-3">Layers {layers}</div>
      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-3 ${badgeColor}`}>
        {badge}
      </span>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-subtle rounded-2xl p-6 hover:border-accent/30 transition-all hover:-translate-y-0.5">
      <div className="w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-heading mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

const features = [
  {
    icon: <Layers size={18} />,
    title: "Memory-Aware Loading",
    description:
      "Each node materializes only its assigned layers using safetensors slice loading on a meta-device skeleton.",
  },
  {
    icon: <BarChart3 size={18} />,
    title: "Dynamic VRAM Splitting",
    description:
      "Tracker recalculates split boundaries on every heartbeat, proportional to each node's reported VRAM.",
  },
  {
    icon: <Activity size={18} />,
    title: "Live Heartbeat Monitoring",
    description:
      "Daemon threads send heartbeats every 20 s. Stale nodes are flagged automatically after a configurable timeout.",
  },
  {
    icon: <Zap size={18} />,
    title: "Token Streaming",
    description:
      "Autoregressive generation streams tokens back to the client as each forward pass completes.",
  },
  {
    icon: <GitBranch size={18} />,
    title: "Multi-Architecture Support",
    description:
      "Auto-detects Qwen2, GPT-2, and Phi-3/4 Mini from the HuggingFace model config — no code changes required.",
  },
  {
    icon: <Network size={18} />,
    title: "Request Trace History",
    description:
      "Every inference request is recorded with per-step latencies across Node A → B → C for full observability.",
  },
];
