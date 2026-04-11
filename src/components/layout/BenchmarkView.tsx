import { useState } from "react";
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

// Stable empty array — prevents BenchmarkChart/Stats from re-rendering
const EMPTY: never[] = [];

export function BenchmarkView() {
  const { loadModel, classify } = useClassifierContext();

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [selectedDatasetId, setSelectedDatasetId] = useState(DATASETS[0]?.id ?? "");

  const { results, runState, start, stop, clear } = useBenchmark({ classify });

  const stableResults = results.length > 0 ? results : EMPTY;

  const handleLoadModel = () => loadModel(selectedModelId);

  const handleStart = async () => {
    await start(selectedDatasetId, selectedModelId);
  };

  const handleExport = () => {
    const csv = resultsToCSV(results);
    downloadCSV(csv, `benchmark-${selectedModelId}-${selectedDatasetId}.csv`);
  };

  const hasResults = results.length > 0;

  return (
    <div className="page-body">
      {/* Sidebar */}
      <aside className="sidebar">
        <ErrorBoundary label="BenchmarkControls">
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
            hasResults={hasResults}
          />
        </ErrorBoundary>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Heading */}
        <div className="page-heading">
          <h1>
            Benchmark <span>Lab</span>
          </h1>
          <p>
            Run systematic evaluations across multilingual datasets. Export results as CSV for
            downstream statistical analysis.
          </p>
        </div>

        {/* Chart / placeholder */}
        {!hasResults ? (
          <div className="bench-placeholder">
            <div className="bench-placeholder-icon">▦</div>
            <p className="bench-placeholder-text">
              Select a model and dataset, then click <strong>Run Benchmark</strong> to start
            </p>
          </div>
        ) : (
          <>
            <ErrorBoundary label="BenchmarkStats">
              <BenchmarkStatsPanel results={stableResults} />
            </ErrorBoundary>

            <ErrorBoundary label="BenchmarkChart">
              <div className="chart-container">
                <BenchmarkChart results={stableResults} />
              </div>
            </ErrorBoundary>

            <ErrorBoundary label="ResultsTable">
              <div className="results-table-wrap">
                <ResultsTable results={stableResults} />
              </div>
            </ErrorBoundary>
          </>
        )}
      </main>
    </div>
  );
}
