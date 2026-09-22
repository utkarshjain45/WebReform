from fastapi import APIRouter
from app.api.v1.endpoints import health, graph, optimization

api_router = APIRouter()
api_router.include_router(health.router, prefix="", tags=["Health"])
api_router.include_router(graph.router, prefix="", tags=["Graph Analysis"])
api_router.include_router(optimization.router, prefix="", tags=["Optimization"])
