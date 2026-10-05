import { useState, useEffect } from 'react';
import { ARCHIVE_PHOTOS } from './data';
import { loadTankasForPhoto } from './services/tankaStorage';
import type { SavedTanka } from './services/tankaStorage';

interface Props {
  photoId: string;
  onBack: () => void;
  onReset?: () => void;
  onViewAll?: () => void;
  highlightReset?: boolean;
}

export default function ArchiveDetailScreen({ photoId, onBack, onReset, onViewAll }: Props) {
  const photo = ARCHIVE_PHOTOS.find((p) => p.id === photoId) ?? ARCHIVE_PHOTOS[0];

  const [entries, setEntries] = useState<SavedTanka[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [tankaVisible, setTankaVisible] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = loadTankasForPhoto(photoId);

      setEntries(saved);
      setSelectedId(saved[0]?.id ?? '');
      setLoadError('');
    } catch (error) {
      console.error('短歌の読み込みに失敗しました:', error);

      setEntries([]);
      setSelectedId('');
      setLoadError('保存した短歌を読み込めませんでした。');
    }

    setTankaVisible(true);
  }, [photoId]);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (tankaVisible) return;

    const timer = setTimeout(() => setTankaVisible(true), 250);
    return () => clearTimeout(timer);
  }, [selectedId, tankaVisible]);

  const handleWordSelect = (id: string) => {
    if (id === selectedId) return;

    setTankaVisible(false);
    setSelectedId(id);
  };

  const currentEntry = entries.find((entry) => entry.id === selectedId);
  const selectedWord = currentEntry?.word ?? '';
  const tankaLines = currentEntry ? currentEntry.tanka.trim().split(/[　\n]+/) : [];

  const isOwnDetail = !!onViewAll;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--c-bg)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '44px 56px 0 72px',
          flexShrink: 0
        }}
      >
        {!isOwnDetail && onReset && (
          <button
            onClick={onReset}
            style={{
              background: 'transparent',
              border: 'none',
              fontFamily: 'Noto Sans JP, sans-serif',
              fontSize: 11,
              fontWeight: 300,
              letterSpacing: '0.05em',
              color: 'var(--c-muted)',
              cursor: 'pointer',
              padding: 0,
              transition: 'color 0.25s ease, text-decoration 0.25s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--c-text)';
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--c-muted)';
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            研究を終了する
          </button>
        )}
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 240px',
          marginTop: 36
        }}
      >
        {/* Photo */}
        <div
          style={{
            padding: '0 44px 80px 72px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start'
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

          <div style={{ marginTop: 14, flexShrink: 0 }}>
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
          </div>
        </div>

        {/* Tanka */}
        <div
          style={{
            borderLeft: '1px solid var(--c-border)',
            padding: '0 52px 80px 52px',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}
        >
          <div
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--c-muted)',
              marginBottom: 44,
              flexShrink: 0
            }}
          >
            他の人の短歌
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'row-reverse',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 18,
              overflow: 'hidden',
              opacity: tankaVisible ? 1 : 0,
              transform: tankaVisible ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.35s ease, transform 0.35s ease'
            }}
          >
            {!currentEntry && (
              <div
                role="status"
                style={{
                  fontFamily: 'Noto Sans JP, sans-serif',
                  fontSize: 14,
                  fontWeight: 300,
                  lineHeight: 1.8,
                  color: 'var(--c-muted)',
                  textAlign: 'center'
                }}
              >
                {loadError || 'この景色には、まだ短歌がありません。'}
              </div>
            )}

            {tankaLines.map((line, i) => (
              <div
                key={i}
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  fontFamily: 'Noto Serif JP, serif',
                  fontSize: 20,
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

        {/* Word list */}
        <div
          style={{
            borderLeft: '1px solid var(--c-border)',
            padding: '0 32px 176px 28px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{ flexShrink: 0, marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 8,
                marginBottom: 7
              }}
            >
              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 30,
                  fontWeight: 300,
                  lineHeight: 1,
                  color: 'var(--c-text)'
                }}
              >
                {entries.length}
              </span>

              <span
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 9,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--c-muted)'
                }}
              >
                words
              </span>
            </div>

            <div
              style={{
                fontFamily: 'Noto Sans JP, sans-serif',
                fontSize: 10,
                fontWeight: 300,
                letterSpacing: '0.08em',
                color: 'var(--c-muted)'
              }}
            >
              この景色に集まった言葉
            </div>
          </div>

          {/* Scrollable words */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto'
            }}
          >
            {entries.map((entry) => {
              const isSel = entry.id === selectedId;

              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleWordSelect(entry.id)}
                  aria-pressed={isSel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    padding: '10px 0',
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSel) {
                      e.currentTarget.style.opacity = '0.65';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span
                    style={{
                      width: 3,
                      height: 14,
                      background: isSel ? 'var(--c-accent)' : 'transparent',
                      flexShrink: 0,
                      transition: 'background 0.25s ease'
                    }}
                  />

                  <span
                    style={{
                      fontFamily: 'Noto Serif JP, serif',
                      fontSize: 15,
                      fontWeight: isSel ? 400 : 300,
                      letterSpacing: '0.08em',
                      color: isSel ? 'var(--c-dark)' : 'var(--c-text)',
                      transition: 'color 0.25s ease, font-weight 0.25s ease'
                    }}
                  >
                    {entry.word}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected word */}
          <div
            style={{
              flexShrink: 0,
              paddingTop: 16,
              marginBottom: 42,
              borderTop: '1px solid var(--c-border)'
            }}
          >
            <div
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 8,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--c-muted)',
                marginBottom: 8
              }}
            >
              選んだ言葉
            </div>

            <div
              style={{
                fontFamily: 'Noto Serif JP, serif',
                fontSize: 18,
                fontWeight: 300,
                letterSpacing: '0.1em',
                color: 'var(--c-text)'
              }}
            >
              {selectedWord}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div
        style={{
          position: 'absolute',
          bottom: 44,
          left: 72,
          right: 0,
          height: 44,
          zIndex: 10
        }}
      >
        <button
          onClick={onBack}
          style={{
            position: 'absolute',
            left: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '0.05em',
            color: 'var(--c-muted)',
            cursor: 'pointer',
            padding: 0,
            transition: 'color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--c-text)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--c-muted)';
          }}
        >
          {isOwnDetail ? '← 自分の短歌に戻る' : '← 一覧へ戻る'}
        </button>

        {isOwnDetail && onViewAll && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              width: 240,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <button
              onClick={onViewAll}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              他の景色も見る
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
        )}
      </div>
    </div>
  );
}
