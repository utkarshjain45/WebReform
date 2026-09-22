"""Unit tests for TopologyEvaluator comparative metrics."""

import numpy as np
import pytest

from gwo.encoding import WebsiteStructure
from gwo.evaluation import TopologyEvaluator


def test_topology_evaluator_comparison():
    num_pages = 4
    # Baseline chain: 0 -> 1 -> 2 -> 3
    baseline_edges = {(0, 1), (1, 2), (2, 3)}

    # Optimized structure: flat tree: 0 -> 1, 0 -> 2, 0 -> 3
    opt_structure = WebsiteStructure(
        num_pages=num_pages,
        parents={0: None, 1: 0, 2: 0, 3: 0},
    )

    traffic = np.array([100.0, 50.0, 50.0, 50.0])

    report = TopologyEvaluator.compare(
        baseline_edges=baseline_edges,
        optimized_structure=opt_structure,
        access_frequencies=traffic,
    )

    assert report.num_pages == 4
    assert report.baseline_max_depth == 3
    assert report.optimized_max_depth == 1
    assert report.depth_reduction == 2
    assert report.optimized_anpl < report.baseline_anpl
    assert report.anpl_improvement_percent > 0.0
    assert report.edges_preserved == 1  # edge (0, 1) was in both
    assert report.edges_added == 2      # (0, 2) and (0, 3) added
    assert report.edges_removed == 2    # (1, 2) and (2, 3) removed
