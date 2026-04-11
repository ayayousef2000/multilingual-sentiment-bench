import { useCallback, useState } from "react";
import { useClassifierContext } from "@/context/ClassifierContext";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { PlaygroundResult } from "@/types";
import { ModelLoader } from "../playground/ModelLoader";
import { ResultCard } from "../playground/ResultCard";
import { TextInput } from "../playground/TextInput";
import { ErrorBoundary } from "../ui";

export function PlaygroundView() {
  const { loadState, loadModel, classify } = useClassifierContext();
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleModelChange = useCallback((id: string) => {
    setSelectedModelId(id);
  }, []);

  const handleLoad = useCallback(() => {
    loadModel(selectedModelId);
  }, [loadModel, selectedModelId]);

  const handleClassify = useCallback(
    async (text: string) => {
      setIsClassifying(true);
      try {
        const res = await classify(text, selectedModelId);
        setResult(res);
      } finally {
        setIsClassifying(false);
      }
    },
    [classify, selectedModelId]
  );

  const isModelReady = loadState.status === "ready";

  return (
    <div className="page-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <ErrorBoundary label="ModelLoader">
          <ModelLoader
            selectedModelId={selectedModelId}
            loadState={loadState}
            onModelChange={handleModelChange}
            onLoad={handleLoad}
          />
        </ErrorBoundary>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Heading */}
        <div className="page-heading">
          <h1>
            Interactive <span>Playground</span>
          </h1>
          <p>
            Classify sentiment across 100+ languages directly in your browser. Zero server latency —
            all inference runs in a Web Worker.
          </p>
        </div>

        <ErrorBoundary label="TextInput">
          <TextInput
            onClassify={handleClassify}
            isLoading={isClassifying}
            isModelReady={isModelReady}
          />
        </ErrorBoundary>

        <ErrorBoundary label="ResultCard">
          <ResultCard result={result} isLoading={isClassifying} />
        </ErrorBoundary>
      </main>
    </div>
  );
}
