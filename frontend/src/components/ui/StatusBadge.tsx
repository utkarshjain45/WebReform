import React from "react";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Play } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = "md" }) => {
  const normalized = status.toUpperCase();

  const config: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    COMPLETED: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    IN_PROGRESS: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <Clock className="w-3.5 h-3.5 animate-spin" />,
    },
    SUBMITTED: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <Play className="w-3.5 h-3.5" />,
    },
    ANALYZED: {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      border: "border-cyan-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    FAILED: {
      bg: "bg-rose-50",
      text: "text-rose-700",
      border: "border-rose-200",
      icon: <XCircle className="w-3.5 h-3.5" />,
    },
    IDLE: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      border: "border-slate-200",
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  };

  const current = config[normalized] || {
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  };

  const sizeClasses = size === "sm" ? "text-xs px-2 py-0.5 gap-1" : "text-xs px-2.5 py-1 gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses}`}
    >
      {current.icon}
      <span>{normalized.replace("_", " ")}</span>
    </span>
  );
};
