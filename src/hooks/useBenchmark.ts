import { useCallback, useRef, useState, useTransition } from "react";
import { getDatasetById } from "@/lib/datasets";
import type { BenchmarkResult, BenchmarkRunState, PlaygroundResult } from "@/types";

interface UseBenchmarkOptions {
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
}

interface UseBenchmarkReturn {
  results: BenchmarkResult[];
  runState: BenchmarkRunState;
  isPending: boolean;
  start: (datasetId: string, modelId: string) => Promise<void>;
  stop: () => void;
  clear: () => void;
}

const INITIAL_RUN_STATE: BenchmarkRunState = {
  isRunning: false,
  currentIdx: 0,
  total: 0,
  datasetId: null,
  modelId: null,
};

export function useBenchmark({ classify }: UseBenchmarkOptions): UseBenchmarkReturn {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [runState, setRunState] = useState<BenchmarkRunState>(INITIAL_RUN_STATE);
  const [isPending, startTransition] = useTransition();

  // AbortController for the current run — replaced on each start()
  const abortRef = useRef<AbortController | null>(null);

  // ── Start ─────────────────────────────────────────────────────────────────
  const start = useCallback(
    async (datasetId: string, modelId: string) => {
      const dataset = getDatasetById(datasetId);
      if (!dataset) {
        console.warn(`useBenchmark: unknown dataset "${datasetId}"`);
        return;
      }

      // Cancel any previous run
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const { signal } = controller;
      const total = dataset.samples.length;

      setRunState({ isRunning: true, currentIdx: 0, total, datasetId, modelId });

      for (let i = 0; i < total; i++) {
        if (signal.aborted) break;

        const sample = dataset.samples[i];
        const started = performance.now();

        try {
          const output = await classify(sample.text, modelId, signal);

          if (signal.aborted) break;

          const result: BenchmarkResult = {
            id: `${datasetId}-${modelId}-${sample.id}`,
            sample_id: sample.id,
            model_id: modelId,
            dataset_id: datasetId,
            label: output.label,
            score: output.score,
            time_ms: output.time_ms ?? performance.now() - started,
            memory_mb: output.memory_mb,
            input_len: sample.text.length,
            language: sample.language,
            timestamp: Date.now(),
          };

          // useTransition keeps the UI responsive during bulk appends
          startTransition(() => {
            setResults((prev) => [...prev, result]);
          });

          setRunState((prev) => ({ ...prev, currentIdx: i + 1 }));
        } catch (err) {
          if ((err as DOMException).name === "AbortError") break;
          console.error(`useBenchmark: sample ${sample.id} failed`, err);
          // Continue with next sample on non-abort errors
        }
      }

      if (!signal.aborted) {
        setRunState((prev) => ({ ...prev, isRunning: false }));
      }
    },
    [classify]
  );

  // ── Stop ──────────────────────────────────────────────────────────────────
  const stop = useCallback(() => {
    abortRef.current?.abort();
    setRunState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    abortRef.current?.abort();
    setResults([]);
    setRunState(INITIAL_RUN_STATE);
  }, []);

  return { results, runState, isPending, start, stop, clear };
}
