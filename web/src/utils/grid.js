export function buildGrid(rows, cols, obstacles) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (const [r, c] of obstacles) {
      grid[r][c] = 1;
    }
    return grid;
  }
  
  export function buildCostGrid(rows, cols, costZones = []) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  
    for (const zone of costZones) {
      for (const [r, c] of zone.cells) {
        grid[r][c] = zone.cost;
      }
    }
  
    return grid;
  }
  
  export function cellToWorld(row, col, rows, cols) {
    const x = col - cols / 2 + 0.5;
    const z = row - rows / 2 + 0.5;
    return [x, 0, z];
  }