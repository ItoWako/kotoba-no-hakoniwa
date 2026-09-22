import { useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function WaitingScreen({ onComplete }: Props) {
  const [leaving, setLeaving] = useState(false);

  const handleStart = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(onComplete, 680);
  };

  return (
    <div
      onClick={handleStart}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--c-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        userSelect: "none",
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.7s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 42,
        }}
      >
        <div
          style={{
            fontSize: 22,
            lineHeight: 2.2,
            color: "var(--c-text)",
            fontWeight: 300,
            textAlign: "center",
            letterSpacing: "0.06em",
          }}
        >
          あなたの言葉で
          <br />
          教えてください
        </div>

        <div
          className={leaving ? "" : "anim-breathe"}
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            border: "1px solid var(--c-text)",
            opacity: leaving ? 0 : undefined,
            transition: leaving ? "opacity 0.3s ease" : undefined,
          }}
        />

        <div
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 11,
            letterSpacing: "0.22em",
            color: "var(--c-muted)",
            textTransform: "uppercase",
            opacity: leaving ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          Touch to Start
        </div>
      </div>
    </div>
  );
}
