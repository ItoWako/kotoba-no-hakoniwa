import { useEffect, useState } from "react";

interface Props {
  onComplete: () => void;
}

export default function ThankYouScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fadeIn = window.setTimeout(() => setVisible(true), 80);
    const fadeOut = window.setTimeout(() => setVisible(false), 2400);
    const complete = window.setTimeout(() => onComplete(), 3000);

    return () => {
      window.clearTimeout(fadeIn);
      window.clearTimeout(fadeOut);
      window.clearTimeout(complete);
    };
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--c-bg)",
        color: "var(--c-text)",
      }}
    >
      <div
        style={{
          fontFamily: "Noto Sans JP, sans-serif",
          fontSize: "clamp(24px, 2.4vw, 40px)",
          fontWeight: 300,
          letterSpacing: "0.08em",
          lineHeight: 1.8,
          textAlign: "center",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.6s ease",
        }}
      >
        ご協力いただきありがとうございました。
      </div>
    </div>
  );
}
