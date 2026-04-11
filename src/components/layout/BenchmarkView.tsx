import { useMemo, useState } from "react";
import { useClassifierContext } from "@/context/ClassifierContext";
import { useBenchmark } from "@/hooks/useBenchmark";
import { DATASETS } from "@/lib/datasets";
import { downloadCSV, resultsToCSV } from "@/lib/export";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import { BenchmarkChart } from "../benchmark/BenchmarkChart";
import { BenchmarkControls } from "../benchmark/BenchmarkControls";
import { BenchmarkStatsPanel } from "../benchmark/BenchmarkStats";
import { ResultsTable } from "../benchmark/ResultsTable";
import { ErrorBoundary } from "../ui";

export function BenchmarkView() {
  const { loadModel, classify } = useClassifierContext();

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [selectedDatasetId, setSelectedDatasetId] = useState(() => DATASETS[0]?.id ?? "");

  const { results, runState, isPending, start, stop, clear } = useBenchmark({
    classify,
  });

  // Stable reference — prevents BenchmarkChart/Stats from re-rendering
  // on every keystroke or unrelated state change
  const stableResults = useMemo(() => results, [results]);

  const handleLoadModel = () => loadModel(selectedModelId);

  const handleStart = async () => {
    await start(selectedDatasetId, selectedModelId);
  };

  const handleExport = () => {
    const csv = resultsToCSV(results);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCSV(csv, `benchmark-${selectedModelId}-${ts}.csv`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <BenchmarkControls
        selectedDatasetId={selectedDatasetId}
        selectedModelId={selectedModelId}
        runState={runState}
        onDatasetChange={setSelectedDatasetId}
        onModelChange={setSelectedModelId}
        onLoadModel={handleLoadModel}
        onStart={handleStart}
        onStop={stop}
        onClear={clear}
        onExport={handleExport}
        hasResults={results.length > 0}
      />

      {isPending && (
        <p
          aria-live="polite"
          style={{ fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}
        >
          Updating results…
        </p>
      )}

      <ErrorBoundary label="BenchmarkStats">
        <BenchmarkStatsPanel results={stableResults} />
      </ErrorBoundary>

      <ErrorBoundary label="BenchmarkChart">
        <BenchmarkChart results={stableResults} />
      </ErrorBoundary>

      <ErrorBoundary label="ResultsTable">
        <ResultsTable results={stableResults} maxRows={150} />
      </ErrorBoundary>
    </div>
  );
}
