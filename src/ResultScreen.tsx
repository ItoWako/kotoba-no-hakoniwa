import { useState, useEffect } from 'react';
import { ARCHIVE_PHOTOS, ACTIVE_PHOTO } from './data';

interface Props {
  word: string;
  tanka: string;
  photoId: string;
  onArchive: () => void;
  onReset?: () => void;
}

export default function ResultScreen({ word, tanka, photoId, onArchive, onReset }: Props) {
  const [phase, setPhase] = useState<'blank' | 'content' | 'full'>('blank');

  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId) ?? ACTIVE_PHOTO;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('content'), 300);
    const t2 = setTimeout(() => setPhase('full'), 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Claudeが「改行」でも「全角スペース」でも返せるようにする
  const tankaLines = (tanka || '')
    .split(/[\r\n　]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--c-bg)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden'
      }}
    >
      {/* ── Left: photo ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '52px 44px 52px 72px',
          opacity: phase !== 'blank' ? 1 : 0,
          transition: 'opacity 1s ease',
          height: '100%',
          boxSizing: 'border-box'
        }}
      >
        {/* Photo */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            overflow: 'hidden'
          }}
        >
          <img
            src={photo.url ?? ''}
            alt={photo.alt}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              objectPosition: 'left center',
              display: 'block'
            }}
          />
        </div>

        {/* Photo caption */}
        <div
          style={{
            flexShrink: 0,
            marginTop: 12
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--c-muted)',
              marginBottom: 2
            }}
          >
            {photo.label}
          </div>

          <div
            style={{
              width: 20,
              height: 1,
              background: 'var(--c-border)',
              marginTop: 8
            }}
          />
        </div>
      </div>

      {/* ── Right: tanka + word ── */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',

          // 下のボタンが画面外へ落ちないよう余白を調整
          padding: '40px 72px 32px 52px',

          borderLeft: '1px solid var(--c-border)',
          height: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          minHeight: 0
        }}
      >
        {/* Accent marker */}
        <div
          style={{
            position: 'absolute',
            left: -2,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 3,
            height: 40,
            background: 'var(--c-accent)'
          }}
        />

        {/* ── Upper: label + tanka ── */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            opacity: phase !== 'blank' ? 1 : 0,
            transition: 'opacity 1s ease 0.15s'
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--c-muted)',
              marginBottom: 28,
              flexShrink: 0
            }}
          >
            生成された短歌
          </div>

          {/* Vertical tanka */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 20,
              overflow: 'hidden'
            }}
          >
            {tankaLines.map((line, i) => (
              <div
                key={i}
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontFamily: 'Noto Serif JP, serif',
                  fontSize: 22,
                  fontWeight: 200,
                  letterSpacing: '0.18em',
                  lineHeight: 1.8,
                  color: 'var(--c-text)',
                  flexShrink: 0
                }}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* ── Lower: word + CTA ── */}
        <div
          style={{
            opacity: phase === 'full' ? 1 : 0,
            transition: 'opacity 0.8s ease 0.1s',
            flexShrink: 0
          }}
        >
          <div
            style={{
              height: 1,
              background: 'var(--c-border)',
              marginBottom: 20
            }}
          />

          {/* Selected word */}
          <div
            style={{
              marginBottom: 20
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 8,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--c-muted)',
                marginBottom: 10
              }}
            >
              選んだ言葉
            </div>

            <div
              style={{
                fontFamily: 'Noto Serif JP, serif',
                fontSize: 26,
                fontWeight: 300,
                letterSpacing: '0.1em',
                color: 'var(--c-text)'
              }}
            >
              {word}

              <span
                style={{
                  display: 'inline-block',
                  marginLeft: 6,
                  width: 24,
                  height: 3,
                  background: 'var(--c-accent)',
                  verticalAlign: 'middle',
                  position: 'relative',
                  top: -2
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}
          >
            <button
              onClick={onArchive}
              style={{
                background: 'var(--c-accent)',
                border: 'none',
                color: 'var(--c-dark)',
                padding: '13px 28px',
                fontFamily: 'Noto Sans JP, sans-serif',
                fontSize: 13,
                fontWeight: 400,
                letterSpacing: '0.06em',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.opacity = '0.85')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.opacity = '1')}
            >
              他の人の景色を見る
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 300
                }}
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
