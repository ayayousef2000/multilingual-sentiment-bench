import { useCallback, useState } from "react";
import { useClassifierContext } from "@/context/ClassifierContext";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { PlaygroundResult } from "@/types";
import { ModelLoader } from "../playground/ModelLoader";
import { ResultCard } from "../playground/ResultCard";
import { TextInput } from "../playground/TextInput";
import { ErrorBoundary } from "../ui";

export function PlaygroundView() {
  const { loadState, loadedModelId, loadModel, classify } = useClassifierContext();

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleLoad = useCallback(() => {
    loadModel(selectedModelId);
  }, [loadModel, selectedModelId]);

  const handleClassify = useCallback(
    async (text: string) => {
      if (!loadedModelId) return;
      setIsClassifying(true);
      try {
        const r = await classify(text, loadedModelId);
        setResult(r);
      } catch {
        // error surfaced via loadState.error
      } finally {
        setIsClassifying(false);
      }
    },
    [classify, loadedModelId]
  );

  return (
    <ErrorBoundary label="PlaygroundView">
      <div className="page-body">
        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="sidebar">
          <div className="sidebar-card">
            <ModelLoader
              selectedModelId={selectedModelId}
              loadState={loadState}
              onModelChange={setSelectedModelId}
              onLoad={handleLoad}
            />
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────── */}
        <main className="main-content">
          <div className="page-heading">
            <h1>
              Interactive <span>Playground</span>
            </h1>
            <p>
              Classify sentiment in English, Arabic, and Russian directly in your browser. Zero
              server latency — all inference runs in a Web Worker.
            </p>
          </div>

          <TextInput
            onClassify={handleClassify}
            isLoading={isClassifying}
            isModelReady={loadState.status === "ready"}
          />

          <ResultCard result={result} isLoading={isClassifying} />
        </main>
      </div>
    </ErrorBoundary>
  );
}
