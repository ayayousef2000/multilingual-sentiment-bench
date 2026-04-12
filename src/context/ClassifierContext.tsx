import { createContext, type ReactNode, useCallback, useContext, useRef, useState } from "react";
import { useClassifier } from "@/hooks/useClassifier";
import type { BenchmarkResult, ModelLoadState, PlaygroundResult } from "@/types";

interface ClassifierContextValue {
  loadState: ModelLoadState;
  loadedModelId: string | null;
  modelLoadTimeMs: number | null;
  loadModel: (modelId: string) => void;
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
  persistedResults: BenchmarkResult[];
  setPersistedResults: (results: BenchmarkResult[]) => void;
  clearPersistedResults: () => void;
}

const ClassifierContext = createContext<ClassifierContextValue | null>(null);

export function ClassifierProvider({ children }: { children: ReactNode }) {
  const classifier = useClassifier();
  const [persistedResults, setPersistedResultsState] = useState<BenchmarkResult[]>([]);
  const modelLoadTimeMsRef = useRef<number | null>(null);
  const [modelLoadTimeMs, setModelLoadTimeMs] = useState<number | null>(null);

  const setPersistedResults = useCallback((results: BenchmarkResult[]) => {
    setPersistedResultsState(results);
  }, []);

  const clearPersistedResults = useCallback(() => {
    setPersistedResultsState([]);
  }, []);

  const loadModel = useCallback(
    (modelId: string) => {
      modelLoadTimeMsRef.current = Date.now();
      classifier.loadModel(modelId);
    },
    [classifier]
  );

  // Track model load time
  const prevLoadState = useRef(classifier.loadState.status);
  if (
    prevLoadState.current !== classifier.loadState.status &&
    classifier.loadState.status === "ready" &&
    modelLoadTimeMsRef.current !== null
  ) {
    setModelLoadTimeMs(Date.now() - modelLoadTimeMsRef.current);
    modelLoadTimeMsRef.current = null;
  }
  prevLoadState.current = classifier.loadState.status;

  const value: ClassifierContextValue = {
    loadState: classifier.loadState,
    loadedModelId: classifier.loadedModelId,
    modelLoadTimeMs,
    loadModel,
    classify: classifier.classify,
    persistedResults,
    setPersistedResults,
    clearPersistedResults,
  };

  return <ClassifierContext.Provider value={value}>{children}</ClassifierContext.Provider>;
}

export function useClassifierContext(): ClassifierContextValue {
  const ctx = useContext(ClassifierContext);
  if (!ctx) throw new Error("useClassifierContext must be used within a ClassifierProvider");
  return ctx;
}
