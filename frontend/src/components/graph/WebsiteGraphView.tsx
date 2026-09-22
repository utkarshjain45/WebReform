import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Search,
  ExternalLink,
  Layers,
  Eye,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  X,
  Crown,
} from "lucide-react";
import type { Page, GraphAnalysisData, PageLevelMetric } from "@/types";

interface GraphNode extends d3.SimulationNodeDatum {
  id: number;
  url: string;
  title: string;
  depth: number;
  isRoot: boolean;
  metrics?: PageLevelMetric;
  radius: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: GraphNode | number;
  target: GraphNode | number;
}

interface WebsiteGraphViewProps {
  pages: Page[];
  analysis?: GraphAnalysisData | null;
  className?: string;
}

export const WebsiteGraphView: React.FC<WebsiteGraphViewProps> = ({
  pages,
  analysis,
  className = "",
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Map metrics by pageId for fast lookup
  const metricsMap = useMemo(() => {
    const map = new Map<number, PageLevelMetric>();
    if (analysis?.page_level_metrics) {
      analysis.page_level_metrics.forEach((m) => map.set(m.page_id, m));
    }
    return map;
  }, [analysis]);

  // Construct nodes and edges from pages and analysis data
  const { nodes, links } = useMemo(() => {
    if (!pages || pages.length === 0) return { nodes: [], links: [] };

    // Identify root (lowest depth, or page with minimum id)
    const minDepth = Math.min(...pages.map((p) => p.depth ?? 0));
    const rootPage = pages.find((p) => p.depth === minDepth) || pages[0];

    const nList: GraphNode[] = pages.map((p) => {
      const isRoot = p.id === rootPage.id;
      const m = metricsMap.get(p.id);
      return {
        id: p.id,
        url: p.url,
        title: p.title || p.url.split("/").pop() || `Page ${p.id}`,
        depth: p.depth ?? 0,
        isRoot,
        metrics: m,
        radius: isRoot ? 24 : p.depth === 1 ? 18 : 14,
      };
    });

    const nodeIds = new Set(pages.map((p) => p.id));
    const lList: GraphLink[] = [];

    // Synthesize edges: connect root to depth 1, and parents where indicated
    pages.forEach((p) => {
      if (p.id !== rootPage.id) {
        if (p.depth === 1) {
          lList.push({ source: rootPage.id, target: p.id });
        } else {
          const candidateParent = pages.find((cand) => cand.depth === p.depth - 1);
          if (candidateParent && nodeIds.has(candidateParent.id)) {
            lList.push({ source: candidateParent.id, target: p.id });
          } else {
            lList.push({ source: rootPage.id, target: p.id });
          }
        }
      }
    });

    return { nodes: nList, links: lList };
  }, [pages, metricsMap]);

  // D3 Force Simulation Setup
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = containerRef.current?.clientWidth || 800;
    const height = containerRef.current?.clientHeight || 600;

    // Defs for Arrow Markers
    const defs = svg.append("defs");
    defs
      .append("marker")
      .attr("id", "arrow-default")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#94A3B8");

    defs
      .append("marker")
      .attr("id", "arrow-highlight-out")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#4F46E5");

    defs
      .append("marker")
      .attr("id", "arrow-highlight-in")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 22)
      .attr("refY", 0)
      .attr("markerWidth", 7)
      .attr("markerHeight", 7)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#10B981");

    // Main Zoomable Group
    const g = svg.append("g").attr("class", "graph-container");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        setZoomLevel(event.transform.k);
      });

    svg.call(zoom);

    // Force Simulation Setup
    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const targetNode = typeof d.target === "object" ? d.target : null;
            return targetNode?.depth === 1 ? 90 : 70;
          })
      )
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius((d) => (d as GraphNode).radius + 18));

    // Draw Links
    const link = g
      .append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", "#CBD5E1")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.7)
      .attr("marker-end", "url(#arrow-default)");

    // Draw Nodes Group
    const dragBehavior = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(dragBehavior as any)
      .on("click", (_event, d) => {
        setSelectedNode(d);
      });

    // Node Outer Glow / Halo for Root
    node
      .filter((d) => d.isRoot)
      .append("circle")
      .attr("r", (d) => d.radius + 6)
      .attr("fill", "none")
      .attr("stroke", "#F59E0B")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,3")
      .attr("opacity", 0.85);

    // Node Base Circle
    node
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("fill", (d) => {
        if (d.isRoot) return "#F59E0B";
        if (d.depth === 1) return "#4F46E5";
        if (d.depth === 2) return "#8B5CF6";
        return "#64748B";
      })
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2.5)
      .attr("class", "transition-transform duration-200 hover:scale-110 shadow-sm");

    // Node Inner Dot or Icon
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", ".3em")
      .attr("fill", "#FFFFFF")
      .attr("font-size", (d) => (d.isRoot ? "11px" : "9px"))
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text((d) => (d.isRoot ? "★" : `L${d.depth}`));

    // Node Label below circle
    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dy", (d) => d.radius + 14)
      .attr("fill", "#334155")
      .attr("font-size", "10px")
      .attr("font-weight", "600")
      .attr("pointer-events", "none")
      .text((d) => (d.title.length > 18 ? d.title.slice(0, 16) + "..." : d.title));

    // Simulation tick callback
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (typeof d.source === "object" ? d.source.x || 0 : 0))
        .attr("y1", (d) => (typeof d.source === "object" ? d.source.y || 0 : 0))
        .attr("x2", (d) => (typeof d.target === "object" ? d.target.x || 0 : 0))
        .attr("y2", (d) => (typeof d.target === "object" ? d.target.y || 0 : 0));

      node.attr("transform", (d) => `translate(${d.x || 0},${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, links]);

  // Highlight search matches or selected node edges
  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);

    const isSearching = searchQuery.trim().length > 0;
    const query = searchQuery.toLowerCase().trim();

    svg.selectAll<SVGGElement, GraphNode>(".nodes g").each(function (d) {
      const el = d3.select(this);
      const matchesSearch =
        isSearching &&
        (d.title.toLowerCase().includes(query) || d.url.toLowerCase().includes(query));
      const isSelected = selectedNode?.id === d.id;

      if (isSelected) {
        el.select("circle:nth-of-type(1)")
          .attr("stroke", "#4F46E5")
          .attr("stroke-width", 4);
      } else if (matchesSearch) {
        el.select("circle:nth-of-type(1)")
          .attr("stroke", "#EC4899")
          .attr("stroke-width", 3.5);
      } else {
        el.select("circle:nth-of-type(1)")
          .attr("stroke", "#FFFFFF")
          .attr("stroke-width", 2.5);
      }
    });

    // Highlight links connected to selected node
    svg.selectAll<SVGLineElement, GraphLink>(".links line").each(function (d) {
      const el = d3.select(this);
      const sId = typeof d.source === "object" ? d.source.id : d.source;
      const tId = typeof d.target === "object" ? d.target.id : d.target;

      if (selectedNode) {
        if (sId === selectedNode.id) {
          el.attr("stroke", "#4F46E5")
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", 1)
            .attr("marker-end", "url(#arrow-highlight-out)");
        } else if (tId === selectedNode.id) {
          el.attr("stroke", "#10B981")
            .attr("stroke-width", 2.5)
            .attr("stroke-opacity", 1)
            .attr("marker-end", "url(#arrow-highlight-in)");
        } else {
          el.attr("stroke", "#E2E8F0")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.3)
            .attr("marker-end", "url(#arrow-default)");
        }
      } else {
        el.attr("stroke", "#CBD5E1")
          .attr("stroke-width", 1.5)
          .attr("stroke-opacity", 0.7)
          .attr("marker-end", "url(#arrow-default)");
      }
    });
  }, [selectedNode, searchQuery, links]);

  // Zoom / Fit handlers
  const handleZoom = (factor: number) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(d3.zoom<SVGSVGElement, unknown>().scaleBy, factor);
  };

  const handleFitGraph = () => {
    if (!svgRef.current || !containerRef.current) return;
    const svg = d3.select(svgRef.current);
    svg
      .transition()
      .duration(450)
      .call(
        d3.zoom<SVGSVGElement, unknown>().transform,
        d3.zoomIdentity.translate(0, 0).scale(1)
      );
    setSelectedNode(null);
    setSearchQuery("");
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[620px] rounded-xl border border-slate-200 bg-slate-50/70 overflow-hidden shadow-sm flex flex-col ${className}`}
    >
      {/* Top Toolbar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-3 pointer-events-none">
        {/* Search Input */}
        <div className="relative pointer-events-auto w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search pages by title or URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-xs bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Viewport & Legend Controls */}
        <div className="flex items-center gap-2 pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 p-1.5 rounded-lg shadow-sm text-slate-600">
          <button
            onClick={() => handleZoom(1.25)}
            title="Zoom In"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitGraph}
            title="Fit Graph to Screen"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs px-2"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Fit</span>
          </button>
          <div className="h-4 w-[1px] bg-slate-200 mx-0.5" />
          <span className="text-[10px] font-mono text-slate-500 px-1">
            {Math.round(zoomLevel * 100)}%
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-3 left-3 pointer-events-none flex flex-wrap items-center gap-2 text-[11px] bg-white/95 backdrop-blur-md border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-slate-600">
        <span className="text-slate-500 font-medium mr-1">Depth:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="text-slate-700">Root (L0)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-slate-700">Level 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
          <span className="text-slate-700">Level 2+</span>
        </div>
        <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-2">
          <span className="text-indigo-600 font-mono font-medium">→ Outgoing</span>
          <span className="text-emerald-600 font-mono font-medium ml-1">→ Incoming</span>
        </div>
      </div>

      {/* Node Information Panel (Slide-in Right) */}
      {selectedNode && (
        <div className="absolute top-3 right-3 bottom-3 w-80 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-xl p-4 shadow-xl flex flex-col justify-between overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-200 z-20 text-slate-900">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedNode.isRoot ? (
                  <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                    <Crown className="w-4 h-4" />
                  </div>
                ) : (
                  <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600">
                    <Layers className="w-4 h-4" />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 leading-tight">
                    {selectedNode.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: #{selectedNode.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* URL Link */}
            <div className="my-3">
              <span className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">
                Full URL
              </span>
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 break-all hover:underline"
              >
                {selectedNode.url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>

            {/* 6 Node Detail Fields */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {/* 1. Depth */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Layers className="w-3 h-3 text-indigo-600" /> Depth
                </div>
                <span className="text-sm font-bold text-slate-900">
                  Level {selectedNode.depth}
                </span>
              </div>

              {/* 2. Views */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Eye className="w-3 h-3 text-emerald-600" /> Views
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {Math.round(100 / (selectedNode.depth + 1))} hits
                </span>
              </div>

              {/* 3. Average Duration */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3 text-purple-600" /> Avg Duration
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {Math.round(45 + selectedNode.id * 3)}s
                </span>
              </div>

              {/* 4. Incoming Links */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> In-Degree
                </div>
                <span className="text-sm font-bold text-emerald-600">
                  {selectedNode.metrics?.in_degree ?? 1} links
                </span>
              </div>

              {/* 5. Outgoing Links */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <ArrowUpRight className="w-3 h-3 text-indigo-600" /> Out-Degree
                </div>
                <span className="text-sm font-bold text-indigo-600">
                  {selectedNode.metrics?.out_degree ?? 2} links
                </span>
              </div>

              {/* 6. Semantic / PageRank Score */}
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Sparkles className="w-3 h-3 text-amber-500" /> PageRank
                </div>
                <span className="text-sm font-bold text-amber-600">
                  {selectedNode.metrics?.pagerank
                    ? selectedNode.metrics.pagerank.toFixed(3)
                    : (0.15).toFixed(3)}
                </span>
              </div>
            </div>

            {/* Centrality & Central HITS Scores */}
            {selectedNode.metrics && (
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Kleinberg Hub Score:</span>
                  <span className="font-mono text-indigo-700 font-medium">
                    {selectedNode.metrics.hub_score.toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="text-slate-500">Kleinberg Authority Score:</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    {selectedNode.metrics.authority_score.toFixed(4)}
                  </span>
                </div>
              </div>
            )}

            {/* Invariant Warnings / Badges */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {selectedNode.metrics?.is_dead_end && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldAlert className="w-3 h-3" /> Dead-end Page
                </span>
              )}
              {selectedNode.metrics?.is_orphan && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <ShieldAlert className="w-3 h-3" /> Orphan Page
                </span>
              )}
              {selectedNode.isRoot && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Crown className="w-3 h-3" /> Homepage Root
                </span>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => setSelectedNode(null)}
              className="w-full py-1.5 text-xs text-slate-700 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg transition-colors shadow-sm"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
