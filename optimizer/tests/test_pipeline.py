"""Integration tests for the complete GWO website optimization pipeline."""

from typing import Any, Dict, List
import pytest
from gwo.pipeline import OptimizationConfig, WebsiteOptimizationPipeline


@pytest.fixture
def sample_website_graph() -> Dict[str, Any]:
    """Provides a synthetic 6-page website graph for integration testing."""
    pages = [
        {"id": 10, "url": "https://site.org/", "title": "Home", "content": "Homepage root main entry", "depth": 0, "access_frequency": 100.0},
        {"id": 20, "url": "https://site.org/about", "title": "About Us", "content": "Company story team mission", "depth": 1, "access_frequency": 25.0},
        {"id": 30, "url": "https://site.org/services", "title": "Services", "content": "Consulting cloud architecture software", "depth": 1, "access_frequency": 75.0},
        {"id": 40, "url": "https://site.org/services/cloud", "title": "Cloud Ops", "content": "Scalable cloud hosting infrastructure", "depth": 2, "access_frequency": 90.0},
        {"id": 50, "url": "https://site.org/contact", "title": "Contact", "content": "Contact form phone email location", "depth": 1, "access_frequency": 30.0},
        {"id": 60, "url": "https://site.org/careers", "title": "Careers", "content": "Job openings engineering hiring", "depth": 2, "access_frequency": 15.0},
    ]

    links = [
        {"source_id": 10, "target_id": 20},
        {"source_id": 10, "target_id": 30},
        {"source_id": 10, "target_id": 50},
        {"source_id": 30, "target_id": 40},
        {"source_id": 20, "target_id": 60},
        {"source_id": 50, "target_id": 10},
    ]

    return {"pages": pages, "links": links, "critical_pages": [40]}


def test_pipeline_output_schema_and_execution(sample_website_graph: Dict[str, Any]):
    """Verifies that the pipeline returns all required top-level fields and sub-dictionaries."""
    config = OptimizationConfig(
        population_size=10,
        iterations=15,
        max_depth=3,
        max_children=4,
        random_seed=42,
    )
    pipeline = WebsiteOptimizationPipeline(config)
    result = pipeline.run(
        pages=sample_website_graph["pages"],
        links=sample_website_graph["links"],
        critical_page_ids=sample_website_graph["critical_pages"],
        root_page_id=10,
    )

    # Required top-level keys
    expected_keys = {
        "bestStructure",
        "initialFitness",
        "finalFitness",
        "improvementPercentage",
        "convergence",
        "iterations",
        "executionTime",
        "fitnessBreakdown",
    }
    assert expected_keys.issubset(result.keys())

    # Check iterations and convergence length
    assert result["iterations"] == 15
    assert len(result["convergence"]) == 16  # gen 0 + 15 iterations

    # Check execution time
    assert result["executionTime"] > 0.0

    # Check fitness breakdown schema
    breakdown = result["fitnessBreakdown"]
    expected_breakdown_keys = {
        "totalFitness",
        "navigationCost",
        "behaviorCost",
        "structuralChangeCost",
        "depthPenalty",
        "semanticRelevance",
    }
    assert expected_breakdown_keys.issubset(breakdown.keys())


def test_pipeline_structural_invariants(sample_website_graph: Dict[str, Any]):
    """Verifies that the returned bestStructure satisfies all topological invariants:

    1. All pages are represented (no missing or extra pages).
    2. No duplicate pages.
    3. Exactly 0 cycles in the hierarchy (acyclic tree).
    4. Max depth constraint strictly respected.
    5. Max children constraint strictly respected.
    6. Critical pages remain reachable within max_depth.
    """
    max_depth = 3
    max_children = 4
    config = OptimizationConfig(
        population_size=12,
        iterations=20,
        max_depth=max_depth,
        max_children=max_children,
        random_seed=123,
    )
    pipeline = WebsiteOptimizationPipeline(config)
    result = pipeline.run(
        pages=sample_website_graph["pages"],
        links=sample_website_graph["links"],
        critical_page_ids=sample_website_graph["critical_pages"],
        root_page_id=10,
    )

    struct = result["bestStructure"]
    input_ids = {p["id"] for p in sample_website_graph["pages"]}

    # 1 & 2: Representation and no duplicates
    assert struct["numPages"] == len(input_ids)
    assert set(struct["parents"].keys()) == input_ids
    assert set(struct["depths"].keys()) == input_ids
    assert set(struct["positions"].keys()) == input_ids

    # Root has no parent and depth 0
    assert struct["parents"][10] is None
    assert struct["depths"][10] == 0

    # 3: Cycle Elimination (tracing parents must reach root 10 in <= max_depth steps)
    for pid in input_ids:
        if pid != 10:
            curr = pid
            steps = 0
            visited = {curr}
            while curr != 10:
                parent = struct["parents"].get(curr)
                assert parent is not None, f"Node {curr} has disconnected parent"
                assert parent not in visited, f"Cycle detected involving node {curr} -> {parent}"
                visited.add(parent)
                curr = parent
                steps += 1
                assert steps <= max_depth + 1, "Exceeded maximum tree traversal steps"

    # 4: Max Depth strictly respected
    for pid, d in struct["depths"].items():
        assert d <= max_depth, f"Page {pid} depth {d} exceeds max_depth {max_depth}"

    # 5: Max Children strictly respected
    children_counts: Dict[int, int] = {}
    for child, parent in struct["parents"].items():
        if parent is not None:
            children_counts[parent] = children_counts.get(parent, 0) + 1

    for parent, count in children_counts.items():
        assert count <= max_children, f"Parent {parent} has {count} children > max {max_children}"

    # 6: Critical Page Reachability
    critical_id = 40
    assert critical_id in struct["depths"]
    assert 1 <= struct["depths"][critical_id] <= max_depth


def test_pipeline_seed_determinism(sample_website_graph: Dict[str, Any]):
    """Verifies that running the pipeline twice with identical random seeds produces bit-identical outputs."""
    config_a = OptimizationConfig(
        population_size=10,
        iterations=15,
        max_depth=3,
        max_children=4,
        random_seed=777,
    )
    pipeline_a = WebsiteOptimizationPipeline(config_a)
    result_a = pipeline_a.run(
        pages=sample_website_graph["pages"],
        links=sample_website_graph["links"],
        root_page_id=10,
    )

    config_b = OptimizationConfig(
        population_size=10,
        iterations=15,
        max_depth=3,
        max_children=4,
        random_seed=777,
    )
    pipeline_b = WebsiteOptimizationPipeline(config_b)
    result_b = pipeline_b.run(
        pages=sample_website_graph["pages"],
        links=sample_website_graph["links"],
        root_page_id=10,
    )

    assert result_a["initialFitness"] == pytest.approx(result_b["initialFitness"], abs=1e-6)
    assert result_a["finalFitness"] == pytest.approx(result_b["finalFitness"], abs=1e-6)
    assert result_a["convergence"] == pytest.approx(result_b["convergence"], abs=1e-6)
    assert result_a["bestStructure"]["parents"] == result_b["bestStructure"]["parents"]
    assert result_a["bestStructure"]["depths"] == result_b["bestStructure"]["depths"]
