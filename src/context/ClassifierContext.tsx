import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useClassifier } from "@/hooks/useClassifier";
import { DEFAULT_MODEL_ID, getModelById } from "@/lib/models";
import type {
  BenchmarkResult,
  ModelDtype,
  ModelLoadState,
  PlaygroundResult,
  WebGpuState,
  WebGpuStatus,
} from "@/types";

// ── WebGPU detection ──────────────────────────────────────────────────────────
async function detectWebGpu(): Promise<WebGpuStatus> {
  if (typeof navigator === "undefined") return "unsupported";
  if (!("gpu" in navigator) || !navigator.gpu) return "unsupported";
  try {
    const adapter = await (navigator.gpu as GPU).requestAdapter();
    return adapter ? "supported" : "unsupported";
  } catch {
    return "unsupported";
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
  // ── Selected model (drives instant WebGPU status on dropdown change) ────────
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  // ── WebGPU ─────────────────────────────────────────────────────────────────
  webGpu: WebGpuState;
  setWebGpuEnabled: (enabled: boolean) => void;
  /** true when the SELECTED model is q8 — WebGPU blocked; false for fp32 or nothing selected */
  webGpuBlockedByDtype: boolean;
}

const ClassifierContext = createContext<ClassifierContextValue | null>(null);

export function ClassifierProvider({ children }: { children: ReactNode }) {
  const {
    loadState,
    loadedModelId,
    modelLoadTimeMs,
    modelSizeMb,
    loadModel: rawLoad,
    classify,
  } = useClassifier();

  const [persistedResults, setPersistedResultsState] = useState<BenchmarkResult[]>([]);

  const setPersistedResults = useCallback((results: BenchmarkResult[]) => {
    setPersistedResultsState(results);
  }, []);

  const clearPersistedResults = useCallback(() => {
    setPersistedResultsState([]);
  }, []);

  // ── Selected model — owned here so WebGPU panel reacts on dropdown change ──
  const [selectedModelId, setSelectedModelId] = useState<string>(DEFAULT_MODEL_ID);

  // ── WebGPU state ───────────────────────────────────────────────────────────
  const [webGpu, setWebGpu] = useState<WebGpuState>({ status: "checking", enabled: false });

  useEffect(() => {
    detectWebGpu().then((status) => {
      setWebGpu((prev) => ({ ...prev, status }));
    });
  }, []);

  // ── Refs declared before any effect that references them ───────────────────
  const lastModelIdRef = useRef<string | null>(null);
  const webGpuEnabledRef = useRef(false);

  // Derive blocked state from SELECTED model, not loaded model.
  // Reacts the moment the user changes the dropdown — before "Load Model" is clicked.
  const selectedModelConfig = getModelById(selectedModelId);
  const selectedDtype: ModelDtype | undefined = selectedModelConfig?.dtype;
  const webGpuBlockedByDtype = webGpu.status === "supported" && selectedDtype === "q8";

  // Auto-disable WebGPU when user picks a q8 model from the dropdown
  useEffect(() => {
    if (webGpuBlockedByDtype && webGpu.enabled) {
      webGpuEnabledRef.current = false;
      setWebGpu((prev) => ({ ...prev, enabled: false }));
    }
  }, [webGpuBlockedByDtype, webGpu.enabled]);

  const loadModel = useCallback(
    (modelId: string) => {
      lastModelIdRef.current = modelId;
      rawLoad(modelId, webGpuEnabledRef.current);
    },
    [rawLoad]
  );

  const setWebGpuEnabled = useCallback(
    (enabled: boolean) => {
      // Defensive guard: never allow enabling WebGPU when the selected dtype blocks it
      if (enabled && webGpuBlockedByDtype) return;
      webGpuEnabledRef.current = enabled;
      setWebGpu((prev) => ({ ...prev, enabled }));
      const currentModel = lastModelIdRef.current;
      if (currentModel) {
        rawLoad(currentModel, enabled);
      }
    },
    [rawLoad, webGpuBlockedByDtype]
  );
  // ──────────────────────────────────────────────────────────────────────────

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
    selectedModelId,
    setSelectedModelId,
    webGpu,
    setWebGpuEnabled,
    webGpuBlockedByDtype,
  };

  return <ClassifierContext.Provider value={value}>{children}</ClassifierContext.Provider>;
}

export function useClassifierContext(): ClassifierContextValue {
  const ctx = useContext(ClassifierContext);
  if (!ctx) throw new Error("useClassifierContext must be used within a ClassifierProvider");
  return ctx;
}
