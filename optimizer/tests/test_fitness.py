"""Unit tests for the research fitness evaluation function with manually calculable examples."""

import numpy as np
import pytest
from gwo.encoding import WebsiteStructure
from gwo.fitness import NavigationFitnessEvaluator
from gwo.semantics import TfidfSemanticProvider


def test_navigation_cost_manual_calculation():
    """Verifies navigation cost against manual calculation:

    N = 4 pages (0: root, 1, 2, 3)
    Subpage access frequencies: [1, 2, 1] -> weights: [0.25, 0.50, 0.25]
    Structure 1: 0 -> 1 -> 2 -> 3 (depths: 1: 1, 2: 2, 3: 3)
      Weighted depth = 0.25*1 + 0.50*2 + 0.25*3 = 2.0
      target_max_depth = 4.0
      Expected C_nav = 2.0 / 4.0 = 0.50
    """
    evaluator = NavigationFitnessEvaluator(
        num_pages=4,
        access_frequencies=np.array([10.0, 1.0, 2.0, 1.0]),
        target_max_depth=4,
    )

    s1 = WebsiteStructure(
        num_pages=4,
        parents={1: 0, 2: 1, 3: 2},
        positions={1: 0, 2: 0, 3: 0},
        depths={0: 0, 1: 1, 2: 2, 3: 3},
    )

    _, metrics = evaluator.evaluate(s1)
    assert metrics["navigationCost"] == pytest.approx(0.50, abs=1e-3)

    # Flat structure: 0 -> 1, 0 -> 2, 0 -> 3 (all depth 1)
    # Expected weighted depth = 1.0, C_nav = 1.0 / 4.0 = 0.25
    s_flat = WebsiteStructure(
        num_pages=4,
        parents={1: 0, 2: 0, 3: 0},
        positions={1: 0, 2: 1, 3: 2},
        depths={0: 0, 1: 1, 2: 1, 3: 1},
    )

    _, metrics_flat = evaluator.evaluate(s_flat)
    assert metrics_flat["navigationCost"] == pytest.approx(0.25, abs=1e-3)
    assert metrics_flat["navigationCost"] < metrics["navigationCost"]


def test_behavioral_cost_manual_calculation():
    """Verifies behavioral cost with user session transition frequencies:

    3 pages (0, 1, 2).
    Transitions: 10 transitions from page 1 to page 2.
    target_max_depth = 2. Max possible path = 2 * 2 = 4. Total = 10 * 4 = 40.

    Structure A: 0 -> 1, 0 -> 2.
      LCA(1, 2) is 0. Path distance = 1 + 1 - 0 = 2.
      Total distance = 10 * 2 = 20.
      Expected C_beh = 20 / 40 = 0.50.

    Structure B: 0 -> 1 -> 2.
      LCA(1, 2) is 1. Path distance = 1 + 2 - 2(1) = 1.
      Total distance = 10 * 1 = 10.
      Expected C_beh = 10 / 40 = 0.25.
    """
    transitions = np.zeros((3, 3))
    transitions[1, 2] = 10.0

    evaluator = NavigationFitnessEvaluator(
        num_pages=3,
        transition_matrix=transitions,
        target_max_depth=2,
    )

    s_a = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 0},
        positions={1: 0, 2: 1},
        depths={0: 0, 1: 1, 2: 1},
    )
    _, m_a = evaluator.evaluate(s_a)
    assert m_a["behaviorCost"] == pytest.approx(0.50, abs=1e-3)

    s_b = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 1},
        positions={1: 0, 2: 0},
        depths={0: 0, 1: 1, 2: 2},
    )
    _, m_b = evaluator.evaluate(s_b)
    assert m_b["behaviorCost"] == pytest.approx(0.25, abs=1e-3)
    assert m_b["behaviorCost"] < m_a["behaviorCost"]


def test_tfidf_semantic_relevance():
    """Verifies semantic coherence using TF-IDF cosine similarity."""
    contents = {
        0: "computer science algorithms data structures programming",
        1: "algorithms sorting searching computational complexity",
        2: "gardening roses soil fertilizers outdoor plants flowers",
    }

    provider = TfidfSemanticProvider(contents, num_pages=3)

    # 0 and 1 share tech vocabulary -> non-zero similarity
    sim_0_1 = provider.get_similarity(0, 1)
    # 0 and 2 share no vocabulary -> 0
    sim_0_2 = provider.get_similarity(0, 2)

    assert sim_0_1 > 0.05
    assert sim_0_1 > sim_0_2
    assert sim_0_2 == pytest.approx(0.0, abs=1e-3)

    # Structure aligning related topics: 0 -> 1, 0 -> 2
    s_good = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 0},
        positions={1: 0, 2: 1},
        depths={0: 0, 1: 1, 2: 1},
    )
    # Structure placing 1 under 2: 0 -> 2 -> 1
    s_bad = WebsiteStructure(
        num_pages=3,
        parents={2: 0, 1: 2},
        positions={2: 0, 1: 0},
        depths={0: 0, 1: 2, 2: 1},
    )

    rel_good = provider.compute_hierarchy_relevance(s_good)
    rel_bad = provider.compute_hierarchy_relevance(s_bad)

    assert rel_good > rel_bad


def test_structural_change_cost():
    """Verifies structural change penalty against identical vs modified structures."""
    original = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 0},
        positions={1: 0, 2: 1},
        depths={0: 0, 1: 1, 2: 1},
    )

    evaluator = NavigationFitnessEvaluator(
        num_pages=3,
        original_structure=original,
    )

    # Identical candidate -> change cost must be 0
    _, m_same = evaluator.evaluate(original)
    assert m_same["structuralChangeCost"] == pytest.approx(0.0, abs=1e-5)

    # Modified parent -> change cost must be > 0
    modified = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 1},
        positions={1: 0, 2: 0},
        depths={0: 0, 1: 1, 2: 2},
    )
    _, m_mod = evaluator.evaluate(modified)
    assert m_mod["structuralChangeCost"] > 0.0


def test_depth_and_breadth_penalty():
    """Verifies depth penalty and menu fanout constraint."""
    evaluator = NavigationFitnessEvaluator(
        num_pages=4,
        target_max_depth=2,
        max_children_fanout=2,
    )

    # Compliant structure: depths <= 2, fanout <= 2
    s_ok = WebsiteStructure(
        num_pages=4,
        parents={1: 0, 2: 0, 3: 1},
        positions={1: 0, 2: 1, 3: 0},
        depths={0: 0, 1: 1, 2: 1, 3: 2},
    )
    _, m_ok = evaluator.evaluate(s_ok)
    assert m_ok["depthPenalty"] == pytest.approx(0.0, abs=1e-5)

    # Excessive depth: 0 -> 1 -> 2 -> 3 (max depth 3 > 2)
    s_deep = WebsiteStructure(
        num_pages=4,
        parents={1: 0, 2: 1, 3: 2},
        positions={1: 0, 2: 0, 3: 0},
        depths={0: 0, 1: 1, 2: 2, 3: 3},
    )
    _, m_deep = evaluator.evaluate(s_deep)
    assert m_deep["depthPenalty"] > 0.0

    # Excessive fanout: 0 -> 1, 2, 3 (fanout 3 > 2)
    s_wide = WebsiteStructure(
        num_pages=4,
        parents={1: 0, 2: 0, 3: 0},
        positions={1: 0, 2: 1, 3: 2},
        depths={0: 0, 1: 1, 2: 1, 3: 1},
    )
    _, m_wide = evaluator.evaluate(s_wide)
    assert m_wide["depthPenalty"] > 0.0


def test_composite_fitness_formula_and_separate_outputs():
    """Verifies that all components are returned separately and composite formula holds:

    F = (w1*nav + w2*beh + w3*struct + w4*depth) / max(eps, w5*sem)
    """
    evaluator = NavigationFitnessEvaluator(
        num_pages=3,
        w1_nav=0.3,
        w2_beh=0.2,
        w3_struct=0.2,
        w4_depth=0.3,
        w5_sem=1.0,
    )

    s = WebsiteStructure(
        num_pages=3,
        parents={1: 0, 2: 1},
        positions={1: 0, 2: 0},
        depths={0: 0, 1: 1, 2: 2},
    )

    total_f, metrics = evaluator.evaluate(s)

    # Check that every requested component is present in response
    required_keys = {
        "totalFitness",
        "navigationCost",
        "behaviorCost",
        "structuralChangeCost",
        "depthPenalty",
        "semanticRelevance",
    }
    assert required_keys.issubset(metrics.keys())

    # Check manual formula equivalence
    c_nav = metrics["navigationCost"]
    c_beh = metrics["behaviorCost"]
    c_struct = metrics["structuralChangeCost"]
    p_depth = metrics["depthPenalty"]
    s_sem = metrics["semanticRelevance"]

    expected_numerator = 0.3 * c_nav + 0.2 * c_beh + 0.2 * c_struct + 0.3 * p_depth
    expected_denominator = max(1e-4, 1.0 * s_sem)
    expected_f = expected_numerator / expected_denominator

    assert total_f == pytest.approx(expected_f, abs=1e-5)
    assert metrics["totalFitness"] == pytest.approx(expected_f, abs=1e-5)
