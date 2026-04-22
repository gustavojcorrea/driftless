import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import DebugConsole from "./DebugConsole";
import { runPlanner } from "../planners";
import { buildGrid, buildCostGrid, cellToWorld } from "../utils/grid";
import { inflateGrid } from "../planners/astar";

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

function CostCells({ rows, cols, costGrid }) {
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cost = costGrid[r][c];
      if (cost <= 0) continue;
      const [x, , z] = cellToWorld(r, c, rows, cols);
      cells.push(
        <mesh key={`${r}-${c}`} position={[x, 0.01, z]}>
          <boxGeometry args={[0.95, 0.02, 0.95]} />
          <meshStandardMaterial color="#fca5a5" transparent opacity={0.45} />
        </mesh>
      );
    }
  }
  return cells;
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

export default function PlannerRow({
  title,
  algorithm,
  map,
  diagonal,
  searchSpeed,
  speed = 1,
  showPath = true,
  showSearch = true,
}) {
  const { rows, cols, obstacles, start, goal, costZones = [] } = map;

  const rawGrid = useMemo(() => buildGrid(rows, cols, obstacles), [rows, cols, obstacles]);
  const costGrid = useMemo(() => buildCostGrid(rows, cols, costZones), [rows, cols, costZones]);

  const inflationRadius = algorithm === "astar" ? 1 : 0;
  const grid = useMemo(
    () => inflateGrid(rawGrid, inflationRadius, start, goal),
    [rawGrid, inflationRadius, start, goal]
  );

  const result = useMemo(() => {
    return runPlanner({
      algorithm,
      grid,
      costGrid,
      start,
      goal,
      diagonal,
    });
  }, [algorithm, grid, costGrid, start[0], start[1], goal[0], goal[1], diagonal]);

  const path = result.path || [];
  const exploredOrder = result.exploredOrder || [];
  const debugLog = result.debugLog || [];

  const [visibleExplored, setVisibleExplored] = useState(0);

  useEffect(() => {
    if (!showSearch) {
      setVisibleExplored(exploredOrder.length);
      return;
    }
  
    setVisibleExplored(0);
  
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
  
      if (i >= exploredOrder.length) {
        setVisibleExplored(exploredOrder.length);
        clearInterval(interval);
        return;
      }
  
      setVisibleExplored(i);
    }, 1000 / searchSpeed);
  
    return () => clearInterval(interval);
  }, [exploredOrder, showSearch, searchSpeed, algorithm, diagonal]);

  const currentCell =
    visibleExplored > 0 && visibleExplored <= exploredOrder.length
      ? exploredOrder[visibleExplored - 1]
      : null;

  const pathPoints = useMemo(() => {
    return path.map(([r, c]) => {
      const [x, , z] = cellToWorld(r, c, rows, cols);
      return [x, 0.16, z];
    });
  }, [path, rows, cols]);

  const robotCanMove = visibleExplored >= exploredOrder.length;

  return (
    <section style={{ marginTop: 40 }}>
      <div style={{ marginBottom: 12 }}>
        <h3 style={{ margin: "0 0 6px", fontSize: 24 }}>{title}</h3>
        <div style={{ color: "#555", fontSize: 14 }}>
          Algorithm: <strong>{algorithm}</strong>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
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

            <CostCells rows={rows} cols={cols} costGrid={costGrid} />
            <Obstacles rows={rows} cols={cols} obstacles={obstacles} />

            {showSearch && (
              <ExploredCells
                rows={rows}
                cols={cols}
                exploredCells={exploredOrder}
                visibleCount={visibleExplored}
              />
            )}

            {showSearch && <CurrentCell rows={rows} cols={cols} cell={currentCell} />}

            <Marker row={start[0]} col={start[1]} rows={rows} cols={cols} color="#16a34a" />
            <Marker row={goal[0]} col={goal[1]} rows={rows} cols={cols} color="#dc2626" />

            {showPath && path.length > 0 && (
              <PathLine rows={rows} cols={cols} path={path} algorithm={algorithm} />
            )}

            {pathPoints.length > 0 && (
              <RobotDog pathPoints={pathPoints} speed={speed} isPlaying={robotCanMove} />
            )}

            <OrbitControls enablePan={false} />
          </Canvas>
        </div>

        <div
          style={{
            flex: 1,
            height: 420,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Planner Debug Output</div>
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
    </section>
  );
}