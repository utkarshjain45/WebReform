"""Unit tests for topological repair operator."""

import pytest
from gwo.encoding import WebsiteStructure
from gwo.repair import StructureRepairer


def test_repair_breaks_direct_cycle():
    # Node 1 -> Node 2 -> Node 1 (Cycle)
    parents = {0: None, 1: 2, 2: 1, 3: 0}
    positions = {0: 0, 1: 0, 2: 0, 3: 1}

    cyclic_structure = WebsiteStructure(num_pages=4, parents=parents, positions=positions)
    repairer = StructureRepairer(max_depth=4, max_fanout=5)

    repaired = repairer.repair(cyclic_structure)

    # All nodes must have path to root 0 (depths >= 0 and reachable)
    for node in range(1, 4):
        p = repaired.parents[node]
        assert p is not None
        # Walk up to root
        curr = node
        visited = set()
        while curr != 0:
            assert curr not in visited, f"Cycle still exists at node {curr}"
            visited.add(curr)
            curr = repaired.parents[curr]


def test_repair_enforces_max_depth():
    # Linear chain: 0 -> 1 -> 2 -> 3 -> 4 (Depth 4 at node 4)
    parents = {0: None, 1: 0, 2: 1, 3: 2, 4: 3}
    positions = {0: 0, 1: 0, 2: 0, 3: 0, 4: 0}

    deep_structure = WebsiteStructure(num_pages=5, parents=parents, positions=positions)

    # Restrict max depth to 2
    repairer = StructureRepairer(max_depth=2, max_fanout=5)
    repaired = repairer.repair(deep_structure)

    for node in range(5):
        assert repaired.depths[node] <= 2, f"Node {node} depth {repaired.depths[node]} exceeds max_depth 2"


def test_repair_enforces_max_fanout():
    # Root 0 has 5 children: 1, 2, 3, 4, 5
    parents = {0: None, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    positions = {0: 0, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4}

    wide_structure = WebsiteStructure(num_pages=6, parents=parents, positions=positions)

    # Restrict max fanout to 3
    repairer = StructureRepairer(max_depth=4, max_fanout=3)
    repaired = repairer.repair(wide_structure)

    for parent in range(6):
        children = repaired.get_children(parent)
        assert len(children) <= 3, f"Parent {parent} has {len(children)} children, exceeding max_fanout 3"
