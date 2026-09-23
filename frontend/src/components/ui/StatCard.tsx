import React from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: "coral" | "emerald" | "amber" | "sand" | "ink" | "indigo" | "cyan" | "purple";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "coral",
}) => {
  const colorMap: Record<string, { bg: string; border: string; iconBg: string }> = {
    coral: {
      bg: "from-coral-50/40 to-white",
      border: "border-sand-200 hover:border-coral-200",
      iconBg: "bg-coral-50 text-coral-600 ring-1 ring-coral-100",
    },
    indigo: {
      bg: "from-coral-50/40 to-white",
      border: "border-sand-200 hover:border-coral-200",
      iconBg: "bg-coral-50 text-coral-600 ring-1 ring-coral-100",
    },
    emerald: {
      bg: "from-emerald-50/40 to-white",
      border: "border-sand-200 hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    },
    amber: {
      bg: "from-amber-50/40 to-white",
      border: "border-sand-200 hover:border-amber-200",
      iconBg: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
    sand: {
      bg: "from-sand-100/40 to-white",
      border: "border-sand-200 hover:border-sand-300",
      iconBg: "bg-sand-100 text-ink-700 ring-1 ring-sand-200",
    },
    cyan: {
      bg: "from-sand-100/40 to-white",
      border: "border-sand-200 hover:border-sand-300",
      iconBg: "bg-sand-100 text-ink-700 ring-1 ring-sand-200",
    },
    ink: {
      bg: "from-sand-100/60 to-white",
      border: "border-sand-200 hover:border-ink-800",
      iconBg: "bg-ink-900 text-white ring-1 ring-ink-900",
    },
    purple: {
      bg: "from-coral-50/30 to-white",
      border: "border-sand-200 hover:border-coral-200",
      iconBg: "bg-coral-50 text-coral-600 ring-1 ring-coral-100",
    },
  };

  const style = colorMap[accentColor] || colorMap.coral;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${style.border} bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        <div className={`rounded-lg p-2.5 ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {trend && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
};
