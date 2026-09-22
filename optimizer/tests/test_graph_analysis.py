"""Unit tests for website graph construction and NetworkX topological analysis on a known graph."""

import pytest
from app.models.graph import GraphAnalysisRequest, LinkInput, PageInput
from app.services.graph_analysis import WebsiteGraphAnalyzer


@pytest.fixture
def small_known_graph_request() -> GraphAnalysisRequest:
    """Constructs a deterministic 5-node synthetic website graph:

    Nodes:
      - 0: Root / Homepage (out=2, in=0, depth=0)
      - 1: Section 1 (out=2, in=2, depth=1)
      - 2: Section 2 (out=1, in=2, depth=1)
      - 3: Article Page (Dead-end: out=0, in=2, depth=2)
      - 4: Orphan Page (in=0, out=1, unreachable from root 0)

    Edges:
      - 0 -> 1, 0 -> 2
      - 1 -> 2, 1 -> 3
      - 2 -> 3
      - 4 -> 1
    """
    pages = [
        PageInput(id=0, url="https://example.com/", title="Home", depth=0),
        PageInput(id=1, url="https://example.com/section-1", title="Section 1", depth=1),
        PageInput(id=2, url="https://example.com/section-2", title="Section 2", depth=1),
        PageInput(id=3, url="https://example.com/article", title="Article", depth=2),
        PageInput(id=4, url="https://example.com/orphan", title="Orphan", depth=3),
    ]

    links = [
        LinkInput(source_page_id=0, target_page_id=1),
        LinkInput(source_page_id=0, target_page_id=2),
        LinkInput(source_page_id=1, target_page_id=2),
        LinkInput(source_page_id=1, target_page_id=3),
        LinkInput(source_page_id=2, target_page_id=3),
        LinkInput(source_page_id=4, target_page_id=1),
    ]

    return GraphAnalysisRequest(pages=pages, links=links, root_page_id=0)


def test_known_graph_basic_counts(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    stats = response.graph_statistics

    # |V| = 5, |E| = 6
    assert stats.num_pages == 5
    assert stats.num_links == 6
    assert stats.density == pytest.approx(6 / (5 * 4), abs=1e-3)


def test_known_graph_degrees(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    metrics_by_id = {m.page_id: m for m in response.page_level_metrics}

    # Expected in-degrees: 0: 0, 1: 2, 2: 2, 3: 2, 4: 0
    assert metrics_by_id[0].in_degree == 0
    assert metrics_by_id[1].in_degree == 2
    assert metrics_by_id[2].in_degree == 2
    assert metrics_by_id[3].in_degree == 2
    assert metrics_by_id[4].in_degree == 0

    # Expected out-degrees: 0: 2, 1: 2, 2: 1, 3: 0, 4: 1
    assert metrics_by_id[0].out_degree == 2
    assert metrics_by_id[1].out_degree == 2
    assert metrics_by_id[2].out_degree == 1
    assert metrics_by_id[3].out_degree == 0
    assert metrics_by_id[4].out_degree == 1


def test_known_graph_dead_ends_and_orphans(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    stats = response.graph_statistics
    metrics_by_id = {m.page_id: m for m in response.page_level_metrics}

    # Dead-end: out-degree == 0 -> Page 3 only
    assert stats.dead_end_count == 1
    assert metrics_by_id[3].is_dead_end is True
    assert metrics_by_id[0].is_dead_end is False
    assert metrics_by_id[1].is_dead_end is False
    assert metrics_by_id[2].is_dead_end is False
    assert metrics_by_id[4].is_dead_end is False

    # Orphan: in-degree == 0 and not root, or unreachable from root -> Page 4 only
    assert stats.orphan_count == 1
    assert metrics_by_id[4].is_orphan is True
    assert metrics_by_id[4].is_reachable_from_root is False
    assert metrics_by_id[0].is_orphan is False
    assert metrics_by_id[1].is_orphan is False
    assert metrics_by_id[2].is_orphan is False
    assert metrics_by_id[3].is_orphan is False


def test_known_graph_depths(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    stats = response.graph_statistics
    metrics_by_id = {m.page_id: m for m in response.page_level_metrics}

    # Expected depths from root 0:
    # 0 -> 0, 1 -> 1, 2 -> 1, 3 -> 2, 4 -> None (unreachable)
    assert metrics_by_id[0].depth_from_root == 0
    assert metrics_by_id[1].depth_from_root == 1
    assert metrics_by_id[2].depth_from_root == 1
    assert metrics_by_id[3].depth_from_root == 2
    assert metrics_by_id[4].depth_from_root is None

    # Max depth across reachable pages = 2
    assert stats.max_depth == 2

    # Avg depth for reachable non-root nodes (1, 2, 3): (1 + 1 + 2) / 3 = 4 / 3 ≈ 1.333
    assert stats.avg_depth == pytest.approx(4 / 3, abs=1e-2)


def test_known_graph_average_path_length(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    stats = response.graph_statistics

    # 9 reachable pairs, total path length = 12, avg = 12/9 = 1.333
    assert stats.average_path_length is not None
    assert stats.average_path_length == pytest.approx(12 / 9, abs=1e-2)


def test_known_graph_hits_scores(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    metrics_by_id = {m.page_id: m for m in response.page_level_metrics}

    # Page 3 has out-degree 0 -> Hub score must be 0
    assert metrics_by_id[3].hub_score == pytest.approx(0.0, abs=1e-5)

    # Page 4 has in-degree 0 -> Authority score must be 0
    assert metrics_by_id[4].authority_score == pytest.approx(0.0, abs=1e-5)

    # Page 3 and Page 1 are pointed to by symmetrical hubs -> authority scores match
    assert metrics_by_id[3].authority_score == pytest.approx(metrics_by_id[1].authority_score, abs=1e-4)
    assert metrics_by_id[3].authority_score > metrics_by_id[0].authority_score


def test_disclaimer_present(small_known_graph_request: GraphAnalysisRequest):
    response = WebsiteGraphAnalyzer.analyze(small_known_graph_request)
    assert "SEO" in response.disclaimer
    assert "structural topology" in response.disclaimer
