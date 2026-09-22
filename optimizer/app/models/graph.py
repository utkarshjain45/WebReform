"""Pydantic data models for website graph construction and topological analysis."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class PageInput(BaseModel):
    """Represents a web page vertex V in the website graph."""

    id: int
    url: str
    title: Optional[str] = None
    depth: Optional[int] = None
    access_frequency: Optional[float] = Field(default=1.0, description="Normalized traffic or hit count")


class LinkInput(BaseModel):
    """Represents a directed internal hyperlink edge E (source -> target)."""

    source_page_id: int
    target_page_id: int


class GraphAnalysisRequest(BaseModel):
    """Request payload to construct and analyze a website directed graph G = (V, E)."""

    pages: List[PageInput]
    links: List[LinkInput]
    root_page_id: Optional[int] = Field(default=None, description="Homepage/root node ID; defaults to lowest depth or first page")


class PageLevelMetrics(BaseModel):
    """Topological metrics calculated for a single page vertex."""

    page_id: int
    url: str
    in_degree: int
    out_degree: int
    depth_from_root: Optional[int]
    is_dead_end: bool = Field(description="True if page has no outgoing internal links (out-degree == 0)")
    is_orphan: bool = Field(description="True if page has no incoming links or is unreachable from root")
    is_reachable_from_root: bool
    hub_score: float = Field(description="Kleinberg HITS hub centrality score")
    authority_score: float = Field(description="Kleinberg HITS authority centrality score")
    pagerank: float = Field(description="PageRank structural prestige score")


class GraphStatistics(BaseModel):
    """Summary metrics of the website directed graph G = (V, E)."""

    num_pages: int
    num_links: int
    density: float
    avg_depth: float
    max_depth: int
    dead_end_count: int
    orphan_count: int
    avg_in_degree: float
    avg_out_degree: float
    average_path_length: Optional[float] = Field(
        default=None, description="Average shortest path length across all reachable node pairs"
    )
    is_strongly_connected: bool
    connected_components: int


class GraphAnalysisResponse(BaseModel):
    """Complete graph analysis response containing global statistics and page-level metrics."""

    graph_statistics: GraphStatistics
    page_level_metrics: List[PageLevelMetrics]
    disclaimer: str = (
        "Graph metrics reflect purely structural topology, click depth, and information flow efficiency. "
        "They do not constitute search engine ranking or commercial SEO guarantees."
    )
