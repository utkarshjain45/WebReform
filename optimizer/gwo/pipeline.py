"""End-to-end optimization pipeline integrating discrete GWO, repair, and fitness evaluation."""

from dataclasses import dataclass, field
import time
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx
import numpy as np

from gwo.encoding import StructureEncoder, WebsiteStructure
from gwo.fitness import NavigationFitnessEvaluator
from gwo.gwo import GreyWolfOptimizer, GWOResult
from gwo.repair import StructureRepairer
from gwo.semantics import TfidfSemanticProvider


@dataclass
class OptimizationConfig:
    """Configurable hyperparameters and multi-objective weights for GWO."""

    population_size: int = 25
    iterations: int = 50
    max_depth: int = 3
    max_children: int = 6
    random_seed: Optional[int] = 42

    # Fitness objective weights
    weight_navigation: float = 0.35
    weight_behavior: float = 0.25
    weight_structural: float = 0.20
    weight_depth: float = 0.20
    weight_semantic: float = 1.0


class WebsiteOptimizationPipeline:
    """Orchestrates website graph ingestion, baseline modeling, discrete GWO search,

    topological repair, and final solution mapping.
    """

    def __init__(self, config: Optional[OptimizationConfig] = None):
        self.config = config or OptimizationConfig()

    def run(
        self,
        pages: List[Dict[str, Any]],
        links: List[Dict[str, Any]],
        critical_page_ids: Optional[List[int]] = None,
        user_transitions: Optional[np.ndarray] = None,
        root_page_id: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Executes the complete optimization pipeline on an ingested website graph.

        Args:
            pages: List of page dicts (must contain 'id'; optionally 'url', 'title', 'content', 'depth', 'access_frequency')
            links: List of link dicts (must contain 'source_id' and 'target_id' or 'source_page_id' and 'target_page_id')
            critical_page_ids: Optional list of external page IDs that must remain reachable within max_depth
            user_transitions: Optional NxN user transition matrix
            root_page_id: Optional ID of homepage/root node

        Returns:
            Dict containing bestStructure, initialFitness, finalFitness, improvementPercentage,
            convergence, iterations, executionTime, and fitnessBreakdown.
        """
        if not pages:
            raise ValueError("Pipeline requires at least 2 pages to optimize.")
        if len(pages) < 2:
            raise ValueError(f"Cannot optimize a website with only {len(pages)} page.")

        # 1. Determine Root and Index Mapping
        id_to_idx, idx_to_id, num_pages = self._create_index_mapping(pages, root_page_id)

        # 2. Map Critical Pages
        critical_indices: Set[int] = set()
        if critical_page_ids:
            for cid in critical_page_ids:
                if cid in id_to_idx:
                    critical_indices.add(id_to_idx[cid])

        # 3. Map Links and Extract Baseline Structure
        original_edges, original_structure = self._extract_original_topology(
            pages=pages,
            links=links,
            id_to_idx=id_to_idx,
            num_pages=num_pages,
        )

        # 4. Extract Traffic Weights and Text Corpus
        access_frequencies = np.ones(num_pages, dtype=np.float64)
        page_contents: Dict[int, str] = {}

        for p in pages:
            idx = id_to_idx[p["id"]]
            freq = p.get("access_frequency")
            if freq is not None and freq > 0:
                access_frequencies[idx] = float(freq)

            text_parts = [
                str(p.get("title") or ""),
                str(p.get("content") or ""),
            ]
            page_contents[idx] = " ".join(text_parts).strip()

        # 5. Initialize Pluggable Evaluator and Constraint Repairer
        fitness_evaluator = NavigationFitnessEvaluator(
            num_pages=num_pages,
            access_frequencies=access_frequencies,
            transition_matrix=user_transitions,
            original_structure=original_structure,
            original_edges=original_edges,
            page_contents=page_contents,
            w1_nav=self.config.weight_navigation,
            w2_beh=self.config.weight_behavior,
            w3_struct=self.config.weight_structural,
            w4_depth=self.config.weight_depth,
            w5_sem=self.config.weight_semantic,
            target_max_depth=self.config.max_depth,
            max_children_fanout=self.config.max_children,
        )

        repairer = StructureRepairer(
            max_depth=self.config.max_depth,
            max_fanout=self.config.max_children,
            critical_pages=critical_indices,
        )

        # 6. Instantiate GWO Engine with Random Seed
        optimizer = GreyWolfOptimizer(
            num_pages=num_pages,
            population_size=self.config.population_size,
            max_iterations=self.config.iterations,
            max_depth=self.config.max_depth,
            max_fanout=self.config.max_children,
            fitness_evaluator=fitness_evaluator,
            seed=self.config.random_seed,
        )
        optimizer.repairer = repairer

        # 7. Execute GWO Hunting Loop
        result: GWOResult = optimizer.optimize()

        # 8. Compute Improvement Percentage
        initial_f = float(result.initial_fitness)
        final_f = float(result.best_fitness)
        if initial_f > 0:
            improvement_pct = float(((initial_f - final_f) / initial_f) * 100.0)
        else:
            improvement_pct = 0.0

        # 9. Format Best Structure Mapping back to Original Page IDs
        best_sol: WebsiteStructure = result.best_solution

        # Verify final repair invariant
        best_repaired = repairer.repair(best_sol)

        best_parents: Dict[int, Optional[int]] = {}
        best_positions: Dict[int, int] = {}
        best_depths: Dict[int, int] = {}
        best_edges: List[List[int]] = []

        for idx in range(num_pages):
            orig_id = idx_to_id[idx]
            p_idx = best_repaired.parents.get(idx)
            best_parents[orig_id] = idx_to_id[p_idx] if p_idx is not None else None
            best_positions[orig_id] = int(best_repaired.positions.get(idx, 0))
            best_depths[orig_id] = int(best_repaired.depths.get(idx, 0))

        for u_idx, v_idx in best_repaired.to_edge_list():
            best_edges.append([idx_to_id[u_idx], idx_to_id[v_idx]])

        formatted_structure = {
            "numPages": num_pages,
            "parents": best_parents,
            "positions": best_positions,
            "depths": best_depths,
            "edges": best_edges,
        }

        # 10. Assemble Required Response Schema
        metrics = result.metrics
        breakdown = {
            "totalFitness": float(round(metrics.get("totalFitness", final_f), 4)),
            "navigationCost": float(round(metrics.get("navigationCost", 0.0), 4)),
            "behaviorCost": float(round(metrics.get("behaviorCost", 0.0), 4)),
            "structuralChangeCost": float(round(metrics.get("structuralChangeCost", 0.0), 4)),
            "depthPenalty": float(round(metrics.get("depthPenalty", 0.0), 4)),
            "semanticRelevance": float(round(metrics.get("semanticRelevance", 1.0), 4)),
        }

        return {
            "bestStructure": formatted_structure,
            "initialFitness": float(round(initial_f, 4)),
            "finalFitness": float(round(final_f, 4)),
            "improvementPercentage": float(round(improvement_pct, 2)),
            "convergence": [float(round(val, 4)) for val in result.convergence_history],
            "iterations": result.iteration_count,
            "executionTime": float(round(result.execution_time_sec, 4)),
            "fitnessBreakdown": breakdown,
        }

    @staticmethod
    def _create_index_mapping(
        pages: List[Dict[str, Any]], root_page_id: Optional[int]
    ) -> Tuple[Dict[int, int], Dict[int, int], int]:
        """Maps original external page IDs to dense 0..N-1 indices, ensuring root is 0."""
        # Find root candidate
        if root_page_id is not None and any(p["id"] == root_page_id for p in pages):
            actual_root_id = root_page_id
        else:
            # Lowest depth, or first page
            sorted_p = sorted(pages, key=lambda p: (p.get("depth", 999), p["id"]))
            actual_root_id = sorted_p[0]["id"]

        id_to_idx: Dict[int, int] = {actual_root_id: 0}
        idx_to_id: Dict[int, int] = {0: actual_root_id}

        curr_idx = 1
        for p in pages:
            pid = p["id"]
            if pid != actual_root_id:
                id_to_idx[pid] = curr_idx
                idx_to_id[curr_idx] = pid
                curr_idx += 1

        return id_to_idx, idx_to_id, len(pages)

    @staticmethod
    def _extract_original_topology(
        pages: List[Dict[str, Any]],
        links: List[Dict[str, Any]],
        id_to_idx: Dict[int, int],
        num_pages: int,
    ) -> Tuple[Set[Tuple[int, int]], WebsiteStructure]:
        """Constructs original edge set and baseline spanning tree structure."""
        original_edges: Set[Tuple[int, int]] = set()
        graph = nx.DiGraph()
        for i in range(num_pages):
            graph.add_node(i)

        for l in links:
            s_id = l.get("source_id") or l.get("source_page_id")
            t_id = l.get("target_id") or l.get("target_page_id")
            if s_id in id_to_idx and t_id in id_to_idx:
                u = id_to_idx[s_id]
                v = id_to_idx[t_id]
                if u != v:
                    original_edges.add((u, v))
                    graph.add_edge(u, v)

        # Baseline hierarchy via BFS from root (node 0)
        parents: Dict[int, Optional[int]] = {0: None}
        positions: Dict[int, int] = {}
        depths: Dict[int, int] = {0: 0}

        try:
            tree = nx.bfs_tree(graph, source=0)
            for child in range(1, num_pages):
                if child in tree:
                    preds = list(tree.predecessors(child))
                    parents[child] = preds[0] if preds else 0
                else:
                    parents[child] = 0
        except nx.NetworkXError:
            for child in range(1, num_pages):
                parents[child] = 0

        # Create baseline structure
        baseline_structure = WebsiteStructure(
            num_pages=num_pages,
            parents=parents,
            positions=positions,
        )

        return original_edges, baseline_structure
