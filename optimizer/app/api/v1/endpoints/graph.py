"""FastAPI endpoint for website graph construction and analysis."""

from fastapi import APIRouter, HTTPException, status
from app.models.graph import GraphAnalysisRequest, GraphAnalysisResponse
from app.services.graph_analysis import WebsiteGraphAnalyzer

router = APIRouter()


@router.post(
    "/graph/analyze",
    response_model=GraphAnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="Construct and analyze website directed graph G = (V, E)",
    description=(
        "Takes page vertices and internal hyperlink edges, constructs a directed NetworkX graph, "
        "and computes topological metrics (in/out-degrees, depths, dead-ends, orphans, HITS hub/authority, and PageRank)."
    ),
)
def analyze_website_graph(request: GraphAnalysisRequest) -> GraphAnalysisResponse:
    try:
        return WebsiteGraphAnalyzer.analyze(request)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during graph analysis: {str(e)}",
        )
