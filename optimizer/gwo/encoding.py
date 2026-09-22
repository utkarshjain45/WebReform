"""Encoding and decoding between continuous GWO positions and discrete website hierarchies."""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Set, Tuple
import networkx as nx
import numpy as np


@dataclass
class WebsiteStructure:
    """Discrete candidate website structure.

    Attributes:
        num_pages: Total number of web pages (indexed 0 to num_pages - 1).
                   Page 0 is designated as the root (homepage).
        parents: Mapping from page ID to its parent page ID (page 0 has None).
        positions: Sibling index of each page under its parent (0, 1, 2...).
        depths: Click depth from the homepage (root depth is 0).
    """

    num_pages: int
    parents: Dict[int, Optional[int]]
    positions: Dict[int, int] = field(default_factory=dict)
    depths: Dict[int, int] = field(default_factory=dict)

    def __post_init__(self):
        self.parents[0] = None
        self._recalculate_depths_and_positions()

    def _recalculate_depths_and_positions(self) -> None:
        """Computes depths from root and orders siblings deterministically."""
        # 1. Group children by parent
        children_map: Dict[int, List[int]] = {i: [] for i in range(self.num_pages)}
        for node in range(1, self.num_pages):
            parent = self.parents.get(node)
            if parent is not None and 0 <= parent < self.num_pages:
                children_map[parent].append(node)

        # 2. Sort children according to existing positions (or ID if unassigned)
        for parent, children in children_map.items():
            children.sort(key=lambda c: self.positions.get(c, c))
            for idx, child in enumerate(children):
                self.positions[child] = idx
        self.positions[0] = 0

        # 3. Calculate depths starting from root
        self.depths = {0: 0}
        visited: Set[int] = {0}
        queue: List[int] = [0]

        while queue:
            curr = queue.pop(0)
            curr_depth = self.depths[curr]
            for child in children_map.get(curr, []):
                if child not in visited:
                    visited.add(child)
                    self.depths[child] = curr_depth + 1
                    queue.append(child)

        # For any disconnected/unvisited node, mark depth as fallback
        for node in range(self.num_pages):
            if node not in self.depths:
                self.depths[node] = 1

    def get_children(self, parent_id: int) -> List[int]:
        """Returns the list of children under parent_id, sorted by position."""
        children = [node for node, p in self.parents.items() if p == parent_id]
        children.sort(key=lambda c: self.positions.get(c, 0))
        return children

    def to_edge_list(self) -> List[Tuple[int, int]]:
        """Returns directed edges (parent -> child) in the hierarchy."""
        edges = []
        for child, parent in self.parents.items():
            if parent is not None:
                edges.append((parent, child))
        return edges

    def to_networkx(self) -> nx.DiGraph:
        """Converts the discrete structure into a NetworkX directed graph."""
        graph = nx.DiGraph()
        for node in range(self.num_pages):
            graph.add_node(
                node,
                depth=self.depths.get(node, 0),
                position=self.positions.get(node, 0),
            )
        for parent, child in self.to_edge_list():
            graph.add_edge(parent, child)
        return graph

    def copy(self) -> "WebsiteStructure":
        """Creates an independent copy of this discrete structure."""
        return WebsiteStructure(
            num_pages=self.num_pages,
            parents=dict(self.parents),
            positions=dict(self.positions),
            depths=dict(self.depths),
        )


class StructureEncoder:
    """Random-Key & Priority-Based encoder/decoder between continuous GWO space

    and discrete website hierarchies.

    Continuous dimension D = 2 * (num_pages - 1):
    - Sub-vector 1 [0 : num_pages - 1]: Continuous Random Keys for parent selection.
    - Sub-vector 2 [num_pages - 1 : 2*(num_pages - 1)]: Continuous Priority Keys for sibling ordering.
    """

    def __init__(self, num_pages: int):
        if num_pages < 2:
            raise ValueError("A website structure requires at least 2 pages (homepage and 1 subpage).")
        self.num_pages = num_pages
        self.dimension = 2 * (num_pages - 1)

    def decode(self, position: np.ndarray) -> WebsiteStructure:
        """Decodes continuous vector X in [0, 1]^D into a discrete WebsiteStructure."""
        if len(position) != self.dimension:
            raise ValueError(f"Expected position vector of length {self.dimension}, got {len(position)}")

        # Clip values safely within [0.0, 1.0]
        clipped = np.clip(position, 0.0, 1.0)

        n_sub = self.num_pages - 1
        parent_keys = clipped[0:n_sub]
        order_keys = clipped[n_sub : 2 * n_sub]

        parents: Dict[int, Optional[int]] = {0: None}
        positions: Dict[int, int] = {0: 0}

        # 1. Decode Parent Assignments
        for i in range(1, self.num_pages):
            key = parent_keys[i - 1]
            # Candidate parents: all nodes except the page itself
            candidates = [node for node in range(self.num_pages) if node != i]
            idx = int(np.floor(key * len(candidates)))
            if idx >= len(candidates):
                idx = len(candidates) - 1
            parents[i] = candidates[idx]

        # 2. Decode Sibling Orderings
        children_map: Dict[int, List[int]] = {p: [] for p in range(self.num_pages)}
        for i in range(1, self.num_pages):
            p = parents[i]
            if p is not None:
                children_map[p].append(i)

        for p, children in children_map.items():
            if children:
                # Sort children by their priority ordering keys (ascending)
                children.sort(key=lambda c: order_keys[c - 1])
                for rank, child in enumerate(children):
                    positions[child] = rank

        return WebsiteStructure(
            num_pages=self.num_pages,
            parents=parents,
            positions=positions,
        )

    def encode(self, structure: WebsiteStructure) -> np.ndarray:
        """Encodes a discrete WebsiteStructure into a continuous position vector in [0, 1]^D."""
        n_sub = self.num_pages - 1
        vec = np.zeros(self.dimension, dtype=np.float64)

        for i in range(1, self.num_pages):
            raw_parent = structure.parents.get(i)
            parent_id: int = raw_parent if raw_parent is not None else 0
            candidates = [node for node in range(self.num_pages) if node != i]
            try:
                cand_idx = candidates.index(parent_id)
            except ValueError:
                cand_idx = 0
            # Place in the middle of candidate bin
            vec[i - 1] = (cand_idx + 0.5) / len(candidates)

            # Sibling order key
            pos = structure.positions.get(i, 0)
            children_count = max(1, len(structure.get_children(parent_id)))
            vec[n_sub + (i - 1)] = (pos + 0.5) / children_count

        return vec
