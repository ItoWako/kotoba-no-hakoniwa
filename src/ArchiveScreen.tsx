import { useState, useEffect, useRef } from 'react';
import { ARCHIVE_PHOTOS } from './data';
import type { PhotoData } from './data';
import { loadTankas } from './services/tankaStorage';

interface Props {
  onPhotoSelect: (id: string) => void;
  onBack: () => void;
  onReset: () => void;
  highlightReset?: boolean;
  isCheckMode?: boolean;
}

export default function ArchiveScreen({
  onPhotoSelect,
  onBack,
  onReset,
  highlightReset = false,
  isCheckMode = false
}: Props) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [tankaCount, setTankaCount] = useState<number | null>(null);
  const [backupMessage, setBackupMessage] = useState('');
  const [backupError, setBackupError] = useState(false);

  const lastTapRef = useRef<{
    id: string;
    time: number;
  } | null>(null);

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

  const handleBackup = () => {
    if (!isCheckMode) return;

    setBackupMessage('');
    setBackupError(false);

    let url: string | undefined;
    let link: HTMLAnchorElement | undefined;

    try {
      // 写真一覧の件数にかかわらず、保存済みの全件を出力する。
      const entries = loadTankas();

      if (entries.length === 0) {
        setBackupMessage('バックアップする短歌がありません。');
        return;
      }

      const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });

      url = URL.createObjectURL(blob);
      link = document.createElement('a');

      const date = new Date().toISOString().replace(/[:.]/g, '-');

      link.href = url;
      link.download = `kotoba-no-hakoniwa-backup-${date}.json`;

      document.body.appendChild(link);
      link.click();

      setBackupMessage(`${entries.length}首のダウンロードを開始しました。保存されたJSONファイルを確認してください。`);
    } catch (error) {
      console.error('バックアップに失敗しました:', error);
      setBackupError(true);
      setBackupMessage(
        'バックアップを開始できませんでした。保存データとブラウザのダウンロード設定を確認してください。'
      );
    } finally {
      link?.remove();

      if (url !== undefined) {
        const downloadUrl = url;

        // ダウンロード処理が始まるまでURLを保持する。
        window.setTimeout(() => {
          URL.revokeObjectURL(downloadUrl);
        }, 10000);
      }
    }
  };

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
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background: 'var(--c-bg)',
          borderBottom: '1px solid var(--c-border)',
          padding: '22px 56px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 20,
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 24
          }}
        >
          <button
            type="button"
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
            onMouseEnter={(event) => {
              event.currentTarget.style.color = 'var(--c-text)';
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.color = 'var(--c-muted)';
            }}
          >
            {isCheckMode ? '← タイトルへ戻る' : '← 自分の景色へ戻る'}
          </button>

          <div
            style={{
              width: 1,
              height: 16,
              background: 'var(--c-border)'
            }}
          />

          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 6
            }}
          >
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

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 24
          }}
        >
          {isCheckMode && (
            <button
              type="button"
              onClick={handleBackup}
              style={{
                background: 'var(--c-accent)',
                border: 'none',
                color: 'var(--c-dark)',
                padding: '10px 16px',
                fontFamily: 'Noto Sans JP, sans-serif',
                fontSize: 11,
                fontWeight: 400,
                letterSpacing: '0.05em',
                cursor: 'pointer'
              }}
            >
              JSONバックアップを保存
            </button>
          )}

          <button
            type="button"
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
            onMouseEnter={(event) => {
              if (!highlightReset) {
                event.currentTarget.style.color = 'var(--c-text)';
                event.currentTarget.style.textDecoration = 'underline';
              }
            }}
            onMouseLeave={(event) => {
              if (!highlightReset) {
                event.currentTarget.style.color = 'var(--c-muted)';
                event.currentTarget.style.textDecoration = 'none';
              }
            }}
          >
            {isCheckMode ? '確認を終了する' : '研究を終了する'}
          </button>
        </div>
      </div>

      {isCheckMode && backupMessage && (
        <div
          role={backupError ? 'alert' : 'status'}
          style={{
            padding: '12px 56px',
            borderBottom: '1px solid var(--c-border)',
            fontFamily: 'Noto Sans JP, sans-serif',
            fontSize: 12,
            fontWeight: 300,
            lineHeight: 1.8,
            color: 'var(--c-text)',
            flexShrink: 0
          }}
        >
          {backupMessage}
        </div>
      )}

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
        {ARCHIVE_PHOTOS.map((photo, index) =>
          photo.isPlaceholder ? (
            <PlaceholderCell key={photo.id} index={index} label={photo.label} />
          ) : (
            <PhotoCell
              key={photo.id}
              photo={photo}
              index={index}
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
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
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
