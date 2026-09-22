"""Research fitness evaluation function for candidate website navigation structures."""

from typing import Dict, List, Optional, Set, Tuple
import numpy as np

from gwo.encoding import WebsiteStructure
from gwo.semantics import DefaultSemanticProvider, SemanticSimilarityProvider, TfidfSemanticProvider


class NavigationFitnessEvaluator:
    """Multi-objective research fitness evaluation for website structure optimization.

    Fitness formulation:
        F = (w1 * navigationCost + w2 * behaviorCost + w3 * structuralChangeCost + w4 * depthPenalty)
            ------------------------------------------------------------------------------------------
                                      max(epsilon, w5 * semanticRelevance)

    All individual components are normalized into [0.0, 1.0]. Lower totalFitness is better.
    """

    def __init__(
        self,
        num_pages: int,
        access_frequencies: Optional[np.ndarray] = None,
        transition_matrix: Optional[np.ndarray] = None,
        original_structure: Optional[WebsiteStructure] = None,
        original_edges: Optional[Set[Tuple[int, int]]] = None,
        semantic_provider: Optional[SemanticSimilarityProvider] = None,
        page_contents: Optional[Dict[int, str]] = None,
        w1_nav: float = 0.35,
        w2_beh: float = 0.25,
        w3_struct: float = 0.20,
        w4_depth: float = 0.20,
        w5_sem: float = 1.0,
        target_max_depth: int = 3,
        max_children_fanout: int = 8,
        epsilon: float = 1e-4,
    ):
        if num_pages < 2:
            raise ValueError("Fitness evaluation requires at least 2 pages.")

        self.num_pages = num_pages
        self.w1 = w1_nav
        self.w2 = w2_beh
        self.w3 = w3_struct
        self.w4 = w4_depth
        self.w5 = w5_sem
        self.target_max_depth = max(1, target_max_depth)
        self.max_children_fanout = max(1, max_children_fanout)
        self.epsilon = epsilon

        # 1. Page Access Frequencies (Traffic Weights)
        if access_frequencies is None:
            self.access_frequencies = np.ones(num_pages, dtype=np.float64)
        else:
            self.access_frequencies = np.array(access_frequencies, dtype=np.float64)
            if len(self.access_frequencies) != num_pages:
                raise ValueError(f"access_frequencies length must match num_pages ({num_pages})")

        # Normalize traffic weights across non-root pages
        subpage_traffic = self.access_frequencies[1:]
        traffic_sum = np.sum(subpage_traffic)
        if traffic_sum > 0:
            self.traffic_weights = subpage_traffic / traffic_sum
        else:
            self.traffic_weights = np.ones(num_pages - 1) / (num_pages - 1)

        # 2. User Navigation Transitions Matrix (Behavior)
        if transition_matrix is not None:
            self.transition_matrix = np.array(transition_matrix, dtype=np.float64)
            if self.transition_matrix.shape != (num_pages, num_pages):
                raise ValueError(f"transition_matrix must be square of shape ({num_pages}, {num_pages})")
            self.total_transitions = float(np.sum(self.transition_matrix))
        else:
            self.transition_matrix = None
            self.total_transitions = 0.0

        # 3. Baseline Original Structure & Link Edges
        self.original_structure = original_structure
        if original_edges is not None:
            self.original_edges = original_edges
        elif original_structure is not None:
            self.original_edges = set(original_structure.to_edge_list())
        else:
            self.original_edges = set()

        # 4. Semantic Similarity Provider
        if semantic_provider is not None:
            self.semantic_provider = semantic_provider
        elif page_contents is not None:
            self.semantic_provider = TfidfSemanticProvider(page_contents, num_pages)
        else:
            self.semantic_provider = DefaultSemanticProvider(num_pages)

    def evaluate(self, structure: WebsiteStructure) -> Tuple[float, Dict[str, float]]:
        """Evaluates candidate website structure and returns (totalFitness, breakdown_dict)."""
        # Component 1: Navigation Cost in [0.0, 1.0]
        nav_cost = self._compute_navigation_cost(structure)

        # Component 2: Behavioral Cost in [0.0, 1.0]
        beh_cost = self._compute_behavioral_cost(structure)

        # Component 3: Structural Change Cost in [0.0, 1.0]
        struct_cost = self._compute_structural_change_cost(structure)

        # Component 4: Depth & Breadth Penalty in [0.0, 1.0]
        depth_penalty = self._compute_depth_and_breadth_penalty(structure)

        # Component 5: Semantic Relevance in [0.0, 1.0]
        sem_relevance = self.semantic_provider.compute_hierarchy_relevance(structure)
        sem_relevance = float(np.clip(sem_relevance, 0.0, 1.0))

        # Composite Research Fitness:
        # F = (w1*C_nav + w2*C_beh + w3*C_struct + w4*P_depth) / max(epsilon, w5 * S_sem)
        numerator = (
            self.w1 * nav_cost
            + self.w2 * beh_cost
            + self.w3 * struct_cost
            + self.w4 * depth_penalty
        )
        denominator = max(self.epsilon, self.w5 * sem_relevance)
        total_fitness = float(numerator / denominator)

        metrics = {
            "totalFitness": total_fitness,
            "navigationCost": nav_cost,
            "behaviorCost": beh_cost,
            "structuralChangeCost": struct_cost,
            "depthPenalty": depth_penalty,
            "semanticRelevance": sem_relevance,
        }

        return total_fitness, metrics

    def _compute_navigation_cost(self, structure: WebsiteStructure) -> float:
        """Expected click depth from homepage weighted by page access frequency."""
        # Depths of non-root pages
        depths = [structure.depths.get(node, 1) for node in range(1, self.num_pages)]
        weighted_depth = float(np.sum(self.traffic_weights * depths))

        # Normalized by target max depth
        norm_nav = weighted_depth / float(self.target_max_depth)
        return float(np.clip(norm_nav, 0.0, 1.0))

    def _compute_behavioral_cost(self, structure: WebsiteStructure) -> float:
        """Evaluates navigation friction along frequent user session transitions."""
        if self.transition_matrix is None or self.total_transitions == 0.0:
            return 0.0

        # In a hierarchy tree, shortest path distance between node u and v is:
        # d(u, v) = depth(u) + depth(v) - 2 * depth(LCA(u, v))
        weighted_distance = 0.0
        for u in range(self.num_pages):
            for v in range(self.num_pages):
                freq = self.transition_matrix[u, v]
                if freq > 0 and u != v:
                    dist = self._tree_distance(structure, u, v)
                    weighted_distance += freq * dist

        # Maximum possible path length between any two nodes in tree of depth target_max_depth is 2 * target_max_depth
        max_possible = self.total_transitions * (2.0 * self.target_max_depth)
        norm_beh = weighted_distance / max_possible if max_possible > 0 else 0.0
        return float(np.clip(norm_beh, 0.0, 1.0))

    def _compute_structural_change_cost(self, structure: WebsiteStructure) -> float:
        """Penalizes deviation from baseline original parent assignments and links."""
        if self.original_structure is None and not self.original_edges:
            return 0.0

        num_subpages = self.num_pages - 1
        parent_changes = 0
        position_changes = 0.0

        if self.original_structure is not None:
            for i in range(1, self.num_pages):
                if structure.parents.get(i) != self.original_structure.parents.get(i):
                    parent_changes += 1

                orig_pos = self.original_structure.positions.get(i, 0)
                curr_pos = structure.positions.get(i, 0)
                position_changes += abs(curr_pos - orig_pos) / float(self.max_children_fanout)

            parent_change_ratio = parent_changes / float(num_subpages)
            pos_change_ratio = min(1.0, position_changes / float(num_subpages))
        else:
            parent_change_ratio = 0.0
            pos_change_ratio = 0.0

        # Link edge churn
        candidate_edges = set(structure.to_edge_list())
        if self.original_edges:
            diff_edges = len(candidate_edges - self.original_edges) + 0.5 * len(self.original_edges - candidate_edges)
            edge_churn_ratio = min(1.0, diff_edges / float(max(1, len(self.original_edges))))
        else:
            edge_churn_ratio = 0.0

        composite = 0.5 * parent_change_ratio + 0.25 * pos_change_ratio + 0.25 * edge_churn_ratio
        return float(np.clip(composite, 0.0, 1.0))

    def _compute_depth_and_breadth_penalty(self, structure: WebsiteStructure) -> float:
        """Penalizes excessive click depths and menu child fanout exceeding cognitive limits."""
        # 1. Depth Penalty
        max_observed_depth = max(structure.depths.values()) if structure.depths else 0
        excess_depth = max(0, max_observed_depth - self.target_max_depth)
        norm_depth_penalty = min(1.0, excess_depth / float(self.target_max_depth))

        # 2. Menu Breadth Constraint
        excess_breadth = 0
        for parent in range(self.num_pages):
            kids_count = len(structure.get_children(parent))
            if kids_count > self.max_children_fanout:
                excess_breadth += (kids_count - self.max_children_fanout)

        norm_breadth_penalty = min(1.0, excess_breadth / float(self.num_pages))

        # Combined penalty in [0.0, 1.0]
        penalty = 0.6 * norm_depth_penalty + 0.4 * norm_breadth_penalty
        return float(np.clip(penalty, 0.0, 1.0))

    def _tree_distance(self, structure: WebsiteStructure, u: int, v: int) -> int:
        """Computes shortest path distance between nodes u and v in the directed tree hierarchy."""
        if u == v:
            return 0

        # Collect ancestors of u
        ancestors_u: Dict[int, int] = {}
        curr = u
        dist = 0
        while curr is not None:
            ancestors_u[curr] = dist
            curr = structure.parents.get(curr)
            dist += 1

        # Climb from v until lowest common ancestor (LCA) is encountered
        curr_v = v
        dist_v = 0
        while curr_v is not None:
            if curr_v in ancestors_u:
                return ancestors_u[curr_v] + dist_v
            curr_v = structure.parents.get(curr_v)
            dist_v += 1

        # Fallback if disconnected
        return structure.depths.get(u, 1) + structure.depths.get(v, 1)
