import { useEffect, useState } from "react";

interface Props {
  onContinue: () => void;
}

export default function PerspectiveIntroScreen({ onContinue }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 120);
    const t2 = setTimeout(() => setVisible(false), 3200);
    const t3 = setTimeout(onContinue, 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onContinue]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--c-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 120px",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          textAlign: "center",
          fontSize: 23,
          fontWeight: 300,
          lineHeight: 2.05,
          letterSpacing: "0.06em",
          color: "var(--c-text)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.8s ease",
        }}
      >
        あなた以外の人から見えている美しい景色も
        <br />
        見てみませんか？
      </div>
    </div>
  );
}
