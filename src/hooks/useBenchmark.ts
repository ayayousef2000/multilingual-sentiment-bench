import { useCallback, useRef, useState, useTransition } from "react";
import type {
  BenchmarkDataset,
  BenchmarkResult,
  BenchmarkRunState,
  PlaygroundResult,
} from "@/types";

interface UseBenchmarkOptions {
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
}

interface UseBenchmarkReturn {
  results: BenchmarkResult[];
  runState: BenchmarkRunState;
  runId: string | null;
  isPending: boolean;
  start: (dataset: BenchmarkDataset, modelId: string) => Promise<void>;
  stop: () => void;
  clear: () => void;
}

const IDLE_RUN_STATE: BenchmarkRunState = {
  isRunning: false,
  currentIdx: 0,
  total: 0,
  datasetId: null,
  datasetName: null,
  modelId: null,
  runId: null,
};

export function useBenchmark({ classify }: UseBenchmarkOptions): UseBenchmarkReturn {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [runState, setRunState] = useState<BenchmarkRunState>(IDLE_RUN_STATE);
  const [isPending, startTransition] = useTransition();

  const abortRef = useRef<AbortController | null>(null);
  const runIdRef = useRef<string | null>(null);

  const start = useCallback(
    async (dataset: BenchmarkDataset, modelId: string) => {
      // Cancel any existing run
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const runId = `run-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      runIdRef.current = runId;

      setResults([]);
      setRunState({
        isRunning: true,
        currentIdx: 0,
        total: dataset.samples.length,
        datasetId: dataset.id,
        datasetName: dataset.name,
        modelId,
        runId,
      });

      const accumulated: BenchmarkResult[] = [];

      for (let i = 0; i < dataset.samples.length; i++) {
        if (controller.signal.aborted) break;

        const sample = dataset.samples[i];

        try {
          const result = await classify(sample.text, modelId, controller.signal);

          const benchmarkResult: BenchmarkResult = {
            id: `${runId}-${i}`,
            sample_id: sample.id,
            model_id: modelId,
            dataset_id: dataset.id,
            label: result.label,
            score: result.score,
            time_ms: result.time_ms,
            memory_mb: result.memory_mb,
            input_len: sample.text.length,
            input_text: sample.text,
            language: sample.language,
            timestamp: Date.now(),
            expected: sample.expected ?? null,
          };

          accumulated.push(benchmarkResult);

          startTransition(() => {
            setResults([...accumulated]);
            setRunState((prev) => ({
              ...prev,
              currentIdx: i + 1,
            }));
          });
        } catch (err) {
          // AbortError = user stopped — exit cleanly
          if (err instanceof DOMException && err.name === "AbortError") break;
          // Other errors — skip sample and continue
          console.warn(`[useBenchmark] sample ${sample.id} failed:`, err);
        }
      }

      setRunState((prev) => ({ ...prev, isRunning: false }));
    },
    [classify]
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setRunState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    runIdRef.current = null;
    setRunState(IDLE_RUN_STATE);
  }, []);

  return {
    results,
    runState,
    runId: runIdRef.current,
    isPending,
    start,
    stop,
    clear,
  };
}
