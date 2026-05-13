import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 border-b border-subtle bg-deep/50 px-6 flex items-center justify-between shrink-0">
      <div>
        <span className="text-heading font-semibold">Lumina Dashboard</span>
        <span className="text-muted text-sm ml-3">Distributed LLM Inference Monitoring</span>
      </div>
      <Link
        href="/"
        className="flex items-center gap-1.5 text-xs text-muted hover:text-body transition-colors"
      >
        <ArrowLeft size={13} />
        Landing
      </Link>
    </header>
  );
}
