"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Server, Activity, GitBranch, ScrollText, Zap } from "lucide-react";

const NAV = [
  { href: "/dashboard/chat",    label: "Chat",    icon: MessageSquare },
  { href: "/dashboard/cluster", label: "Cluster", icon: Server },
  { href: "/dashboard/health",  label: "Health",  icon: Activity },
  { href: "/dashboard/trace",   label: "Traces",  icon: GitBranch },
  { href: "/dashboard/logs",    label: "Logs",    icon: ScrollText },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 bg-card border-r border-subtle flex flex-col">
      <div className="px-5 py-6 border-b border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-heading font-bold text-lg tracking-tight">Lumina</span>
        </div>
        <p className="text-muted text-xs ml-9">Operator Dashboard</p>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-accent text-white"
                  : "text-dim hover:bg-subtle hover:text-body"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-4 border-t border-subtle">
        <div className="flex items-center gap-2 text-xs text-muted">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          3 nodes active
        </div>
      </div>
    </aside>
  );
}
