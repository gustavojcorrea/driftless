import heapq
from typing import Dict, List, Optional, Tuple

import numpy as np

GridPoint = Tuple[int, int]


def heuristic(a: GridPoint, b: GridPoint) -> float:
    """Manhattan distance heuristic for 4-connected grid."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])


def get_neighbors(node: GridPoint, grid: np.ndarray) -> List[GridPoint]:
    """Return valid 4-connected neighbors that are not obstacles."""
    rows, cols = grid.shape
    r, c = node

    candidates = [
        (r - 1, c),
        (r + 1, c),
        (r, c - 1),
        (r, c + 1),
    ]

    neighbors = []
    for nr, nc in candidates:
        if 0 <= nr < rows and 0 <= nc < cols and grid[nr, nc] == 0:
            neighbors.append((nr, nc))
    return neighbors


def reconstruct_path(
    came_from: Dict[GridPoint, GridPoint],
    current: GridPoint,
) -> List[GridPoint]:
    path = [current]
    while current in came_from:
        current = came_from[current]
        path.append(current)
    path.reverse()
    return path


def astar(
    grid: np.ndarray,
    start: GridPoint,
    goal: GridPoint,
) -> Tuple[Optional[List[GridPoint]], float]:
    """
    Run A* on a 2D occupancy grid.

    grid:
      0 = free
      1 = obstacle
    start, goal:
      (row, col)

    Returns:
      path: list of grid cells from start to goal, or None if no path
      cost: path cost, or inf if no path
    """
    if grid[start] == 1:
        raise ValueError("Start is inside an obstacle.")
    if grid[goal] == 1:
        raise ValueError("Goal is inside an obstacle.")

    open_heap: List[Tuple[float, GridPoint]] = []
    heapq.heappush(open_heap, (0.0, start))

    came_from: Dict[GridPoint, GridPoint] = {}
    g_score: Dict[GridPoint, float] = {start: 0.0}
    f_score: Dict[GridPoint, float] = {start: heuristic(start, goal)}

    open_set = {start}

    while open_heap:
        _, current = heapq.heappop(open_heap)

        if current not in open_set:
            continue

        open_set.remove(current)

        if current == goal:
            path = reconstruct_path(came_from, current)
            return path, g_score[current]

        for neighbor in get_neighbors(current, grid):
            tentative_g = g_score[current] + 1.0  # unit cost for each move

            if tentative_g < g_score.get(neighbor, float("inf")):
                came_from[neighbor] = current
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)

                if neighbor not in open_set:
                    heapq.heappush(open_heap, (f_score[neighbor], neighbor))
                    open_set.add(neighbor)

    return None, float("inf")
