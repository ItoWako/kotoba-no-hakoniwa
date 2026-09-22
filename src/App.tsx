import { useState, useCallback, useRef } from "react";
import WaitingScreen from "./WaitingScreen";
import ConceptScreen from "./ConceptScreen";
import PhotoSelectionScreen from "./PhotoSelectionScreen";
import InputScreen from "./InputScreen";
import GeneratingScreen from "./GeneratingScreen";
import ResultScreen from "./ResultScreen";
import ArchiveScreen from "./ArchiveScreen";
import ArchiveDetailScreen from "./ArchiveDetailScreen";
import ThankYouScreen from "./ThankYouScreen";

type Screen =
  | "waiting"
  | "concept"
  | "photo-selection"
  | "input"
  | "generating"
  | "result"
  | "own-detail"      // detail for user's own selected photo
  | "archive"
  | "archive-detail"
  | "thank-you"; // final thank-you message before reset

export default function App() {
  const [screen, setScreen] = useState<Screen>("waiting");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayColor, setOverlayColor] = useState("var(--c-bg)");
  const [selectedPhotoId, setSelectedPhotoId] = useState("sign-dusk");
  const [inputWord, setInputWord] = useState("");
  const [generatedTanka, setGeneratedTanka] = useState("");
  const [archivePhotoId, setArchivePhotoId] = useState<string | null>(null);
  const [hasViewedOtherScene, setHasViewedOtherScene] = useState(false);
  const transitioning = useRef(false);

  const navigate = useCallback(
    (target: Screen, color = "var(--c-bg)", inMs = 400, outMs = 400) => {
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
    },
    []
  );

  const handleReset = useCallback(() => {
    if (transitioning.current) return;
    transitioning.current = true;
    setOverlayColor("var(--c-bg)");
    setOverlayVisible(true);
    setTimeout(() => {
      setSelectedPhotoId("sign-dusk");
      setInputWord("");
      setGeneratedTanka("");
      setArchivePhotoId(null);
      setHasViewedOtherScene(false);
      setScreen("thank-you");
      setTimeout(() => {
        setOverlayVisible(false);
        transitioning.current = false;
      }, 450);
    }, 350);
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "var(--c-bg)",
      }}
    >
      {screen === "waiting" && (
        <WaitingScreen
          onComplete={() => navigate("concept", "var(--c-bg)", 350, 500)}
        />
      )}

      {screen === "concept" && (
        <ConceptScreen
          onStart={() => navigate("photo-selection", "var(--c-bg)", 350, 350)}
        />
      )}

      {screen === "photo-selection" && (
        <PhotoSelectionScreen
          onSelect={(id) => {
            setSelectedPhotoId(id);
            setTimeout(() => {
              setScreen("input");
              transitioning.current = false;
            }, 0);
          }}
          onBack={() => navigate("concept", "var(--c-bg)", 300, 300)}
        />
      )}

      {screen === "input" && (
        <InputScreen
          photoId={selectedPhotoId}
          onSubmit={(word) => {
            setInputWord(word);
            // Direct switch — no overlay, same photo shows seamlessly in GeneratingScreen
            setScreen("generating");
          }}
          onBack={() => navigate("photo-selection", "var(--c-bg)", 300, 300)}
        />
      )}

      {screen === "generating" && (
        <GeneratingScreen
          word={inputWord}
          photoId={selectedPhotoId}
          onComplete={(tanka) => {
            setGeneratedTanka(tanka);
            navigate("result", "var(--c-bg)", 500, 500);
          }}
        />
      )}

      {screen === "result" && (
        <ResultScreen
          word={inputWord}
          tanka={generatedTanka}
          photoId={selectedPhotoId}
          onArchive={() => navigate("own-detail", "var(--c-bg)", 250, 320)}
          onReset={handleReset}
        />
      )}

      {/* Own photo's detail — other people's words for the same photo */}
      {screen === "own-detail" && (
        <ArchiveDetailScreen
          photoId={selectedPhotoId}
          onBack={() => navigate("result", "var(--c-bg)", 300, 300)}
          onViewAll={() => navigate("archive", "var(--c-bg)", 350, 350)}
        />
      )}

      {screen === "archive" && (
        <ArchiveScreen
          onPhotoSelect={(id) => {
            setArchivePhotoId(id);
            setHasViewedOtherScene(true);
            navigate("archive-detail", "var(--c-bg)", 300, 300);
          }}
          onBack={() => navigate("own-detail", "var(--c-bg)", 300, 300)}
          onReset={handleReset}
          highlightReset={hasViewedOtherScene}
        />
      )}

      {screen === "archive-detail" && archivePhotoId && (
        <ArchiveDetailScreen
          photoId={archivePhotoId}
          onBack={() => navigate("archive", "var(--c-bg)", 300, 300)}
          onReset={handleReset}
          highlightReset={hasViewedOtherScene}
        />
      )}

      {screen === "thank-you" && (
        <ThankYouScreen
          onComplete={() => navigate("waiting", "var(--c-bg)", 350, 500)}
        />
      )}

      {/* Transition overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9000,
          background: overlayColor,
          opacity: overlayVisible ? 1 : 0,
          transition: "opacity 0.4s ease",
          pointerEvents: overlayVisible ? "all" : "none",
        }}
      />
    </div>
  );
}
