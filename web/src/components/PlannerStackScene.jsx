import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, Line, OrbitControls } from "@react-three/drei";
import { GroundRobot, HudCard, Trail, worldPoint } from "./autonomyPrimitives";

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function sampleGlobalPath(path, progress) {
  const scaled = progress * (path.length - 1);
  const index = Math.min(Math.floor(scaled), path.length - 2);
  const local = scaled - index;
  const a = path[index];
  const b = path[index + 1];
  return [
    lerp(a[0], b[0], local),
    lerp(a[1], b[1], local),
    Math.atan2(b[1] - a[1], b[0] - a[0]),
  ];
}

function previewRollouts(robotState, obstacle) {
  const [x, y, theta] = robotState;
  const candidates = [];

  for (let i = -3; i <= 3; i++) {
    const curvature = i * 0.11;
    const points = [];
    let px = x;
    let py = y;
    let heading = theta;

    for (let step = 0; step < 12; step++) {
      heading += curvature;
      px += Math.cos(heading) * 0.55;
      py += Math.sin(heading) * 0.55;
      points.push([px, py]);
    }

    const minDistance = Math.min(
      ...points.map((point) => Math.hypot(point[0] - obstacle[0], point[1] - obstacle[1]))
    );
    const end = points[points.length - 1];
    const pathBias = Math.abs(end[1] - 2.5);
    const score = minDistance - pathBias * 0.4;

    candidates.push({
      id: i,
      points: [[x, y], ...points],
      minDistance,
      score,
      safe: minDistance > 1.25,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

function RolloutLines({ candidates, chosenId }) {
  return candidates.map((candidate) => {
    const color = !candidate.safe ? "#ef4444" : candidate.id === chosenId ? "#06b6d4" : "#f59e0b";

    return (
      <Line
        key={candidate.id}
        points={candidate.points.map((point) => worldPoint(point, candidate.id === chosenId ? 0.22 : 0.17))}
        color={color}
        lineWidth={candidate.id === chosenId ? 4 : 2}
      />
    );
  });
}

export default function PlannerStackScene() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showRollouts, setShowRollouts] = useState(true);
  const [progress, setProgress] = useState(0);

  const globalPath = useMemo(
    () => [
      [-8, -2.5],
      [-5, -1],
      [-2, 0.8],
      [1, 2.2],
      [4.5, 2.8],
      [8, 2.5],
    ],
    []
  );

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = setInterval(() => {
      setProgress((value) => (value >= 1 ? 0 : Math.min(1, value + 0.008)));
    }, 60);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const robotState = sampleGlobalPath(globalPath, progress);
  const obstacle = [1.8 + Math.sin(progress * Math.PI * 5) * 1.6, 2.3 + Math.cos(progress * Math.PI * 3) * 1.1];
  const candidates = previewRollouts(robotState, obstacle);
  const chosen = candidates.find((candidate) => candidate.safe) ?? candidates[0];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <label>
          <input
            type="checkbox"
            checked={showRollouts}
            onChange={(event) => setShowRollouts(event.target.checked)}
          />{" "}
          Show local rollouts
        </label>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <HudCard label="Global Planner" value="A*" />
        <HudCard label="Local Planner" value="Rollout MPC" tone="#06b6d4" />
        <HudCard label="Closest Obstacle" value={`${chosen.minDistance.toFixed(2)} m`} tone={chosen.minDistance > 1.4 ? "#0f766e" : "#b91c1c"} />
        <HudCard label="Command" value={chosen.safe ? "Bypass" : "Brake"} />
      </div>

      <div
        style={{
          height: 460,
          overflow: "hidden",
          border: "1px solid #ddd",
          borderRadius: 16,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #f8fafc 0%, #e0f2fe 100%)",
        }}
      >
        <Canvas camera={{ position: [0, 10.5, 13], fov: 45 }}>
          <ambientLight intensity={0.95} />
          <directionalLight position={[5, 10, 8]} intensity={1.25} />

          <Grid args={[22, 14]} cellSize={1} sectionSize={2} fadeDistance={18} />

          <Trail points={globalPath} color="#1d4ed8" height={0.08} lineWidth={3.5} />
          {showRollouts && <RolloutLines candidates={candidates} chosenId={chosen.id} />}

          <mesh position={worldPoint(obstacle, 0.4)}>
            <sphereGeometry args={[0.42, 18, 18]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>

          <GroundRobot state={robotState} color="#111827" label="Tracked Base" />

          <mesh position={worldPoint(globalPath[globalPath.length - 1], 0.18)}>
            <cylinderGeometry args={[0.18, 0.18, 0.36, 18]} />
            <meshStandardMaterial color="#7c3aed" />
          </mesh>

          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The dark blue line is the long-horizon global path. The orange and red previews are local candidate rollouts, and
        the cyan trajectory is the command actually selected to skirt the moving obstacle without abandoning the mission.
      </div>
    </div>
  );
}
