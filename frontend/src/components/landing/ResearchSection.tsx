import React, { useState } from "react";
import {
  Network,
  Cpu,
  GitCompare,
  Terminal,
  Zap,
} from "lucide-react";

interface TechPillar {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
  title: string;
  simpleSummary: string;
  techDetails: {
    stack: string;
    algorithm: string;
    explanation: string;
  };
}

const TECH_PILLARS: TechPillar[] = [
  {
    id: "crawler-graph",
    icon: Network,
    tag: "Phase 1 • Discovery",
    title: "Safe Web Crawler & Graph Modeling",
    simpleSummary:
      "WebReform gently crawls your public website pages, discovers every menu and in-content link, and maps your site into an interconnected network.",
    techDetails: {
      stack: "Java 21 • Spring Boot • Multi-threaded Crawler",
      algorithm: "Directed Graph Construction G = (V, E)",
      explanation:
        "Pages are represented as vertices V and hyperlinks as directed edges E. The engine respects robots.txt, applies polite rate limiting, and extracts DOM structure and click depths without placing load on your live servers.",
    },
  },
  {
    id: "friction-engine",
    icon: Zap,
    tag: "Phase 2 • Diagnosis",
    title: "Friction & Dead-End Detection",
    simpleSummary:
      "Calculates the exact click distance to every page from the homepage. Instantly highlights high-value pages hidden 5+ clicks deep and orphan dead-ends.",
    techDetails: {
      stack: "NetworkX • Shortest Path Analysis",
      algorithm: "Breadth-First Search (BFS) & Shortest Path Centrality",
      explanation:
        "Calculates shortest path lengths d(root, v) across the graph. Pages exceeding the 3-click threshold or possessing an in-degree of 0 are flagged as critical conversion bottlenecks.",
    },
  },
  {
    id: "optimizer-tree",
    icon: Cpu,
    tag: "Phase 3 • Restructuring",
    title: "Balanced Tree Hierarchy Optimization",
    simpleSummary:
      "Our graph optimizer searches thousands of possible layout combinations to produce a clean, balanced menu where key pages are directly accessible.",
    techDetails: {
      stack: "Python FastAPI • NetworkX Optimization Core",
      algorithm: "Degree-Constrained Minimum Spanning Tree (MST)",
      explanation:
        "Solves the NP-hard degree-constrained minimum latency hierarchy problem. Caps branching degree at k ≤ 7 per category to prevent menu fatigue while hoisting vital pages into direct reach.",
    },
  },
  {
    id: "drift-diff",
    icon: GitCompare,
    tag: "Phase 4 • Governance",
    title: "Live Structural Drift & Sitemap Diffing",
    simpleSummary:
      "As your team publishes new landing pages and blogs, WebReform continuously monitors your hierarchy to prevent menus from becoming cluttered again.",
    techDetails: {
      stack: "Automated Diffing Service",
      algorithm: "Graph Symmetric Difference E_live △ E_opt",
      explanation:
        "Computes real-time topological diffs between newly deployed web pages and the optimized hierarchy, notifying teams before navigation complexity regresses.",
    },
  },
];

export const ResearchSection: React.FC = () => {
  const [activePillar, setActivePillar] = useState<TechPillar>(TECH_PILLARS[0]);

  return (
    <section id="research" className="py-14 md:py-16 border-t border-sand-200/80 relative">
      <div className="max-w-7xl mx-auto px-6 space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sand-100 border border-sand-200 text-xs font-mono font-bold uppercase tracking-wider text-ink-700">
              <Cpu className="h-3.5 w-3.5 text-coral-500" />
              <span>Under The Hood</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight text-ink-900 leading-tight">
              How WebReform Works <br />
              <span className="text-coral-500">Under The Hood</span>
            </h2>

            <p className="text-base sm:text-lg text-ink-600 leading-relaxed font-normal">
              Designed for website owners who want effortless results, and backed by robust graph theory that engineers appreciate. Here is how our dual-engine architecture turns tangled websites into streamlined journeys.
            </p>
          </div>

          <a
            href="/research"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sand-300 bg-white text-xs font-bold text-ink-800 hover:border-coral-400 hover:text-coral-600 transition-all shadow-xs self-start md:self-auto shrink-0"
          >
            <span>Full Technical Architecture &rarr;</span>
          </a>
        </div>

        {/* 3-Step Clear Summary for Everyone (Non-Tech First) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-7 rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-coral-50 text-coral-600 border border-coral-200 flex items-center justify-center font-display font-extrabold text-sm">
              01
            </div>
            <h3 className="text-base font-display font-bold text-ink-900">
              1. Scan &amp; Map Pages
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              Paste your URL. Our crawler safely visits your public pages, maps internal links, and calculates how many clicks it takes visitors to reach each page.
            </p>
          </div>

          <div className="p-7 rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-display font-extrabold text-sm">
              02
            </div>
            <h3 className="text-base font-display font-bold text-ink-900">
              2. Diagnose Navigation Friction
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              Spots hidden pages buried 5+ clicks deep and dead-ends with no links pointing back, pinpointing exactly where visitors get frustrated and drop off.
            </p>
          </div>

          <div className="p-7 rounded-4xl bg-white/90 backdrop-blur-md border border-sand-200/90 shadow-card-sm space-y-3">
            <div className="h-10 w-10 rounded-2xl bg-mint-50 text-mint-600 border border-mint-500/25 flex items-center justify-center font-display font-extrabold text-sm">
              03
            </div>
            <h3 className="text-base font-display font-bold text-ink-900">
              3. Restructure Site Hierarchy
            </h3>
            <p className="text-xs sm:text-sm text-ink-600 leading-relaxed">
              Our graph optimizer creates a streamlined visual hierarchy where every important page is within fast, effortless reach. Preview and apply only what you approve.
            </p>
          </div>
        </div>

        {/* Technical Deep Dive For Developers & Knowledgeable Visitors */}
        <div className="rounded-4xl bg-sand-50/80 border border-sand-200/90 p-7 sm:p-10 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand-200/80 pb-5">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-coral-600">
                Technical Architecture
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-ink-900">
                Algorithmic Details &amp; Systems
              </h3>
            </div>
            <span className="text-xs font-mono text-ink-500">
              Click a phase below to inspect the tech stack &amp; algorithm
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Phase Tabs */}
            <div className="lg:col-span-5 space-y-2.5">
              {TECH_PILLARS.map((pillar) => {
                const isActive = activePillar.id === pillar.id;
                const Icon = pillar.icon;

                return (
                  <button
                    key={pillar.id}
                    onClick={() => setActivePillar(pillar)}
                    className={`w-full text-left p-4 rounded-3xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-white border-coral-300 shadow-card-sm"
                        : "bg-transparent border-transparent hover:bg-white/60 hover:border-sand-200"
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`h-9 w-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                          isActive
                            ? "bg-coral-500 text-white shadow-coral-glow"
                            : "bg-sand-200 text-ink-700"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-mono font-bold uppercase text-coral-600">
                          {pillar.tag}
                        </div>
                        <div className="text-sm font-display font-bold text-ink-900 truncate">
                          {pillar.title}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right: Technical Explanation Card */}
            <div className="lg:col-span-7 rounded-3xl bg-white border border-sand-200/90 shadow-card-sm p-6 sm:p-8 space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-coral-600">
                  {activePillar.tag}
                </span>
                <h4 className="text-xl font-display font-bold text-ink-900">
                  {activePillar.title}
                </h4>
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed pt-1">
                  {activePillar.simpleSummary}
                </p>
              </div>

              {/* Code / Algorithm Snippet Box */}
              <div className="p-4 rounded-2xl bg-sand-100/70 border border-sand-200 font-mono text-xs text-ink-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-ink-400 font-sans font-bold uppercase">
                  <span>Tech Stack &amp; Method</span>
                  <Terminal className="h-3.5 w-3.5 text-coral-500" />
                </div>
                <div className="text-coral-600 font-bold">{activePillar.techDetails.stack}</div>
                <div className="text-ink-700 font-semibold">{activePillar.techDetails.algorithm}</div>
              </div>

              {/* In-depth Narrative */}
              <div className="space-y-1.5">
                <div className="text-xs font-mono font-bold uppercase text-ink-400">
                  How it executes
                </div>
                <p className="text-xs sm:text-sm text-ink-700 leading-relaxed">
                  {activePillar.techDetails.explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
