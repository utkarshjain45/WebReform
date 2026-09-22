"""FastAPI endpoint for running WebReform website structure optimization."""

from fastapi import APIRouter, HTTPException, status
from app.models.optimization import OptimizationRunRequest, OptimizationRunResponse
from gwo.pipeline import OptimizationConfig, WebsiteOptimizationPipeline

router = APIRouter()


@router.post(
    "/optimization/run",
    response_model=OptimizationRunResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute WebReform website structure optimization",
    description=(
        "Ingests website pages and links, decodes candidate solutions, evaluates multi-objective "
        "fitness, repairs topological constraints, and returns the optimized hierarchy and convergence trace."
    ),
)
def run_optimization(request: OptimizationRunRequest) -> OptimizationRunResponse:
    try:
        # Build configuration from request
        w = request.weights
        config = OptimizationConfig(
            population_size=request.population_size,
            iterations=request.iterations,
            max_depth=request.max_depth,
            max_children=request.max_children,
            random_seed=request.random_seed,
            weight_navigation=w.navigation if w else 0.35,
            weight_behavior=w.behavior if w else 0.25,
            weight_structural=w.structural if w else 0.20,
            weight_depth=w.depth if w else 0.20,
            weight_semantic=w.semantic if w else 1.0,
        )

        # Convert Pydantic payloads to pipeline dictionaries
        pages_data = [p.model_dump() for p in request.pages]
        links_data = [
            {"source_id": l.get_source(), "target_id": l.get_target()}
            for l in request.links
        ]

        pipeline = WebsiteOptimizationPipeline(config=config)
        result = pipeline.run(
            pages=pages_data,
            links=links_data,
            critical_page_ids=request.critical_page_ids,
            root_page_id=request.root_page_id,
        )

        return OptimizationRunResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Optimization failed during execution: {str(e)}",
        )
