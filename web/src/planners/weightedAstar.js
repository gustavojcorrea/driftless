function heuristic(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function key(node) {
  return `${node[0]},${node[1]}`;
}

function parseKey(k) {
  return k.split(",").map(Number);
}

function inBounds(r, c, rows, cols) {
  return r >= 0 && r < rows && c >= 0 && c < cols;
}

function isFree(grid, r, c) {
  return grid[r][c] === 0;
}

function getCellCost(costGrid, r, c) {
  return costGrid?.[r]?.[c] ?? 0;
}

function getNeighbors(node, grid, diagonal = true) {
  const [r, c] = node;
  const rows = grid.length;
  const cols = grid[0].length;

  const neighbors = [];

  const straightMoves = [
    [-1, 0, 1],
    [1, 0, 1],
    [0, -1, 1],
    [0, 1, 1],
  ];

  for (const [dr, dc, cost] of straightMoves) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc, rows, cols)) continue;
    if (!isFree(grid, nr, nc)) continue;
    neighbors.push([[nr, nc], cost]);
  }

  if (!diagonal) return neighbors;

  const diagonalMoves = [
    [-1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [1, 1, Math.SQRT2],
  ];

  for (const [dr, dc, cost] of diagonalMoves) {
    const nr = r + dr;
    const nc = c + dc;
    if (!inBounds(nr, nc, rows, cols)) continue;
    if (!isFree(grid, nr, nc)) continue;

    const side1r = r + dr;
    const side1c = c;
    const side2r = r;
    const side2c = c + dc;

    if (!isFree(grid, side1r, side1c) || !isFree(grid, side2r, side2c)) {
      continue;
    }

    neighbors.push([[nr, nc], cost]);
  }

  return neighbors;
}

function reconstructPath(cameFrom, currentKey) {
  const path = [parseKey(currentKey)];
  let ck = currentKey;
  while (cameFrom.has(ck)) {
    ck = cameFrom.get(ck);
    path.push(parseKey(ck));
  }
  return path.reverse();
}

export function weightedAstar(grid, costGrid, start, goal, diagonal = true) {
  const startKey = key(start);
  const goalKey = key(goal);

  const openSet = new Set([startKey]);
  const cameFrom = new Map();

  const gScore = new Map();
  gScore.set(startKey, 0);

  const fScore = new Map();
  fScore.set(startKey, heuristic(start, goal));

  const exploredOrder = [];
  const debugLog = [];

  while (openSet.size > 0) {
    let currentKey = null;
    let bestF = Infinity;

    for (const k of openSet) {
      const f = fScore.get(k) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        currentKey = k;
      }
    }

    const current = parseKey(currentKey);
    const currentG = gScore.get(currentKey) ?? Infinity;
    const currentH = heuristic(current, goal);
    const currentF = fScore.get(currentKey) ?? Infinity;

    exploredOrder.push(current);
    debugLog.push(
      `Expand node (${current[0]}, ${current[1]}), g=${currentG.toFixed(2)}, h=${currentH.toFixed(2)}, f=${currentF.toFixed(2)}`
    );

    if (currentKey === goalKey) {
      const path = reconstructPath(cameFrom, currentKey);
      debugLog.push(
        `Goal reached at (${current[0]}, ${current[1]}), total cost=${currentG.toFixed(2)}`
      );

      return {
        path,
        cost: currentG,
        explored: cameFrom.size,
        exploredOrder,
        debugLog,
      };
    }

    openSet.delete(currentKey);

    for (const [neighbor, moveCost] of getNeighbors(current, grid, diagonal)) {
      const neighborKey = key(neighbor);
      const terrainCost = getCellCost(costGrid, neighbor[0], neighbor[1]);
      const tentativeG = currentG + moveCost + terrainCost;
      const oldG = gScore.get(neighborKey);
      const neighborH = heuristic(neighbor, goal);
      const tentativeF = tentativeG + neighborH;

      if (tentativeG < (oldG ?? Infinity)) {
        cameFrom.set(neighborKey, currentKey);
        gScore.set(neighborKey, tentativeG);
        fScore.set(neighborKey, tentativeF);
        openSet.add(neighborKey);

        // debugLog.push(
        //   `  Update neighbor (${neighbor[0]}, ${neighbor[1]}): move=${moveCost.toFixed(2)}, terrain=${terrainCost.toFixed(2)}, g=${tentativeG.toFixed(2)}, h=${neighborH.toFixed(2)}, f=${tentativeF.toFixed(2)}`
        // );
        debugLog.push(
          `  → (${neighbor[0]},${neighbor[1]}) move=${moveCost.toFixed(1)} + terrain=${terrainCost.toFixed(1)} → g=${tentativeG.toFixed(2)}`
        );
      }
    }
  }

  debugLog.push("No path found.");

  return {
    path: null,
    cost: Infinity,
    explored: cameFrom.size,
    exploredOrder,
    debugLog,
  };
}