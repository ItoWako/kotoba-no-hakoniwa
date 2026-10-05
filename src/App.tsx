import { useState, useCallback, useRef } from 'react';
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

export default function App() {
  const [screen, setScreen] = useState<Screen>('waiting');
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState('var(--c-bg)');
  const [selectedPhotoId, setSelectedPhotoId] = useState('sign-dusk');
  const [inputWord, setInputWord] = useState('');
  const [generatedTanka, setGeneratedTanka] = useState('');
  const [archivePhotoId, setArchivePhotoId] = useState<string | null>(null);
  const [hasViewedOtherScene, setHasViewedOtherScene] = useState(false);

  const transitioning = useRef(false);
  const currentTankaId = useRef('');
  const completedGeneration = useRef(false);

  const navigate = useCallback((target: Screen, color = 'var(--c-bg)', inMs = 400, outMs = 400) => {
    if (transitioning.current) return;

    transitioning.current = true;
    setOverlayColor(color);
    setOverlayVisible(true);

    setTimeout(() => {
      setScreen(target);

      setTimeout(() => {
        setOverlayVisible(false);
        transitioning.current = false;
      }, outMs);
    }, inMs);
  }, []);

  const handleReset = useCallback(() => {
    if (transitioning.current) return;

    transitioning.current = true;
    setOverlayColor('var(--c-bg)');
    setOverlayVisible(true);

    setTimeout(() => {
      setSelectedPhotoId('sign-dusk');
      setInputWord('');
      setGeneratedTanka('');
      setArchivePhotoId(null);
      setHasViewedOtherScene(false);

      currentTankaId.current = '';
      completedGeneration.current = false;

      setScreen('thank-you');

      setTimeout(() => {
        setOverlayVisible(false);
        transitioning.current = false;
      }, 450);
    }, 350);
  }, []);

  const handleGenerationComplete = useCallback(
    (tanka: string) => {
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
      {screen === 'waiting' && <WaitingScreen onComplete={() => navigate('concept', 'var(--c-bg)', 350, 500)} />}

      {screen === 'concept' && <ConceptScreen onStart={() => navigate('photo-selection', 'var(--c-bg)', 350, 350)} />}

      {screen === 'photo-selection' && (
        <PhotoSelectionScreen
          onSelect={(id) => {
            setSelectedPhotoId(id);

            setTimeout(() => {
              setScreen('input');
              transitioning.current = false;
            }, 0);
          }}
          onBack={() => navigate('concept', 'var(--c-bg)', 300, 300)}
        />
      )}

      {screen === 'input' && (
        <InputScreen
          photoId={selectedPhotoId}
          onSubmit={(word) => {
            currentTankaId.current = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
            completedGeneration.current = false;

            setInputWord(word);
            setScreen('generating');
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
          onPhotoSelect={(id) => {
            setArchivePhotoId(id);
            setHasViewedOtherScene(true);
            navigate('archive-detail', 'var(--c-bg)', 300, 300);
          }}
          onBack={() => navigate('own-detail', 'var(--c-bg)', 300, 300)}
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

      {screen === 'thank-you' && <ThankYouScreen onComplete={() => navigate('waiting', 'var(--c-bg)', 350, 500)} />}

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
