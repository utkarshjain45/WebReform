import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { ApiError } from "@/lib/api";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";

interface ProgressState {
  jobId: string;
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  runId?: number;
  currentIteration?: number;
  totalIterations?: number;
  bestFitness?: number;
  elapsedSeconds?: number;
  message?: string;
}

export const OptimizationProgressPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();

  const [progress, setProgress] = useState<ProgressState>({
    jobId: jobId || "active-job",
    status: "SUBMITTED",
  });
  const [error, setError] = useState<ApiError | null>(null);
  const [polling, setPolling] = useState<boolean>(true);

  const checkStatus = async () => {
    if (!jobId) return;
    try {
      const response = await fetch(`/api/optimizations/jobs/${jobId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setProgress((prev) => ({
            ...prev,
            status: "SUBMITTED",
            message: "Job dispatched. Awaiting optimizer worker allocation.",
          }));
          return;
        }
        throw new ApiError(`HTTP ${response.status}: Failed to read job status`, response.status);
      }
      const data = await response.json();
      setProgress(data);
      if (data.status === "COMPLETED" || data.status === "FAILED") {
        setPolling(false);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(
          new ApiError(
            "Unable to connect to the optimization service. Please try again in a moment.",
            0,
            true
          )
        );
      }
      setPolling(false);
    }
  };

  useEffect(() => {
    checkStatus();
    if (!polling) return;

    const timer = setInterval(() => {
      checkStatus();
    }, 2000);

    return () => clearInterval(timer);
  }, [jobId, polling]);

  const steps = [
    { name: "Candidate Population Initialization", desc: "Construct initial valid spanning trees from site graph" },
    { name: "Topological Repair & Constraints Check", desc: "Cycle detection and root reachability enforcement" },
    { name: "Global Search Iteration", desc: "Encircling prey and position vector updates" },
    { name: "Convergence & Final Tree Extraction", desc: "Elitist selection and discrete navigation tree output" },
  ];

  return (
    <div className="space-y-6 max-w-3xl mx-auto py-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 font-mono">
            Job ID: {jobId}
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Website Structure Reform Execution
          </h1>
          <p className="text-xs text-slate-500">
            Real-time execution status reported by the WebReform optimization engine.
          </p>
        </div>
        <StatusBadge status={progress.status} size="md" />
      </div>

      {error && (
        <ErrorState
          title="Status Unreachable"
          message={error.message}
          isBackendOffline={error.isBackendUnavailable}
          onRetry={() => {
            setError(null);
            setPolling(true);
            checkStatus();
          }}
        />
      )}

      {/* Real Execution State Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-900">
                Status: {progress.status.replace("_", " ")}
              </span>
              <p className="text-xs text-slate-500">
                {progress.message || "Optimization task registered in backend queue."}
              </p>
            </div>
          </div>
          <button
            onClick={checkStatus}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-50 transition-colors"
            title="Refresh Status"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Real Metrics Grid if available */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-xs text-slate-500">Current Cycle</span>
            <div className="text-lg font-bold font-mono text-slate-900">
              {progress.currentIteration !== undefined ? progress.currentIteration : "-"}
              {progress.totalIterations ? ` / ${progress.totalIterations}` : ""}
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1">
            <span className="text-xs text-slate-500">Best Optimization Score</span>
            <div className="text-lg font-bold font-mono text-emerald-600">
              {progress.bestFitness !== undefined ? progress.bestFitness.toFixed(4) : "-"}
            </div>
          </div>
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-xs text-slate-500">Engine Mode</span>
            <div className="text-lg font-bold font-mono text-indigo-600">WebReform AI</div>
          </div>
        </div>

        {/* Phase Flow */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Reform Pipeline Phases
          </span>
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50"
              >
                <div className="mt-0.5 rounded-full p-1 bg-indigo-50 text-indigo-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900">{step.name}</span>
                  <p className="text-[11px] text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completed Action */}
        {progress.status === "COMPLETED" && (
          <div className="pt-2 flex justify-end">
            <Link
              to={`/optimize/results/${progress.runId || 1}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
            >
              View Optimization Results
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Back to Configuration */}
      <div className="flex justify-between items-center text-xs text-slate-500">
        <Link to="/optimize" className="hover:text-slate-800">
          &larr; Return to Optimization Configuration
        </Link>
        <Link to="/dashboard" className="hover:text-slate-800">
          Dashboard Overview
        </Link>
      </div>
    </div>
  );
};
