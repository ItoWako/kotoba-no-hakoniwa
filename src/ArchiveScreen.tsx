import { useState, useEffect, useRef } from 'react';
import { ARCHIVE_PHOTOS } from './data';
import type { PhotoData } from './data';
import { loadTankas } from './services/tankaStorage';

interface Props {
  onPhotoSelect: (id: string) => void;
  onBack: () => void;
  onReset: () => void;
  highlightReset?: boolean;
}

export default function ArchiveScreen({ onPhotoSelect, onBack, onReset, highlightReset = false }: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tankaCount, setTankaCount] = useState<number | null>(null);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

  useEffect(() => {
    try {
      const photoIds = new Set(ARCHIVE_PHOTOS.filter((photo) => !photo.isPlaceholder).map((photo) => photo.id));

      const saved = loadTankas();
      setTankaCount(saved.filter((entry) => photoIds.has(entry.photoId)).length);
    } catch (error) {
      console.error('短歌の件数を読み込めませんでした:', error);
      setTankaCount(null);
    }

    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleTouchEnd = (photoId: string) => {
    const now = Date.now();
    const previous = lastTapRef.current;

    if (previous && previous.id === photoId && now - previous.time < 360) {
      lastTapRef.current = null;
      onPhotoSelect(photoId);
      return;
    }

    lastTapRef.current = { id: photoId, time: now };
    setSelected(photoId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--c-bg)',
        overflow: 'hidden',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--c-bg)',
          borderBottom: '1px solid var(--c-border)',
          padding: '22px 56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button
            onClick={onBack}
            style={{
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
            ← 自分の景色へ戻る
          </button>

          <div
            style={{
              width: 1,
              height: 16,
              background: 'var(--c-border)'
            }}
          />

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            {tankaCount === null ? (
              <div
                role="status"
                style={{
                  fontFamily: 'Noto Sans JP, sans-serif',
                  fontSize: 10,
                  color: 'var(--c-muted)'
                }}
              >
                保存件数を読み込めませんでした
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 22,
                    fontWeight: 300,
                    color: 'var(--c-text)',
                    letterSpacing: '-0.01em'
                  }}
                >
                  {tankaCount}
                </div>

                <div
                  style={{
                    fontFamily: 'Noto Sans JP, sans-serif',
                    fontSize: 9,
                    letterSpacing: '0.08em',
                    color: 'var(--c-muted)'
                  }}
                >
                  首の短歌
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onReset}
          style={{
            background: highlightReset ? 'var(--c-accent)' : 'transparent',
            border: 'none',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: 11,
            fontWeight: highlightReset ? 400 : 300,
            letterSpacing: '0.05em',
            color: highlightReset ? 'var(--c-dark)' : 'var(--c-muted)',
            cursor: 'pointer',
            padding: highlightReset ? '9px 14px' : 0,
            textDecoration: 'none',
            transition: 'all 0.25s ease'
          }}
          onMouseEnter={(e) => {
            if (!highlightReset) {
              e.currentTarget.style.color = 'var(--c-text)';
              e.currentTarget.style.textDecoration = 'underline';
            }
          }}
          onMouseLeave={(e) => {
            if (!highlightReset) {
              e.currentTarget.style.color = 'var(--c-muted)';
              e.currentTarget.style.textDecoration = 'none';
            }
          }}
        >
          研究を終了する
        </button>
      </div>

      {/* Photo grid */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          padding: '28px 56px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(3, minmax(0, 1fr))',
          gap: 14
        }}
      >
        {ARCHIVE_PHOTOS.map((photo, i) =>
          photo.isPlaceholder ? (
            <PlaceholderCell key={photo.id} index={i} label={photo.label} />
          ) : (
            <PhotoCell
              key={photo.id}
              photo={photo}
              index={i}
              isHovered={hovered === photo.id}
              isSelected={selected === photo.id}
              onHover={setHovered}
              onSelect={setSelected}
              onEnter={onPhotoSelect}
              onTouchEnd={() => handleTouchEnd(photo.id)}
            />
          )
        )}
      </div>
    </div>
  );
}

function PhotoCell({
  photo,
  index,
  isHovered,
  isSelected,
  onHover,
  onSelect,
  onEnter,
  onTouchEnd
}: {
  photo: PhotoData;
  index: number;
  isHovered: boolean;
  isSelected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
  onEnter: (id: string) => void;
  onTouchEnd: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={photo.alt}
      onClick={() => onSelect(photo.id)}
      onDoubleClick={() => onEnter(photo.id)}
      onTouchEnd={onTouchEnd}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEnter(photo.id);
        }
      }}
      onMouseEnter={() => onHover(photo.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        position: 'relative',
        minHeight: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        background: 'var(--c-border)',
        outline: isSelected ? '2px solid var(--c-accent)' : '2px solid transparent',
        outlineOffset: -2,
        transition: 'outline 0.2s ease',
        touchAction: 'manipulation'
      }}
    >
      <img
        src={photo.url ?? ''}
        alt={photo.alt}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          transition: 'transform 0.35s ease'
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          fontFamily: 'Inter, sans-serif',
          fontSize: 8,
          letterSpacing: '0.14em',
          color: 'rgba(255,255,255,0.5)',
          pointerEvents: 'none'
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            border: '2px solid var(--c-accent)',
            pointerEvents: 'none'
          }}
        />
      )}
    </div>
  );
}

function PlaceholderCell({ index, label }: { index: number; label: string }) {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: 0,
        height: '100%',
        background: 'var(--c-border)',
        opacity: 0.35,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6
      }}
    >
      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 8,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--c-muted)'
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>

      <div
        style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 7,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'var(--c-muted)'
        }}
      >
        {label}
      </div>
    </div>
  );
}
