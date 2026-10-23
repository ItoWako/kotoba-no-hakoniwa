import { useState, useEffect, useRef } from 'react';
import { ARCHIVE_PHOTOS, ACTIVE_PHOTO } from './data';

interface Props {
  photoId: string;
  onSubmit: (word: string) => void;
  onBack: () => void;
}

export type Placement = 'bottom-right' | 'bottom-left' | 'bottom-center';

export const PLACEMENT: Record<string, Placement> = {
  'sign-dusk': 'bottom-right',
  chrysanthemum: 'bottom-center',
  'statue-roses': 'bottom-left',
  'tree-abstract': 'bottom-center',
  feather: 'bottom-right',
  candles: 'bottom-center',
  'fire-bowl': 'bottom-left',
  'cat-evening': 'bottom-right',
  cicada: 'bottom-right',
  clover: 'bottom-left',
  'shrine-rope': 'bottom-right',
  'overpass-sky': 'bottom-left'
};

export function getUIStyle(placement: Placement): React.CSSProperties {
  switch (placement) {
    case 'bottom-left':
      return {
        left: 120,
        bottom: 110,
        alignItems: 'flex-start'
      };

    case 'bottom-center':
      return {
        left: '50%',
        bottom: 110,
        transform: 'translateX(-50%)',
        alignItems: 'center'
      };

    default:
      return {
        right: 120,
        bottom: 110,
        alignItems: 'flex-end'
      };
  }
}

export default function InputScreen({ photoId, onSubmit, onBack }: Props) {
  const [word, setWord] = useState('');
  const [uiVisible, setUiVisible] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const composingRef = useRef(false);

  const placement: Placement = PLACEMENT[photoId] ?? 'bottom-right';

  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId) ?? ACTIVE_PHOTO;

  useEffect(() => {
    const t1 = setTimeout(() => setUiVisible(true), 200);
    const t2 = setTimeout(() => inputRef.current?.focus(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleSubmit = () => {
    if (composingRef.current) return;

    const trimmed = word.trim();
    if (trimmed) onSubmit(trimmed);
  };

  const inputAlign = placement === 'bottom-left' ? 'left' : placement === 'bottom-center' ? 'center' : 'right';

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      {/* 写真 */}
      <img
        src={photo.fullUrl ?? ''}
        alt={photo.alt}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />

      {/* 写真下部のグラデーション */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.42) 0%, transparent 52%)',
          pointerEvents: 'none'
        }}
      />

      {/* 上部のラベルと戻るボタン */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '36px 80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: uiVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.2s'
        }}
      >
        <div
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 10,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)'
          }}
        >
          {photo.label}
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '0.06em',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.color = 'rgba(255,255,255,0.85)';
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.color = 'rgba(255,255,255,0.45)';
          }}
        >
          景色を選び直す
        </button>
      </div>

      {/* 写真ごとの位置に入力欄を配置 */}
      <div
        style={{
          position: 'absolute',
          ...getUIStyle(placement),
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          opacity: uiVisible ? 1 : 0,
          transition: 'opacity 0.9s ease 0.4s'
        }}
      >
        <div
          style={{
            fontSize: 15,
            color: 'rgba(255,255,255,0.82)',
            fontWeight: 300,
            letterSpacing: '0.08em',
            textAlign: inputAlign
          }}
        >
          あなたは何を見ましたか。
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            width: 220
          }}
        >
          <input
            ref={inputRef}
            type="text"
            aria-label="写真から思い浮かんだ一語"
            aria-describedby="input-enter-hint"
            value={word}
            onChange={(event) => setWord(event.target.value)}
            onCompositionStart={() => {
              composingRef.current = true;
            }}
            onCompositionEnd={() => {
              composingRef.current = false;
            }}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;

              if (composingRef.current || event.nativeEvent.isComposing || event.keyCode === 229) {
                return;
              }

              event.preventDefault();
              handleSubmit();
            }}
            maxLength={12}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.32)',
              color: 'rgba(255,255,255,0.95)',
              fontSize: 32,
              fontFamily: 'Noto Sans JP, sans-serif',
              fontWeight: 300,
              letterSpacing: '0.12em',
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 0',
              outline: 'none',
              caretColor: '#D7FF3F',
              textAlign: inputAlign
            }}
          />

          <div
            id="input-enter-hint"
            style={{
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: 12,
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.65)',
              textAlign: inputAlign
            }}
          >
            Enterで入力
          </div>
        </div>

        <div
          style={{
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: inputAlign === 'right' ? 'flex-end' : inputAlign === 'left' ? 'flex-start' : 'center'
          }}
        >
          {word.trim().length > 0 && (
            <button
              type="button"
              onClick={handleSubmit}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 0,
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.color = 'rgba(255,255,255,0.9)';
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              Enter →
            </button>
          )}
        </div>
      </div>

      {/* 画面下部の案内 */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 80,
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          letterSpacing: '0.12em',
          color: 'rgba(255,255,255,0.28)',
          textTransform: 'uppercase',
          opacity: uiVisible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.6s'
        }}
      >
        一語を入力してください
      </div>
    </div>
  );
}
