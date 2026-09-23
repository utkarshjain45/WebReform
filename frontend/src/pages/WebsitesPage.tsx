import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Globe,
  Plus,
  RefreshCw,
  ExternalLink,
  BarChart2,
  Sliders,
  X,
  FileText,
  Trash2,
  Sparkles,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Website, Page, OptimizationRun } from "@/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAccessGuard } from "@/context/AccessGuardContext";

export const WebsitesPage: React.FC = () => {
  const { requireAccess } = useAccessGuard();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websitePages, setWebsitePages] = useState<Record<number, Page[]>>({});
  const [runs, setRuns] = useState<OptimizationRun[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [newSiteName, setNewSiteName] = useState<string>("");
  const [newSiteUrl, setNewSiteUrl] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteModalWebsite, setDeleteModalWebsite] = useState<{ id: number; name: string } | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchWebsites = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, optRuns] = await Promise.all([
        api.getWebsites(),
        api.getOptimizationRuns().catch(() => [] as OptimizationRun[]),
      ]);
      setWebsites(data);
      setRuns(optRuns);

      // Fetch pages for each website asynchronously to compute real stats
      const pagesMap: Record<number, Page[]> = {};
      for (const site of data) {
        try {
          const pages = await api.getWebsitePages(site.id);
          pagesMap[site.id] = pages;
        } catch {
          pagesMap[site.id] = [];
        }
      }
      setWebsitePages(pagesMap);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err);
      } else {
        setError(new ApiError("Failed to fetch websites repository."));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleCreateWebsite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName.trim() || !newSiteUrl.trim()) {
      setModalError("Please provide both website name and valid HTTP/HTTPS base URL.");
      return;
    }

    try {
      const url = new URL(newSiteUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        setModalError("URL must begin with http:// or https://");
        return;
      }
    } catch {
      setModalError("Invalid URL format. Example: https://example.com");
      return;
    }

    requireAccess(async () => {
      setSubmitting(true);
      setModalError(null);
      try {
        await api.createWebsite({
          name: newSiteName.trim(),
          baseUrl: newSiteUrl.trim(),
        });
        setIsModalOpen(false);
        setNewSiteName("");
        setNewSiteUrl("");
        await fetchWebsites();
      } catch (err) {
        if (err instanceof ApiError) {
          setModalError(err.message);
        } else {
          setModalError("Failed to register website.");
        }
      } finally {
        setSubmitting(false);
      }
    });
  };

  const openDeleteModal = (id: number, name: string) => {
    setDeleteError(null);
    setDeleteModalWebsite({ id, name });
  };

  const confirmDeleteWebsite = () => {
    if (!deleteModalWebsite) return;
    const { id } = deleteModalWebsite;
    requireAccess(async () => {
      setDeletingId(id);
      setDeleteError(null);
      try {
        await api.deleteWebsite(id);
        // Optimistically remove from state immediately
        setWebsites((prev) => prev.filter((w) => w.id !== id));
        setDeleteModalWebsite(null);
        // Sync full state in background
        await fetchWebsites();
      } catch (err) {
        console.error("Failed to delete website:", err);
        setDeleteError(err instanceof Error ? err.message : "Failed to delete website. Please try again.");
      } finally {
        setDeletingId(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Target Websites</h1>
          <p className="text-sm text-slate-500">
            Registered domain targets, graph page topologies, and click depths.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchWebsites}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Target Website
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <ErrorState
          title={error.isBackendUnavailable ? "Backend Offline" : "Repository Error"}
          message={error.message}
          isBackendOffline={error.isBackendUnavailable}
          onRetry={fetchWebsites}
        />
      )}

      {/* Websites Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {loading ? (
          <LoadingState message="Loading websites and topological records..." rows={4} />
        ) : websites.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-3">
            <Globe className="w-12 h-12 mx-auto text-slate-400" />
            <h3 className="text-base font-semibold text-slate-900">No Target Websites Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your first website to initiate crawling, extract internal hyperlinks, and prepare
              for automated navigation restructuring.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Website Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 bg-slate-50/50">
                  <th className="py-3 px-3 font-medium">Website Target</th>
                  <th className="py-3 px-3 font-medium">Pages</th>
                  <th className="py-3 px-3 font-medium">Avg Depth</th>
                  <th className="py-3 px-3 font-medium">Status</th>
                  <th className="py-3 px-3 font-medium">Registered</th>
                  <th className="py-3 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {websites.map((site) => {
                  const pages = websitePages[site.id] || [];
                  const pageCount = pages.length;
                  const avgDepth =
                    pageCount > 0
                      ? (pages.reduce((acc, p) => acc + p.depth, 0) / pageCount).toFixed(1)
                      : "0.0";
                  const status = pageCount > 0 ? "ANALYZED" : "IDLE";
                  const siteLatestRun = runs.find((r) => r.websiteId === site.id && r.status === "COMPLETED");

                  return (
                    <tr key={site.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-3 font-medium text-slate-900">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-semibold text-slate-900">{site.name}</span>
                          <a
                            href={site.baseUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-xs text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                          >
                            {site.baseUrl}
                            <ExternalLink className="w-3 h-3 opacity-60" />
                          </a>
                        </div>
                      </td>
                      <td className="py-4 px-3">
                        <span className="inline-flex items-center gap-1 font-mono text-slate-700">
                          <FileText className="w-3 h-3 text-slate-400" />
                          {pageCount}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-mono text-slate-700">
                        {avgDepth}
                      </td>
                      <td className="py-4 px-3">
                        <StatusBadge status={status} size="sm" />
                      </td>
                      <td className="py-4 px-3 text-slate-500">
                        {new Date(site.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          {siteLatestRun && (
                            <Link
                              to={`/optimize/results/${siteLatestRun.id}`}
                              className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                              title="View latest reform results and tree"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                              Results
                            </Link>
                          )}
                          <Link
                            to={`/websites/${site.id}`}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="View crawled pages and structure"
                          >
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            Details
                          </Link>
                          <Link
                            to={`/websites/${site.id}/analysis`}
                            className="inline-flex items-center gap-1 rounded border border-indigo-100 bg-indigo-50/50 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50 transition-colors"
                            title="Analyze depth and topology"
                          >
                            <BarChart2 className="w-3.5 h-3.5" />
                            Analysis
                          </Link>
                          <Link
                            to={`/optimize?websiteId=${site.id}`}
                            className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shadow-sm"
                            title="Run Structure Reform"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            Reform
                          </Link>
                          <button
                            onClick={() => openDeleteModal(site.id, site.name)}
                            disabled={deletingId === site.id}
                            className="inline-flex items-center gap-1 rounded border border-rose-200 bg-rose-50/60 px-2 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors disabled:opacity-50 cursor-pointer"
                            title="Delete Website"
                          >
                            {deletingId === site.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Website Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-600" />
                Register Target Website
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateWebsite} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Website Name</label>
                <input
                  type="text"
                  placeholder="e.g. Books Benchmark or Academic Portal"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Base URL</label>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={newSiteUrl}
                  onChange={(e) => setNewSiteUrl(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
                  required
                />
                <p className="text-[11px] text-slate-500">
                  Must be public HTTP/HTTPS URL. Localhost and private subnets are blocked by SSRF filters.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-sm"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Register Website
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalWebsite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl border border-rose-100 bg-white p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <Trash2 className="w-4 h-4" />
                </div>
                Delete Target Website
              </h2>
              <button
                onClick={() => setDeleteModalWebsite(null)}
                disabled={deletingId !== null}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <p className="text-sm text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-slate-900">
                &ldquo;{deleteModalWebsite.name}&rdquo;
              </span>
              ? All crawled pages, link topology graphs, and navigation reform runs for this website will be removed permanently.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalWebsite(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteWebsite}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-lg bg-rose-600 text-xs font-semibold text-white hover:bg-rose-500 transition-colors disabled:opacity-50 inline-flex items-center gap-2 shadow-sm cursor-pointer"
              >
                {deletingId !== null && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {deletingId !== null ? "Deleting..." : "Delete Website"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
