"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

type Log = {
  id: string;
  timestamp: string;
  level: "info" | "warn" | "error";
  message: string;
  metadata: Record<string, unknown>;
};

const LEVEL_STYLE: Record<string, string> = {
  info: "text-blue-400 bg-blue-500/10",
  warn: "text-warn bg-yellow-500/10",
  error: "text-danger bg-red-500/10",
};

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);

  function loadLogs() {
    try {
      const raw = localStorage.getItem("lumina_logs");
      setLogs(raw ? JSON.parse(raw) : []);
    } catch {
      setLogs([]);
    }
  }

  function clearLogs() {
    localStorage.removeItem("lumina_logs");
    setLogs([]);
  }

  useEffect(() => {
    loadLogs();
    const id = setInterval(loadLogs, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-heading">Logs</h2>
          <p className="text-muted text-sm mt-1">Frontend polling activity and API events. Persisted in localStorage.</p>
        </div>
        <button
          onClick={clearLogs}
          className="flex items-center gap-2 text-sm text-muted hover:text-danger bg-card border border-subtle rounded-lg px-4 py-2 transition-colors"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      <div className="bg-card border border-subtle rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
          <h3 className="font-semibold text-heading">Activity Log</h3>
          <span className="text-xs text-muted">{logs.length} entries · refreshes every 2s</span>
        </div>
        {logs.length === 0 ? (
          <div className="p-10 text-center text-muted text-sm">
            No logs yet. Browse the dashboard to generate activity.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle text-muted text-xs">
                  <th className="px-4 py-3 text-left font-medium">Time</th>
                  <th className="px-4 py-3 text-left font-medium">Level</th>
                  <th className="px-4 py-3 text-left font-medium">Message</th>
                  <th className="px-4 py-3 text-left font-medium">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {[...logs].reverse().map((log) => (
                  <tr key={log.id} className="border-b border-subtle/40 hover:bg-subtle/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEVEL_STYLE[log.level] ?? "text-muted"}`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body">{log.message}</td>
                    <td className="px-4 py-3">
                      <pre className="text-xs text-muted max-w-xs overflow-hidden text-ellipsis">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
