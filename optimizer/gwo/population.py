"""Population management and grey wolf social hierarchy."""

from typing import List, Optional, Tuple
import numpy as np

from gwo.encoding import StructureEncoder
from gwo.fitness import NavigationFitnessEvaluator
from gwo.repair import StructureRepairer
from gwo.wolf import Wolf


class Population:
    """Manages the pack of grey wolves and tracks the alpha, beta, and delta hierarchy.

    In Grey Wolf Optimization:
    - Alpha (alpha): Fittest wolf (leader of the pack).
    - Beta (beta): Second fittest wolf (assists alpha).
    - Delta (delta): Third fittest wolf (scouts and sentinels).
    - Omega (omega): Subordinate wolves that follow alpha, beta, and delta.
    """

    def __init__(
        self,
        population_size: int,
        encoder: StructureEncoder,
        repairer: StructureRepairer,
        fitness_evaluator: NavigationFitnessEvaluator,
        rng: Optional[np.random.Generator] = None,
    ):
        if population_size < 4:
            raise ValueError("GWO population size must be at least 4 to establish alpha, beta, delta, and omega.")

        self.population_size = population_size
        self.encoder = encoder
        self.repairer = repairer
        self.fitness_evaluator = fitness_evaluator
        self.rng = rng if rng is not None else np.random.default_rng()

        self.wolves: List[Wolf] = []
        self.alpha: Optional[Wolf] = None
        self.beta: Optional[Wolf] = None
        self.delta: Optional[Wolf] = None

    def get_leaders(self) -> Tuple[Wolf, Wolf, Wolf]:
        """Returns the current leaders (Alpha, Beta, Delta), guaranteeing non-null."""
        if self.alpha is None or self.beta is None or self.delta is None:
            self.update_hierarchy()
        assert self.alpha is not None and self.beta is not None and self.delta is not None
        return self.alpha, self.beta, self.delta

    def initialize(self) -> None:
        """Initializes the wolf pack uniformly in [0, 1]^D and evaluates baseline fitness."""
        dim = self.encoder.dimension
        self.wolves = []

        for _ in range(self.population_size):
            # Uniform continuous distribution in [0, 1]
            pos = self.rng.uniform(0.0, 1.0, size=dim)

            # Decode, repair, and evaluate
            structure = self.encoder.decode(pos)
            repaired = self.repairer.repair(structure)
            fitness, metrics = self.fitness_evaluator.evaluate(repaired)

            wolf = Wolf(
                position=pos,
                structure=repaired,
                fitness=fitness,
                metrics=metrics,
            )
            self.wolves.append(wolf)

        self.update_hierarchy()

    def update_hierarchy(self) -> None:
        """Ranks wolves by fitness (ascending for minimization) and preserves top leaders (Alpha, Beta, Delta)."""
        candidates = list(self.wolves)
        if self.alpha is not None:
            candidates.append(self.alpha)
        if self.beta is not None:
            candidates.append(self.beta)
        if self.delta is not None:
            candidates.append(self.delta)

        # Sort all candidate wolves by fitness (ascending)
        candidates.sort(key=lambda w: w.fitness)

        # Update top 3 leaders with best solutions found so far
        self.alpha = candidates[0].copy()
        self.beta = candidates[1].copy()
        self.delta = candidates[2].copy()

        # Elitism: replace worst wolf in pack with best leader if needed
        self.wolves.sort(key=lambda w: w.fitness)
        if self.wolves[0].fitness > self.alpha.fitness:
            self.wolves[-1] = self.alpha.copy()
            self.wolves.sort(key=lambda w: w.fitness)

    def evaluate_and_update(self, index: int, new_position: np.ndarray) -> None:
        """Updates wolf at index with a new position vector, decodes, repairs, and evaluates."""
        dim = self.encoder.dimension
        clipped_pos = np.clip(new_position, 0.0, 1.0)

        structure = self.encoder.decode(clipped_pos)
        repaired = self.repairer.repair(structure)
        fitness, metrics = self.fitness_evaluator.evaluate(repaired)

        self.wolves[index].position = clipped_pos
        self.wolves[index].structure = repaired
        self.wolves[index].fitness = fitness
        self.wolves[index].metrics = metrics
