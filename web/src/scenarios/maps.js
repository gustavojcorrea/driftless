export const MAPS = {
  open: {
    rows: 10,
    cols: 10,
    obstacles: [
      [2, 2], [2, 3], [2, 4],
      [5, 5], [6, 5], [7, 5],
      [7, 2], [7, 3],
    ],
    start: [0, 0],
    goal: [9, 9],
    costZones: [
      {
        cells: [
          [3, 5], [4, 5], [5, 6], [6, 6], [7, 6], [8, 6]
        ],
        cost: 10,
      },
    ],
  },
  warehouse: {
    rows: 10,
    cols: 10,
    obstacles: [
      [1, 4], [2, 4], [3, 4], [4, 4],
      [6, 6], [6, 7], [6, 8],
      [7, 2], [8, 2],
    ],
    start: [0, 0],
    goal: [9, 8],
    costZones: [
      { cells: [[4, 6], [5, 6], [5, 7], [6, 5]], cost: 3 },
    ],
  },
  blocked: {
    rows: 10,
    cols: 10,
    obstacles: [
      [1, 1], [1, 2], [1, 3], [1, 4],
      [2, 4], [3, 4], [4, 4],
      [5, 4], [6, 4], [7, 4],
      [8, 4], [8, 5], [8, 6],
    ],
    start: [0, 0],
    goal: [9, 9],
    costZones: [],
  },
};