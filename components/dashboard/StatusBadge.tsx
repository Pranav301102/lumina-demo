export default function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  let cls = "text-xs font-semibold px-2.5 py-0.5 rounded-full ";
  if (s === "healthy" || s === "online" || s === "active" || s === "ok") {
    cls += "bg-success/10 text-success";
  } else if (s === "degraded" || s === "warning") {
    cls += "bg-warn/10 text-warn";
  } else {
    cls += "bg-danger/10 text-danger";
  }
  return <span className={cls}>{status || "unknown"}</span>;
}
