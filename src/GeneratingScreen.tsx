import { useState, useEffect } from "react";
import { ARCHIVE_PHOTOS } from "./data";
import { requestTanka } from "./services/tankaService";
import { PLACEMENT, getUIStyle } from "./InputScreen";

interface Props {
  word: string;
  photoId: string;
  onComplete: (tanka: string) => void;
}

export default function GeneratingScreen({ word, photoId, onComplete }: Props) {
  const [photoOpacity, setPhotoOpacity] = useState(1);
  const [onBg, setOnBg] = useState(false);
  const [wordVisible, setWordVisible] = useState(true);
  const [messageVisible, setMessageVisible] = useState(false);

  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId) ?? ARCHIVE_PHOTOS[0];
  const placement = PLACEMENT[photoId] ?? "bottom-right";
  const inputAlign = placement === "bottom-left" ? "left" : placement === "bottom-center" ? "center" : "right";

  useEffect(() => {
    let cancelled = false;
    let generatedTanka = "";

    // Start generation immediately. For now this resolves from local mock data;
    // later this service call becomes the server-side Claude request.
    const generationPromise = requestTanka({ word, photoId })
      .then(({ tanka }) => {
        generatedTanka = tanka;
      })
      .catch(() => {
        // Keep the exhibition flow moving even if generation fails unexpectedly.
        generatedTanka = `${word}という　言葉からひらく　景色には　まだ名も知らない　光が残る`;
      });

    const t1 = setTimeout(() => {
      setPhotoOpacity(0);
      setOnBg(true);
    }, 120);

    const t2 = setTimeout(() => {
      setWordVisible(false);
      setMessageVisible(true);
    }, 1750);

    // Keep the bridge text on screen long enough to read comfortably.
    const t3 = setTimeout(() => setMessageVisible(false), 6750);

    const t4 = setTimeout(async () => {
      await generationPromise;
      if (!cancelled) onComplete(generatedTanka);
    }, 7550);

    return () => {
      cancelled = true;
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [word, photoId, onComplete]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--c-bg)" }}>
      {photo.url && (
        <img
          src={photo.url}
          alt={photo.alt}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: photoOpacity,
            transition: "opacity 1.6s ease",
            willChange: "opacity",
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 52%)",
          pointerEvents: "none",
          opacity: photoOpacity,
          transition: "opacity 1.6s ease",
        }}
      />

      <div
        style={{
          position: "absolute",
          ...getUIStyle(placement),
          display: "flex",
          flexDirection: "column",
          zIndex: 2,
          opacity: wordVisible ? 1 : 0,
          transition: "opacity 0.55s ease",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 300,
            fontFamily: "Noto Sans JP, sans-serif",
            letterSpacing: "0.12em",
            color: onBg ? "var(--c-text)" : "rgba(255,255,255,0.95)",
            transition: "color 1.6s ease",
            textAlign: inputAlign,
            userSelect: "none",
          }}
        >
          {word}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(680px, 64vw)",
          textAlign: "center",
          fontSize: 17,
          fontWeight: 300,
          lineHeight: 2.15,
          letterSpacing: "0.045em",
          color: "var(--c-text)",
          opacity: messageVisible ? 1 : 0,
          transition: "opacity 0.8s ease",
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        短歌の歴史と言葉の蓄積を学んだAIが、
        <br />
        あなたの一語を解析し、
        <br />
        三十一文字の世界へ再構築しています。
        <br /><br />
        あなたの言葉から生まれる、
        <br />
        ひとつの箱庭を生成しています。
      </div>
    </div>
  );
}
