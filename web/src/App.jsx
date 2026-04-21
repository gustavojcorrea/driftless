export default function App() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 24px", fontFamily: "Inter, system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 48, marginBottom: 12 }}>driftless</h1>
      <p style={{ fontSize: 20, lineHeight: 1.5, maxWidth: 720 }}>
        Minimal autonomy stack for state estimation and navigation.
      </p>

      <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 720, marginTop: 16 }}>
        Driftless is a lightweight robotics sandbox for EKF-based localization and classical planning.
        The repo currently includes noisy-sensor state estimation, grid-based path planning, and
        simple visualizations for understanding autonomy behavior under uncertainty.
      </p>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <a
          href="https://github.com/gustavojcorrea/driftless"
          target="_blank"
          rel="noreferrer"
          style={{
            padding: "12px 16px",
            border: "1px solid #ccc",
            borderRadius: 10,
            textDecoration: "none",
            color: "inherit"
          }}
        >
          View GitHub
        </a>
      </div>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 40 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>EKF Localization</h2>
          <p>
            From-scratch Extended Kalman Filter for 2D robot localization under noisy sensing.
          </p>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 16, padding: 20 }}>
          <h2 style={{ marginTop: 0 }}>A* Path Planning</h2>
          <p>
            Grid-based path planning with obstacles, path visualization, and cost evaluation.
          </p>
        </div>
      </section>

      <section style={{ marginTop: 48 }}>
        <h2>Next</h2>
        <p>
          Interactive dashboard with estimation visualizations, planning demos, and lightweight 3D rendering.
        </p>
      </section>
    </main>
  );
}