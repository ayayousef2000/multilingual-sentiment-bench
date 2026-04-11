import { createContext, type ReactNode, useContext } from "react";
import { useClassifier } from "@/hooks/useClassifier";
import type { ModelLoadState, PlaygroundResult } from "@/types";

interface ClassifierContextValue {
  loadState: ModelLoadState;
  loadModel: (modelId: string) => void;
  classify: (text: string, modelId: string) => Promise<PlaygroundResult>;
}

const ClassifierContext = createContext<ClassifierContextValue | null>(null);

export function ClassifierProvider({ children }: { children: ReactNode }) {
  const classifier = useClassifier();
  return <ClassifierContext.Provider value={classifier}>{children}</ClassifierContext.Provider>;
}

/**
 * Consume the shared classifier instance.
 * Must be used within a <ClassifierProvider>.
 */
export function useClassifierContext(): ClassifierContextValue {
  const ctx = useContext(ClassifierContext);
  if (!ctx) {
    throw new Error("useClassifierContext must be used within <ClassifierProvider>");
  }
  return ctx;
}
