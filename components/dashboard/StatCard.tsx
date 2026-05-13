type Color = "default" | "success" | "accent" | "warn";

const COLOR_MAP: Record<Color, string> = {
  default: "text-heading bg-subtle/30",
  success: "text-success bg-success/10",
  accent:  "text-accent bg-accent/10",
  warn:    "text-warn bg-warn/10",
};

export default function StatCard({
  label,
  value,
  icon,
  color = "default",
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: Color;
}) {
  const iconCls = COLOR_MAP[color];
  return (
    <div className="bg-card border border-subtle rounded-2xl p-5 hover:-translate-y-0.5 transition-transform">
      {icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${iconCls}`}>
          {icon}
        </div>
      )}
      <div className="text-2xl font-bold text-heading leading-none mb-1">{value}</div>
      <div className="text-muted text-xs">{label}</div>
    </div>
  );
}
