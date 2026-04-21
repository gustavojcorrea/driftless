import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line } from "@react-three/drei";

const gridData = {
  rows: 10,
  cols: 10,
  obstacles: [
    [2, 2], [2, 3], [2, 4],
    [5, 5], [6, 5], [7, 5],
    [7, 2], [7, 3]
  ],
  start: [0, 0],
  goal: [9, 9],
  path: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 1],
    [6, 2],
    [7, 3],
    [8, 4],
    [8, 5],
    [8, 6],
    [9, 7],
    [9, 8],
    [9, 9]
  ]
};

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
        <meshStandardMaterial color="#FFF" />
      </mesh>
    );
  });
}

function Marker({ row, col, rows, cols, color }) {
  const [x, , z] = cellToWorld(row, col, rows, cols);
  return (
    <mesh position={[x, 0.3, z]}>
      <cylinderGeometry args={[0.25, 0.25, 0.6, 24]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function PathLine({ rows, cols, path }) {
  const points = path.map(([r, c]) => {
    const [x, , z] = cellToWorld(r, c, rows, cols);
    return [x, 0.15, z];
  });

  return <Line points={points} color="#2563eb" lineWidth={3} />;
}

export default function PlanningScene() {
  const { rows, cols, obstacles, start, goal, path } = gridData;

  return (
    <div
        style={{
            width: "100%",
            maxWidth: "100%",
            height: 420,
            overflow: "hidden",
            border: "1px solid #ddd",
            borderRadius: 16,
            position: "relative",
            boxSizing: "border-box",
        }}
        >
  <Canvas
    style={{ width: "100%", height: "100%", display: "block" }}
    camera={{ position: [8, 10, 8], fov: 50 }}
  >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} />
        <Grid args={[10, 10]} cellSize={1} cellThickness={0.8} sectionSize={5} fadeDistance={20} fadeStrength={1} />
        <Obstacles rows={rows} cols={cols} obstacles={obstacles} />
        <Marker row={start[0]} col={start[1]} rows={rows} cols={cols} color="#16a34a" />
        <Marker row={goal[0]} col={goal[1]} rows={rows} cols={cols} color="#dc2626" />
        <PathLine rows={rows} cols={cols} path={path} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}