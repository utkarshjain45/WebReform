"""Wolf representation in the Grey Wolf Optimizer."""

from dataclasses import dataclass, field
from typing import Any, Dict, Optional
import numpy as np


@dataclass
class Wolf:
    """Represents an individual grey wolf in the metaheuristic search space.

    Attributes:
        position: Continuous search position vector X in [0, 1]^D.
        structure: Decoded discrete website structure (parents, positions, depths).
        fitness: Scalar objective evaluation score (lower is better in minimization).
        metrics: Dictionary of detailed navigation and structural metric values.
    """

    position: np.ndarray
    structure: Optional[Any] = None
    fitness: float = float("inf")
    metrics: Dict[str, float] = field(default_factory=dict)

    def copy(self) -> "Wolf":
        """Creates an independent deep copy of the wolf."""
        struct_copy = None
        if self.structure is not None:
            struct_copy = self.structure.copy() if hasattr(self.structure, "copy") else self.structure
        return Wolf(
            position=np.copy(self.position),
            structure=struct_copy,
            fitness=self.fitness,
            metrics=dict(self.metrics),
        )

    def __repr__(self) -> str:
        return f"Wolf(fitness={self.fitness:.5f}, metrics={self.metrics})"
