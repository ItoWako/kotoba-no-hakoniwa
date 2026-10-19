import { useState, useCallback, useRef, useEffect } from 'react';
import { saveTanka } from './services/tankaStorage';
import WaitingScreen from './WaitingScreen';
import ConceptScreen from './ConceptScreen';
import PhotoSelectionScreen from './PhotoSelectionScreen';
import InputScreen from './InputScreen';
import GeneratingScreen from './GeneratingScreen';
import ResultScreen from './ResultScreen';
import ArchiveScreen from './ArchiveScreen';
import ArchiveDetailScreen from './ArchiveDetailScreen';
import ThankYouScreen from './ThankYouScreen';

type Screen =
  | 'waiting'
  | 'concept'
  | 'photo-selection'
  | 'input'
  | 'generating'
  | 'result'
  | 'own-detail'
  | 'archive'
  | 'archive-detail'
  | 'thank-you';

function getIdleTimeout(screen: Screen): number | null {
  switch (screen) {
    case 'waiting':
    case 'generating':
      return null;

    case 'concept':
      return 120000;

    case 'result':
    case 'own-detail':
    case 'archive-detail':
      return 90000;

    default:
      return 45000;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('waiting');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState('var(--c-bg)');
  const [selectedPhotoId, setSelectedPhotoId] = useState('sign-dusk');
  const [inputWord, setInputWord] = useState('');
  const [generatedTanka, setGeneratedTanka] = useState('');
  const [archivePhotoId, setArchivePhotoId] = useState<string | null>(null);
  const [hasViewedOtherScene, setHasViewedOtherScene] = useState(false);
  const [archiveCheckMode, setArchiveCheckMode] = useState(false);

  const transitioning = useRef(false);
  const currentTankaId = useRef('');
  const completedGeneration = useRef(false);
  const screenRef = useRef<Screen>('waiting');

  const transitionTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTransitionTimers = useCallback(() => {
    transitionTimers.current.forEach(clearTimeout);
    transitionTimers.current = [];
  }, []);

  const changeScreen = useCallback((target: Screen) => {
    screenRef.current = target;
    setScreen(target);
  }, []);

  const navigate = useCallback(
    (target: Screen, color = 'var(--c-bg)', inMs = 400, outMs = 400) => {
      if (transitioning.current) return;

      clearTransitionTimers();
      transitioning.current = true;
      setOverlayColor(color);
      setOverlayVisible(true);

      const enterTimer = setTimeout(() => {
        changeScreen(target);

        const exitTimer = setTimeout(() => {
          setOverlayVisible(false);
          transitioning.current = false;
        }, outMs);

        transitionTimers.current.push(exitTimer);
      }, inMs);

      transitionTimers.current.push(enterTimer);
    },
    [changeScreen, clearTransitionTimers]
  );

  // 保存済みの短歌は消さず、今回の体験だけリセットする。
  const clearExperience = useCallback(() => {
    setSelectedPhotoId('sign-dusk');
    setInputWord('');
    setGeneratedTanka('');
    setArchivePhotoId(null);
    setHasViewedOtherScene(false);
    setArchiveCheckMode(false);

    currentTankaId.current = '';
    completedGeneration.current = false;
  }, []);

  const returnToWaiting = useCallback(() => {
    clearTransitionTimers();
    transitioning.current = true;
    setOverlayColor('var(--c-bg)');
    setOverlayVisible(true);

    const enterTimer = setTimeout(() => {
      clearExperience();
      changeScreen('waiting');

      const exitTimer = setTimeout(() => {
        setOverlayVisible(false);
        transitioning.current = false;
      }, 400);

      transitionTimers.current.push(exitTimer);
    }, 350);

    transitionTimers.current.push(enterTimer);
  }, [changeScreen, clearExperience, clearTransitionTimers]);

  const handleReset = useCallback(() => {
    if (transitioning.current) return;

    if (archiveCheckMode) {
      returnToWaiting();
      return;
    }

    clearTransitionTimers();
    transitioning.current = true;
    setOverlayColor('var(--c-bg)');
    setOverlayVisible(true);

    const enterTimer = setTimeout(() => {
      clearExperience();
      changeScreen('thank-you');

      const exitTimer = setTimeout(() => {
        setOverlayVisible(false);
        transitioning.current = false;
      }, 450);

      transitionTimers.current.push(exitTimer);
    }, 350);

    transitionTimers.current.push(enterTimer);
  }, [archiveCheckMode, returnToWaiting, changeScreen, clearExperience, clearTransitionTimers]);

  useEffect(() => {
    const timeoutMs = getIdleTimeout(screen);
    if (timeoutMs === null) return;

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const restartIdleTimer = () => {
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }

      idleTimer = setTimeout(() => {
        if (transitioning.current) {
          restartIdleTimer();
          return;
        }

        returnToWaiting();
      }, timeoutMs);
    };

    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart'] as const;

    events.forEach((event) => {
      window.addEventListener(event, restartIdleTimer, {
        capture: true,
        passive: true
      });
    });

    restartIdleTimer();

    return () => {
      if (idleTimer !== undefined) {
        clearTimeout(idleTimer);
      }

      events.forEach((event) => {
        window.removeEventListener(event, restartIdleTimer, true);
      });
    };
  }, [screen, returnToWaiting]);

  useEffect(() => {
    return () => clearTransitionTimers();
  }, [clearTransitionTimers]);

  const handleGenerationComplete = useCallback(
    (tanka: string) => {
      if (screenRef.current !== 'generating') return;
      if (completedGeneration.current) return;

      completedGeneration.current = true;
      setGeneratedTanka(tanka);

      try {
        saveTanka({
          id: currentTankaId.current,
          photoId: selectedPhotoId,
          word: inputWord,
          tanka,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        console.error('短歌の保存に失敗しました:', error);

        window.alert('短歌は生成できましたが、保存に失敗しました。展示担当者にお知らせください。');
      }

      navigate('result', 'var(--c-bg)', 500, 500);
    },
    [inputWord, selectedPhotoId, navigate]
  );

  const openArchiveForCheck = useCallback(() => {
    if (screenRef.current !== 'waiting') return;
    if (transitioning.current) return;

    setArchiveCheckMode(true);
    setArchivePhotoId(null);
    setHasViewedOtherScene(false);
    navigate('archive', 'var(--c-bg)', 300, 300);
  }, [navigate]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: 'var(--c-bg)'
      }}
    >
      {screen === 'waiting' && (
        <WaitingScreen
          onComplete={() => {
            if (screenRef.current !== 'waiting') return;
            if (transitioning.current) return;

            setArchiveCheckMode(false);
            navigate('concept', 'var(--c-bg)', 350, 500);
          }}
        />
      )}

      {screen === 'concept' && (
        <ConceptScreen
          onStart={() => {
            if (screenRef.current !== 'concept') return;

            navigate('photo-selection', 'var(--c-bg)', 350, 350);
          }}
        />
      )}

      {screen === 'photo-selection' && (
        <PhotoSelectionScreen
          onSelect={(id) => {
            if (screenRef.current !== 'photo-selection') return;
            if (transitioning.current) return;

            setSelectedPhotoId(id);
            changeScreen('input');
          }}
          onBack={() => navigate('concept', 'var(--c-bg)', 300, 300)}
        />
      )}

      {screen === 'input' && (
        <InputScreen
          photoId={selectedPhotoId}
          onSubmit={(word) => {
            if (screenRef.current !== 'input') return;
            if (transitioning.current) return;

            currentTankaId.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

            completedGeneration.current = false;
            setInputWord(word);
            changeScreen('generating');
          }}
          onBack={() => navigate('photo-selection', 'var(--c-bg)', 300, 300)}
        />
      )}

      {screen === 'generating' && (
        <GeneratingScreen word={inputWord} photoId={selectedPhotoId} onComplete={handleGenerationComplete} />
      )}

      {screen === 'result' && (
        <ResultScreen
          word={inputWord}
          tanka={generatedTanka}
          photoId={selectedPhotoId}
          onArchive={() => navigate('own-detail', 'var(--c-bg)', 250, 320)}
          onReset={handleReset}
        />
      )}

      {screen === 'own-detail' && (
        <ArchiveDetailScreen
          photoId={selectedPhotoId}
          onBack={() => navigate('result', 'var(--c-bg)', 300, 300)}
          onViewAll={() => navigate('archive', 'var(--c-bg)', 350, 350)}
        />
      )}

      {screen === 'archive' && (
        <ArchiveScreen
          isCheckMode={archiveCheckMode}
          onPhotoSelect={(id) => {
            if (transitioning.current) return;

            setArchivePhotoId(id);
            setHasViewedOtherScene(true);
            navigate('archive-detail', 'var(--c-bg)', 300, 300);
          }}
          onBack={() => {
            if (transitioning.current) return;

            if (archiveCheckMode) {
              returnToWaiting();
            } else {
              navigate('own-detail', 'var(--c-bg)', 300, 300);
            }
          }}
          onReset={handleReset}
          highlightReset={hasViewedOtherScene}
        />
      )}

      {screen === 'archive-detail' && archivePhotoId && (
        <ArchiveDetailScreen
          photoId={archivePhotoId}
          onBack={() => navigate('archive', 'var(--c-bg)', 300, 300)}
          onReset={handleReset}
          highlightReset={hasViewedOtherScene}
        />
      )}

      {screen === 'thank-you' && (
        <ThankYouScreen
          onComplete={() => {
            if (screenRef.current !== 'thank-you') return;

            navigate('waiting', 'var(--c-bg)', 350, 500);
          }}
        />
      )}

      {screen === 'waiting' && (
        <button
          type="button"
          aria-label="確認用アーカイブを開く"
          onClick={(event) => {
            event.stopPropagation();
            openArchiveForCheck();
          }}
          style={{
            position: 'fixed',
            right: 16,
            bottom: 16,
            width: 64,
            height: 64,
            padding: 0,
            border: 'none',
            background: 'transparent',
            cursor: 'default',
            zIndex: 8000
          }}
        />
      )}

      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          background: overlayColor,
          opacity: overlayVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          pointerEvents: overlayVisible ? 'all' : 'none'
        }}
      />
    </div>
  );
}
