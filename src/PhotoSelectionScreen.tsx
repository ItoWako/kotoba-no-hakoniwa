import { useState, useRef, useCallback, useEffect } from "react";
import { ARCHIVE_PHOTOS, PhotoData } from "./data";

interface Props {
  onSelect: (photoId: string) => void;
  onBack: () => void;
}

interface ExpandState {
  rect: DOMRect;
  photo: PhotoData;
}

export default function PhotoSelectionScreen({ onSelect, onBack }: Props) {
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [expand, setExpand] = useState<ExpandState | null>(null);
  const [expandFull, setExpandFull] = useState(false);
  const photoRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const enterPhoto = useCallback((photoId: string) => {
    const el = photoRefs.current[photoId];
    const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId);
    if (!el || !photo || photo.isPlaceholder) return;

    setSelected(photoId);
    const rect = el.getBoundingClientRect();
    setExpand({ rect, photo });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setExpandFull(true);
      });
    });

    setTimeout(() => onSelect(photoId), 820);
  }, [onSelect]);

  const handleEnter = useCallback(() => {
    if (selected) enterPhoto(selected);
  }, [selected, enterPhoto]);

  const handleTouchEnd = (photoId: string) => {
    const now = Date.now();
    const previous = lastTapRef.current;
    if (previous && previous.id === photoId && now - previous.time < 360) {
      lastTapRef.current = null;
      enterPhoto(photoId);
      return;
    }
    lastTapRef.current = { id: photoId, time: now };
    setSelected(photoId);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--c-bg)",
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.7s ease",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--c-bg)",
          borderBottom: "1px solid var(--c-border)",
          padding: "22px 56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            fontFamily: "Noto Sans JP, sans-serif",
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: "0.05em",
            color: "var(--c-muted)",
            cursor: "pointer",
            padding: 0,
            transition: "color 0.2s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--c-text)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--c-muted)")}
        >
          ← 戻る
        </button>

        <button
          onClick={handleEnter}
          disabled={!selected}
          style={{
            background: selected ? "var(--c-accent)" : "transparent",
            border: `1px solid ${selected ? "var(--c-accent)" : "var(--c-border)"}`,
            color: selected ? "var(--c-dark)" : "var(--c-border)",
            padding: "10px 24px",
            fontFamily: "Noto Sans JP, sans-serif",
            fontSize: 13,
            fontWeight: selected ? 400 : 300,
            letterSpacing: "0.08em",
            cursor: selected ? "pointer" : "default",
            transition: "all 0.3s ease",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          この景色を見る
          <span style={{ fontFamily: "Inter", fontWeight: 300 }}>→</span>
        </button>
      </div>

      <div
        style={{
          padding: "20px 56px 14px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: 300,
            lineHeight: 1.7,
            letterSpacing: "0.05em",
            color: "var(--c-text)",
          }}
        >
          あなたが言葉を残したい景色を選んでください。
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: "0 56px 36px",
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {ARCHIVE_PHOTOS.map((photo, i) => {
          if (photo.isPlaceholder) {
            return (
              <div
                key={photo.id}
                style={{
                  position: "relative",
                  background: "var(--c-border)",
                  minHeight: 0,
                  height: "100%",
                  opacity: 0.35,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 8, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--c-muted)" }}>
                  {photo.label}
                </div>
              </div>
            );
          }

          const isSelected = selected === photo.id;
          const isHovered = hovered === photo.id;
          return (
            <div
              key={photo.id}
              ref={(el) => { photoRefs.current[photo.id] = el; }}
              onClick={() => setSelected(photo.id)}
              onDoubleClick={() => enterPhoto(photo.id)}
              onTouchEnd={() => handleTouchEnd(photo.id)}
              onMouseEnter={() => setHovered(photo.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                cursor: "pointer",
                position: "relative",
                background: "var(--c-border)",
                outline: isSelected ? "2px solid var(--c-accent)" : "2px solid transparent",
                transition: "outline 0.2s ease",
                touchAction: "manipulation",
                minHeight: 0,
                overflow: "hidden",
              }}
            >
              <img
                src={photo.url!}
                alt={photo.alt}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transform: isHovered ? "scale(1.02)" : "scale(1)",
                  transition: "transform 0.35s ease",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 8,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.5)",
                  pointerEvents: "none",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>

              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    border: "2px solid var(--c-accent)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {expand && (
        <div
          style={{
            position: "fixed",
            zIndex: 200,
            overflow: "hidden",
            left: expandFull ? 0 : expand.rect.left,
            top: expandFull ? 0 : expand.rect.top,
            width: expandFull ? "100vw" : expand.rect.width,
            height: expandFull ? "100vh" : expand.rect.height,
            transition: expandFull ? "left 0.75s ease, top 0.75s ease, width 0.75s ease, height 0.75s ease" : "none",
          }}
        >
          <img src={expand.photo.fullUrl ?? ""} alt={expand.photo.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </div>
  );
}
