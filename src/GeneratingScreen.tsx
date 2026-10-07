import { useState, useEffect } from 'react';
import { ARCHIVE_PHOTOS } from './data';
import { requestTanka } from './services/tankaService';
import { PLACEMENT, getUIStyle } from './InputScreen';

interface Props {
  word: string;
  photoId: string;
  onComplete: (tanka: string) => void;
}

// 入力語を3秒表示し、1.6秒かけて消す。
const WORD_DISPLAY_MS = 3000;
const WORD_FADE_MS = 1600;

// 文章のフェードイン後、最低7秒間表示する。
const MESSAGE_FADE_MS = 800;
const MESSAGE_READING_MS = 7000;

const MESSAGE_START_MS = WORD_DISPLAY_MS + WORD_FADE_MS;
const MINIMUM_DURATION_MS = MESSAGE_START_MS + MESSAGE_FADE_MS + MESSAGE_READING_MS;

export default function GeneratingScreen({ word, photoId, onComplete }: Props) {
  const [photoOpacity, setPhotoOpacity] = useState(1);
  const [onBg, setOnBg] = useState(false);
  const [wordVisible, setWordVisible] = useState(true);
  const [messageVisible, setMessageVisible] = useState(false);
  const [longWait, setLongWait] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId) ?? ARCHIVE_PHOTOS[0];
  const placement = PLACEMENT[photoId] ?? 'bottom-right';
  const inputAlign = placement === 'bottom-left' ? 'left' : placement === 'bottom-center' ? 'center' : 'right';

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    setErrorMessage('');
    setPhotoOpacity(1);
    setOnBg(false);
    setWordVisible(true);
    setMessageVisible(false);
    setLongWait(false);

    const photoTimer = setTimeout(() => {
      setPhotoOpacity(0);
      setOnBg(true);
    }, 120);

    const wordTimer = setTimeout(() => {
      setWordVisible(false);
    }, WORD_DISPLAY_MS);

    const messageTimer = setTimeout(() => {
      setMessageVisible(true);
    }, MESSAGE_START_MS);

    const longWaitTimer = setTimeout(() => {
      setLongWait(true);
    }, 15000);

    let minimumTimer: ReturnType<typeof setTimeout> | undefined;

    const minimumDuration = new Promise<void>((resolve) => {
      minimumTimer = setTimeout(resolve, MINIMUM_DURATION_MS);
    });

    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, 120000);

    const clearTimers = () => {
      clearTimeout(photoTimer);
      clearTimeout(wordTimer);
      clearTimeout(messageTimer);
      clearTimeout(longWaitTimer);
      clearTimeout(timeoutTimer);

      if (minimumTimer !== undefined) {
        clearTimeout(minimumTimer);
      }
    };

    const generate = async () => {
      try {
        // 生成の完了と、文章の表示時間の両方を待つ。
        const [result] = await Promise.all([requestTanka({ word, photoId }, controller.signal), minimumDuration]);

        if (cancelled) return;

        setMessageVisible(false);
        setLongWait(false);
        onComplete(result.tanka);
      } catch (error) {
        if (cancelled) return;

        console.error('短歌の生成に失敗しました:', error);

        setPhotoOpacity(0);
        setOnBg(true);
        setWordVisible(false);
        setMessageVisible(false);
        setLongWait(false);

        setErrorMessage(
          controller.signal.aborted
            ? '時間内に短歌を受け取れませんでした。少し待ってから、もう一度お試しください。'
            : error instanceof TypeError
              ? '通信できませんでした。インターネット接続を確認して、もう一度お試しください。'
              : error instanceof Error
                ? error.message
                : '短歌を生成できませんでした。もう一度お試しください。'
        );
      } finally {
        clearTimers();
      }
    };

    void generate();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimers();
    };
  }, [word, photoId, onComplete, attempt]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--c-bg)'
      }}
    >
      <style>{`
        @keyframes hakoniwa-generating-dot {
          0%, 100% {
            opacity: 0.25;
          }
          50% {
            opacity: 0.85;
          }
        }

        .hakoniwa-generating-dot {
          animation: hakoniwa-generating-dot 2.4s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .hakoniwa-generating-dot {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>

      {photo.url && (
        <img
          src={photo.url}
          alt={photo.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: photoOpacity,
            transition: 'opacity 1.6s ease',
            willChange: 'opacity'
          }}
        />
      )}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 52%)',
          pointerEvents: 'none',
          opacity: photoOpacity,
          transition: 'opacity 1.6s ease'
        }}
      />

      <div
        style={{
          position: 'absolute',
          ...getUIStyle(placement),
          display: 'flex',
          flexDirection: 'column',
          zIndex: 2,
          opacity: wordVisible ? 1 : 0,
          transition: `opacity ${WORD_FADE_MS}ms ease-in-out`,
          willChange: 'opacity',
          pointerEvents: 'none'
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 300,
            fontFamily: 'Noto Sans JP, sans-serif',
            letterSpacing: '0.12em',
            color: onBg ? 'var(--c-text)' : 'rgba(255,255,255,0.95)',
            transition: 'color 1.6s ease',
            textAlign: inputAlign,
            userSelect: 'none'
          }}
        >
          {word}
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(680px, 80vw)',
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 300,
          lineHeight: 2.15,
          letterSpacing: '0.045em',
          color: 'var(--c-text)',
          opacity: messageVisible ? 1 : 0,
          transition: `opacity ${MESSAGE_FADE_MS}ms ease`,
          pointerEvents: 'none',
          zIndex: 1
        }}
      >
        短歌の歴史と言葉の蓄積を学んだAIが、
        <br />
        あなたの一語を解析し、
        <br />
        三十一文字の世界へ再構築しています。
        <br />
        <br />
        あなたの言葉から生まれる、
        <br />
        ひとつの箱庭を生成しています。
        {messageVisible && (
          <div
            aria-hidden="true"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 10,
              marginTop: 28
            }}
          >
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="hakoniwa-generating-dot"
                style={{
                  display: 'block',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: 'var(--c-text)',
                  animationDelay: `${index * 0.4}s`
                }}
              />
            ))}
          </div>
        )}
        <div
          role="status"
          aria-live="polite"
          style={{
            marginTop: 22,
            minHeight: '4em',
            fontSize: 13,
            fontWeight: 300,
            lineHeight: 2,
            letterSpacing: '0.05em',
            opacity: longWait && messageVisible ? 0.8 : 0,
            transition: 'opacity 1s ease'
          }}
        >
          {longWait && messageVisible && (
            <>
              生成に少し時間がかかっています。
              <br />
              この画面のまま、もうしばらくお待ちください。
            </>
          )}
        </div>
      </div>

      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(680px, 80vw)',
            textAlign: 'center',
            fontFamily: 'Noto Sans JP, sans-serif',
            color: 'var(--c-text)',
            zIndex: 3
          }}
        >
          <div
            role="alert"
            style={{
              fontSize: 15,
              fontWeight: 300,
              lineHeight: 2,
              letterSpacing: '0.05em'
            }}
          >
            {errorMessage}
          </div>

          <button
            type="button"
            onClick={() => {
              setErrorMessage('');
              setAttempt((value) => value + 1);
            }}
            style={{
              marginTop: 28,
              background: 'var(--c-accent)',
              border: 'none',
              color: 'var(--c-dark)',
              padding: '13px 28px',
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: 13,
              fontWeight: 400,
              letterSpacing: '0.06em',
              cursor: 'pointer'
            }}
          >
            もう一度生成する
          </button>
        </div>
      )}
    </div>
  );
}
