import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FlaskConical,
  Play,
  RefreshCw,
  Layers,
  ArrowRight,
  Sparkles,
  Sliders,
  Users,
  Clock,
  Shuffle,
  Network,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { ExperimentSummary, Website, CreateExperimentRequest } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { StatCard } from "@/components/ui/StatCard";

import { useAccessGuard } from "@/context/AccessGuardContext";

export const ExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { requireAccess } = useAccessGuard();
  const [experiments, setExperiments] = useState<ExperimentSummary[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningSuite, setRunningSuite] = useState<string | null>(null);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [exps, sites] = await Promise.allSettled([
        api.getExperiments(),
        api.getWebsites(),
      ]);

      if (exps.status === "fulfilled") {
        setExperiments(exps.value);
      } else {
        setExperiments([]);
      }

      if (sites.status === "fulfilled" && sites.value.length > 0) {
        setWebsites(sites.value);
        if (!selectedWebsiteId) {
          setSelectedWebsiteId(sites.value[0].id);
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setExperiments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunSuite = (suiteType: CreateExperimentRequest["suiteType"]) => {
    requireAccess(async () => {
      setRunningSuite(suiteType);
      setError(null);
      try {
        const result = await api.runExperimentSuite({
          suiteType,
          websiteId: suiteType === "WEBSITE_SIZE" ? undefined : selectedWebsiteId,
        });
        navigate(`/experiments/${result.id}`);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err);
        } else {
          setError(new ApiError("Failed to execute benchmark experiment suite."));
        }
      } finally {
        setRunningSuite(null);
      }
    });
  };

  const completedCount = experiments.filter((e) => e.status === "COMPLETED").length;
  const bestGlobalFitness = experiments.length > 0
    ? Math.min(...experiments.map((e) => e.bestFitness ?? 999).filter((f) => f < 999))
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
            <FlaskConical className="h-3.5 w-3.5 text-indigo-600" />
            Performance &amp; Simulation Tests
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            Structure Reform Benchmark Simulations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Simulate diverse site topologies, search intensity sweeps, and reform stability tests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {websites.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs shadow-sm">
              <span className="text-slate-500">Target Website:</span>
              <select
                value={selectedWebsiteId || ""}
                onChange={(e) => setSelectedWebsiteId(Number(e.target.value))}
                className="bg-transparent text-slate-900 focus:outline-none font-medium cursor-pointer"
              >
                {websites.map((w) => (
                  <option key={w.id} value={w.id} className="text-slate-900">
                    {w.name} ({w.pageCount || "?"} pages)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <ErrorState
          title="Experiment Service Notice"
          message={error.message}
          isBackendOffline={error.isBackendUnavailable}
          onRetry={fetchData}
        />
      )}

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Benchmark Experiments"
          value={experiments.length}
          subtitle={`${completedCount} successfully completed`}
          icon={FlaskConical}
          accentColor="purple"
        />
        <StatCard
          title="Global Best Fitness"
          value={bestGlobalFitness !== null && bestGlobalFitness < 999 ? bestGlobalFitness.toFixed(4) : "N/A"}
          subtitle="Best Optimization Score Observed"
          icon={Sparkles}
          accentColor="cyan"
        />
        <StatCard
          title="Optimization Framework"
          value="WebReform Engine"
          subtitle="Discrete Topological Optimization"
          icon={Layers}
          accentColor="indigo"
        />
      </div>

      {/* 4 BENCHMARK EXPERIMENT SUITE LAUNCHERS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            Standard Benchmark Experiment Suites
          </h2>
          <span className="text-xs text-slate-500">
            Click any suite to trigger automated multi-run evaluation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Suite A: Population Size */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold">
                  Suite A
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Population Size Sweep</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates search diversity across candidate pool sizes of <strong>10, 20, 30, 50, 100</strong>.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 space-y-0.5">
                <div>• Measures: Final Fitness, Runtime</div>
                <div>• Invariant: Fixed Iterations &amp; Seed</div>
              </div>
            </div>

            <button
              onClick={() => handleRunSuite("POPULATION_SIZE")}
              disabled={runningSuite !== null}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${runningSuite === "POPULATION_SIZE" ? "animate-spin" : ""}`} />
              {runningSuite === "POPULATION_SIZE" ? "Evaluating Suite A..." : "Run Population Suite"}
            </button>
          </div>

          {/* Suite B: Iterations */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded font-semibold">
                  Suite B
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Iteration Budget Scaling</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates convergence horizon over <strong>50, 100, 200, 500</strong> algorithm iterations.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 space-y-0.5">
                <div>• Measures: Convergence &amp; Runtime</div>
                <div>• Invariant: Fixed Population Size</div>
              </div>
            </div>

            <button
              onClick={() => handleRunSuite("ITERATIONS")}
              disabled={runningSuite !== null}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${runningSuite === "ITERATIONS" ? "animate-spin" : ""}`} />
              {runningSuite === "ITERATIONS" ? "Evaluating Suite B..." : "Run Iterations Suite"}
            </button>
          </div>

          {/* Suite C: Website Scale */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Network className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded font-semibold">
                  Suite C
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Problem Dimension &amp; Scale</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scalability benchmark across <strong>50, 100, 250, 500, 1000</strong> page graphs.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 space-y-0.5">
                <div>• Measures: Dimension vs Runtime</div>
                <div>• Scale-free Target Topologies</div>
              </div>
            </div>

            <button
              onClick={() => handleRunSuite("WEBSITE_SIZE")}
              disabled={runningSuite !== null}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${runningSuite === "WEBSITE_SIZE" ? "animate-spin" : ""}`} />
              {runningSuite === "WEBSITE_SIZE" ? "Evaluating Suite C..." : "Run Scale Suite"}
            </button>
          </div>

          {/* Suite D: Random Seeds */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Shuffle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-semibold">
                  Suite D
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900">Stochastic Seed Variance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Runs multiple seeds to compute statistical mean (μ), variance (σ), best &amp; worst bounds.
              </p>
              <div className="pt-2 text-[11px] font-mono text-slate-500 border-t border-slate-100 space-y-0.5">
                <div>• Measures: μ, σ, Min/Max Bounds</div>
                <div>• Seeds: 42, 101, 777, 1337, 2024</div>
              </div>
            </div>

            <button
              onClick={() => handleRunSuite("RANDOM_SEEDS")}
              disabled={runningSuite !== null}
              className="mt-4 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <Play className={`w-3.5 h-3.5 ${runningSuite === "RANDOM_SEEDS" ? "animate-spin" : ""}`} />
              {runningSuite === "RANDOM_SEEDS" ? "Evaluating Suite D..." : "Run Seed Robustness"}
            </button>
          </div>
        </div>
      </div>

      {/* TABLE OF EXECUTED EXPERIMENTS */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Conducted Experiment Trials</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Persistent evaluation records ready for CSV / JSON export.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {experiments.length} total experiments
          </span>
        </div>

        {loading ? (
          <div className="p-8">
            <LoadingState message="Loading experiment database records..." rows={3} />
          </div>
        ) : experiments.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <FlaskConical className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            No experiments executed yet. Click one of the standard benchmark suites above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Suite Type</th>
                  <th className="px-4 py-3">Experiment Title</th>
                  <th className="px-4 py-3">Website</th>
                  <th className="px-4 py-3">Runs</th>
                  <th className="px-4 py-3">Best Fitness</th>
                  <th className="px-4 py-3">Mean Runtime</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {experiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-indigo-700 font-semibold">
                      {exp.suiteType}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <Link
                        to={`/experiments/${exp.id}`}
                        className="hover:text-indigo-600 transition-colors flex items-center gap-1.5"
                      >
                        {exp.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-500 truncate max-w-[180px]">
                      {exp.websiteName}
                    </td>
                    <td className="px-4 py-3 font-mono">{exp.totalRuns} runs</td>
                    <td className="px-4 py-3 font-mono text-emerald-700 font-bold">
                      {exp.bestFitness !== null ? exp.bestFitness.toFixed(4) : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      {exp.meanExecutionTimeMs !== null
                        ? `${Math.round(exp.meanExecutionTimeMs)} ms`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exp.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/experiments/${exp.id}`}
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
