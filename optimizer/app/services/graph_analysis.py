"""NetworkX-based website graph construction and topological analysis service."""

from typing import Dict, List, Optional, Set, Tuple
import networkx as nx
import numpy as np

from app.models.graph import (
    GraphAnalysisRequest,
    GraphAnalysisResponse,
    GraphStatistics,
    PageLevelMetrics,
)


class WebsiteGraphAnalyzer:
    """Builds and analyzes directed graph representation G = (V, E) of website pages and links."""

    @staticmethod
    def analyze(request: GraphAnalysisRequest) -> GraphAnalysisResponse:
        pages = request.pages
        links = request.links

        if not pages:
            raise ValueError("Cannot analyze an empty graph: pages list must not be empty.")

        # 1. Construct NetworkX Directed Graph G = (V, E)
        graph = nx.DiGraph()
        page_dict: Dict[int, str] = {}

        for p in pages:
            graph.add_node(
                p.id,
                url=p.url,
                title=p.title or "",
                depth=p.depth if p.depth is not None else 0,
                access_frequency=p.access_frequency or 1.0,
            )
            page_dict[p.id] = p.url

        for link in links:
            # Only add internal edges where both source and target exist in the page vertex set
            if link.source_page_id in graph and link.target_page_id in graph:
                graph.add_edge(link.source_page_id, link.target_page_id)

        num_pages = graph.number_of_nodes()
        num_links = graph.number_of_edges()

        # 2. Determine Homepage / Root Node
        if request.root_page_id is not None and request.root_page_id in graph:
            root_id = request.root_page_id
        else:
            # Default root: node with lowest depth, or first page
            candidates = sorted(pages, key=lambda p: (p.depth if p.depth is not None else 999, p.id))
            root_id = candidates[0].id

        # 3. In-Degrees and Out-Degrees
        in_degrees: Dict[int, int] = dict(graph.in_degree())
        out_degrees: Dict[int, int] = dict(graph.out_degree())

        avg_in_degree = float(np.mean(list(in_degrees.values()))) if in_degrees else 0.0
        avg_out_degree = float(np.mean(list(out_degrees.values()))) if out_degrees else 0.0

        # 4. Shortest Paths from Root
        depths_from_root: Dict[int, int] = {}
        try:
            depths_from_root = nx.single_source_shortest_path_length(graph, root_id)
        except nx.NetworkXError:
            depths_from_root = {root_id: 0}

        # 5. Dead-ends and Orphans
        # Dead-end: out-degree == 0 (no outgoing internal links)
        dead_ends: Set[int] = {node for node, out_deg in out_degrees.items() if out_deg == 0}

        # Orphan: in-degree == 0 (except root) OR unreachable from root
        orphans: Set[int] = set()
        for node in graph.nodes():
            if node != root_id:
                if in_degrees.get(node, 0) == 0 or node not in depths_from_root:
                    orphans.add(node)

        # Average Depth from Root (for reachable subpages)
        reachable_non_root = [depths_from_root[n] for n in depths_from_root if n != root_id]
        avg_depth = float(np.mean(reachable_non_root)) if reachable_non_root else 0.0
        max_depth = int(max(depths_from_root.values())) if depths_from_root else 0

        # 6. Average Shortest Path Length (Across all reachable ordered pairs)
        all_pairs_lengths: List[int] = []
        for source, targets in nx.all_pairs_shortest_path_length(graph):
            for target, length in targets.items():
                if source != target:
                    all_pairs_lengths.append(length)

        avg_path_length = (
            float(np.mean(all_pairs_lengths)) if all_pairs_lengths else None
        )

        # 7. Kleinberg HITS Centrality (Hub & Authority Scores)
        hub_scores: Dict[int, float] = {}
        authority_scores: Dict[int, float] = {}

        if num_links > 0:
            try:
                hub_scores, authority_scores = nx.hits(
                    graph, max_iter=500, tol=1e-8, normalized=True
                )
            except (nx.PowerIterationFailedConvergence, ZeroDivisionError):
                # Fallback to degree-based normalized scores if power iteration diverges
                total_out = max(1, sum(out_degrees.values()))
                total_in = max(1, sum(in_degrees.values()))
                hub_scores = {n: out_degrees[n] / total_out for n in graph.nodes()}
                authority_scores = {n: in_degrees[n] / total_in for n in graph.nodes()}
        else:
            uniform = 1.0 / max(1, num_pages)
            hub_scores = {n: uniform for n in graph.nodes()}
            authority_scores = {n: uniform for n in graph.nodes()}

        # 8. PageRank Structural Prestige
        try:
            pagerank_scores = nx.pagerank(graph, alpha=0.85, max_iter=500)
        except (nx.PowerIterationFailedConvergence, ZeroDivisionError):
            uniform = 1.0 / max(1, num_pages)
            pagerank_scores = {n: uniform for n in graph.nodes()}

        # 9. Global Topology Statistics
        density = float(nx.density(graph))
        is_strongly_connected = bool(nx.is_strongly_connected(graph)) if num_pages > 1 else True
        connected_components = nx.number_weakly_connected_components(graph)

        stats = GraphStatistics(
            num_pages=num_pages,
            num_links=num_links,
            density=density,
            avg_depth=float(round(avg_depth, 3)),
            max_depth=max_depth,
            dead_end_count=len(dead_ends),
            orphan_count=len(orphans),
            avg_in_degree=float(round(avg_in_degree, 3)),
            avg_out_degree=float(round(avg_out_degree, 3)),
            average_path_length=float(round(avg_path_length, 3)) if avg_path_length is not None else None,
            is_strongly_connected=is_strongly_connected,
            connected_components=connected_components,
        )

        # 10. Per-Page Node Metrics
        page_metrics: List[PageLevelMetrics] = []
        for p in pages:
            p_id = p.id
            page_metrics.append(
                PageLevelMetrics(
                    page_id=p_id,
                    url=p.url,
                    in_degree=in_degrees.get(p_id, 0),
                    out_degree=out_degrees.get(p_id, 0),
                    depth_from_root=depths_from_root.get(p_id),
                    is_dead_end=(p_id in dead_ends),
                    is_orphan=(p_id in orphans),
                    is_reachable_from_root=(p_id in depths_from_root),
                    hub_score=float(hub_scores.get(p_id, 0.0)),
                    authority_score=float(authority_scores.get(p_id, 0.0)),
                    pagerank=float(pagerank_scores.get(p_id, 0.0)),
                )
            )

        return GraphAnalysisResponse(
            graph_statistics=stats,
            page_level_metrics=page_metrics,
        )
