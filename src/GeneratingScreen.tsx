import { useState, useEffect } from 'react';
import { ARCHIVE_PHOTOS } from './data';
import { requestTanka } from './services/tankaService';
import { PLACEMENT, getUIStyle } from './InputScreen';

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

    const t1 = setTimeout(() => {
      setPhotoOpacity(0);
      setOnBg(true);
    }, 120);

    const t2 = setTimeout(() => {
      setWordVisible(false);
      setMessageVisible(true);
    }, 1750);

    let minimumTimer: ReturnType<typeof setTimeout> | undefined;

    const minimumDuration = new Promise<void>((resolve) => {
      minimumTimer = setTimeout(resolve, 7550);
    });

    // 長時間応答がない場合も、再試行できる状態にする。
    const timeoutTimer = setTimeout(() => {
      controller.abort();
    }, 120000);

    const generate = async () => {
      try {
        const [result] = await Promise.all([requestTanka({ word, photoId }, controller.signal), minimumDuration]);

        if (cancelled) return;

        setMessageVisible(false);
        onComplete(result.tanka);
      } catch (error) {
        if (cancelled) return;

        console.error('短歌の生成に失敗しました:', error);

        setPhotoOpacity(0);
        setOnBg(true);
        setWordVisible(false);
        setMessageVisible(false);

        setErrorMessage(
          controller.signal.aborted
            ? '生成に時間がかかっています。少し待ってから、もう一度お試しください。'
            : error instanceof TypeError
              ? '通信できませんでした。インターネット接続を確認して、もう一度お試しください。'
              : error instanceof Error
                ? error.message
                : '短歌を生成できませんでした。もう一度お試しください。'
        );
      } finally {
        clearTimeout(timeoutTimer);
        clearTimeout(t1);
        clearTimeout(t2);

        if (minimumTimer !== undefined) {
          clearTimeout(minimumTimer);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(timeoutTimer);

      if (minimumTimer !== undefined) {
        clearTimeout(minimumTimer);
      }
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
          transition: 'opacity 0.55s ease'
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
          width: 'min(680px, 64vw)',
          textAlign: 'center',
          fontSize: 17,
          fontWeight: 300,
          lineHeight: 2.15,
          letterSpacing: '0.045em',
          color: 'var(--c-text)',
          opacity: messageVisible ? 1 : 0,
          transition: 'opacity 0.8s ease',
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
