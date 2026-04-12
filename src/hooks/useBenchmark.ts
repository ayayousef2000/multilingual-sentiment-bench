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
  const [runId, setRunId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortControllerRef.current?.abort();
    setResults([]);
    setRunId(null);
    setRunState(IDLE_RUN_STATE);
  }, []);

  const start = useCallback(
    async (dataset: BenchmarkDataset, modelId: string) => {
      // Abort any in-progress run
      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Generate a fresh UUID for this run — used to group CSV rows in Colab
      const thisRunId = crypto.randomUUID();
      setRunId(thisRunId);
      setResults([]);

      setRunState({
        isRunning: true,
        currentIdx: 0,
        total: dataset.samples.length,
        datasetId: dataset.id,
        datasetName: dataset.name,
        modelId,
        runId: thisRunId,
      });

      const { signal } = controller;

      for (let i = 0; i < dataset.samples.length; i++) {
        if (signal.aborted) break;

        const sample = dataset.samples[i];

        setRunState((prev) => ({ ...prev, currentIdx: i + 1 }));

        try {
          const playgroundResult = await classify(sample.text, modelId, signal);

          if (signal.aborted) break;

          const result: BenchmarkResult = {
            id: `${thisRunId}-${i}`,
            sample_id: sample.id,
            model_id: modelId,
            dataset_id: dataset.id,
            label: playgroundResult.label,
            score: playgroundResult.score,
            time_ms: playgroundResult.time_ms,
            memory_mb: playgroundResult.memory_mb,
            input_len: sample.text.length,
            input_text: sample.text,
            language: sample.language,
            timestamp: Date.now(),
            expected: sample.expected ?? null,
          };

          startTransition(() => {
            setResults((prev) => [...prev, result]);
          });
        } catch (err) {
          // Ignore AbortError — it means stop() was called intentionally
          if (err instanceof Error && err.name === "AbortError") break;
          // Other errors are silently skipped to allow the run to continue
          console.warn(`[useBenchmark] sample ${sample.id} failed:`, err);
        }
      }

      setRunState((prev) => ({ ...prev, isRunning: false }));
    },
    [classify]
  );

  return { results, runState, runId, isPending, start, stop, clear };
}
