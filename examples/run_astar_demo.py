import numpy as np
import matplotlib.pyplot as plt

from planning.astar import astar


def make_grid(rows: int = 20, cols: int = 20) -> np.ndarray:
    """Create a simple grid with hand-made obstacles."""
    grid = np.zeros((rows, cols), dtype=int)

    # Vertical wall
    grid[2:15, 5] = 1

    # Horizontal wall
    grid[10, 7:18] = 1

    # Small block
    grid[4:8, 12:14] = 1

    # Another obstacle strip
    grid[14:18, 9] = 1

    # Leave openings so a path exists
    grid[8, 5] = 0
    grid[10, 12] = 0
    grid[16, 9] = 0

    return grid


def plot_grid(
    grid: np.ndarray,
    start: tuple[int, int],
    goal: tuple[int, int],
    path: list[tuple[int, int]] | None,
) -> None:
    fig, ax = plt.subplots(figsize=(8, 8))

    # Show grid: obstacles = dark, free = light
    ax.imshow(grid, cmap="Greys", origin="upper")

    # Plot path if found
    if path:
        path_rows = [p[0] for p in path]
        path_cols = [p[1] for p in path]
        ax.plot(path_cols, path_rows, linewidth=2, label="A* Path")

    # Plot start and goal
    ax.scatter(start[1], start[0], marker="o", s=100, label="Start")
    ax.scatter(goal[1], goal[0], marker="x", s=100, label="Goal")

    ax.set_title("A* Path Planning Demo")
    ax.set_xlabel("Column")
    ax.set_ylabel("Row")
    ax.set_xticks(range(grid.shape[1]))
    ax.set_yticks(range(grid.shape[0]))
    ax.grid(True, which="both", linewidth=0.5)
    ax.legend()
    plt.show()


def main():
    grid = make_grid()
    start = (0, 0)
    goal = (19, 19)

    path, cost = astar(grid, start, goal)

    if path is None:
        print("No path found.")
    else:
        print(f"Path found with cost: {cost:.1f}")
        print(f"Number of waypoints in path: {len(path)}")

    plot_grid(grid, start, goal, path)


if __name__ == "__main__":
    main()
