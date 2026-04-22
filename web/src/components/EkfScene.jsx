import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { simulateEkfDemo } from "../simulation/ekfSimulator";
import { GroundRobot, HudCard, Trail, worldPoint } from "./autonomyPrimitives";

function MeasurementCloud({ measurements }) {
  return measurements.map((measurement, index) => (
    <mesh key={index} position={worldPoint(measurement, 0.06)}>
      <sphereGeometry args={[0.07, 12, 12]} />
      <meshStandardMaterial color="#60a5fa" transparent opacity={0.45} />
    </mesh>
  ));
}

function CovarianceDisk({ frame }) {
  const { estimate, ellipse } = frame;
  const [x, y] = estimate;

  return (
    <mesh
      position={[x, 0.03, y]}
      rotation={[-Math.PI / 2, 0, ellipse.angle]}
      scale={[ellipse.major, ellipse.minor, 1]}
    >
      <circleGeometry args={[0.5, 48]} />
      <meshStandardMaterial color="#f59e0b" transparent opacity={0.18} />
    </mesh>
  );
}

export default function EkfScene() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [showCovariance, setShowCovariance] = useState(true);
  const [trailLength, setTrailLength] = useState(80);
  const [frameIndex, setFrameIndex] = useState(0);

  const frames = useMemo(() => simulateEkfDemo(), []);
  const frame = frames[frameIndex];

  useEffect(() => {
    if (!isPlaying) return undefined;

    const interval = setInterval(() => {
      setFrameIndex((index) => (index + 1 >= frames.length ? 0 : index + 1));
    }, 1000 / (18 * speed));

    return () => clearInterval(interval);
  }, [frames.length, isPlaying, speed]);

  const start = Math.max(0, frameIndex - trailLength + 1);
  const visibleFrames = frames.slice(start, frameIndex + 1);
  const truthTrail = visibleFrames.map((item) => item.trueState.slice(0, 2));
  const estimateTrail = visibleFrames.map((item) => item.estimate.slice(0, 2));
  const measurements = visibleFrames.map((item) => item.measurement);

  const gpsError = Math.hypot(
    frame.measurement[0] - frame.trueState[0],
    frame.measurement[1] - frame.trueState[1]
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
          Trail{" "}
          <input
            type="range"
            min="20"
            max="180"
            step="10"
            value={trailLength}
            onChange={(event) => setTrailLength(Number(event.target.value))}
          />
          <span style={{ marginLeft: 8 }}>{trailLength} steps</span>
        </label>

        <label>
          <input
            type="checkbox"
            checked={showMeasurements}
            onChange={(event) => setShowMeasurements(event.target.checked)}
          />{" "}
          Show GPS
        </label>

        <label>
          <input
            type="checkbox"
            checked={showCovariance}
            onChange={(event) => setShowCovariance(event.target.checked)}
          />{" "}
          Show covariance
        </label>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <HudCard label="Time" value={`${frame.time.toFixed(1)} s`} />
        <HudCard label="GPS Error" value={gpsError.toFixed(2)} tone="#2563eb" />
        <HudCard label="EKF Error" value={frame.error.toFixed(2)} tone="#d97706" />
        <HudCard label="Heading" value={`${frame.estimate[2].toFixed(2)} rad`} />
      </div>

      <div
        style={{
          height: 480,
          overflow: "hidden",
          border: "1px solid #ddd",
          borderRadius: 16,
          boxSizing: "border-box",
          background:
            "linear-gradient(180deg, rgba(247,250,252,1) 0%, rgba(239,246,255,1) 100%)",
        }}
      >
        <Canvas camera={{ position: [6, 10, 12], fov: 45 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[8, 10, 4]} intensity={1.2} />

          <Grid
            args={[36, 36]}
            cellSize={1}
            cellThickness={0.7}
            sectionSize={6}
            sectionThickness={1.2}
            fadeDistance={32}
            fadeStrength={1}
          />

          <Trail points={truthTrail} color="#111827" height={0.1} />
          <Trail points={estimateTrail} color="#f59e0b" height={0.14} />
          {showMeasurements && <MeasurementCloud measurements={measurements} />}
          {showCovariance && <CovarianceDisk frame={frame} />}

          <GroundRobot state={frame.trueState} color="#111827" label="Ground Truth" />
          <GroundRobot state={frame.estimate} color="#f59e0b" label="EKF Estimate" />

          <mesh position={worldPoint(frame.measurement, 0.08)}>
            <sphereGeometry args={[0.12, 18, 18]} />
            <meshStandardMaterial color="#2563eb" />
          </mesh>

          <OrbitControls enablePan={false} />
        </Canvas>
      </div>

      <div style={{ marginTop: 14, color: "#444", fontSize: 15, lineHeight: 1.6 }}>
        The black robot is ground truth, the blue dot cloud is noisy GPS, and the amber robot is the EKF estimate.
        The shaded amber disk shows the 2-sigma position uncertainty implied by the covariance matrix.
      </div>
    </div>
  );
}
