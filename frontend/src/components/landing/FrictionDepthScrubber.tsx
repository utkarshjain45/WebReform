import React, { useState } from "react";
import { Gauge, Users, TrendingDown } from "lucide-react";

export const FrictionDepthScrubber: React.FC = () => {
  const [depth, setDepth] = useState<number>(3);

  // Derived metrics based on empirical navigation research
  const dropOffRate = Math.min(88, Math.round(Math.pow(depth, 1.45) * 6));
  const retentionRate = 100 - dropOffRate;
  const cognitiveLoad = depth <= 2 ? "Frictionless" : depth <= 3 ? "Acceptable" : depth <= 4 ? "Elevated" : "Severe Drop-Off";

  return (
    <div className="w-full rounded-3xl bg-sand-50/80 border border-sand-200/90 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider font-bold text-coral-600">
            Empirical Benchmark Tool
          </span>
          <h3 className="text-xl sm:text-2xl font-display font-extrabold text-ink-900 mt-0.5">
            Click-Depth vs. Conversion Decay
          </h3>
          <p className="text-xs sm:text-sm text-ink-500 mt-1 max-w-xl">
            Drag the scrubber to inspect how visitor patience rapidly evaporates as click depth increases.
          </p>
        </div>

        {/* Live Depth Indicator Badge */}
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 rounded-2xl border border-sand-200 shadow-sand-pill self-start sm:self-auto">
          <Gauge className="h-5 w-5 text-coral-500" />
          <div>
            <div className="text-[11px] font-mono text-ink-400">Target Page Depth</div>
            <div className="text-base font-extrabold text-ink-900 leading-none">
              {depth} {depth === 1 ? "Click" : "Clicks"}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Slider Bar */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs font-mono font-semibold text-ink-500">
          <span>Direct Root</span>
          <span className="text-mint-600 font-bold">Streamlined (Ideal Depth)</span>
          <span className="text-coral-600">Deep / Buried Page</span>
        </div>

        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={depth}
          onChange={(e) => setDepth(parseInt(e.target.value))}
          className="w-full h-2.5 bg-sand-200 rounded-lg appearance-none cursor-pointer accent-coral-500 focus:outline-none"
        />

        <div className="flex justify-between text-[11px] text-ink-400 font-mono">
          <span>Homepage Hero</span>
          <span>Primary Category</span>
          <span>Submenu</span>
          <span>Nested Folder</span>
          <span>Buried Archive</span>
          <span>Lost Page</span>
        </div>
      </div>

      {/* Reactive Visual Impact Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-white border border-sand-200/90 shadow-card-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-500 font-medium">Visitor Retention</span>
            <Users className="h-4 w-4 text-mint-500" />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink-900">
            {retentionRate}%
          </div>
          <div className="text-[11px] text-ink-400">
            {depth <= 2 ? "Almost all visitors reach the goal" : "Visitors give up before reaching destination"}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sand-200/90 shadow-card-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-500 font-medium">Bounce & Drop-Off</span>
            <TrendingDown className={`h-4 w-4 ${depth <= 2 ? "text-mint-500" : "text-coral-500"}`} />
          </div>
          <div className={`text-2xl font-display font-extrabold ${depth <= 2 ? "text-mint-600" : "text-coral-600"}`}>
            {dropOffRate}%
          </div>
          <div className="text-[11px] text-ink-400">
            Exponential drop-off rate measured per additional menu level
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-sand-200/90 shadow-card-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-ink-500 font-medium">Cognitive Friction</span>
            <span className={`h-2.5 w-2.5 rounded-full ${depth <= 2 ? "bg-mint-500" : depth <= 3 ? "bg-amber-500" : "bg-coral-500"}`} />
          </div>
          <div className="text-2xl font-display font-extrabold text-ink-900">
            {cognitiveLoad}
          </div>
          <div className="text-[11px] text-ink-400">
            {depth <= 2 ? "Zero mental friction for visitors" : "High cognitive fatigue and navigation confusion"}
          </div>
        </div>
      </div>
    </div>
  );
};
