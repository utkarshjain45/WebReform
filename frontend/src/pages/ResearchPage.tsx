import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cpu,
  Network,
  GitBranch,
  Terminal,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const ResearchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"architecture" | "graph-theory" | "solver" | "benchmarks">("architecture");

  return (
    <div className="min-h-screen bg-[#FDFBF9] text-ink-900 selection:bg-coral-500/15 selection:text-coral-600">
      {/* Floating Island Header */}
      <header className="sticky top-4 z-40 max-w-6xl mx-auto px-6">
        <div className="h-16 px-6 rounded-full glass-sand shadow-card-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Logo size="sm" showText={true} />
            </Link>
            <span className="text-sand-400">/</span>
            <span className="text-xs font-mono font-bold text-coral-600 uppercase tracking-wider">
              Technical Architecture &amp; Research
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <Link to="/">
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}>
                Home
              </Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="primary" size="sm" withArrow>
                Launch Console
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-12 pb-24 space-y-12">
        {/* Page Hero */}
        <div className="space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sand-100 border border-sand-200 text-xs font-mono font-bold text-ink-700 uppercase tracking-wider">
            <Terminal className="h-3.5 w-3.5 text-coral-500" />
            <span>WebReform Technical Documentation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight text-ink-900 leading-tight">
            Algorithmic Website Hierarchy &amp; Navigation Graph Reform
          </h1>

          <p className="text-base sm:text-lg text-ink-600 leading-relaxed font-normal">
            A comprehensive technical breakdown of how WebReform models websites as directed graphs, evaluates navigation friction, and executes degree-constrained spanning tree optimization to streamline user journeys.
          </p>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex flex-wrap gap-2 p-1.5 rounded-3xl bg-sand-100 border border-sand-200/90 w-fit">
          <button
            onClick={() => setActiveTab("architecture")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-white text-ink-900 shadow-sand-pill border border-sand-200"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Dual-Engine Architecture
          </button>
          <button
            onClick={() => setActiveTab("graph-theory")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "graph-theory"
                ? "bg-white text-ink-900 shadow-sand-pill border border-sand-200"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Graph Theory Formulation
          </button>
          <button
            onClick={() => setActiveTab("solver")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "solver"
                ? "bg-white text-ink-900 shadow-sand-pill border border-sand-200"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Optimization Algorithm
          </button>
          <button
            onClick={() => setActiveTab("benchmarks")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === "benchmarks"
                ? "bg-white text-ink-900 shadow-sand-pill border border-sand-200"
                : "text-ink-500 hover:text-ink-800"
            }`}
          >
            Empirical Results
          </button>
        </div>

        {/* Tab 1: Dual-Engine Architecture */}
        {activeTab === "architecture" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-4xl bg-white border border-sand-200/90 shadow-card-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-coral-50 text-coral-600 border border-coral-200 flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-ink-900">
                    High-Level System Architecture
                  </h2>
                  <p className="text-xs text-ink-500">Decoupled crawler, graph engine, and visualization core</p>
                </div>
              </div>

              <p className="text-sm text-ink-700 leading-relaxed">
                WebReform separates crawling and graph optimization into two autonomous services orchestrated through a clean REST interface:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-3xl bg-sand-50/70 border border-sand-200 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-coral-600">
                    Service 1: Siphon Crawler
                  </div>
                  <div className="font-display font-bold text-ink-900">
                    Java 21 / Spring Boot 3
                  </div>
                  <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                    <li>Multi-threaded, respectful asynchronous HTTP client</li>
                    <li>Respects robots.txt rules, nofollow tags, and polite rate limits</li>
                    <li>Extracts clean internal DOM hyperlinks and sitemap XML</li>
                    <li>Normalizes dynamic and canonical URL paths into graph vertices</li>
                  </ul>
                </div>

                <div className="p-5 rounded-3xl bg-sand-50/70 border border-sand-200 space-y-2">
                  <div className="text-xs font-mono font-bold uppercase text-mint-600">
                    Service 2: Restructuring Optimizer
                  </div>
                  <div className="font-display font-bold text-ink-900">
                    Python FastAPI / NetworkX
                  </div>
                  <ul className="text-xs text-ink-600 space-y-1.5 list-disc list-inside">
                    <li>In-memory directed graph construction G = (V, E)</li>
                    <li>High-performance BFS &amp; Dijkstra shortest-path calculations</li>
                    <li>Bounded-degree spanning tree generation with custom heuristics</li>
                    <li>Continuous topological diffing against live production sitemaps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Graph Theory Formulation */}
        {activeTab === "graph-theory" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-4xl bg-white border border-sand-200/90 shadow-card-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                  <Network className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-ink-900">
                    Mathematical Graph Modeling
                  </h2>
                  <p className="text-xs text-ink-500">Formal representation of website topology</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-ink-700 leading-relaxed">
                <p>
                  A website is formalized as a directed graph <span className="font-mono bg-sand-100 px-2 py-0.5 rounded text-coral-600 font-bold">G = (V, E)</span>:
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs text-ink-600 pl-2">
                  <li><strong>V (Vertices):</strong> Unique canonical HTML pages discovered on the domain.</li>
                  <li><strong>E (Edges):</strong> Hyperlinks connecting page <em>u</em> to page <em>v</em>, represented as ordered pairs (u, v).</li>
                  <li><strong>root &isin; V:</strong> The primary landing page or home route (/).</li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-sand-100 border border-sand-200 font-mono text-xs text-ink-900 space-y-3">
                <div className="text-[11px] font-sans font-bold uppercase text-ink-400">
                  Navigation Distance Metric:
                </div>
                <div className="text-sm font-bold text-coral-600">
                  d(root, v) = length of shortest path from root to v in G
                </div>
                <div className="text-ink-600 text-xs font-sans">
                  Pages where <span className="font-mono font-bold">d(root, v) &ge; 4</span> or in-degree <span className="font-mono font-bold">deg<sup>-</sup>(v) = 0</span> are defined as isolated or buried bottlenecks.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Optimization Algorithm */}
        {activeTab === "solver" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-4xl bg-white border border-sand-200/90 shadow-card-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-mint-50 text-mint-600 border border-mint-500/25 flex items-center justify-center">
                  <GitBranch className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-ink-900">
                    Spanning Tree Restructuring Solver
                  </h2>
                  <p className="text-xs text-ink-500">Degree-constrained latency minimization</p>
                </div>
              </div>

              <p className="text-sm text-ink-700 leading-relaxed">
                The objective is to produce an optimal spanning hierarchy <span className="font-mono font-bold text-coral-600">T &sube; G</span> that minimizes average path length across all conversion pages while enforcing cognitive menu limits (branching constraint <em>k &le; 7</em> per category).
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
                  <div className="text-xs font-mono font-bold text-ink-900">Step 1: Page Importance Weighting</div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Key conversion routes (pricing, documentation, product catalogs, contact) receive elevated importance weights based on URI semantics and in-link centrality.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
                  <div className="text-xs font-mono font-bold text-ink-900">Step 2: Semantic Category Clustering</div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Orphan and deep-seated pages are grouped with related parent nodes by analyzing path tokens and structural link neighborhoods.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-sand-50 border border-sand-200 space-y-1.5">
                  <div className="text-xs font-mono font-bold text-ink-900">Step 3: Branching Pruning &amp; Hoisting</div>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    Excessive drop-down menus with 20+ links are partitioned into sensible subcategories, ensuring navigation remains fast and readable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Empirical Results */}
        {activeTab === "benchmarks" && (
          <div className="space-y-8 animate-fadeIn">
            <div className="p-8 rounded-4xl bg-white border border-sand-200/90 shadow-card-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-coral-50 text-coral-600 border border-coral-200 flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-extrabold text-ink-900">
                    Restructuring Performance Benchmarks
                  </h2>
                  <p className="text-xs text-ink-500">Measurable improvements recorded across test sites</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-sand-50/70 border border-sand-200 space-y-1">
                  <div className="text-3xl font-display font-black text-coral-500">-52%</div>
                  <div className="text-xs font-bold text-ink-900">Path Depth Reduction</div>
                  <div className="text-[11px] text-ink-500">Average navigation distance to key goals</div>
                </div>

                <div className="p-5 rounded-3xl bg-sand-50/70 border border-sand-200 space-y-1">
                  <div className="text-3xl font-display font-black text-mint-600">100%</div>
                  <div className="text-xs font-bold text-ink-900">Dead-End Recovery</div>
                  <div className="text-[11px] text-ink-500">Orphan pages connected to logical parents</div>
                </div>

                <div className="p-5 rounded-3xl bg-sand-50/70 border border-sand-200 space-y-1">
                  <div className="text-3xl font-display font-black text-ink-900">&le; 7</div>
                  <div className="text-xs font-bold text-ink-900">Max Category Items</div>
                  <div className="text-[11px] text-ink-500">Adheres to cognitive clarity limits</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA Box */}
        <div className="p-8 rounded-4xl bg-ink-900 text-white text-center space-y-4 shadow-card-md">
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold">
            Inspect Your Own Website Topology
          </h2>
          <p className="text-xs sm:text-sm text-sand-300 max-w-md mx-auto">
            Run an automated audit to discover hidden pages and generate a clean, balanced structure for your site.
          </p>
          <div className="pt-2">
            <Link to="/dashboard">
              <Button variant="primary" size="md" withArrow>
                Launch Free Audit
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
