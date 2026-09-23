import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LandingPage } from "@/pages/LandingPage";
import { ResearchPage } from "@/pages/ResearchPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { WebsitesPage } from "@/pages/WebsitesPage";
import { WebsiteDetailsPage } from "@/pages/WebsiteDetailsPage";
import { WebsiteAnalysisPage } from "@/pages/WebsiteAnalysisPage";
import { OptimizationPage } from "@/pages/OptimizationPage";
import { OptimizationProgressPage } from "@/pages/OptimizationProgressPage";
import { OptimizationResultsPage } from "@/pages/OptimizationResultsPage";
import { ExperimentsPage } from "@/pages/ExperimentsPage";
import { ExperimentDetailsPage } from "@/pages/ExperimentDetailsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
    errorElement: <NotFoundPage />,
  },
  {
    path: "/research",
    element: <ResearchPage />,
    errorElement: <NotFoundPage />,
  },
  {
    element: <AppShell />,
    errorElement: <NotFoundPage />,
    children: [
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "app",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "websites",
        element: <WebsitesPage />,
      },
      {
        path: "websites/:id",
        element: <WebsiteDetailsPage />,
      },
      {
        path: "websites/:id/analysis",
        element: <WebsiteAnalysisPage />,
      },
      {
        path: "optimize",
        element: <OptimizationPage />,
      },
      {
        path: "optimize/progress/:jobId",
        element: <OptimizationProgressPage />,
      },
      {
        path: "optimize/results/:runId",
        element: <OptimizationResultsPage />,
      },
      {
        path: "results/:runId",
        element: <OptimizationResultsPage />,
      },
      {
        path: "optimizations/:runId",
        element: <OptimizationResultsPage />,
      },
      {
        path: "experiments",
        element: <ExperimentsPage />,
      },
      {
        path: "experiments/:id",
        element: <ExperimentDetailsPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "architecture",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "docs",
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
