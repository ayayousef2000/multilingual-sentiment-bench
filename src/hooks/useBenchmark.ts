import { useCallback, useRef, useState } from "react";
import { getDatasetById } from "@/lib/datasets";
import type { BenchmarkResult, BenchmarkRunState, PlaygroundResult } from "@/types";

interface UseBenchmarkOptions {
  classify: (text: string, modelId: string) => Promise<PlaygroundResult>;
}

export function useBenchmark({ classify }: UseBenchmarkOptions) {
  const [results, setResults] = useState<BenchmarkResult[]>([]);
  const [runState, setRunState] = useState<BenchmarkRunState>({
    isRunning: false,
    currentIdx: 0,
    total: 0,
    datasetId: null,
    modelId: null,
  });

  const abortRef = useRef(false);

  const startBenchmark = useCallback(
    async (datasetId: string, modelId: string) => {
      const dataset = getDatasetById(datasetId);
      if (!dataset) throw new Error(`Dataset "${datasetId}" not found`);

      abortRef.current = false;
      setResults([]);
      setRunState({
        isRunning: true,
        currentIdx: 0,
        total: dataset.samples.length,
        datasetId,
        modelId,
      });

      const accumulated: BenchmarkResult[] = [];

      for (let i = 0; i < dataset.samples.length; i++) {
        if (abortRef.current) break;

        const sample = dataset.samples[i];
        setRunState((prev) => ({ ...prev, currentIdx: i }));

        try {
          const result = await classify(sample.text, modelId);
          const row: BenchmarkResult = {
            id: `${datasetId}-${modelId}-${sample.id}`,
            sample_id: sample.id,
            model_id: modelId,
            dataset_id: datasetId,
            label: result.label,
            score: result.score,
            time_ms: result.time_ms,
            memory_mb: result.memory_mb,
            input_len: sample.text.length,
            language: sample.language,
            timestamp: Date.now(),
          };
          accumulated.push(row);
          setResults([...accumulated]);
        } catch {
          // Silently skip failed samples — they won't appear in stats
        }
      }

      setRunState((prev) => ({
        ...prev,
        isRunning: false,
        currentIdx: prev.total,
      }));
    },
    [classify]
  );

  const stopBenchmark = useCallback(() => {
    abortRef.current = true;
    setRunState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setRunState({
      isRunning: false,
      currentIdx: 0,
      total: 0,
      datasetId: null,
      modelId: null,
    });
  }, []);

  return { results, runState, startBenchmark, stopBenchmark, clearResults };
}
