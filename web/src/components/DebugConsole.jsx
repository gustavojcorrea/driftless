import { useEffect, useRef } from "react";

export default function DebugConsole({ lines = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
      }}
    >
      <div
        ref={containerRef}
        style={{
          height: "100%",
          minHeight: 0,
          boxSizing: "border-box",
          border: "1px solid #ddd",
          borderRadius: 12,
          background: "#020617",
          color: "#e2e8f0",
          padding: 16,
          overflowY: "auto",
          fontFamily: "ui-monospace, monospace",
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}