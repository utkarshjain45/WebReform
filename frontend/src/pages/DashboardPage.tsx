import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Globe,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Zap,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Website, OptimizationRun } from "@/types";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [runs, setRuns] = useState<OptimizationRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // 1-Click Quick Reform State
  const [quickUrl, setQuickUrl] = useState<string>("");
  const [quickStep, setQuickStep] = useState<"idle" | "registering" | "crawling" | "optimizing">("idle");
  const [quickError, setQuickError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sites, optRuns] = await Promise.all([
        api.getWebsites(),
        api.getOptimizationRuns().catch(() => [] as OptimizationRun[]),
      ]);
      setWebsites(sites);
      setRuns(optRuns);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError("Failed to fetch dashboard data."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 1-Click Quick Reform Handler
  const handleQuickReform = async (e: React.FormEvent) => {
    e.preventDefault();
    const raw = quickUrl.trim();
    if (!raw) return;

    let targetUrl = raw;
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = `https://${targetUrl}`;
    }

    try {
      new URL(targetUrl);
    } catch {
      setQuickError("Please enter a valid website URL (e.g. https://mybrand.com)");
      return;
    }

    setQuickError(null);
    setQuickStep("registering");

    try {
      // 1. Find existing or register new
      let site = websites.find(
        (w) => w.baseUrl.toLowerCase() === targetUrl.toLowerCase() ||
               w.baseUrl.toLowerCase() === `${targetUrl}/`.toLowerCase()
      );

      if (!site) {
        let domainName = "Target Website";
        try {
          domainName = new URL(targetUrl).hostname.replace(/^www\./, "");
        } catch {
          // fallback
        }
        site = await api.createWebsite({ name: domainName, baseUrl: targetUrl });
      }

      // 2. Crawl site (focused scan)
      setQuickStep("crawling");
      const crawlJob = await api.startCrawl(site.id, { maxPages: 8, maxDepth: 2 });
      
      // Poll crawl completion
      await new Promise<void>((resolve, reject) => {
        let attempts = 0;
        const interval = setInterval(async () => {
          attempts++;
          try {
            const status = await api.getCrawlJob(site!.id, crawlJob.jobId);
            if (status.status === "COMPLETED") {
              clearInterval(interval);
              resolve();
            } else if (status.status === "FAILED") {
              clearInterval(interval);
              reject(new Error(status.errorMessage || "Website crawl failed."));
            } else if (attempts > 30) {
              clearInterval(interval);
              resolve(); // Proceed with what was crawled
            }
          } catch (err) {
            clearInterval(interval);
            reject(err);
          }
        }, 1200);
      });

      // 3. Optimize structure
      setQuickStep("optimizing");
      const run = await api.runOptimization({
        websiteId: site.id,
        populationSize: 30,
        iterations: 80,
        randomSeed: 42,
        maxDepth: 3,
        maxChildren: 7,
        weights: {
          navigation: 0.40,
          behavior: 0.30,
          semantic: 0.15,
          structural: 0.05,
          depth: 0.10,
        },
      });

      // Navigate to results
      navigate(`/optimize/results/${run.id}`);
    } catch (err) {
      setQuickError(err instanceof Error ? err.message : "Failed to run website reform.");
      setQuickStep("idle");
    }
  };

  const completedRuns = runs.filter((r) => r.status === "COMPLETED");
  const avgGain = completedRuns.length > 0
    ? (completedRuns.reduce((acc, r) => {
        const imp = (r.initialFitness && r.finalFitness && r.initialFitness > 0)
          ? ((r.initialFitness - r.finalFitness) / r.initialFitness) * 100
          : 0;
        return acc + imp;
      }, 0) / completedRuns.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-12">
      {/* Hero: 1-Click Guided Action */}
      <div className="pt-2 pb-6 border-b border-sand-200/90">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight text-ink-900">
            Simplify your website navigation.
          </h1>
          <p className="text-sm text-ink-600 leading-relaxed">
            Enter your website to spot buried pages, unclutter menus, and bring visitors to key destinations effortlessly.
          </p>
        </div>

        {/* 1-Click URL Input Bar */}
        <form onSubmit={handleQuickReform} className="mt-6 max-w-2xl">
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sand-500">
                <Globe className="w-4 h-4 text-coral-500" />
              </div>
              <input
                type="text"
                placeholder="Enter website URL (e.g. https://mybrand.com)"
                value={quickUrl}
                onChange={(e) => {
                  setQuickUrl(e.target.value);
                  setQuickError(null);
                }}
                disabled={quickStep !== "idle"}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-sand-300 rounded-2xl focus:border-coral-500 focus:outline-none focus:ring-2 focus:ring-coral-500/10 transition-all shadow-card-sm text-ink-900 font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={quickStep !== "idle" || !quickUrl.trim()}
              className="px-6 py-3 bg-coral-500 text-white text-sm font-bold rounded-2xl hover:bg-coral-600 shadow-coral-glow disabled:opacity-50 transition-all inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              {quickStep === "idle" && (
                <>
                  <span>Simplify My Menus</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
              {quickStep === "registering" && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              )}
              {quickStep === "crawling" && (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Pages...</span>
                </>
              )}
              {quickStep === "optimizing" && (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Reorganizing Structure...</span>
                </>
              )}
            </button>
          </div>

          {quickError && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-coral-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{quickError}</span>
            </div>
          )}

          {quickStep !== "idle" && (
            <div className="mt-3 p-3 bg-sand-100 border border-sand-200 rounded-xl text-xs text-ink-800 flex items-center gap-3 font-mono">
              <Sparkles className="w-4 h-4 text-coral-500 animate-pulse shrink-0" />
              <span>
                {quickStep === "registering" && "Checking website domain and accessibility..."}
                {quickStep === "crawling" && "Discovering menu links and measuring click depths..."}
                {quickStep === "optimizing" && "Searching thousands of layouts to find the optimal navigation hierarchy..."}
              </span>
            </div>
          )}
        </form>
      </div>

      {error && (
        <ErrorState
          title="Unable to connect"
          message={error.message}
          isBackendOffline={error.isBackendUnavailable}
          onRetry={fetchData}
        />
      )}

      {/* Human Metrics Bar (Clean, Unboxed) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-2">
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-ink-400 block mb-1">Websites Monitored</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-ink-900">{websites.length}</span>
            <span className="text-xs text-ink-400">domains</span>
          </div>
        </div>
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-ink-400 block mb-1">Navigation Target</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-mint-600">Optimized</span>
            <span className="text-xs text-ink-400">streamlined paths</span>
          </div>
        </div>
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-ink-400 block mb-1">Avg. Friction Reduced</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-coral-600">
              {completedRuns.length > 0 ? `+${avgGain}%` : "—"}
            </span>
            <span className="text-xs text-ink-400">faster access</span>
          </div>
        </div>
        <div>
          <span className="text-xs font-mono font-semibold uppercase text-ink-400 block mb-1">Reforms Completed</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-display font-extrabold text-ink-900">{completedRuns.length}</span>
            <span className="text-xs text-ink-400">layouts generated</span>
          </div>
        </div>
      </div>

      {/* Main Section: Monitored Websites & Recent Activity */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-sand-200/90 pb-3">
          <div>
            <h2 className="text-base font-display font-bold text-ink-900">Your Websites</h2>
            <p className="text-xs text-ink-500">Domains and active menu reform plans</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 text-ink-400 hover:text-ink-800 rounded-lg hover:bg-sand-100 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <Link
              to="/websites"
              className="text-xs font-bold text-coral-600 hover:text-coral-700 font-mono"
            >
              All Websites &rarr;
            </Link>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading your websites..." rows={2} />
        ) : websites.length === 0 ? (
          <div className="py-12 text-center text-ink-400 space-y-3">
            <Globe className="w-10 h-10 mx-auto text-sand-400" />
            <div className="space-y-1">
              <h3 className="text-sm font-display font-bold text-ink-800">No websites added yet</h3>
              <p className="text-xs text-ink-500 max-w-sm mx-auto">
                Paste your website URL in the box above to start your website structure reform.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-sand-200 border-b border-sand-200">
            {websites.map((site) => {
              const siteRuns = runs.filter((r) => r.websiteId === site.id && r.status === "COMPLETED");
              const latestRun = siteRuns[0];

              return (
                <div
                  key={site.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/60 px-3 rounded-2xl transition-colors border border-transparent hover:border-sand-200"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink-900">{site.name}</span>
                      {latestRun && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-mint-50 text-mint-700 border border-mint-500/25">
                          <CheckCircle2 className="w-3 h-3 text-mint-600" />
                          Optimized
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-ink-500 font-mono">
                      <a
                        href={site.baseUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-coral-600 inline-flex items-center gap-1"
                      >
                        {site.baseUrl}
                        <ExternalLink className="w-2.5 h-2.5 opacity-50" />
                      </a>
                      <span>•</span>
                      <span>{site.pageCount ?? 0} pages discovered</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {latestRun ? (
                      <Link
                        to={`/optimize/results/${latestRun.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-mint-500 text-xs font-bold text-white hover:bg-mint-600 shadow-sm transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Results</span>
                      </Link>
                    ) : (
                      <Link
                        to={`/optimize?websiteId=${site.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-coral-500 text-xs font-bold text-white hover:bg-coral-600 shadow-coral-glow transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simplify Menus</span>
                      </Link>
                    )}
                    <Link
                      to={`/websites/${site.id}`}
                      className="px-3.5 py-1.5 rounded-full border border-sand-300 bg-sand-100 text-xs font-semibold text-ink-800 hover:bg-sand-200 transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
