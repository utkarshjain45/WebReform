"""Topological repair operator for discrete website hierarchies."""

from typing import Dict, List, Optional, Set
from gwo.encoding import WebsiteStructure


class StructureRepairer:
    """Repairs and enforces topological invariants on discrete website hierarchies:

    1. Directed Acyclic Graph (DAG) / Tree property: Cycle elimination.
    2. Root reachability: Every page must have a directed path from homepage (0).
    3. Maximum Depth constraint: depth(page) <= max_depth.
    4. Maximum Fanout constraint: children_count(page) <= max_fanout.
    5. Critical Page Reachability: High-priority/critical pages are guaranteed to remain
       directly or hierarchically reachable within max_depth.
    """

    def __init__(
        self,
        max_depth: int = 4,
        max_fanout: int = 8,
        critical_pages: Optional[Set[int]] = None,
    ):
        if max_depth < 1:
            raise ValueError("max_depth must be at least 1")
        if max_fanout < 1:
            raise ValueError("max_fanout must be at least 1")

        self.max_depth = max_depth
        self.max_fanout = max_fanout
        self.critical_pages = set(critical_pages) if critical_pages is not None else set()

    def repair(self, structure: WebsiteStructure) -> WebsiteStructure:
        """Applies deterministic repair operations to ensure structural validity."""
        num_pages = structure.num_pages
        parents: Dict[int, Optional[int]] = {0: None}

        # 1. Copy initial parent assignments safely
        for i in range(1, num_pages):
            p = structure.parents.get(i, 0)
            # Ensure valid node index and not self-loop
            if p is None or p < 0 or p >= num_pages or p == i:
                p = 0
            parents[i] = p

        # 2. Cycle Detection and Breaking (DFS Path Tracing)
        for node in range(1, num_pages):
            curr = node
            visited_in_path: Set[int] = {curr}

            while curr != 0:
                p = parents.get(curr, 0)
                if p is None or p == curr:
                    parents[curr] = 0
                    break
                if p in visited_in_path:
                    # Cycle detected: break loop by reassigning curr's parent to root
                    parents[curr] = 0
                    break
                visited_in_path.add(p)
                curr = p

        # 3. Maximum Depth Enforcement (BFS from root)
        depths: Dict[int, int] = {0: 0}
        children_map = self._build_children_map(num_pages, parents)
        queue: List[int] = [0]

        while queue:
            parent = queue.pop(0)
            p_depth = depths[parent]
            for child in children_map.get(parent, []):
                if p_depth + 1 > self.max_depth:
                    # Reassign to root to enforce depth <= max_depth
                    parents[child] = 0
                    depths[child] = 1
                else:
                    depths[child] = p_depth + 1
                queue.append(child)

        # 4. Maximum Fanout Enforcement
        children_map = self._build_children_map(num_pages, parents)
        for parent in range(num_pages):
            kids = children_map.get(parent, [])
            if len(kids) > self.max_fanout:
                # Keep top max_fanout children according to existing positions
                kids.sort(key=lambda c: structure.positions.get(c, c))
                retained = kids[: self.max_fanout]
                overflow = kids[self.max_fanout :]

                # Reassign overflow children to retained siblings if depth permits, else root
                for idx, overflow_child in enumerate(overflow):
                    target_sibling = retained[idx % len(retained)]
                    target_depth = depths.get(target_sibling, 1)

                    if target_depth + 1 <= self.max_depth:
                        parents[overflow_child] = target_sibling
                        depths[overflow_child] = target_depth + 1
                    else:
                        parents[overflow_child] = 0
                        depths[overflow_child] = 1

        # 5. Critical Page Reachability & Depth Enforcement
        for crit in self.critical_pages:
            if 1 <= crit < num_pages:
                curr_depth = depths.get(crit, 999)
                if curr_depth > self.max_depth or curr_depth < 1:
                    parents[crit] = 0
                    depths[crit] = 1

        # 6. Build sanitized WebsiteStructure
        repaired = WebsiteStructure(
            num_pages=num_pages,
            parents=parents,
            positions=dict(structure.positions),
        )

        return repaired

    @staticmethod
    def _build_children_map(num_pages: int, parents: Dict[int, Optional[int]]) -> Dict[int, List[int]]:
        children_map: Dict[int, List[int]] = {i: [] for i in range(num_pages)}
        for child in range(1, num_pages):
            p = parents.get(child)
            if p is not None and 0 <= p < num_pages:
                children_map[p].append(child)
        return children_map
