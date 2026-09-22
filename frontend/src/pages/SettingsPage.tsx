import React, { useState } from "react";
import {
  Sliders,
  Compass,
  Download,
  CheckCircle2,
  Save,
  RotateCcw,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const getStored = () => {
    try {
      const saved = localStorage.getItem("webreform_settings");
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  };

  const initial = getStored() || {};

  // Optimization Defaults
  const [targetClickDepth, setTargetClickDepth] = useState<number>(initial.targetClickDepth ?? 3);
  const [hierarchyStyle, setHierarchyStyle] = useState<string>(initial.hierarchyStyle ?? "balanced");
  const [maxChildrenPerNode, setMaxChildrenPerNode] = useState<number>(initial.maxChildrenPerNode ?? 7);

  // Crawler Preferences
  const [defaultMaxPages, setDefaultMaxPages] = useState<number>(initial.defaultMaxPages ?? 50);
  const [defaultScanDepth, setDefaultScanDepth] = useState<number>(initial.defaultScanDepth ?? 3);
  const [stripTrackingParams, setStripTrackingParams] = useState<boolean>(initial.stripTrackingParams ?? true);

  // Export Preferences
  const [defaultExportFormat, setDefaultExportFormat] = useState<string>(initial.defaultExportFormat ?? "csv");
  const [includeMetricsSummary, setIncludeMetricsSummary] = useState<boolean>(initial.includeMetricsSummary ?? true);

  // Save State
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = {
      targetClickDepth,
      hierarchyStyle,
      maxChildrenPerNode,
      defaultMaxPages,
      defaultScanDepth,
      stripTrackingParams,
      defaultExportFormat,
      includeMetricsSummary,
    };
    try {
      localStorage.setItem("webreform_settings", JSON.stringify(settings));
    } catch {}
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    try {
      localStorage.removeItem("webreform_settings");
    } catch {}
    setTargetClickDepth(3);
    setHierarchyStyle("balanced");
    setMaxChildrenPerNode(7);
    setDefaultMaxPages(50);
    setDefaultScanDepth(3);
    setStripTrackingParams(true);
    setDefaultExportFormat("csv");
    setIncludeMetricsSummary(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
          <p className="text-sm text-slate-500">
            Customize your default website crawling, structure reform rules, and export options.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span>Preferences Saved Successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Optimization Defaults */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Structure Reform Defaults</h2>
              <p className="text-xs text-slate-500">
                Baseline constraints applied when generating recommended website navigation structures.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Target Maximum Click Depth
              </label>
              <select
                value={targetClickDepth}
                onChange={(e) => setTargetClickDepth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={2}>2 Clicks (Ultra-flat / Small Sites)</option>
                <option value={3}>3 Clicks (Recommended for Most Sites)</option>
                <option value={4}>4 Clicks (Large Catalogs &amp; Portals)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                The algorithm prioritizes paths where visitors reach any page within this number of clicks.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Navigation Hierarchy Style
              </label>
              <select
                value={hierarchyStyle}
                onChange={(e) => setHierarchyStyle(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="balanced">Balanced (Optimal Breadth &amp; Depth)</option>
                <option value="flat">Flat (Prioritize Minimal Clicks)</option>
                <option value="deep">Structured (Group By Focused Categories)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Balances how broad menus are vs. how deep user journeys go.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Max Links per Category Menu
              </label>
              <input
                type="number"
                min={4}
                max={15}
                value={maxChildrenPerNode}
                onChange={(e) => setMaxChildrenPerNode(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Prevents crowded, overwhelming menus (recommended: 6 to 9 items).
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Crawler Preferences */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-cyan-50 text-cyan-600">
              <Compass className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Crawler &amp; Discovery Preferences</h2>
              <p className="text-xs text-slate-500">
                Controls how WebReform scans website URLs and internal links.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Default Max Pages per Crawl
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={defaultMaxPages}
                onChange={(e) => setDefaultMaxPages(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Limit total pages indexed during standard website crawls.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Default Crawl Depth
              </label>
              <input
                type="number"
                min={1}
                max={8}
                value={defaultScanDepth}
                onChange={(e) => setDefaultScanDepth(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">
                Number of link hops followed from the homepage.
              </p>
            </div>

            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={stripTrackingParams}
                  onChange={(e) => setStripTrackingParams(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 block">
                    Strip URL tracking parameters (?utm_*, ?ref=*, etc.)
                  </span>
                  <span className="text-xs text-slate-500">
                    Treats URLs with tracking tags as the canonical destination page to avoid duplicates.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Export & Reports */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Export &amp; Deliverables</h2>
              <p className="text-xs text-slate-500">
                Configure default download formats for site restructuring blueprints.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Preferred Export Format
              </label>
              <select
                value={defaultExportFormat}
                onChange={(e) => setDefaultExportFormat(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="csv">CSV (Spreadsheet / Site Architect Hand-off)</option>
                <option value="json">JSON (API &amp; CMS Import)</option>
              </select>
            </div>

            <div className="sm:col-span-2 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeMetricsSummary}
                  onChange={(e) => setIncludeMetricsSummary(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 bg-white text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <span className="text-sm font-medium text-slate-900 block">
                    Include click depth reduction summary in exports
                  </span>
                  <span className="text-xs text-slate-500">
                    Appends before-vs-after click distance stats into exported data files.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to Recommended Defaults</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-indigo-600 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
