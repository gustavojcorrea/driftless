import { Html, Line } from "@react-three/drei";

export function worldPoint([x, y], height = 0.12) {
  return [x, height, y];
}

export function Trail({ points, color, height = 0.12, lineWidth = 3 }) {
  if (!points || points.length < 2) return null;

  return (
    <Line
      points={points.map((point) => worldPoint(point, height))}
      color={color}
      lineWidth={lineWidth}
    />
  );
}

export function GroundRobot({
  state,
  color,
  label,
  body = [0.5, 0.18, 0.34],
  showLabel = true,
}) {
  const [x, y, theta] = state;

  return (
    <group position={[x, 0.16, y]} rotation={[0, -theta, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={body} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.18, body[2] * 0.62]}>
        <coneGeometry args={[0.09, 0.22, 20]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {showLabel && (
        <Html position={[0, 0.52, 0]} center>
          <div
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
              whiteSpace: "nowrap",
              color: "#111827",
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
}

export function HudCard({ label, value, tone = "#111827" }) {
  return (
    <div
      style={{
        flex: "1 1 160px",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#6b7280",
        }}
      >
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 700, color: tone }}>
        {value}
      </div>
    </div>
  );
}
