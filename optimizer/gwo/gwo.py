"""Core Grey Wolf Optimization (GWO) engine implementation."""

from dataclasses import dataclass, field
import time
from typing import Dict, List, Optional
import numpy as np

from gwo.encoding import StructureEncoder, WebsiteStructure
from gwo.fitness import NavigationFitnessEvaluator
from gwo.population import Population
from gwo.repair import StructureRepairer
from gwo.wolf import Wolf


@dataclass
class GWOResult:
    """Encapsulates the complete result of a GWO optimization run.

    Attributes:
        best_solution: The fittest decoded discrete website structure (Alpha wolf).
        best_fitness: Lowest scalar fitness value achieved.
        convergence_history: List of alpha fitness values across all iterations.
        iteration_count: Total iterations executed.
        execution_time_sec: Wall-clock runtime in seconds.
        metrics: Detailed objective breakdown (ANPL, depths, edit cost).
        alpha_wolf: The leading Alpha wolf instance.
    """

    best_solution: WebsiteStructure
    best_fitness: float
    convergence_history: List[float]
    iteration_count: int
    execution_time_sec: float
    initial_fitness: float = 0.0
    metrics: Dict[str, float] = field(default_factory=dict)
    alpha_wolf: Optional[Wolf] = None


class GreyWolfOptimizer:
    """Grey Wolf Optimizer (GWO) metaheuristic adapted for discrete website structure optimization.

    Mathematical formulation (Mirjalili et al., 2014):
    - Encircling prey:
        D = |C * X_prey - X|
        X(t+1) = X_prey - A * D
    - Hunting guided by top 3 leaders (Alpha, Beta, Delta):
        X1 = X_alpha - A1 * |C1 * X_alpha - X|
        X2 = X_beta  - A2 * |C2 * X_beta  - X|
        X3 = X_delta - A3 * |C3 * X_delta - X|
        X(t+1) = (X1 + X2 + X3) / 3
    - Coefficient vectors:
        A = 2 * a * r1 - a
        C = 2 * r2
        a linearly decreases from 2 to 0 across iterations: a = 2 - 2 * (t / T_max)
    """

    def __init__(
        self,
        num_pages: int,
        population_size: int = 30,
        max_iterations: int = 100,
        max_depth: int = 4,
        max_fanout: int = 8,
        fitness_evaluator: Optional[NavigationFitnessEvaluator] = None,
        seed: Optional[int] = None,
    ):
        self.num_pages = num_pages
        self.population_size = population_size
        self.max_iterations = max_iterations
        self.seed = seed

        # Deterministic random generator
        self.rng = np.random.default_rng(seed)

        # Core discrete mapping operators
        self.encoder = StructureEncoder(num_pages)
        self.repairer = StructureRepairer(max_depth=max_depth, max_fanout=max_fanout)
        self.fitness_evaluator = (
            fitness_evaluator
            if fitness_evaluator is not None
            else NavigationFitnessEvaluator(num_pages)
        )

    def optimize(self) -> GWOResult:
        """Executes the GWO search loop and returns optimization results."""
        start_time = time.perf_counter()

        # 1. Initialize Pack
        population = Population(
            population_size=self.population_size,
            encoder=self.encoder,
            repairer=self.repairer,
            fitness_evaluator=self.fitness_evaluator,
            rng=self.rng,
        )
        population.initialize()

        alpha, beta, delta = population.get_leaders()
        initial_fitness = float(alpha.fitness)

        convergence_history: List[float] = [alpha.fitness]
        dim = self.encoder.dimension

        # 2. Main GWO Iterative Hunting Loop
        for iteration in range(1, self.max_iterations + 1):
            # Linearly decrease parameter 'a' from 2 down to 0
            a = 2.0 - 2.0 * (iteration / self.max_iterations)

            for i in range(population.population_size):
                curr_pos = population.wolves[i].position

                # --- Hunting via Alpha ---
                r1_a = self.rng.uniform(0.0, 1.0, size=dim)
                r2_a = self.rng.uniform(0.0, 1.0, size=dim)
                A1 = 2.0 * a * r1_a - a
                C1 = 2.0 * r2_a
                D_alpha = np.abs(C1 * alpha.position - curr_pos)
                X1 = alpha.position - A1 * D_alpha

                # --- Hunting via Beta ---
                r1_b = self.rng.uniform(0.0, 1.0, size=dim)
                r2_b = self.rng.uniform(0.0, 1.0, size=dim)
                A2 = 2.0 * a * r1_b - a
                C2 = 2.0 * r2_b
                D_beta = np.abs(C2 * beta.position - curr_pos)
                X2 = beta.position - A2 * D_beta

                # --- Hunting via Delta ---
                r1_d = self.rng.uniform(0.0, 1.0, size=dim)
                r2_d = self.rng.uniform(0.0, 1.0, size=dim)
                A3 = 2.0 * a * r1_d - a
                C3 = 2.0 * r2_d
                D_delta = np.abs(C3 * delta.position - curr_pos)
                X3 = delta.position - A3 * D_delta

                # --- Position Update: Mean Vector ---
                X_new = (X1 + X2 + X3) / 3.0

                # Decode, repair, evaluate, and update wolf in pack
                population.evaluate_and_update(i, X_new)

            # Re-rank social hierarchy
            population.update_hierarchy()
            alpha, beta, delta = population.get_leaders()

            # Monotonic tracking: keep best fitness found so far
            convergence_history.append(alpha.fitness)

        elapsed_sec = time.perf_counter() - start_time

        best_structure: WebsiteStructure = (
            alpha.structure
            if isinstance(alpha.structure, WebsiteStructure)
            else self.encoder.decode(alpha.position)
        )

        return GWOResult(
            best_solution=best_structure,
            best_fitness=alpha.fitness,
            convergence_history=convergence_history,
            iteration_count=self.max_iterations,
            execution_time_sec=elapsed_sec,
            initial_fitness=initial_fitness,
            metrics=dict(alpha.metrics),
            alpha_wolf=alpha,
        )
