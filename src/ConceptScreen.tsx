import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  onStart: () => void;
}

const WORD_LIST = [
  "静寂", "帰り道", "夏", "光", "孤独", "希望", "記憶", "夕暮れ",
  "雨", "温度", "懐かしい", "不安", "朝", "気配", "遠い", "息",
  "霧", "窓", "波", "影", "空", "眠り", "冷たい", "揺れ", "夕陽",
  "匂い", "風", "余白", "季節", "気持ち", "時間", "まなざし",
];
const WORD_SIZES = [14, 18, 24, 32, 44];

interface FWord {
  id: number;
  text: string;
  x: number;
  y: number;
  size: number;
  show: boolean;
}

function FloatingWords({ scrollTop, enabled }: { scrollTop: number; enabled: boolean }) {
  const [words, setWords] = useState<FWord[]>([]);
  const idRef = useRef(0);
  const idxRef = useRef(0);
  const scrollRef = useRef(scrollTop);
  const cleanupTimers = useRef<number[]>([]);

  useEffect(() => {
    scrollRef.current = scrollTop;
  }, [scrollTop]);

  const addWord = useCallback((showImmediately = false) => {
    const id = idRef.current++;
    const text = WORD_LIST[idxRef.current % WORD_LIST.length];
    idxRef.current++;
    const size = WORD_SIZES[Math.floor(Math.random() * WORD_SIZES.length)];
    const viewportH = window.innerHeight || 900;
    const fw: FWord = {
      id,
      text,
      x: 2 + Math.random() * 92,
      y: scrollRef.current + viewportH * (0.03 + Math.random() * 0.9),
      size,
      show: showImmediately,
    };

    setWords((prev) => [...prev.slice(-28), fw]);

    if (!showImmediately) {
      const appear = window.setTimeout(() => {
        setWords((prev) => prev.map((w) => (w.id === id ? { ...w, show: true } : w)));
      }, 60);
      cleanupTimers.current.push(appear);
    }

    const dur = 7200 + Math.random() * 3000;
    const hide = window.setTimeout(() => {
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, show: false } : w)));
    }, dur);
    const remove = window.setTimeout(() => {
      setWords((prev) => prev.filter((w) => w.id !== id));
    }, dur + 1500);
    cleanupTimers.current.push(hide, remove);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setWords([]);
      return;
    }

    // Seed enough words immediately so the background never becomes completely empty.
    for (let i = 0; i < 9; i += 1) addWord(true);

    const iv = window.setInterval(() => addWord(false), 850);
    return () => {
      window.clearInterval(iv);
      cleanupTimers.current.forEach((timer) => window.clearTimeout(timer));
      cleanupTimers.current = [];
    };
  }, [enabled, addWord]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {words.map((w) => (
        <div
          key={w.id}
          style={{
            position: "absolute",
            left: `${w.x}%`,
            top: w.y,
            fontSize: w.size,
            fontWeight: 300,
            letterSpacing: "0.04em",
            color: "var(--c-text)",
            opacity: w.show
              ? w.size >= 44
                ? 0.085
                : w.size >= 32
                ? 0.105
                : w.size >= 24
                ? 0.125
                : 0.15
              : 0,
            transition: "opacity 1.25s ease",
            userSelect: "none",
            whiteSpace: "nowrap",
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(8px)",
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function ConceptScreen({ onStart }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasScrolled = scrollTop > 30;

  const handleStart = () => {
    if (leaving) return;
    setLeaving(true);
    // Leave only the background words for 1.5 seconds before moving on.
    setTimeout(onStart, 1500);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--c-bg)",
        overflow: "hidden",
      }}
    >
      <div
        ref={scrollerRef}
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        style={{
          position: "absolute",
          inset: 0,
          overflowY: leaving ? "hidden" : "auto",
        }}
      >
        <div style={{ position: "relative", minHeight: "100%" }}>
          <FloatingWords scrollTop={scrollTop} enabled={hasScrolled || leaving} />

          <div
            style={{
              position: "relative",
              zIndex: 2,
              maxWidth: 1180,
              margin: "0 auto",
              padding: "0 88px",
              opacity: leaving ? 0 : 1,
              transition: "opacity 0.5s ease",
              pointerEvents: leaving ? "none" : "auto",
            }}
          >
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  lineHeight: 1.85,
                  letterSpacing: "0.045em",
                  color: "var(--c-text)",
                }}
              >
                あなたの言葉がつくる世界を
                <br />
                私に見せてください
              </div>
            </section>

            <section style={{ padding: "140px 0 70px", maxWidth: 660, marginLeft: "auto" }}>
              <Reveal>
                <div style={{ width: 48, height: 1, background: "var(--c-border)", marginBottom: 46 }} />
                <div style={{ fontSize: 30, lineHeight: 2.0, letterSpacing: "0.04em", color: "var(--c-text)", fontWeight: 300 }}>
                  私たちは、本当に同じ景色を
                  <br />
                  見ているのでしょうか。
                </div>
              </Reveal>
            </section>

            <section style={{ padding: "120px 0", maxWidth: 610 }}>
              <Reveal delay={60}>
                <div style={{ fontSize: 18, lineHeight: 2.5, letterSpacing: "0.035em", color: "var(--c-text)", fontWeight: 300 }}>
                  同じ景色を見ていても、
                  <br />
                  そこから何を感じるかは人それぞれです。
                  <br /><br />
                  それなら、私とあなたが見ている「景色」は、
                  <br />
                  本当に同じものなのでしょうか。
                </div>
              </Reveal>
            </section>

            <section style={{ padding: "105px 0 125px", maxWidth: 700, marginLeft: "12%" }}>
              <Reveal>
                <div style={{ fontSize: 29, lineHeight: 2.0, letterSpacing: "0.04em", color: "var(--c-text)", fontWeight: 300 }}>
                  私は、人がそれぞれ何を感じ、
                  <br />
                  どんな世界を見ているのか知りたいのです。
                </div>
              </Reveal>
            </section>

            <section style={{ padding: "125px 0", maxWidth: 620, marginLeft: "auto" }}>
              <Reveal delay={60}>
                <div style={{ display: "flex", gap: 28 }}>
                  <div style={{ width: 2, background: "var(--c-accent)", flexShrink: 0 }} />
                  <div style={{ fontSize: 17, lineHeight: 2.55, letterSpacing: "0.035em", color: "var(--c-text)", fontWeight: 300 }}>
                    日本人は古くから、景色や心の動きを和歌に残してきました。
                    <br /><br />
                    無数にある言葉の中から言葉を選び取り、
                    <br />
                    三十一文字という限られた器の中へ紡いでいく。
                  </div>
                </div>
              </Reveal>
            </section>

            <section style={{ padding: "110px 0", maxWidth: 590, marginLeft: "8%" }}>
              <Reveal>
                <div style={{ width: 32, height: 1, background: "var(--c-border)", marginBottom: 36 }} />
                <div style={{ fontSize: 17, lineHeight: 2.5, letterSpacing: "0.035em", color: "var(--c-text)", fontWeight: 300 }}>
                  制限されることで、言葉は洗練され、
                  <br />
                  その人が見ていた世界が浮かび上がってきます。
                </div>
              </Reveal>
            </section>

            <section style={{ padding: "140px 0 190px", maxWidth: 760, marginLeft: "auto" }}>
              <Reveal delay={60}>
                <div style={{ fontSize: 18, lineHeight: 2.45, letterSpacing: "0.04em", color: "var(--c-text)", fontWeight: 300, marginBottom: 58 }}>
                  これからあなたにはある景色を見て
                  <br />
                  あなたが感じたことを教えてください。
                </div>
                <div style={{ width: 48, height: 1, background: "var(--c-border)", marginBottom: 50 }} />
                <div style={{ fontSize: 30, lineHeight: 2.0, letterSpacing: "0.05em", color: "var(--c-text)", fontWeight: 300, marginBottom: 68 }}>
                  あなたが見ている景色を
                  <br />
                  私に見せてください
                </div>
                <button
                  onClick={handleStart}
                  style={{
                    background: "var(--c-accent)",
                    border: "none",
                    color: "var(--c-dark)",
                    padding: "14px 36px",
                    fontFamily: "Noto Sans JP, sans-serif",
                    fontSize: 14,
                    fontWeight: 400,
                    letterSpacing: "0.1em",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 12,
                    transition: "opacity 0.2s ease",
                  }}
                >
                  実験に参加する
                  <span style={{ fontFamily: "Inter", fontWeight: 300 }}>→</span>
                </button>
              </Reveal>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
