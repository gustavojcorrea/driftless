import PlanningScene from "./components/PlanningScene";

export default function App() {
  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: "48px 24px 80px",
        fontFamily: "Inter, system-ui, sans-serif",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <section style={{ marginBottom: 56 }}>
        <h1 style={{ fontSize: 56, margin: "0 0 12px" }}>driftless</h1>

        <p style={{ fontSize: 22, lineHeight: 1.5, maxWidth: 760, margin: 0 }}>
          Minimal autonomy stack for state estimation and navigation.
        </p>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.7,
            maxWidth: 760,
            color: "#444",
            marginTop: 18,
          }}
        >
          Driftless is a lightweight robotics sandbox for EKF-based localization,
          path planning, and autonomy visualization.
        </p>
      </section>

      <section>
        <div style={{ marginBottom: 18 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 28 }}>Planning Demo</h2>
          {/* <p style={{ margin: 0, color: "#444", maxWidth: 760, lineHeight: 1.6 }}>
            Compare A*, Dijkstra, and weighted A* on the same grid map.
          </p> */}
        </div>

        <PlanningScene />

        {/* <div style={{ marginTop: 12, color: "#555", fontSize: 14 }}>
          Blue cells show search exploration. The blue line is the final path.
        </div> */}
      </section>
    </main>
  );
}