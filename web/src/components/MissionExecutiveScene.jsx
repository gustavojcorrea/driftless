import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { GroundRobot, HudCard, Trail, worldPoint } from "./autonomyPrimitives";

function moveToward(current, target, step = 0.06) {
  const dx = target[0] - current[0];
  const dy = target[1] - current[1];
  const dist = Math.hypot(dx, dy);

  if (dist < step) {
    return [target[0], target[1]];
  }

  return [current[0] + (dx / dist) * step, current[1] + (dy / dist) * step];
}

function stateTone(mode) {
  switch (mode) {
    case "Inspect":
      return "#7c3aed";
    case "Avoid Hazard":
      return "#b91c1c";
    case "Return":
      return "#0369a1";
    default:
      return "#0f766e";
  }
}

export default function MissionExecutiveScene() {
  const waypoints = useMemo(
    () => ({
      depot: [-7, -4],
      alpha: [-2, 4],
      bravo: [5.2, 5.2],
      science: [6.8, -0.8],
      relay: [-1.5, -5.5],
      avoid: [2.2, -5.4],
    }),
    []
  );

  const hazard = [3.4, 2.2];
  const legs = useMemo(
    () => [
      { key: "Alpha", target: waypoints.alpha, mode: "Transit", task: "Navigate to Alpha" },
      { key: "Bravo", target: waypoints.bravo, mode: "Inspect", task: "Inspect survey node Bravo" },
      { key: "Avoid", target: waypoints.avoid, mode: "Avoid Hazard", task: "Reroute around unstable soil" },
      { key: "Science", target: waypoints.science, mode: "Transit", task: "Reach science target" },
      { key: "Relay", target: waypoints.relay, mode: "Return", task: "Return to relay station" },
      { key: "Depot", target: waypoints.depot, mode: "Return", task: "Return to depot" },
    ],
    [waypoints]
  );

  const [isPlaying, setIsPlaying] = useState(true);
  const [mode, setMode] = useState(legs[0].mode);
  const [task, setTask] = useState(legs[0].task);
  const [robot, setRobot] = useState([-7, -4, 0]);
  const [target, setTarget] = useState(legs[0].target);
  const [history, setHistory] = useState([[-7, -4]]);
  const [visited, setVisited] = useState(["Depot"]);
  const [legIndex, setLegIndex] = useState(0);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = setInterval(() => {
      setRobot((current) => {
        const [nx, ny] = moveToward(current, target);
        const theta = Math.atan2(target[1] - current[1], target[0] - current[0]);
        const next = [nx, ny, theta];

        setHistory((path) => [...path, [nx, ny]]);

        const reached = Math.hypot(nx - target[0], ny - target[1]) < 0.12;
        if (reached) {
          const nextLegIndex = (legIndex + 1) % legs.length;
          const completedLeg = legs[legIndex];
          const nextLeg = legs[nextLegIndex];
          setLegIndex(nextLegIndex);
          setMode(nextLeg.mode);
          setTask(nextLeg.task);
          setTarget(nextLeg.target);
          setVisited((items) =>
            items.includes(completedLeg.key) ? items : [...items, completedLeg.key]
          );
        }

        return next;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isPlaying, legIndex, legs, target]);

  const pendingGoals = ["Alpha", "Bravo", "Science", "Relay", "Depot"].filter(
    (item) => !visited.includes(item)
  );
  const queueLabels = [
    "Transit to Alpha",
    "Inspect Bravo",
    "Avoid Hazard",
    "Science Target",
    "Return via Relay",
    "Return to Depot",
  ];

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <HudCard label="Behavior" value={mode} tone={stateTone(mode)} />
        <HudCard label="Task" value={task.split(" ").slice(0, 2).join(" ")} />
        <HudCard label="Visited" value={`${visited.length}`} tone="#0369a1" />
        <HudCard label="Pending Goals" value={`${pendingGoals.length}`} tone="#7c3aed" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 16,
          alignItems: "stretch",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 620px",
            height: 460,
            overflow: "hidden",
            border: "1px solid #ddd",
            borderRadius: 16,
            boxSizing: "border-box",
            background: "linear-gradient(180deg, #f8fafc 0%, #ede9fe 100%)",
          }}
        >
          <Canvas camera={{ position: [0, 11, 13], fov: 45 }}>
            <ambientLight intensity={0.95} />
            <directionalLight position={[6, 10, 6]} intensity={1.25} />

            <Grid args={[22, 18]} cellSize={1} sectionSize={3} fadeDistance={18} />
            <Trail points={history} color="#7c3aed" height={0.08} lineWidth={3.5} />

            {Object.entries(waypoints).map(([key, point]) => (
              <mesh key={key} position={worldPoint(point, 0.18)}>
                <cylinderGeometry args={[0.18, 0.18, 0.36, 18]} />
                <meshStandardMaterial color={key === "avoid" ? "#f59e0b" : "#334155"} />
              </mesh>
            ))}

            <mesh position={worldPoint(hazard, 0.08)}>
              <cylinderGeometry args={[1.05, 1.05, 0.08, 40]} />
              <meshStandardMaterial color="#ef4444" transparent opacity={0.3} />
            </mesh>

            <GroundRobot state={robot} color="#7c3aed" label="Mission Rover" />

            <OrbitControls enablePan={false} />
          </Canvas>
        </div>

        <div
          style={{
            flex: "1 1 280px",
            minWidth: 260,
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: 18,
            background: "#fff",
            boxSizing: "border-box",
          }}
        >
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#6b7280" }}>
            Mission Executive
          </div>
          <div style={{ marginTop: 8, fontSize: 26, fontWeight: 700, color: "#111827" }}>{mode}</div>
          <div style={{ marginTop: 10, color: "#374151", lineHeight: 1.6 }}>{task}</div>

          <div style={{ marginTop: 22, fontWeight: 700, color: "#111827" }}>Behavior Queue</div>
          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {queueLabels.map((item, index) => (
              <div
                key={item}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: "10px 12px",
                  background: index === legIndex ? "#f5f3ff" : "#f8fafc",
                  color: "#111827",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 22, fontWeight: 700, color: "#111827" }}>Visited Goals</div>
          <div style={{ marginTop: 10, color: "#475569", lineHeight: 1.8 }}>
            {visited.join(" -> ")}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        This scene makes the high-level mission layer visible: not just where the robot is going, but what behavior is
        active, which goals are complete, and when the executive inserts an avoidance or return-home task.
      </div>
    </div>
  );
}
