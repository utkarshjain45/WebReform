/**
 * TypeScript Data Transfer Objects and Domain Types for WebReform.
 * Strictly aligned with Spring Boot backend entities and optimization outputs.
 */

export interface Website {
  id: number;
  name: string;
  baseUrl: string;
  createdAt: string;
  pageCount?: number;
  linkCount?: number;
  avgDepth?: number;
  status?: "IDLE" | "CRAWLING" | "ANALYZED" | "OPTIMIZING" | "COMPLETED" | "FAILED";
}

export interface CreateWebsiteRequest {
  name: string;
  baseUrl: string;
}

export interface Page {
  id: number;
  websiteId: number;
  url: string;
  title: string;
  content?: string;
  depth: number;
  loadTime?: number; // in milliseconds
}

export interface PageFeature {
  id: number;
  pageId: number;
  accessFrequency: number;
  uniqueVisitors: number;
  averageDuration: number;
  backlinkCount: number;
  hubScore: number;
  authorityScore: number;
}

export interface PageLink {
  id: number;
  sourcePageId: number;
  targetPageId: number;
}

export interface CrawlRequest {
  maxPages: number;
  maxDepth: number;
}

export interface CrawlJobResponse {
  jobId: string;
  websiteId: number;
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  pagesCrawled: number;
  linksDiscovered: number;
  startTime: string;
  endTime: string | null;
  errorMessage: string | null;
}

export interface FitnessWeights {
  navigation: number; // w_nav: Average path length
  behavior: number;   // w_beh: User traffic / access frequencies
  semantic: number;   // w_sem: Content similarity
  structural: number; // w_str: Preservation of original graph links
  depth: number;      // w_depth: Penalty for exceeding max allowed click depth
}

export interface OptimizationConfig {
  websiteId: number;
  populationSize: number;
  iterations: number;
  randomSeed?: number;
  maxDepth: number;
  maxChildren: number;
  weights: FitnessWeights;
}

export interface OptimizationRun {
  id: number;
  websiteId: number;
  websiteName?: string;
  algorithm: string; // "WebReform"
  populationSize: number;
  iterations: number;
  initialFitness: number;
  finalFitness: number;
  executionTime: number; // in seconds or milliseconds
  executionTimeMs?: number;
  improvementPercentage?: number;
  convergence?: number[];
  status: "SUBMITTED" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: string;
}

export interface ComparisonMetrics {
  baselineAnpl: number;
  optimizedAnpl: number;
  anplImprovementPercent: number;
  baselineMaxDepth: number;
  optimizedMaxDepth: number;
  depthReduction: number;
  edgesPreserved: number;
  edgesAdded: number;
  edgesRemoved: number;
  structuralSimilarity: number;
}

export interface OptimizationResult {
  runId: number;
  websiteId: number;
  websiteName: string;
  bestFitness: number;
  initialFitness: number;
  improvementPercent: number;
  runtimeSeconds: number;
  iterations: number;
  populationSize: number;
  convergenceHistory: number[];
  metrics: ComparisonMetrics;
  weightsUsed: FitnessWeights;
  optimizedPages: {
    pageId: number;
    url: string;
    title: string;
    parentPageId: number | null;
    parentUrl?: string;
    position: number;
    depth: number;
  }[];
}

export interface ExperimentSummary {
  id: number;
  suiteType: "POPULATION_SIZE" | "ITERATIONS" | "WEBSITE_SIZE" | "RANDOM_SEEDS" | string;
  name: string;
  description: string;
  websiteId: number | null;
  websiteName: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  totalRuns: number;
  bestFitness: number | null;
  meanFitness: number | null;
  meanImprovementPercentage: number | null;
  meanExecutionTimeMs: number | null;
  createdAt: string;
}

export interface ExperimentStats {
  meanFitness: number;
  stdDevFitness: number;
  bestFitness: number;
  worstFitness: number;
  meanImprovementPercentage: number;
  meanExecutionTimeMs: number;
  stdDevExecutionTimeMs: number;
  totalRunsCompleted: number;
}

export interface ExperimentRunItem {
  id: number;
  experimentId: number;
  runLabel: string;
  paramName: string;
  paramValue: number;
  populationSize: number;
  iterations: number;
  randomSeed: number;
  numPages: number;
  initialFitness: number | null;
  finalFitness: number | null;
  improvementPercentage: number | null;
  executionTimeMs: number | null;
  avgDepth: number | null;
  maxDepth: number | null;
  convergence: number[];
  fitnessBreakdown: Record<string, number>;
  createdAt: string;
}

export interface ExperimentDetails {
  id: number;
  suiteType: string;
  name: string;
  description: string;
  websiteId: number | null;
  websiteName: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  stats: ExperimentStats;
  runs: ExperimentRunItem[];
  createdAt: string;
}

export interface CreateExperimentRequest {
  suiteType: "POPULATION_SIZE" | "ITERATIONS" | "WEBSITE_SIZE" | "RANDOM_SEEDS" | string;
  websiteId?: number;
  name?: string;
  description?: string;
  basePopulationSize?: number;
  baseIterations?: number;
  baseSeed?: number;
}

// Backward compatibility alias
export type Experiment = ExperimentSummary;

export interface SystemHealth {
  backend: boolean;
  database: boolean;
  optimizer: boolean;
  activeJobs: number;
}

// --- Graph Analysis Interfaces ---

export interface GraphStatistics {
  num_pages: number;
  num_links: number;
  density: number;
  avg_depth: number;
  max_depth: number;
  dead_end_count: number;
  orphan_count: number;
  avg_in_degree: number;
  avg_out_degree: number;
  average_path_length: number | null;
  is_strongly_connected: boolean;
  connected_components: number;
}

export interface PageLevelMetric {
  page_id: number;
  url: string;
  in_degree: number;
  out_degree: number;
  depth_from_root: number | null;
  is_dead_end: boolean;
  is_orphan: boolean;
  is_reachable_from_root: boolean;
  hub_score: number;
  authority_score: number;
  pagerank: number;
}

export interface GraphAnalysisData {
  graph_statistics: GraphStatistics;
  page_level_metrics: PageLevelMetric[];
  disclaimer: string;
}

// --- Live Optimization Integration Interfaces ---

export interface RunOptimizationRequest {
  websiteId: number;
  populationSize?: number;
  iterations?: number;
  randomSeed?: number;
  maxDepth?: number;
  maxChildren?: number;
  weights?: FitnessWeights;
}

export interface OptimizedNode {
  pageId: number;
  url: string;
  title: string;
  parentPageId: number | null;
  parentUrl: string | null;
  position: number;
  depth: number;
}

export interface OptimizationResultDetails {
  id: number;
  websiteId: number;
  status: "RUNNING" | "COMPLETED" | "FAILED";
  initialFitness: number;
  finalFitness: number;
  improvementPercentage: number;
  executionTimeMs: number;
  bestStructure: OptimizedNode[];
  fitnessBreakdown: {
    totalFitness?: number;
    navigationCost?: number;
    behaviorCost?: number;
    structuralChangeCost?: number;
    depthPenalty?: number;
    semanticRelevance?: number;
    [key: string]: number | undefined;
  };
  convergence: number[];
}
