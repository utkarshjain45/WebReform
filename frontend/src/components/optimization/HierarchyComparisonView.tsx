import React, { useState } from "react";
import {
  GitCommit,
  ArrowRight,
  Sparkles,
  Crown,
  FolderTree,
} from "lucide-react";
import type { OptimizedNode } from "@/types";

interface HierarchyComparisonViewProps {
  originalNodes: {
    pageId: number;
    url: string;
    title: string;
    depth: number;
    parentPageId?: number | null;
    position?: number;
  }[];
  optimizedNodes: OptimizedNode[];
  className?: string;
}

export const HierarchyComparisonView: React.FC<HierarchyComparisonViewProps> = ({
  originalNodes,
  optimizedNodes,
  className = "",
}) => {
  const [hoveredPageId, setHoveredPageId] = useState<number | null>(null);

  // Map original nodes by pageId
  const origMap = new Map<number, (typeof originalNodes)[0]>();
  originalNodes.forEach((n) => origMap.set(n.pageId, n));

  // Determine change classification for each optimized node
  const analyzedNodes = optimizedNodes.map((opt) => {
    const orig = origMap.get(opt.pageId);
    const isRoot = opt.parentPageId === null;

    let changedParent = false;
    let changedPosition = false;
    let isNewRelationship = false;

    if (orig && !isRoot) {
      if (orig.parentPageId !== opt.parentPageId) {
        changedParent = true;
      }
      if (orig.position !== undefined && orig.position !== opt.position) {
        changedPosition = true;
      }
      if (orig.depth !== opt.depth) {
        isNewRelationship = true;
      }
    }

    return {
      ...opt,
      origParentId: orig?.parentPageId ?? null,
      origDepth: orig?.depth ?? 0,
      origPosition: orig?.position ?? 0,
      changedParent,
      changedPosition,
      isNewRelationship,
      isRoot,
    };
  });

  // Calculate summary counts
  const totalChangedParents = analyzedNodes.filter((n) => n.changedParent).length;
  const totalChangedPositions = analyzedNodes.filter((n) => n.changedPosition).length;
  const totalDepthReductions = analyzedNodes.filter((n) => n.origDepth > n.depth).length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Legend & Summary Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm">
        {/* Color-Coded Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <FolderTree className="w-3.5 h-3.5 text-indigo-600" /> Structure Legend:
          </span>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 border border-amber-200 text-amber-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Changed Parent
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-sky-50 border border-sky-200 text-sky-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            Changed Position
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Depth Compressed
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            Retained Unchanged
          </div>
        </div>

        {/* Change Counts Summary */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-amber-700">
            Parents: <strong>{totalChangedParents}</strong>
          </span>
          <span className="text-sky-700">
            Positions: <strong>{totalChangedPositions}</strong>
          </span>
          <span className="text-emerald-700">
            Promoted: <strong>{totalDepthReductions}</strong>
          </span>
        </div>
      </div>

      {/* Side-by-Side Dual Tree Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PANE 1: ORIGINAL STRUCTURE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Original Structure (Baseline)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {originalNodes.length} pages
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {originalNodes.map((node) => {
              const isHovered = hoveredPageId === node.pageId;
              const isRoot = node.depth === 0;

              return (
                <div
                  key={`orig-${node.pageId}`}
                  onMouseEnter={() => setHoveredPageId(node.pageId)}
                  onMouseLeave={() => setHoveredPageId(null)}
                  className={`p-2.5 rounded-lg border transition-all text-xs ${
                    isHovered
                      ? "bg-indigo-50/70 border-indigo-400 shadow-sm translate-x-1"
                      : "bg-slate-50/70 border-slate-200 hover:border-slate-300"
                  }`}
                  style={{ marginLeft: `${Math.min(node.depth, 4) * 16}px` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      {isRoot ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <GitCommit className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      )}
                      <span className="font-medium text-slate-900 truncate">
                        {node.title || node.url}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shrink-0">
                      L{node.depth}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[280px]">{node.url}</span>
                    <span className="text-[10px]">
                      {node.parentPageId ? `Parent: #${node.parentPageId}` : "Root Page"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 2: REFORMED OPTIMIZED STRUCTURE */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Reformed Optimized Structure
              </h3>
            </div>
            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded font-semibold">
              Valid Discrete Tree
            </span>
          </div>

          <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {analyzedNodes.map((node) => {
              const isHovered = hoveredPageId === node.pageId;

              // Border and background highlighting depending on change type
              let cardStyle = "bg-slate-50/70 border-slate-200";
              if (node.changedParent) {
                cardStyle = "bg-amber-50/60 border-amber-200";
              } else if (node.changedPosition) {
                cardStyle = "bg-sky-50/60 border-sky-200";
              } else if (node.isNewRelationship) {
                cardStyle = "bg-emerald-50/60 border-emerald-200";
              }

              if (isHovered) {
                cardStyle = "bg-indigo-50 border-indigo-400 shadow-sm translate-x-1";
              }

              return (
                <div
                  key={`opt-${node.pageId}`}
                  onMouseEnter={() => setHoveredPageId(node.pageId)}
                  onMouseLeave={() => setHoveredPageId(null)}
                  className={`p-2.5 rounded-lg border transition-all text-xs ${cardStyle}`}
                  style={{ marginLeft: `${Math.min(node.depth, 4) * 16}px` }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      {node.isRoot ? (
                        <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      ) : (
                        <GitCommit className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-900 truncate">
                        {node.title || node.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {/* Highlight Badges */}
                      {node.changedParent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                          Parent #{node.parentPageId}
                        </span>
                      )}

                      {node.changedPosition && !node.changedParent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                          Pos {node.position}
                        </span>
                      )}

                      {node.origDepth > node.depth && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-0.5">
                          L{node.origDepth} <ArrowRight className="w-2.5 h-2.5" /> L{node.depth}
                        </span>
                      )}

                      {!node.changedParent && !node.changedPosition && !node.isRoot && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-500 bg-white border border-slate-200">
                          Retained
                        </span>
                      )}

                      <span className="text-[10px] font-mono text-indigo-700 bg-white border border-indigo-200 px-1.5 py-0.5 rounded font-semibold">
                        L{node.depth}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[260px]">{node.url}</span>
                    <span className="text-[10px] text-slate-600">
                      {node.parentPageId ? `Parent: #${node.parentPageId}` : "Root Page"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
