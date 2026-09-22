from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings


router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    timestamp: str


@router.get("/health", response_model=HealthResponse, tags=["Health"])
def health_check() -> HealthResponse:
    """Return optimizer service health and status information."""
    return HealthResponse(
        status="UP",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
