import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading platform data...",
  rows = 3,
}) => {
  return (
    <div className="w-full space-y-4 py-8">
      <div className="flex items-center justify-center gap-3 text-slate-500">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-full rounded-xl bg-slate-100 border border-slate-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
};
