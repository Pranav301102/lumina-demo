"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Cpu, Loader2, Bot, User } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string };

const NODE_STAGES = [
  { label: "Node A — Tokenize & Embed", color: "text-blue-400" },
  { label: "Node B — Mid Layers 9–18", color: "text-purple-400" },
  { label: "Node C — Decode & Generate", color: "text-emerald-400" },
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage = prompt.trim();
    setPrompt("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    // Simulate pipeline stages
    setStage(0);
    await delay(400);
    setStage(1);
    await delay(300);
    setStage(2);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      if (!res.body) throw new Error("No response body");

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: updated[updated.length - 1].content + chunk,
          };
          return updated;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg.includes("GEMINI_API_KEY") ? "Add GEMINI_API_KEY to .env.local" : msg);
      setMessages((prev) => prev.filter((_, i) => i !== prev.length - 1 || prev[prev.length - 1].content !== ""));
    } finally {
      setLoading(false);
      setStage(-1);
    }
  }

  return (
    <div className="flex flex-col gap-5 h-full max-w-3xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-heading">Chat</h2>
        <p className="text-muted text-sm mt-1">Submit prompts — inference runs across 3 distributed nodes via Gemini.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 text-danger rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Pipeline status */}
      {loading && (
        <div className="bg-card border border-subtle rounded-xl px-4 py-3 flex items-center gap-4">
          {NODE_STAGES.map((s, i) => (
            <div key={s.label} className="flex items-center gap-1.5 text-xs">
              {i < stage ? (
                <div className="w-3 h-3 rounded-full bg-success shrink-0" />
              ) : i === stage ? (
                <Loader2 size={12} className="animate-spin text-accent shrink-0" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-subtle shrink-0" />
              )}
              <span className={i === stage ? s.color : "text-muted"}>{s.label}</span>
              {i < NODE_STAGES.length - 1 && <span className="text-subtle ml-1">→</span>}
            </div>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 bg-card border border-subtle rounded-2xl p-4 flex flex-col gap-4 min-h-[360px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Cpu size={24} className="text-accent" />
            </div>
            <p className="text-sm">Ask anything — responses run through all 3 Lumina nodes.</p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={15} className="text-accent" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-accent text-white rounded-tr-sm"
                  : "bg-deep border border-subtle text-body rounded-tl-sm"
              }`}
            >
              {m.content || (loading && i === messages.length - 1 ? (
                <span className="inline-block w-1.5 h-4 bg-muted animate-pulse rounded" />
              ) : "")}
            </div>
            {m.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-subtle flex items-center justify-center shrink-0 mt-0.5">
                <User size={15} className="text-muted" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="bg-card border border-subtle rounded-2xl p-4 flex gap-3">
        <textarea
          className="flex-1 bg-transparent text-body placeholder:text-muted resize-none outline-none text-sm"
          placeholder="Enter a prompt..."
          value={prompt}
          rows={2}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="self-end w-9 h-9 rounded-lg bg-accent hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0"
        >
          {loading ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={15} className="text-white" />}
        </button>
      </form>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
