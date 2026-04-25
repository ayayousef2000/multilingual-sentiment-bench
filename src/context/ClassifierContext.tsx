import { createContext, type ReactNode, useCallback, useContext, useState } from "react";
import { useClassifier } from "@/hooks/useClassifier";
import type { BenchmarkResult, ModelLoadState, PlaygroundResult } from "@/types";

interface ClassifierContextValue {
  loadState: ModelLoadState;
  loadedModelId: string | null;
  modelLoadTimeMs: number | null;
  modelSizeMb: number | null;
  loadModel: (modelId: string) => void;
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
  persistedResults: BenchmarkResult[];
  setPersistedResults: (results: BenchmarkResult[]) => void;
  clearPersistedResults: () => void;
}

const ClassifierContext = createContext<ClassifierContextValue | null>(null);

export function ClassifierProvider({ children }: { children: ReactNode }) {
  const { loadState, loadedModelId, modelLoadTimeMs, modelSizeMb, loadModel, classify } =
    useClassifier();
  const [persistedResults, setPersistedResultsState] = useState<BenchmarkResult[]>([]);

  const setPersistedResults = useCallback((results: BenchmarkResult[]) => {
    setPersistedResultsState(results);
  }, []);

  const clearPersistedResults = useCallback(() => {
    setPersistedResultsState([]);
  }, []);

  const value: ClassifierContextValue = {
    loadState,
    loadedModelId,
    modelLoadTimeMs,
    modelSizeMb,
    loadModel,
    classify,
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
