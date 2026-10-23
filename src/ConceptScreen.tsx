import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';

interface Props {
  onStart: () => void;
}

// 案内が出始めるまでの待ち時間
const SCROLL_HINT_DELAY_MS = 500;

// 矢印が上から降りてくる時間
const ARROW_DURATION_MS = 2200;

const WORD_LIST = [
  '静寂',
  '帰り道',
  '夏',
  '光',
  '孤独',
  '希望',
  '記憶',
  '夕暮れ',
  '雨',
  '温度',
  '懐かしい',
  '不安',
  '朝',
  '気配',
  '遠い',
  '息',
  '霧',
  '窓',
  '波',
  '影',
  '空',
  '眠り',
  '冷たい',
  '揺れ',
  '夕陽',
  '匂い',
  '風',
  '余白',
  '季節',
  '気持ち',
  '時間',
  'まなざし'
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
  const cleanupTimers = useRef<Set<number>>(new Set());

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
      show: showImmediately
    };

    setWords((prev) => [...prev.slice(-28), fw]);

    const schedule = (callback: () => void, delay: number) => {
      const timer = window.setTimeout(() => {
        cleanupTimers.current.delete(timer);
        callback();
      }, delay);

      cleanupTimers.current.add(timer);
    };

    if (!showImmediately) {
      schedule(() => {
        setWords((prev) => prev.map((w) => (w.id === id ? { ...w, show: true } : w)));
      }, 60);
    }

    const duration = 7200 + Math.random() * 3000;

    schedule(() => {
      setWords((prev) => prev.map((w) => (w.id === id ? { ...w, show: false } : w)));
    }, duration);

    schedule(() => {
      setWords((prev) => prev.filter((w) => w.id !== id));
    }, duration + 1500);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setWords([]);
      return;
    }

    for (let i = 0; i < 9; i += 1) {
      addWord(true);
    }

    const interval = window.setInterval(() => addWord(false), 850);

    return () => {
      window.clearInterval(interval);
      cleanupTimers.current.forEach((timer) => window.clearTimeout(timer));
      cleanupTimers.current.clear();
    };
  }, [enabled, addWord]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden'
      }}
    >
      {words.map((w) => (
        <div
          key={w.id}
          style={{
            position: 'absolute',
            left: `${w.x}%`,
            top: w.y,
            fontSize: w.size,
            fontWeight: 300,
            letterSpacing: '0.04em',
            color: 'var(--c-text)',
            opacity: w.show ? (w.size >= 44 ? 0.085 : w.size >= 32 ? 0.105 : w.size >= 24 ? 0.125 : 0.15) : 0,
            transition: 'opacity 1.25s ease',
            userSelect: 'none',
            whiteSpace: 'nowrap'
          }}
        >
          {w.text}
        </div>
      ))}
    </div>
  );
}

function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function ConceptScreen({ onStart }: Props) {
  const [scrollTop, setScrollTop] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const [scrollHintVisible, setScrollHintVisible] = useState(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const startTimerRef = useRef<number | null>(null);
  const leavingRef = useRef(false);

  const hasScrolled = scrollTop > 30;

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || leaving) return;

    let hintTimer: number | undefined;

    const canScrollDown = () => el.scrollHeight - el.clientHeight - el.scrollTop > 4;

    const clearHintTimer = () => {
      if (hintTimer !== undefined) {
        window.clearTimeout(hintTimer);
        hintTimer = undefined;
      }
    };

    const armHintTimer = () => {
      clearHintTimer();

      if (!canScrollDown()) return;

      hintTimer = window.setTimeout(() => {
        hintTimer = undefined;

        if (canScrollDown() && !leavingRef.current) {
          setScrollHintVisible(true);
        }
      }, SCROLL_HINT_DELAY_MS);
    };

    const handleScroll = () => {
      setScrollHintVisible(false);
      armHintTimer();
    };

    const handleResize = () => {
      setScrollHintVisible(false);
      armHintTimer();
    };

    setScrollHintVisible(false);
    armHintTimer();

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      clearHintTimer();
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [leaving]);

  useEffect(() => {
    return () => {
      if (startTimerRef.current !== null) {
        window.clearTimeout(startTimerRef.current);
      }
    };
  }, []);

  const handleStart = () => {
    if (leavingRef.current) return;

    leavingRef.current = true;
    setLeaving(true);
    setScrollHintVisible(false);

    startTimerRef.current = window.setTimeout(() => {
      startTimerRef.current = null;
      onStart();
    }, 1500);
  };

  const handleScrollHintClick = () => {
    const el = scrollerRef.current;
    if (!el || leavingRef.current) return;

    setScrollHintVisible(false);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    el.scrollBy({
      top: el.clientHeight * 0.85,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--c-bg)',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @keyframes hakoniwa-arrow-descend {
          0% {
            transform: translateY(-100vh);
            opacity: 0;
          }
          12% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(0);
            opacity: 0.8;
          }
        }

        @keyframes hakoniwa-scroll-label {
          from {
            opacity: 0;
          }
          to {
            opacity: 0.8;
          }
        }

        .hakoniwa-scroll-arrow {
          opacity: 0;
          animation:
            hakoniwa-arrow-descend
            ${ARROW_DURATION_MS}ms
            cubic-bezier(0.22, 0.61, 0.36, 1)
            both;
        }

        .hakoniwa-scroll-label {
          opacity: 0;
          animation:
            hakoniwa-scroll-label
            600ms
            ease
            ${ARROW_DURATION_MS}ms
            both;
        }

        @media (prefers-reduced-motion: reduce) {
          .hakoniwa-scroll-arrow,
          .hakoniwa-scroll-label {
            animation: none;
            transform: none;
            opacity: 0.8;
          }
        }
      `}</style>

      <div
        ref={scrollerRef}
        onScroll={(event) => {
          setScrollTop(event.currentTarget.scrollTop);
        }}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: leaving ? 'hidden' : 'auto'
        }}
      >
        <div style={{ position: 'relative', minHeight: '100%' }}>
          <FloatingWords scrollTop={scrollTop} enabled={hasScrolled || leaving} />

          <div
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: 1180,
              margin: '0 auto',
              padding: '0 88px',
              opacity: leaving ? 0 : 1,
              transition: 'opacity 0.5s ease',
              pointerEvents: leaving ? 'none' : 'auto'
            }}
          >
            <section
              style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <div
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  lineHeight: 1.85,
                  letterSpacing: '0.045em',
                  color: 'var(--c-text)'
                }}
              >
                あなたの言葉がつくる世界を
                <br />
                私に見せてください
              </div>
            </section>

            <section
              style={{
                padding: '140px 0 70px',
                maxWidth: 660,
                marginLeft: 'auto'
              }}
            >
              <Reveal>
                <div
                  style={{
                    width: 48,
                    height: 1,
                    background: 'var(--c-border)',
                    marginBottom: 46
                  }}
                />

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 2,
                    letterSpacing: '0.04em',
                    color: 'var(--c-text)',
                    fontWeight: 300
                  }}
                >
                  私たちは、本当に同じ景色を
                  <br />
                  見ているのでしょうか。
                </div>
              </Reveal>
            </section>

            <section style={{ padding: '120px 0', maxWidth: 610 }}>
              <Reveal delay={60}>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 2.5,
                    letterSpacing: '0.035em',
                    color: 'var(--c-text)',
                    fontWeight: 300
                  }}
                >
                  同じ景色を見ていても、
                  <br />
                  そこから何を感じるかは人それぞれです。
                  <br />
                  <br />
                  それなら、私とあなたが見ている「景色」は、
                  <br />
                  本当に同じものなのでしょうか。
                </div>
              </Reveal>
            </section>

            <section
              style={{
                padding: '105px 0 125px',
                maxWidth: 700,
                marginLeft: '12%'
              }}
            >
              <Reveal>
                <div
                  style={{
                    fontSize: 29,
                    lineHeight: 2,
                    letterSpacing: '0.04em',
                    color: 'var(--c-text)',
                    fontWeight: 300
                  }}
                >
                  私は、人がそれぞれ何を感じ、
                  <br />
                  どんな世界を見ているのか知りたいのです。
                </div>
              </Reveal>
            </section>

            <section
              style={{
                padding: '125px 0',
                maxWidth: 620,
                marginLeft: 'auto'
              }}
            >
              <Reveal delay={60}>
                <div style={{ display: 'flex', gap: 28 }}>
                  <div
                    style={{
                      width: 2,
                      background: 'var(--c-accent)',
                      flexShrink: 0
                    }}
                  />

                  <div
                    style={{
                      fontSize: 17,
                      lineHeight: 2.55,
                      letterSpacing: '0.035em',
                      color: 'var(--c-text)',
                      fontWeight: 300
                    }}
                  >
                    日本人は古くから、景色や心の動きを和歌に残してきました。
                    <br />
                    <br />
                    無数にある言葉の中から言葉を選び取り、
                    <br />
                    三十一文字という限られた器の中へ紡いでいく。
                  </div>
                </div>
              </Reveal>
            </section>

            <section
              style={{
                padding: '110px 0',
                maxWidth: 590,
                marginLeft: '8%'
              }}
            >
              <Reveal>
                <div
                  style={{
                    width: 32,
                    height: 1,
                    background: 'var(--c-border)',
                    marginBottom: 36
                  }}
                />

                <div
                  style={{
                    fontSize: 17,
                    lineHeight: 2.5,
                    letterSpacing: '0.035em',
                    color: 'var(--c-text)',
                    fontWeight: 300
                  }}
                >
                  制限されることで、言葉は洗練され、
                  <br />
                  その人が見ていた世界が浮かび上がってきます。
                </div>
              </Reveal>
            </section>

            <section
              style={{
                padding: '140px 0 190px',
                maxWidth: 760,
                marginLeft: 'auto'
              }}
            >
              <Reveal delay={60}>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 2.45,
                    letterSpacing: '0.04em',
                    color: 'var(--c-text)',
                    fontWeight: 300,
                    marginBottom: 58
                  }}
                >
                  これからあなたに、いくつかの景色をお見せします。
                  <br />
                  気になる景色をひとつ選び、
                  <br />
                  そこから思い浮かんだ言葉を、教えてください。
                  <br />
                  <br />
                  あなたの言葉は、一首の短歌になります。
                  <br />
                  <br />
                  そして、ほかの人には
                  <br />
                  どんな景色が見えていたのか、
                  <br />
                  覗いてみてください。
                </div>

                <div
                  style={{
                    width: 48,
                    height: 1,
                    background: 'var(--c-border)',
                    marginBottom: 50
                  }}
                />

                <div
                  style={{
                    fontSize: 30,
                    lineHeight: 2,
                    letterSpacing: '0.05em',
                    color: 'var(--c-text)',
                    fontWeight: 300,
                    marginBottom: 68
                  }}
                >
                  あなたが見ている景色を
                  <br />
                  私に見せてください
                </div>

                <button
                  type="button"
                  onClick={handleStart}
                  disabled={leaving}
                  style={{
                    background: 'var(--c-accent)',
                    border: 'none',
                    color: 'var(--c-dark)',
                    padding: '14px 36px',
                    fontFamily: 'Noto Sans JP, sans-serif',
                    fontSize: 14,
                    fontWeight: 400,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 12,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  実験に参加する
                  <span
                    style={{
                      fontFamily: 'Inter',
                      fontWeight: 300
                    }}
                  >
                    →
                  </span>
                </button>
              </Reveal>
            </section>
          </div>
        </div>
      </div>

      {scrollHintVisible && !leaving && (
        <button
          type="button"
          aria-label="下へスクロールして続きを読む"
          onClick={handleScrollHintClick}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: 28,
            transform: 'translateX(-50%)',
            width: 100,
            height: 80,
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: 'var(--c-text)',
            cursor: 'pointer',
            zIndex: 5
          }}
        >
          <span
            className="hakoniwa-scroll-label"
            style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: 12,
              fontWeight: 300,
              letterSpacing: '0.12em'
            }}
          >
            SCROLL
          </span>

          <svg
            className="hakoniwa-scroll-arrow"
            width="28"
            height="36"
            viewBox="0 0 28 36"
            fill="none"
            aria-hidden="true"
            style={{
              flexShrink: 0,
              pointerEvents: 'none'
            }}
          >
            <path
              d="M14 3V31M4 21L14 31L24 21"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
