import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NodeData {
  id: string;
  label: string;
  type: "root" | "category" | "target" | "deadend" | "orphan";
  before: { x: number; y: number; depth: number };
  after: { x: number; y: number; depth: number };
}

const PRESETS = {
  ecommerce: {
    name: "E-Commerce Store",
    beforeFriction: 84,
    afterFriction: 14,
    beforeAvgDepth: 5.6,
    afterAvgDepth: 2.1,
    nodes: [
      { id: "home", label: "Home (/)", type: "root", before: { x: 50, y: 12, depth: 0 }, after: { x: 50, y: 12, depth: 0 } },
      { id: "shop", label: "Shop", type: "category", before: { x: 26, y: 32, depth: 1 }, after: { x: 24, y: 38, depth: 1 } },
      { id: "checkout", label: "Checkout", type: "target", before: { x: 20, y: 88, depth: 5 }, after: { x: 50, y: 40, depth: 1 } },
      { id: "about", label: "About", type: "category", before: { x: 74, y: 32, depth: 1 }, after: { x: 76, y: 38, depth: 1 } },
      { id: "mens", label: "Men's", type: "category", before: { x: 16, y: 52, depth: 2 }, after: { x: 12, y: 68, depth: 2 } },
      { id: "womens", label: "Women's", type: "category", before: { x: 38, y: 52, depth: 2 }, after: { x: 34, y: 68, depth: 2 } },
      { id: "jackets", label: "Jackets", type: "target", before: { x: 14, y: 72, depth: 3 }, after: { x: 23, y: 88, depth: 2 } },
      { id: "support", label: "Returns / Support", type: "deadend", before: { x: 74, y: 55, depth: 4 }, after: { x: 68, y: 68, depth: 2 } },
      { id: "sale", label: "Archive Sale", type: "orphan", before: { x: 88, y: 82, depth: 6 }, after: { x: 88, y: 68, depth: 2 } },
    ] as NodeData[],
    beforeEdges: [
      { from: "home", to: "shop" },
      { from: "home", to: "about" },
      { from: "shop", to: "mens" },
      { from: "shop", to: "womens" },
      { from: "mens", to: "jackets" },
      { from: "jackets", to: "checkout" },
      { from: "about", to: "support" },
    ],
    afterEdges: [
      { from: "home", to: "shop" },
      { from: "home", to: "checkout" },
      { from: "home", to: "about" },
      { from: "shop", to: "mens" },
      { from: "shop", to: "womens" },
      { from: "shop", to: "jackets" },
      { from: "about", to: "support" },
      { from: "about", to: "sale" },
    ],
  },
  saas: {
    name: "SaaS Knowledge Hub",
    beforeFriction: 89,
    afterFriction: 11,
    beforeAvgDepth: 6.2,
    afterAvgDepth: 1.9,
    nodes: [
      { id: "home", label: "Landing (/)", type: "root", before: { x: 50, y: 12, depth: 0 }, after: { x: 50, y: 12, depth: 0 } },
      { id: "features", label: "Features", type: "category", before: { x: 25, y: 32, depth: 1 }, after: { x: 24, y: 38, depth: 1 } },
      { id: "pricing", label: "Pricing / Plans", type: "target", before: { x: 18, y: 88, depth: 5 }, after: { x: 50, y: 40, depth: 1 } },
      { id: "docs", label: "Developer Docs", type: "category", before: { x: 75, y: 32, depth: 1 }, after: { x: 76, y: 38, depth: 1 } },
      { id: "blog", label: "Company Blog", type: "category", before: { x: 40, y: 55, depth: 2 }, after: { x: 12, y: 68, depth: 2 } },
      { id: "api", label: "REST API Ref", type: "target", before: { x: 75, y: 55, depth: 3 }, after: { x: 66, y: 68, depth: 2 } },
      { id: "sdk", label: "Python SDK", type: "target", before: { x: 86, y: 78, depth: 4 }, after: { x: 88, y: 68, depth: 2 } },
      { id: "webhooks", label: "Webhooks Guide", type: "orphan", before: { x: 90, y: 22, depth: 7 }, after: { x: 77, y: 88, depth: 2 } },
    ] as NodeData[],
    beforeEdges: [
      { from: "home", to: "features" },
      { from: "features", to: "blog" },
      { from: "blog", to: "pricing" },
      { from: "home", to: "docs" },
      { from: "docs", to: "api" },
      { from: "api", to: "sdk" },
    ],
    afterEdges: [
      { from: "home", to: "features" },
      { from: "home", to: "pricing" },
      { from: "home", to: "docs" },
      { from: "docs", to: "api" },
      { from: "docs", to: "sdk" },
      { from: "docs", to: "webhooks" },
      { from: "features", to: "blog" },
    ],
  },
};

type PresetKey = keyof typeof PRESETS;

export const InteractiveGraphSimulator: React.FC = () => {
  const [activePreset, setActivePreset] = useState<PresetKey>("ecommerce");
  const [isOptimized, setIsOptimized] = useState<boolean>(true);
  const [hoveredNode, setHoveredNode] = useState<NodeData | null>(null);

  const currentPreset = PRESETS[activePreset];
  const edges = isOptimized ? currentPreset.afterEdges : currentPreset.beforeEdges;

  return (
    <div className="w-full rounded-4xl bg-white/95 backdrop-blur-md border border-sand-200/90 shadow-card-lg p-5 sm:p-7 relative overflow-hidden">
      {/* Top Header: Title & Presets */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sand-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-coral-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-600">
              Interactive Topology Lab
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-display font-extrabold text-ink-900 mt-0.5">
            Simulate Structure Reform
          </h3>
        </div>

        {/* Preset Selector Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-full bg-sand-100 border border-sand-200 self-stretch sm:self-auto justify-center">
          {(Object.keys(PRESETS) as PresetKey[]).map((key) => (
            <button
              key={key}
              onClick={() => setActivePreset(key)}
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                activePreset === key
                  ? "bg-white text-ink-900 shadow-sand-pill border border-sand-200"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              {PRESETS[key].name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Strip: 2-Tier Clean Layout (Guarantees HUD Visibility) */}
      <div className="py-3.5 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Segmented Capsule Switch */}
          <div className="p-1 rounded-full bg-sand-100 border border-sand-200 flex items-center shrink-0">
            <button
              onClick={() => setIsOptimized(false)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                !isOptimized
                  ? "bg-white text-coral-600 shadow-sand-pill border border-sand-200"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5 text-coral-500" />
              <span>Chaotic Reality (Before)</span>
            </button>

            <button
              onClick={() => setIsOptimized(true)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isOptimized
                  ? "bg-white text-mint-600 shadow-sand-pill border border-sand-200"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-mint-500" />
              <span>Optimized Hierarchy (After)</span>
            </button>
          </div>

          {/* Metric Badges (Always Fully Visible) */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 border border-sand-200/90 shadow-2xs">
              <span className="text-ink-500 font-sans font-medium">Avg Depth:</span>
              <span className={`font-bold ${isOptimized ? "text-mint-600" : "text-coral-600"}`}>
                {isOptimized ? `${currentPreset.afterAvgDepth} Clicks` : `${currentPreset.beforeAvgDepth} Clicks`}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sand-100 border border-sand-200/90 shadow-2xs">
              <span className="text-ink-500 font-sans font-medium">Friction:</span>
              <span className={`font-bold ${isOptimized ? "text-mint-600" : "text-coral-600"}`}>
                {isOptimized ? `${currentPreset.afterFriction}% Low` : `${currentPreset.beforeFriction}% Severe`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* The Visual Interactive Topology Canvas */}
      <div className="relative w-full h-[380px] sm:h-[420px] rounded-3xl bg-sand-50/80 border border-sand-200/90 overflow-hidden">
        {/* Ambient Grid Pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none">
          <defs>
            <pattern
              id="grid-sim-soft"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="2" cy="2" r="0.75" fill="#D2C8BC" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-sim-soft)" />
        </svg>

        {/* Dynamic Edge Connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {edges.map((edge, idx) => {
            const fromNode = currentPreset.nodes.find((n) => n.id === edge.from);
            const toNode = currentPreset.nodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const fromPos = isOptimized ? fromNode.after : fromNode.before;
            const toPos = isOptimized ? toNode.after : toNode.before;

            return (
              <line
                key={`edge-${idx}-${edge.from}-${edge.to}`}
                x1={`${fromPos.x}%`}
                y1={`${fromPos.y}%`}
                x2={`${toPos.x}%`}
                y2={`${toPos.y}%`}
                stroke={isOptimized ? "#10B981" : "#D4A373"}
                strokeWidth={isOptimized ? "2.2" : "1.5"}
                strokeOpacity={isOptimized ? 0.65 : 0.4}
                strokeDasharray={!isOptimized && toPos.depth > 3 ? "4 3" : undefined}
                className="transition-all duration-700 ease-out"
              />
            );
          })}
        </svg>

        {/* Floating Nodes with Safe Spacing */}
        {currentPreset.nodes.map((node) => {
          const pos = isOptimized ? node.after : node.before;
          const isTarget = node.type === "target";
          const isRoot = node.type === "root";
          const isProblem = !isOptimized && (node.type === "deadend" || node.type === "orphan");

          let colorClass = "bg-white text-ink-900 border-sand-300";
          if (isRoot) colorClass = "bg-ink-900 text-white border-ink-900 shadow-md";
          else if (isOptimized && isTarget) colorClass = "bg-coral-500 text-white border-coral-400 shadow-coral-glow";
          else if (!isOptimized && isProblem) colorClass = "bg-coral-100 text-coral-800 border-coral-300";
          else if (isOptimized) colorClass = "bg-white text-ink-900 border-mint-500/40 shadow-xs";

          return (
            <div
              key={node.id}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
              className="absolute transition-all duration-700 ease-out cursor-pointer group z-10"
            >
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border transition-all duration-300 ${colorClass} group-hover:scale-110`}
              >
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    isRoot
                      ? "bg-coral-500"
                      : isOptimized
                      ? "bg-mint-500"
                      : isProblem
                      ? "bg-coral-500"
                      : "bg-sand-400"
                  }`}
                />
                <span className="whitespace-nowrap">{node.label}</span>
              </div>
            </div>
          );
        })}

        {/* Hovered Node Tooltip */}
        {hoveredNode && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md border border-sand-200 px-3.5 py-2 rounded-2xl shadow-card-sm text-xs font-mono space-y-0.5 z-20">
            <div className="font-bold text-ink-900 font-sans">{hoveredNode.label}</div>
            <div className="text-ink-500">
              Navigation Depth: <span className="text-coral-600 font-bold">{isOptimized ? hoveredNode.after.depth : hoveredNode.before.depth} Clicks</span>
            </div>
          </div>
        )}
      </div>

      {/* Simulator Bottom Status Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3.5 border-t border-sand-200/80">
        <div className="flex items-center gap-2 text-xs text-ink-600">
          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${isOptimized ? "bg-mint-500" : "bg-coral-500"}`} />
          <p className="leading-relaxed">
            {isOptimized ? (
              <span><strong>Optimized:</strong> High-priority pages hoisted into clean, direct categories.</span>
            ) : (
              <span><strong>Chaotic Reality:</strong> Key pages buried 5+ links deep across confusing submenus.</span>
            )}
          </p>
        </div>

        <Button
          variant={isOptimized ? "sand" : "primary"}
          size="sm"
          onClick={() => setIsOptimized(!isOptimized)}
          className="shrink-0"
        >
          {isOptimized ? "Show Before Reality" : "Optimize Structure"}
        </Button>
      </div>
    </div>
  );
};
