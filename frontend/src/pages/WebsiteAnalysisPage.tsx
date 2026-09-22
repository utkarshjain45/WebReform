import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart2,
  Layers,
  Clock,
  ArrowLeft,
  Sliders,
  TrendingDown,
  Network,
  Share2,
  Info,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";
import { api, ApiError } from "@/lib/api";
import type { Website, Page, GraphAnalysisData } from "@/types";
import { StatCard } from "@/components/ui/StatCard";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { WebsiteGraphView } from "@/components/graph/WebsiteGraphView";

export const WebsiteAnalysisPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const websiteId = Number(id);

  const [website, setWebsite] = useState<Website | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [analysis, setAnalysis] = useState<GraphAnalysisData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!websiteId || isNaN(websiteId)) return;
      setLoading(true);
      setError(null);
      try {
        const site = await api.getWebsite(websiteId);
        setWebsite(site);

        const sitePages = await api.getWebsitePages(websiteId);
        setPages(sitePages);

        try {
          const analysisData = await api.getWebsiteGraphAnalysis(websiteId);
          setAnalysis(analysisData);
        } catch {
          // If backend graph analysis endpoint is unavailable, continue with pages
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(new ApiError("Failed to fetch website topology data for analysis."));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [websiteId]);

  if (loading) {
    return <LoadingState message="Analyzing website topology and constructing graph model G=(V,E)..." rows={5} />;
  }

  if (error || !website) {
    return (
      <div className="space-y-4">
        <Link
          to="/websites"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Websites
        </Link>
        <ErrorState
          title="Analysis Unavailable"
          message={error ? error.message : "Website data could not be retrieved."}
          isBackendOffline={error?.isBackendUnavailable}
        />
      </div>
    );
  }

  // Aggregate Depth Distribution
  const depthCounts: Record<number, number> = {};
  pages.forEach((p) => {
    depthCounts[p.depth] = (depthCounts[p.depth] || 0) + 1;
  });

  const depthChartData = Object.keys(depthCounts)
    .sort((a, b) => Number(a) - Number(b))
    .map((depthKey) => ({
      depth: `Level ${depthKey}`,
      pageCount: depthCounts[Number(depthKey)],
    }));

  // Latency / Load Time Chart Data
  const latencyChartData = pages.slice(0, 15).map((p, idx) => ({
    name: p.title ? p.title.slice(0, 15) + "..." : `Page ${idx + 1}`,
    loadTime: p.loadTime != null ? Math.round(p.loadTime) : 0,
  }));

  const stats = analysis?.graph_statistics;

  const tooltipStyle = {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
    color: "#0F172A",
    fontSize: "12px",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/websites" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
              Websites
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs text-slate-700 font-medium">{website.name}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Network className="w-6 h-6 text-indigo-600" />
            Website Graph Topology &amp; Structural Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mathematical model G = (V, E) of internal navigation pages and hyperlinks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/optimize?websiteId=${website.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors shadow-sm"
          >
            <Sliders className="w-4 h-4" /> Reform Navigation
          </Link>
        </div>
      </div>

      {/* Scientific Graph Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Pages |V|"
          value={stats?.num_pages ?? pages.length}
          subtitle="Discovered HTML Vertices"
          icon={Layers}
          accentColor="indigo"
        />
        <StatCard
          title="Internal Links |E|"
          value={stats?.num_links ?? (website.linkCount || 0)}
          subtitle="Directed Navigation Edges"
          icon={Share2}
          accentColor="cyan"
        />
        <StatCard
          title="Graph Density"
          value={stats?.density ? `${(stats.density * 100).toFixed(2)}%` : "N/A"}
          subtitle="Adjacency Completeness"
          icon={BarChart2}
          accentColor="purple"
        />
        <StatCard
          title="Average Path Length"
          value={stats?.average_path_length ? stats.average_path_length.toFixed(2) : "N/A"}
          subtitle="Click Steps from Root"
          icon={TrendingDown}
          accentColor="emerald"
        />
      </div>

      {/* SECTION 1: INTERACTIVE D3 GRAPH VISUALIZATION */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-indigo-600" />
              Interactive Website Hyperlink Graph G = (V, E)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Force-directed visualization: Zoom, pan, search pages, and click any node for detailed topological telemetry.
            </p>
          </div>
          {stats && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-500">Dead-Ends: <strong className="text-amber-600">{stats.dead_end_count}</strong></span>
              <span className="text-slate-500">Orphans: <strong className="text-rose-600">{stats.orphan_count}</strong></span>
            </div>
          )}
        </div>

        <WebsiteGraphView pages={pages} analysis={analysis} />
      </div>

      {/* Disclaimer Banner */}
      {analysis?.disclaimer && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            <strong>Topology Note:</strong> {analysis.disclaimer}
          </span>
        </div>
      )}

      {/* SECTION 2: CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Depth Distribution Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Crawl Depth Distribution</h2>
              <p className="text-xs text-slate-500">Page count per hierarchy level from root</p>
            </div>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            {depthChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No depth data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={depthChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="depth" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="pageCount" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Page Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            WebReform automatically restructures tree hierarchies to compress higher-level depths into an optimal, direct balance.
          </p>
        </div>

        {/* Page Load Latency Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Page Response Latencies</h2>
              <p className="text-xs text-slate-500">HTTP response time profile across discovered nodes</p>
            </div>
            <Clock className="w-4 h-4 text-cyan-600" />
          </div>

          <div className="h-64 w-full">
            {latencyChartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No latency data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={latencyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} tickLine={false} unit="ms" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="loadTime"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#latencyGradient)"
                    name="Latency (ms)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[11px] text-slate-500 italic">
            Lower latencies reduce crawler overhead and enhance user transition flow.
          </p>
        </div>
      </div>
    </div>
  );
};
