function distance2D(a, b) {
    const dx = a[0] - b[0];
    const dz = a[1] - b[1];
    return Math.sqrt(dx * dx + dz * dz);
  }
  
  function normalize(v) {
    const mag = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    if (mag < 1e-8) return [0, 0];
    return [v[0] / mag, v[1] / mag];
  }
  
  function add(a, b) {
    return [a[0] + b[0], a[1] + b[1]];
  }
  
  function sub(a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  }
  
  function scale(v, s) {
    return [v[0] * s, v[1] * s];
  }
  
  function obstacleCentersFromGrid(grid) {
    const centers = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] === 1) {
          centers.push([c, r]); // x = col, z = row in grid coordinates
        }
      }
    }
    return centers;
  }
  
  export function apf(grid, start, goal, options = {}) {
    const {
      kAtt = 1.0,
      kRep = 8.0,
      influenceRadius = 2.5,
      stepSize = 0.2,
      maxIterations = 250,
      goalTolerance = 0.4,
    } = options;
  
    const debugLog = [];
    const path = [];
  
    // Use grid coordinates for APF math: [col, row]
    let p = [start[1], start[0]];
    const g = [goal[1], goal[0]];
  
    const obstacles = obstacleCentersFromGrid(grid);
  
    path.push([...p]);
  
    for (let i = 0; i < maxIterations; i++) {
      const toGoal = sub(g, p);
      const fAtt = scale(toGoal, kAtt);
  
      let fRep = [0, 0];
  
      for (const obs of obstacles) {
        const away = sub(p, obs);
        const d = distance2D(p, obs);
  
        if (d < 1e-6) continue;
        if (d > influenceRadius) continue;
  
        const dir = normalize(away);
        const mag = kRep * (1 / d - 1 / influenceRadius) * (1 / (d * d));
        fRep = add(fRep, scale(dir, mag));
      }
  
      const fTotal = add(fAtt, fRep);
      const fMag = Math.sqrt(fTotal[0] * fTotal[0] + fTotal[1] * fTotal[1]);
  
      debugLog.push(
        `iter=${i} pos=(${p[0].toFixed(2)}, ${p[1].toFixed(2)}) ` +
        `| Fatt=(${fAtt[0].toFixed(2)}, ${fAtt[1].toFixed(2)}) ` +
        `| Frep=(${fRep[0].toFixed(2)}, ${fRep[1].toFixed(2)}) ` +
        `| |F|=${fMag.toFixed(2)}`
      );
  
      if (distance2D(p, g) < goalTolerance) {
        debugLog.push("Goal reached.");
        return {
          path,
          cost: pathLength(path),
          explored: i + 1,
          exploredOrder: [],
          debugLog,
          success: true,
          meta: { algorithm: "apf" },
        };
      }
  
      if (fMag < 1e-4) {
        debugLog.push("Stopped: force magnitude too small (likely local minimum).");
        return {
          path,
          cost: pathLength(path),
          explored: i + 1,
          exploredOrder: [],
          debugLog,
          success: false,
          meta: { algorithm: "apf" },
        };
      }
  
      const direction = normalize(fTotal);
      p = add(p, scale(direction, stepSize));
      path.push([...p]);
    }
  
    debugLog.push("Stopped: max iterations reached.");
    return {
      path,
      cost: pathLength(path),
      explored: maxIterations,
      exploredOrder: [],
      debugLog,
      success: false,
      meta: { algorithm: "apf" },
    };
  }
  
  function pathLength(path) {
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      total += distance2D(path[i], path[i - 1]);
    }
    return total;
  }