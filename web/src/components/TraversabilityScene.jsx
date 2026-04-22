import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { GroundRobot, HudCard, Trail, worldPoint } from "./autonomyPrimitives";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function createTerrain(rows = 14, cols = 14) {
  const cells = [];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c - cols / 2 + 0.5;
      const y = r - rows / 2 + 0.5;
      const roughness = 0.35 * Math.sin(c * 0.55) + 0.28 * Math.cos(r * 0.6);
      const slope = Math.exp(-((x - 1.5) ** 2 + (y + 0.2) ** 2) / 18) * 0.8;
      const hazard = Math.exp(-((x + 2.4) ** 2 + (y - 3.2) ** 2) / 5) * 1.4;
      const obstacle = Math.abs(x - 3.5) < 0.7 && y > -4 && y < 2 ? 1.8 : 0;
      const cost = Math.max(0, 0.8 + roughness + slope + hazard + obstacle);
      const height = 0.14 + slope * 0.55 + Math.max(0, roughness) * 0.12;

      cells.push({ r, c, x, y, cost, height, blocked: obstacle > 0 });
    }
  }

  return { rows, cols, cells };
}

function costColor(cost, blocked) {
  if (blocked) return "#111827";
  if (cost < 0.9) return "#86efac";
  if (cost < 1.4) return "#fde68a";
  if (cost < 1.9) return "#fb923c";
  return "#ef4444";
}

function TerrainCells({ cells, showGeometry }) {
  return cells.map((cell) => (
    <mesh key={`${cell.r}-${cell.c}`} position={[cell.x, showGeometry ? cell.height / 2 : 0.02, cell.y]}>
      <boxGeometry args={[0.94, showGeometry ? cell.height : 0.04, 0.94]} />
      <meshStandardMaterial color={costColor(cell.cost, cell.blocked)} />
    </mesh>
  ));
}

function interpolatePath(path, progress) {
  if (path.length === 0) return [0, 0, 0];
  if (path.length === 1) return [...path[0], 0];

  const scaled = progress * (path.length - 1);
  const index = Math.min(Math.floor(scaled), path.length - 2);
  const local = scaled - index;
  const a = path[index];
  const b = path[index + 1];
  const x = lerp(a[0], b[0], local);
  const y = lerp(a[1], b[1], local);
  const theta = Math.atan2(b[1] - a[1], b[0] - a[0]);
  return [x, y, theta];
}

export default function TraversabilityScene() {
  const [useAwarePath, setUseAwarePath] = useState(true);
  const [showGeometry, setShowGeometry] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const terrain = useMemo(() => createTerrain(), []);
  const directPath = useMemo(
    () => [
      [-6, -5],
      [-3.5, -2.8],
      [-0.2, -0.5],
      [2.4, 1.5],
      [5.4, 5],
    ],
    []
  );
  const awarePath = useMemo(
    () => [
      [-6, -5],
      [-5.2, -2.4],
      [-4.4, 0.8],
      [-2.2, 3.8],
      [1.4, 5.6],
      [5.4, 5],
    ],
    []
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = setInterval(() => {
      setProgress((value) => (value >= 1 ? 0 : Math.min(1, value + 0.01)));
    }, 70);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const path = useAwarePath ? awarePath : directPath;
  const robotState = interpolatePath(path, progress);
  const costSummary = terrain.cells.reduce((sum, cell) => sum + cell.cost, 0) / terrain.cells.length;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <label>
          <input
            type="checkbox"
            checked={useAwarePath}
            onChange={(event) => setUseAwarePath(event.target.checked)}
          />{" "}
          Use traversability-aware path
        </label>

        <label>
          <input
            type="checkbox"
            checked={showGeometry}
            onChange={(event) => setShowGeometry(event.target.checked)}
          />{" "}
          Show terrain relief
        </label>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <HudCard label="Mean Cost" value={costSummary.toFixed(2)} />
        <HudCard label="Planner" value={useAwarePath ? "Costmap" : "Naive"} tone={useAwarePath ? "#0f766e" : "#b91c1c"} />
        <HudCard label="Risk" value={useAwarePath ? "Low" : "High"} tone={useAwarePath ? "#0f766e" : "#b91c1c"} />
        <HudCard label="Goal" value="Ridge Camp" />
      </div>

      <div
        style={{
          height: 460,
          overflow: "hidden",
          border: "1px solid #ddd",
          borderRadius: 16,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #f8fafc 0%, #ecfccb 100%)",
        }}
      >
        <Canvas camera={{ position: [0, 12, 14], fov: 45 }}>
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 10, 6]} intensity={1.2} />

          <Grid args={[18, 18]} cellSize={1} sectionSize={3} fadeDistance={20} />

          <TerrainCells cells={terrain.cells} showGeometry={showGeometry} />
          <Trail points={directPath} color="#ef4444" height={0.18} lineWidth={2.5} />
          <Trail points={awarePath} color="#0f766e" height={0.22} lineWidth={4} />

          <mesh position={worldPoint(directPath[0], 0.18)}>
            <cylinderGeometry args={[0.18, 0.18, 0.36, 18]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>
          <mesh position={worldPoint(awarePath[awarePath.length - 1], 0.18)}>
            <cylinderGeometry args={[0.18, 0.18, 0.36, 18]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>

          <GroundRobot
            state={robotState}
            color={useAwarePath ? "#0f766e" : "#ef4444"}
            label={useAwarePath ? "Cost-Aware Robot" : "Naive Robot"}
          />

          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The terrain is colored by traversability cost. The red route cuts straight through rough, risky cells, while the
        green route bends around steep and high-cost terrain the way a costmap-driven planner would.
      </div>
    </div>
  );
}
