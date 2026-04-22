import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { GroundRobot, HudCard, Trail, worldPoint } from "./autonomyPrimitives";

function generateSlamFrames(steps = 220) {
  const landmarks = [
    [-7, -5],
    [-2, 6],
    [5, 7],
    [8, -2],
    [1, -8],
    [-6, 2],
  ];

  const frames = [];

  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const nextT = ((i + 1) / steps) * Math.PI * 2;

    const truePose = [
      8 * Math.cos(t) + 1.5 * Math.cos(2 * t),
      6 * Math.sin(t),
      Math.atan2(
        6 * Math.sin(nextT) - 6 * Math.sin(t),
        8 * Math.cos(nextT) - 8 * Math.cos(t)
      ),
    ];

    const drift = [0.018 * i, -0.012 * i, 0.0018 * i];
    const odomPose = [
      truePose[0] + drift[0],
      truePose[1] + drift[1],
      truePose[2] + drift[2],
    ];

    const loopClosureBlend = i < steps * 0.82 ? 1 : Math.max(0, 1 - (i - steps * 0.82) / (steps * 0.18));
    const correctedPose = [
      truePose[0] + drift[0] * loopClosureBlend,
      truePose[1] + drift[1] * loopClosureBlend,
      truePose[2] + drift[2] * loopClosureBlend,
    ];

    const visibleScans = landmarks
      .filter(([lx, ly]) => Math.hypot(lx - truePose[0], ly - truePose[1]) < 9)
      .map(([lx, ly], index) => ({
        id: `${i}-${index}`,
        world: [lx, ly],
        mappedBeforeClosure: [lx + drift[0], ly + drift[1]],
        mappedAfterClosure: [
          lx + drift[0] * loopClosureBlend,
          ly + drift[1] * loopClosureBlend,
        ],
      }));

    frames.push({
      time: i * 0.1,
      truePose,
      odomPose,
      correctedPose,
      loopClosureBlend,
      visibleScans,
    });
  }

  return { frames, landmarks };
}

function LandmarkField({ landmarks }) {
  return landmarks.map(([x, y], index) => (
    <mesh key={index} position={worldPoint([x, y], 0.45)}>
      <boxGeometry args={[0.45, 0.9, 0.45]} />
      <meshStandardMaterial color="#1f2937" />
    </mesh>
  ));
}

function ScanCloud({ points, color, opacity = 0.5 }) {
  return points.map((point, index) => (
    <mesh key={index} position={worldPoint(point, 0.08)}>
      <sphereGeometry args={[0.07, 10, 10]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  ));
}

export default function SlamScene() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showLoopClosure, setShowLoopClosure] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);

  const { frames, landmarks } = useMemo(() => generateSlamFrames(), []);
  const frame = frames[frameIndex];

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = setInterval(() => {
      setFrameIndex((index) => (index + 1 >= frames.length ? 0 : index + 1));
    }, 1000 / (16 * speed));

    return () => clearInterval(interval);
  }, [frames.length, isPlaying, speed]);

  const visibleFrames = frames.slice(0, frameIndex + 1);
  const trueTrail = visibleFrames.map((item) => item.truePose.slice(0, 2));
  const odomTrail = visibleFrames.map((item) => item.odomPose.slice(0, 2));
  const correctedTrail = visibleFrames.map((item) =>
    (showLoopClosure ? item.correctedPose : item.odomPose).slice(0, 2)
  );
  const mappedPoints = visibleFrames.flatMap((item) =>
    item.visibleScans.map((scan) =>
      showLoopClosure ? scan.mappedAfterClosure : scan.mappedBeforeClosure
    )
  );

  const loopClosureActive = showLoopClosure && frame.loopClosureBlend < 0.98;
  const driftError = Math.hypot(
    frame.odomPose[0] - frame.truePose[0],
    frame.odomPose[1] - frame.truePose[1]
  );
  const correctedError = Math.hypot(
    (showLoopClosure ? frame.correctedPose[0] : frame.odomPose[0]) - frame.truePose[0],
    (showLoopClosure ? frame.correctedPose[1] : frame.odomPose[1]) - frame.truePose[1]
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <button onClick={() => setIsPlaying((value) => !value)}>
          {isPlaying ? "Pause" : "Play"}
        </button>

        <label>
          Speed{" "}
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{speed.toFixed(1)}x</span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={showLoopClosure}
            onChange={(event) => setShowLoopClosure(event.target.checked)}
          />{" "}
          Apply loop closure
        </label>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <HudCard label="Time" value={`${frame.time.toFixed(1)} s`} />
        <HudCard label="Odom Drift" value={driftError.toFixed(2)} tone="#b91c1c" />
        <HudCard label="Map Error" value={correctedError.toFixed(2)} tone="#0f766e" />
        <HudCard
          label="Loop Closure"
          value={loopClosureActive ? "Closing" : showLoopClosure ? "Healthy" : "Off"}
          tone={loopClosureActive ? "#d97706" : "#111827"}
        />
      </div>

      <div
        style={{
          height: 460,
          overflow: "hidden",
          border: "1px solid #ddd",
          borderRadius: 16,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        }}
      >
        <Canvas camera={{ position: [0, 16, 16], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[8, 12, 4]} intensity={1.3} />

          <Grid args={[28, 28]} cellSize={1} sectionSize={4} fadeDistance={24} />

          <LandmarkField landmarks={landmarks} />
          <Trail points={trueTrail} color="#111827" height={0.08} />
          <Trail points={odomTrail} color="#ef4444" height={0.11} />
          <Trail points={correctedTrail} color="#14b8a6" height={0.14} />
          <ScanCloud points={mappedPoints} color="#60a5fa" opacity={0.32} />

          <GroundRobot state={frame.truePose} color="#111827" label="Truth" />
          <GroundRobot
            state={showLoopClosure ? frame.correctedPose : frame.odomPose}
            color={showLoopClosure ? "#14b8a6" : "#ef4444"}
            label={showLoopClosure ? "SLAM Pose" : "Drifting Odom"}
          />

          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The red odometry path drifts over time. The teal SLAM path shows how scan matching and loop closure pull the pose
        graph back toward the true trajectory while keeping the landmark map coherent.
      </div>
    </div>
  );
}
