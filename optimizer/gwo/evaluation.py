"""Comparative evaluation and statistical metrics between baseline and optimized website graphs."""

from dataclasses import dataclass
from typing import Dict, List, Set, Tuple
import networkx as nx
import numpy as np

from gwo.encoding import WebsiteStructure


@dataclass
class ComparisonReport:
    """Statistical summary comparing baseline and optimized website topologies."""

    num_pages: int
    baseline_anpl: float
    optimized_anpl: float
    anpl_improvement_percent: float
    baseline_max_depth: int
    optimized_max_depth: int
    depth_reduction: int
    edges_preserved: int
    edges_added: int
    edges_removed: int
    structural_similarity: float


class TopologyEvaluator:
    """Computes comparative graph and navigation metrics between original and GWO structures."""

    @staticmethod
    def compare(
        baseline_edges: Set[Tuple[int, int]],
        optimized_structure: WebsiteStructure,
        access_frequencies: np.ndarray,
    ) -> ComparisonReport:
        num_pages = optimized_structure.num_pages

        # Normalize traffic
        traffic = np.array(access_frequencies, dtype=np.float64)
        total_traffic = np.sum(traffic)
        weights = traffic / total_traffic if total_traffic > 0 else np.ones(num_pages) / num_pages

        # 1. Baseline Graph Metrics
        baseline_graph = nx.DiGraph()
        baseline_graph.add_nodes_from(range(num_pages))
        baseline_graph.add_edges_from(baseline_edges)

        baseline_depths = TopologyEvaluator._calculate_depths(baseline_graph, root=0, num_pages=num_pages)
        baseline_anpl = sum(weights[i] * baseline_depths[i] for i in range(1, num_pages))
        baseline_max_depth = max(baseline_depths.values()) if baseline_depths else 0

        # 2. Optimized Graph Metrics
        opt_depths = optimized_structure.depths
        opt_anpl = sum(weights[i] * opt_depths.get(i, 1) for i in range(1, num_pages))
        opt_max_depth = max(opt_depths.values()) if opt_depths else 0

        # 3. Improvement
        if baseline_anpl > 0:
            anpl_improvement = ((baseline_anpl - opt_anpl) / baseline_anpl) * 100.0
        else:
            anpl_improvement = 0.0

        depth_reduction = baseline_max_depth - opt_max_depth

        # 4. Structural Edge Changes
        opt_edges = set(optimized_structure.to_edge_list())
        preserved = len(baseline_edges & opt_edges)
        added = len(opt_edges - baseline_edges)
        removed = len(baseline_edges - opt_edges)

        union_count = len(baseline_edges | opt_edges)
        jaccard_similarity = preserved / union_count if union_count > 0 else 1.0

        return ComparisonReport(
            num_pages=num_pages,
            baseline_anpl=float(baseline_anpl),
            optimized_anpl=float(opt_anpl),
            anpl_improvement_percent=float(anpl_improvement),
            baseline_max_depth=int(baseline_max_depth),
            optimized_max_depth=int(opt_max_depth),
            depth_reduction=int(depth_reduction),
            edges_preserved=int(preserved),
            edges_added=int(added),
            edges_removed=int(removed),
            structural_similarity=float(jaccard_similarity),
        )

    @staticmethod
    def _calculate_depths(graph: nx.DiGraph, root: int, num_pages: int) -> Dict[int, int]:
        depths: Dict[int, int] = {root: 0}
        try:
            lengths = nx.single_source_shortest_path_length(graph, root)
            for node in range(num_pages):
                depths[node] = lengths.get(node, num_pages)  # Fallback high depth if unreachable
        except nx.NetworkXError:
            for node in range(num_pages):
                depths[node] = num_pages
        return depths
