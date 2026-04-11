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

  const handleLoadModel = useCallback(() => {
    loadModel(selectedModelId);
  }, [loadModel, selectedModelId]);

  const handleClassify = useCallback(
    async (text: string) => {
      setIsClassifying(true);
      setResult(null);
      try {
        const out = await classify(text, selectedModelId);
        setResult(out);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          console.error("Playground classify error:", err);
        }
      } finally {
        setIsClassifying(false);
      }
    },
    [classify, selectedModelId]
  );

  const isModelReady = loadState.status === "ready";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <ErrorBoundary label="ModelLoader">
        <ModelLoader
          selectedModelId={selectedModelId}
          loadState={loadState}
          onModelChange={setSelectedModelId}
          onLoad={handleLoadModel}
        />
      </ErrorBoundary>

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
    </div>
  );
}
