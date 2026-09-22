"""Pydantic data models for the WebReform optimization API."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class PagePayload(BaseModel):
    id: int
    url: Optional[str] = ""
    title: Optional[str] = ""
    content: Optional[str] = ""
    depth: Optional[int] = 0
    access_frequency: Optional[float] = 1.0


class LinkPayload(BaseModel):
    source_page_id: Optional[int] = None
    target_page_id: Optional[int] = None
    source_id: Optional[int] = None
    target_id: Optional[int] = None

    def get_source(self) -> int:
        if self.source_id is not None:
            return self.source_id
        if self.source_page_id is not None:
            return self.source_page_id
        raise ValueError("Link must specify source_id or source_page_id")

    def get_target(self) -> int:
        if self.target_id is not None:
            return self.target_id
        if self.target_page_id is not None:
            return self.target_page_id
        raise ValueError("Link must specify target_id or target_page_id")


class FitnessWeightsPayload(BaseModel):
    navigation: float = 0.35
    behavior: float = 0.25
    structural: float = 0.20
    depth: float = 0.20
    semantic: float = 1.0


class OptimizationRunRequest(BaseModel):
    pages: List[PagePayload]
    links: List[LinkPayload]
    population_size: int = Field(default=25, ge=4, le=200)
    iterations: int = Field(default=50, ge=1, le=500)
    max_depth: int = Field(default=3, ge=1, le=10)
    max_children: int = Field(default=6, ge=1, le=30)
    random_seed: Optional[int] = 42
    weights: Optional[FitnessWeightsPayload] = None
    critical_page_ids: Optional[List[int]] = None
    root_page_id: Optional[int] = None


class BestStructureResponse(BaseModel):
    numPages: int
    parents: Dict[int, Optional[int]]
    positions: Dict[int, int]
    depths: Dict[int, int]
    edges: List[List[int]]


class FitnessBreakdownResponse(BaseModel):
    totalFitness: float
    navigationCost: float
    behaviorCost: float
    structuralChangeCost: float
    depthPenalty: float
    semanticRelevance: float


class OptimizationRunResponse(BaseModel):
    bestStructure: BestStructureResponse
    initialFitness: float
    finalFitness: float
    improvementPercentage: float
    convergence: List[float]
    iterations: int
    executionTime: float
    fitnessBreakdown: FitnessBreakdownResponse
