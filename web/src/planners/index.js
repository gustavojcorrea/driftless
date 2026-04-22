import { astar } from "./astar";
import { dijkstra } from "./dijkstra";
import { weightedAstar } from "./weightedAstar";
import { apf } from "./apf";

export function runPlanner({ algorithm, grid, costGrid, start, goal, diagonal }) {
  switch (algorithm) {
    case "dijkstra":
      return dijkstra(grid, start, goal, diagonal);
    case "weighted_astar":
      return weightedAstar(grid, costGrid, start, goal, diagonal);
    case "apf":
      return apf(grid, start, goal, {
        kAtt: 0.08,
        kRep: 3.5,
        influenceRadius: 2.2,
        stepSize: 0.22,
        maxIterations: 220,
        goalTolerance: 0.35,
      });
    case "astar":
    default:
      return astar(grid, start, goal, diagonal);
  }
}