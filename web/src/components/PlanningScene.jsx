import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { astar, inflateGrid } from "../utils/astar";
import DebugConsole from "./DebugConsole";


const MAPS = {
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
  },
};

function buildGrid(rows, cols, obstacles) {
  const grid = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (const [r, c] of obstacles) {
    grid[r][c] = 1;
  }
  return grid;
}

function cellToWorld(row, col, rows, cols) {
  const x = col - cols / 2 + 0.5;
  const z = row - rows / 2 + 0.5;
  return [x, 0, z];
}

function Obstacles({ rows, cols, obstacles }) {
  return obstacles.map(([r, c], i) => {
    const [x, , z] = cellToWorld(r, c, rows, cols);
    return (
      <mesh key={i} position={[x, 0.5, z]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
    );
  });
}

function Marker({ row, col, rows, cols, color }) {
  const [x, , z] = cellToWorld(row, col, rows, cols);
  return (
    <mesh position={[x, 0.25, z]}>
      <cylinderGeometry args={[0.22, 0.22, 0.5, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PathLine({ rows, cols, path }) {
  const points = path.map(([r, c]) => {
    const [x, , z] = cellToWorld(r, c, rows, cols);
    return [x, 0.12, z];
  });

  return <Line points={points} color="#2563eb" lineWidth={3} />;
}

function ExploredCells({ rows, cols, exploredCells, visibleCount }) {
  return exploredCells.slice(0, visibleCount).map(([r, c], i) => {
    const [x, , z] = cellToWorld(r, c, rows, cols);
    return (
      <mesh key={i} position={[x, 0.02, z]}>
        <boxGeometry args={[0.9, 0.04, 0.9]} />
        <meshStandardMaterial color="#93c5fd" transparent opacity={0.6} />
      </mesh>
    );
  });
}

function RobotDog({ pathPoints, speed = 1, isPlaying = true }) {
  const groupRef = useRef();
  const tRef = useRef(0);

  useEffect(() => {
    tRef.current = 0;
  }, [pathPoints]);

  useFrame((_, delta) => {
    if (!groupRef.current || pathPoints.length < 2 || !isPlaying) return;

    tRef.current += delta * speed;
    const segmentCount = pathPoints.length - 1;
    const totalT = tRef.current % segmentCount;

    const idx = Math.floor(totalT);
    const localT = totalT - idx;

    const p0 = new THREE.Vector3(...pathPoints[idx]);
    const p1 = new THREE.Vector3(...pathPoints[Math.min(idx + 1, pathPoints.length - 1)]);

    const pos = new THREE.Vector3().lerpVectors(p0, p1, localT);
    groupRef.current.position.copy(pos);

    const dir = new THREE.Vector3().subVectors(p1, p0);
    const yaw = Math.atan2(dir.x, dir.z);
    groupRef.current.rotation.y = yaw;
  });

  return (
    <group ref={groupRef} position={pathPoints[0] || [0, 0.16, 0]}>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.9, 0.35, 0.45]} />
        <meshStandardMaterial color="#f59e0b" />
      </mesh>

      <mesh position={[0, 0.52, 0.32]}>
        <boxGeometry args={[0.35, 0.22, 0.22]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>

      {[
        [-0.25, 0.15, -0.15],
        [0.25, 0.15, -0.15],
        [-0.25, 0.15, 0.15],
        [0.25, 0.15, 0.15],
      ].map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.08, 0.3, 0.08]} />
          <meshStandardMaterial color="#92400e" />
        </mesh>
      ))}
    </group>
  );
}

function CurrentCell({ rows, cols, cell }) {
    if (!cell) return null;
  
    const [r, c] = cell;
    const [x, , z] = cellToWorld(r, c, rows, cols);
  
    return (
      <mesh position={[x, 0.08, z]}>
        <boxGeometry args={[0.95, 0.08, 0.95]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.95} />
      </mesh>
    );
  }

export default function PlanningScene() {
  const [mapKey, setMapKey] = useState("open");
  const [speed, setSpeed] = useState(1.0);
  const [showPath, setShowPath] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [diagonal, setDiagonal] = useState(true);
  const [showSearch, setShowSearch] = useState(true);
  const [searchSpeed, setSearchSpeed] = useState(20);

  const map = MAPS[mapKey];
  const { rows, cols, obstacles, start, goal } = map;

  const rawGrid = useMemo(() => buildGrid(rows, cols, obstacles), [rows, cols, obstacles]);

  const inflationRadius = mapKey === "open" ? 1 : 0;

  const grid = useMemo(
    () => inflateGrid(rawGrid, inflationRadius, start, goal),
    [rawGrid, inflationRadius, start, goal]
  );

//   const result = useMemo(() => {
//     return astar(grid, start, goal, diagonal);
//   }, [grid, start, goal, diagonal]);

  const result = useMemo(() => {
    return astar(grid, start, goal, diagonal);
  }, [grid, start, goal, diagonal]);
const debugLog = result.debugLog || [];

  const path = result.path || [];
  const exploredOrder = result.exploredOrder || [];
  

  const [visibleExplored, setVisibleExplored] = useState(0);

  const currentCell =
    visibleExplored > 0 && visibleExplored <= exploredOrder.length
        ? exploredOrder[visibleExplored - 1]
        : null;

  useEffect(() => {
    if (!showSearch) {
      setVisibleExplored(exploredOrder.length);
      return;
    }

    setVisibleExplored(0);

    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setVisibleExplored(i);
      if (i >= exploredOrder.length) clearInterval(interval);
    }, 1000 / searchSpeed);

    return () => clearInterval(interval);
  }, [exploredOrder, showSearch, searchSpeed, mapKey, diagonal]);

  const pathPoints = useMemo(() => {
    return path.map(([r, c]) => {
      const [x, , z] = cellToWorld(r, c, rows, cols);
      return [x, 0.16, z];
    });
  }, [path, rows, cols]);

  const robotCanMove = isPlaying && visibleExplored >= exploredOrder.length;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <label>
          Map{" "}
          <select value={mapKey} onChange={(e) => setMapKey(e.target.value)}>
            <option value="open">Open</option>
            <option value="warehouse">Warehouse</option>
            <option value="blocked">Blocked</option>
          </select>
        </label>

        <label>
          Speed{" "}
          <input
            type="range"
            min="0.2"
            max="3"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{speed.toFixed(1)}x</span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={showPath}
            onChange={(e) => setShowPath(e.target.checked)}
          />{" "}
          Show path
        </label>

        <label>
          <input
            type="checkbox"
            checked={diagonal}
            onChange={(e) => setDiagonal(e.target.checked)}
          />{" "}
          8-connected
        </label>

        <label>
          <input
            type="checkbox"
            checked={showSearch}
            onChange={(e) => setShowSearch(e.target.checked)}
          />{" "}
          Show search
        </label>

        <label>
          Search speed{" "}
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={searchSpeed}
            onChange={(e) => setSearchSpeed(Number(e.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{searchSpeed}</span>
        </label>

        <button onClick={() => setIsPlaying((v) => !v)}>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div
  style={{
    display: "flex",
    gap: 16,
    alignItems: "stretch",
  }}
>
  {/* LEFT: Canvas */}
  <div
    style={{
      flex: 1,
      height: 420,
      overflow: "hidden",
      border: "1px solid #ddd",
      borderRadius: 16,
      boxSizing: "border-box",
    }}
  >
    <Canvas
      style={{ width: "100%", height: "100%", display: "block" }}
      camera={{ position: [8, 10, 8], fov: 50 }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} />

      <Grid args={[10, 10]} cellSize={1} cellThickness={0.8} sectionSize={5} fadeDistance={20} fadeStrength={1} />

      <Obstacles rows={rows} cols={cols} obstacles={obstacles} />

      {showSearch && (
        <ExploredCells
          rows={rows}
          cols={cols}
          exploredCells={exploredOrder}
          visibleCount={visibleExplored}
        />
      )}

      {showSearch && (
        <CurrentCell
          rows={rows}
          cols={cols}
          cell={currentCell}
        />
      )}

      <Marker row={start[0]} col={start[1]} rows={rows} cols={cols} color="#16a34a" />
      <Marker row={goal[0]} col={goal[1]} rows={rows} cols={cols} color="#dc2626" />

      {showPath && path.length > 0 && (
        <PathLine rows={rows} cols={cols} path={path} />
      )}

      {pathPoints.length > 0 && (
        <RobotDog pathPoints={pathPoints} speed={speed} isPlaying={robotCanMove} />
      )}

      <OrbitControls enablePan={false} />
    </Canvas>
  </div>

  {/* RIGHT: Debug Console */}
  <div
  style={{
    flex: 1,
    height: 420,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
  }}
>
  <div style={{ marginBottom: 8, fontWeight: 600 }}>
    Planner Debug Output
  </div>

  <div style={{ flex: 1, minHeight: 0 }}>
    <DebugConsole lines={debugLog.slice(0, visibleExplored)} />
  </div>
</div>
</div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15 }}>
        {path.length > 0 ? (
          <>
            Path cost: <strong>{result.cost.toFixed(2)}</strong>
            {" · "}
            Nodes explored: <strong>{result.explored}</strong>
            {" · "}
            Clearance: <strong>{inflationRadius}</strong>
          </>
        ) : (
          <>
            <strong>No path found</strong>
            {" · "}
            Nodes explored: <strong>{result.explored}</strong>
          </>
        )}
      </div>
      </div>
    
  );
  
  
}