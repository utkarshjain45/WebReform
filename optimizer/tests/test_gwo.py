"""Unit tests for the Grey Wolf Optimizer algorithm engine."""

import numpy as np
import pytest

from gwo.encoding import StructureEncoder, WebsiteStructure
from gwo.fitness import NavigationFitnessEvaluator
from gwo.gwo import GreyWolfOptimizer, GWOResult
from gwo.population import Population
from gwo.repair import StructureRepairer


def test_population_initialization():
    num_pages = 6
    encoder = StructureEncoder(num_pages)
    repairer = StructureRepairer()
    evaluator = NavigationFitnessEvaluator(num_pages)

    pop = Population(
        population_size=10,
        encoder=encoder,
        repairer=repairer,
        fitness_evaluator=evaluator,
        rng=np.random.default_rng(42),
    )
    pop.initialize()

    assert len(pop.wolves) == 10
    assert pop.alpha is not None
    assert pop.beta is not None
    assert pop.delta is not None

    # Check social hierarchy ranking (minimization: alpha <= beta <= delta)
    assert pop.alpha.fitness <= pop.beta.fitness
    assert pop.beta.fitness <= pop.delta.fitness

    # Check valid positions and structures
    for wolf in pop.wolves:
        assert wolf.position.shape == (encoder.dimension,)
        assert np.all(wolf.position >= 0.0) and np.all(wolf.position <= 1.0)
        assert isinstance(wolf.structure, WebsiteStructure)
        assert wolf.fitness < float("inf")


def test_gwo_position_update():
    num_pages = 5
    encoder = StructureEncoder(num_pages)
    repairer = StructureRepairer()
    evaluator = NavigationFitnessEvaluator(num_pages)

    pop = Population(
        population_size=6,
        encoder=encoder,
        repairer=repairer,
        fitness_evaluator=evaluator,
        rng=np.random.default_rng(123),
    )
    pop.initialize()

    old_position = np.copy(pop.wolves[3].position)
    new_position = np.clip(old_position + 0.1, 0.0, 1.0)

    pop.evaluate_and_update(3, new_position)
    assert not np.array_equal(pop.wolves[3].position, old_position)
    assert pop.wolves[3].fitness < float("inf")


def test_gwo_deterministic_seed():
    """Verifies that two runs with identical random seed produce bitwise identical results."""
    num_pages = 8
    seed = 42

    gwo1 = GreyWolfOptimizer(
        num_pages=num_pages,
        population_size=12,
        max_iterations=20,
        seed=seed,
    )
    result1 = gwo1.optimize()

    gwo2 = GreyWolfOptimizer(
        num_pages=num_pages,
        population_size=12,
        max_iterations=20,
        seed=seed,
    )
    result2 = gwo2.optimize()

    # Fitness and convergence history must be exactly identical
    assert result1.best_fitness == result2.best_fitness
    assert np.allclose(result1.convergence_history, result2.convergence_history)
    assert result1.best_solution.parents == result2.best_solution.parents
    assert result1.best_solution.positions == result2.best_solution.positions


def test_gwo_convergence_history():
    """Verifies convergence history tracking and monotonic non-increasing alpha fitness."""
    num_pages = 7
    max_iters = 25

    gwo = GreyWolfOptimizer(
        num_pages=num_pages,
        population_size=15,
        max_iterations=max_iters,
        seed=999,
    )
    result = gwo.optimize()

    assert isinstance(result, GWOResult)
    assert result.iteration_count == max_iters
    assert len(result.convergence_history) == max_iters + 1
    assert result.execution_time_sec > 0.0

    # The alpha fitness in the convergence history should be monotonically non-increasing
    # (fitness either improves or stays the same as alpha is preserved)
    for t in range(1, len(result.convergence_history)):
        assert (
            result.convergence_history[t] <= result.convergence_history[t - 1] + 1e-9
        ), f"Convergence broken at iteration {t}: {result.convergence_history[t]} > {result.convergence_history[t-1]}"

    assert result.best_fitness == result.convergence_history[-1]
