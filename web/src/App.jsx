import EkfScene from "./components/EkfScene";
import MissionExecutiveScene from "./components/MissionExecutiveScene";
import PlannerStackScene from "./components/PlannerStackScene";
import PlanningScene from "./components/PlanningScene";
import SlamScene from "./components/SlamScene";
import TraversabilityScene from "./components/TraversabilityScene";

function DemoSection({ title, description, accent, children }) {
  return (
    <section
      style={{
        marginBottom: 42,
        padding: "26px 26px 30px",
        borderRadius: 28,
        background: "#fffdf8",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 22px 50px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            width: 72,
            height: 4,
            borderRadius: 999,
            background: accent,
            marginBottom: 14,
          }}
        />
        <h2 style={{ margin: "0 0 8px", fontSize: 30, color: "#111827" }}>{title}</h2>
        <p style={{ margin: 0, color: "#475569", maxWidth: 860, lineHeight: 1.7 }}>{description}</p>
      </div>

      {children}
    </section>
  );
}

function StackBadge({ label, accent }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 999,
        background: `${accent}16`,
        border: `1px solid ${accent}33`,
        color: "#0f172a",
        fontSize: 14,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  );
}

function DiagramCard({ title, accent, items }) {
  return (
    <div
      style={{
        flex: "1 1 210px",
        minWidth: 210,
        borderRadius: 22,
        padding: "18px 18px 16px",
        background: "#fff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: 999,
          background: `${accent}16`,
          color: accent,
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              lineHeight: 1.45,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function FlowArrow() {
  return (
    <div
      style={{
        alignSelf: "center",
        color: "#94a3b8",
        fontSize: 28,
        fontWeight: 700,
        padding: "0 2px",
      }}
    >
      →
    </div>
  );
}

function TimelineStep({ windowLabel, title, accent, items }) {
  return (
    <div
      style={{
        flex: "1 1 190px",
        minWidth: 190,
        borderRadius: 22,
        padding: "18px 18px 16px",
        background: "#fff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "6px 10px",
          borderRadius: 999,
          background: `${accent}16`,
          color: accent,
          fontSize: 12,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {windowLabel}
      </div>

      <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: "#111827" }}>{title}</div>

      <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              lineHeight: 1.45,
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const architecture = [
    {
      title: "Sensing",
      accent: "#0f766e",
      items: [
        "LiDAR",
        "IMU",
        "GPS / GNSS",
        "Wheel encoders / joint states",
        "Cameras / depth cameras",
        "Radar / ultrasonics",
      ],
    },
    {
      title: "Perception",
      accent: "#d97706",
      items: [
        "Sensor calibration and time sync",
        "LiDAR preprocessing and filtering",
        "Ground segmentation",
        "Obstacle detection and clustering",
        "Semantic perception",
        "Terrain and hazard perception",
      ],
    },
    {
      title: "State Estimation",
      accent: "#2563eb",
      items: [
        "LiDAR odometry",
        "Inertial propagation",
        "GPS fusion",
        "Visual / wheel odometry",
        "EKF / UKF / factor graph fusion",
        "Robot pose and covariance",
      ],
    },
    {
      title: "Mapping",
      accent: "#14b8a6",
      items: [
        "SLAM backend",
        "Loop closure",
        "Occupancy map",
        "Elevation map",
        "Semantic map",
        "Global world model",
      ],
    },
    {
      title: "World Understanding",
      accent: "#16a34a",
      items: [
        "Traversability analysis",
        "Inflation and safety buffers",
        "Costmap generation",
        "Dynamic obstacle tracking",
        "Free space estimation",
        "Drivable corridor extraction",
      ],
    },
    {
      title: "Planning And Control",
      accent: "#7c3aed",
      items: [
        "Mission planner / task executive",
        "Behavior tree or FSM",
        "Global planner",
        "Local planner / MPC / rollouts",
        "Trajectory tracking control",
        "Emergency stop / safety supervisor",
      ],
    },
  ];
  const loopTimeline = [
    {
      windowLabel: "0-20 ms",
      title: "Sensor Arrival",
      accent: "#0f766e",
      items: [
        "LiDAR packet / scan arrives",
        "IMU samples stream in continuously",
        "GPS or heading update may arrive asynchronously",
        "Timestamp alignment and buffer lookup",
      ],
    },
    {
      windowLabel: "20-60 ms",
      title: "Preprocess And Register",
      accent: "#d97706",
      items: [
        "Filter water spray, outliers, and multipath",
        "Deskew scan using IMU motion",
        "Register current scan to local map or previous scans",
        "Accumulate a short scan window for LiDAR odometry",
      ],
    },
    {
      windowLabel: "60-120 ms",
      title: "Estimate State",
      accent: "#2563eb",
      items: [
        "Produce LiDAR odometry increment",
        "Propagate inertial state with IMU",
        "Fuse LiDAR, IMU, GPS, and compass if available",
        "Update boat pose, velocity, heading, and covariance",
      ],
    },
    {
      windowLabel: "120-180 ms",
      title: "Update Map And Costs",
      accent: "#14b8a6",
      items: [
        "Insert scan into local SLAM map",
        "Refresh obstacle tracks and shoreline model",
        "Update occupancy grid / elevation proxy / free space",
        "Recompute traversability and local costmap",
      ],
    },
    {
      windowLabel: "180-240 ms",
      title: "Plan",
      accent: "#16a34a",
      items: [
        "Check mission intent and active goal",
        "Replan global route if world model changed enough",
        "Score fast local trajectories around hazards",
        "Choose the next feasible motion command",
      ],
    },
    {
      windowLabel: "240-300 ms",
      title: "Control And Publish",
      accent: "#7c3aed",
      items: [
        "Convert chosen trajectory into throttle and rudder commands",
        "Run safety checks and collision vetoes",
        "Publish control outputs to the vessel",
        "Log telemetry and start the next cycle immediately",
      ],
    },
  ];

  return (
    <main
      style={{
        maxWidth: 1180,
        margin: "0 auto",
        padding: "40px 22px 80px",
        fontFamily: '"Avenir Next", "Segoe UI", sans-serif',
        boxSizing: "border-box",
        overflowX: "hidden",
      }}
    >
      <section
        style={{
          marginBottom: 38,
          padding: "32px 30px",
          borderRadius: 30,
          background:
            "radial-gradient(circle at top left, rgba(20,184,166,0.16), transparent 32%), radial-gradient(circle at top right, rgba(245,158,11,0.16), transparent 28%), linear-gradient(180deg, #fffaf0 0%, #f8fafc 100%)",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 18, justifyContent: "center" }}>
          <a
            href="https://github.com/gustavojcorrea/driftless"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#ffffffcc",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            GitHub Repo
          </a>
          <a
            href="https://github.com/gustavojcorrea/driftless/tree/main/web"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#ffffffcc",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Web Demo Source
          </a>
          <a
            href="https://www.linkedin.com/in/correagustavo/"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#ffffffcc",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            LinkedIn
          </a>
          <a
            href="https://scholar.google.com/citations?user=XhF4Pa0AAAAJ&hl=en"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#ffffffcc",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Google Scholar
          </a>
          <a
            href="https://arxiv.org/abs/2103.11470"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: "10px 14px",
              borderRadius: 999,
              background: "#ffffffcc",
              border: "1px solid rgba(15, 23, 42, 0.12)",
              color: "#0f172a",
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            NeBula Paper
          </a>
        </div>

        <h1
          style={{
            fontSize: 58,
            margin: "0 0 12px",
            color: "#111827",
            letterSpacing: "-0.04em",
            textAlign: "center",
          }}
        >
          Driftless
        </h1>

        <p
          style={{
            fontSize: 22,
            lineHeight: 1.5,
            maxWidth: 820,
            margin: "0 auto",
            color: "#0f172a",
            textAlign: "center",
          }}
        >
          Building a simple autonomy stack. By Gustavo J. Correa.
        </p>

        <p
          style={{
            fontSize: 16,
            lineHeight: 1.8,
            maxWidth: 860,
            color: "#475569",
            margin: "18px auto 0",
            textAlign: "center",
          }}
        >
          
        </p>

        <p
          style={{
            fontSize: 14,
            lineHeight: 1.7,
            maxWidth: 900,
            color: "#64748b",
            margin: "14px auto 0",
            textAlign: "center",
          }}
        >
          Inspired in part by{" "}
          <a
            href="https://arxiv.org/abs/2103.11470"
            target="_blank"
            rel="noreferrer"
            style={{ color: "#0f172a", fontWeight: 600, textDecoration: "none" }}
          >
            NeBula: Quest for Robotic Autonomy in Challenging Environments
          </a>
          .
        </p>

        {/* <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 22 }}>
          <StackBadge label="Sensor Fusion" accent="#f59e0b" />
          <StackBadge label="SLAM" accent="#14b8a6" />
          <StackBadge label="Traversability" accent="#16a34a" />
          <StackBadge label="Planning Stack" accent="#2563eb" />
          <StackBadge label="Mission Executive" accent="#7c3aed" />
          <StackBadge label="Classical Grid Planning" accent="#1d4ed8" />
        </div> */}
      </section>

      <section
        style={{
          marginBottom: 42,
          padding: "26px 26px 30px",
          borderRadius: 28,
          background: "#f8fafc",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 22px 50px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              width: 88,
              height: 4,
              borderRadius: 999,
              background: "#0f172a",
              marginBottom: 14,
            }}
          />
          <h2 style={{ margin: "0 0 8px", fontSize: 30, color: "#111827" }}>Autonomy System Modules</h2>
          <p style={{ margin: 0, color: "#475569", maxWidth: 920, lineHeight: 1.7 }}>
            This is work in progress high-level block diagram for a full autonomy stack. It starts with sensing and perception, feeds
            localization and mapping, builds world understanding for traversability and costmaps, then hands that model to
            planning, control, safety, and operator-facing tools.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          {architecture.map((block, index) => (
            <div
              key={block.title}
              style={{
                display: "flex",
                gap: 10,
                flex: "1 1 250px",
                minWidth: 250,
              }}
            >
              <DiagramCard title={block.title} accent={block.accent} items={block.items} />
              {index < architecture.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <StackBadge label="Operator Dashboard / Teleoperation" accent="#0f172a" />
          <StackBadge label="Logging / Replay / Data Products" accent="#334155" />
          <StackBadge label="Health Monitoring / Fault Detection" accent="#b91c1c" />
          <StackBadge label="Simulation / Digital Twin / Testing" accent="#0369a1" />
          <StackBadge label="Networking / Middleware / Time Sync" accent="#475569" />
        </div>
      </section>

      <section
        style={{
          marginBottom: 42,
          padding: "26px 26px 30px",
          borderRadius: 28,
          background: "#fffdf8",
          border: "1px solid rgba(15, 23, 42, 0.08)",
          boxShadow: "0 22px 50px rgba(15, 23, 42, 0.05)",
        }}
      >
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              width: 88,
              height: 4,
              borderRadius: 999,
              background: "#0f172a",
              marginBottom: 14,
            }}
          />
          <h2 style={{ margin: "0 0 8px", fontSize: 30, color: "#111827" }}>Autonomy Loop At Each Time Step</h2>
          <p style={{ margin: 0, color: "#475569", maxWidth: 920, lineHeight: 1.7 }}>
            For a fast autonomous boat, the stack runs as a tight rolling loop rather than waiting a full second between
            decisions. A single cycle can be a few hundred milliseconds or less, with sensing, registration, fusion,
            mapping, planning, and actuation overlapping continuously.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "stretch" }}>
          {loopTimeline.map((step, index) => (
            <div
              key={step.title}
              style={{
                display: "flex",
                gap: 10,
                flex: "1 1 240px",
                minWidth: 240,
              }}
            >
              <TimelineStep
                windowLabel={step.windowLabel}
                title={step.title}
                accent={step.accent}
                items={step.items}
              />
              {index < loopTimeline.length - 1 && <FlowArrow />}
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <StackBadge label="IMU propagation usually runs faster than the LiDAR frame rate" accent="#2563eb" />
          <StackBadge label="Global planning runs slower than local planning unless the world changes" accent="#16a34a" />
          <StackBadge label="Safety checks can interrupt at any point and command stop or evade" accent="#b91c1c" />
          <StackBadge label="Dashboard and logging consume the loop output but should not block control" accent="#334155" />
        </div>
      </section>

      <DemoSection
        title="Sensor Fusion Sandbox"
        description="Ground truth, noisy GPS, and the EKF estimate animate together so you can see why fused state estimation matters before planning ever begins."
        accent="#d97706"
      >
        <EkfScene />
      </DemoSection>

      <DemoSection
        title="SLAM With Drift And Loop Closure"
        description="This mapping scene shows what happens when odometry drifts, how a landmark map gets distorted, and how loop closure pulls the pose graph back into alignment."
        accent="#0f766e"
      >
        <SlamScene />
      </DemoSection>

      <DemoSection
        title="Traversability-Aware Navigation"
        description="A cost-colored terrain makes the traversability pipeline visible. The route can either cut through hazardous cells or bend around them like a real costmap-driven planner."
        accent="#15803d"
      >
        <TraversabilityScene />
      </DemoSection>

      <DemoSection
        title="Global Vs Local Planning"
        description="The global plan provides mission-scale intent, while the local planner continuously evaluates short-horizon rollouts to react to moving obstacles without losing the route."
        accent="#1d4ed8"
      >
        <PlannerStackScene />
      </DemoSection>

      <DemoSection
        title="Mission Executive"
        description="This final layer makes high-level reasoning explicit: behavior mode, active objective, visited goals, and inserted avoidance tasks all stay visible while the rover moves."
        accent="#7c3aed"
      >
        <MissionExecutiveScene />
      </DemoSection>

      <DemoSection
        title="Classical Grid Planning"
        description="Your original planner playground is back here with A*, Dijkstra, weighted A*, and APF so you can compare search behavior, path cost, and robot playback on the same maps."
        accent="#1d4ed8"
      >
        <PlanningScene />
      </DemoSection>
    </main>
  );
}
