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
  accentColor?: "indigo" | "emerald" | "amber" | "cyan" | "purple";
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = "indigo",
}) => {
  const colorMap = {
    indigo: {
      bg: "from-indigo-50/40 to-white",
      border: "border-slate-200 hover:border-indigo-200",
      iconBg: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
    },
    emerald: {
      bg: "from-emerald-50/40 to-white",
      border: "border-slate-200 hover:border-emerald-200",
      iconBg: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    },
    amber: {
      bg: "from-amber-50/40 to-white",
      border: "border-slate-200 hover:border-amber-200",
      iconBg: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    },
    cyan: {
      bg: "from-cyan-50/40 to-white",
      border: "border-slate-200 hover:border-cyan-200",
      iconBg: "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100",
    },
    purple: {
      bg: "from-purple-50/40 to-white",
      border: "border-slate-200 hover:border-purple-200",
      iconBg: "bg-purple-50 text-purple-600 ring-1 ring-purple-100",
    },
  };

  const style = colorMap[accentColor];

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
