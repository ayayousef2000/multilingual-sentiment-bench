import { useEffect, useRef, useState } from "react";
import { useClassifierContext } from "@/context/ClassifierContext";
import { useBenchmark } from "@/hooks/useBenchmark";
import { downloadCSV, resultsToCSV } from "@/lib/export";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { BenchmarkDataset } from "@/types";
import { BenchmarkChart } from "../benchmark/BenchmarkChart";
import { BenchmarkControls } from "../benchmark/BenchmarkControls";
import { BenchmarkStatsPanel } from "../benchmark/BenchmarkStats";
import { ResultsTable } from "../benchmark/ResultsTable";
import { ErrorBoundary } from "../ui";

export function BenchmarkView() {
  const {
    loadedModelId,
    loadModel,
    classify,
    persistedResults,
    setPersistedResults,
    clearPersistedResults,
  } = useClassifierContext();

  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [loadedDataset, setLoadedDataset] = useState<BenchmarkDataset | null>(null);
  const [datasetError, setDatasetError] = useState<string | null>(null);

  const { results, runState, isPending, start, stop, clear } = useBenchmark({ classify });

  useEffect(() => {
    if (results.length > 0) setPersistedResults(results);
  }, [results, setPersistedResults]);

  const displayResults = results.length > 0 ? results : persistedResults;

  const prevModelRef = useRef<string | null>(null);
  useEffect(() => {
    if (prevModelRef.current !== null && loadedModelId !== prevModelRef.current) {
      clearPersistedResults();
    }
    prevModelRef.current = loadedModelId;
  }, [loadedModelId, clearPersistedResults]);

  const handleLoadModel = () => loadModel(selectedModelId);

  const handleStart = async () => {
    if (!loadedDataset || !loadedModelId) return;
    await start(loadedDataset, loadedModelId);
  };

  const handleDatasetLoad = (dataset: BenchmarkDataset) => {
    setLoadedDataset(dataset);
    setDatasetError(null);
  };

  const handleDatasetError = (msg: string) => setDatasetError(msg);

  const handleClear = () => {
    clear();
    clearPersistedResults();
  };

  const handleExport = () => {
    if (displayResults.length === 0) return;
    const csv = resultsToCSV(displayResults, loadedDataset?.name, runState.runId ?? undefined);
    downloadCSV(csv, `benchmark-${Date.now()}.csv`);
  };

  const hasResults = displayResults.length > 0;

  return (
    <ErrorBoundary label="BenchmarkView">
      <div className="page-body">
        <div className="sidebar">
          <BenchmarkControls
            loadedDataset={loadedDataset}
            selectedModelId={selectedModelId}
            runState={runState}
            onDatasetLoad={handleDatasetLoad}
            onDatasetError={handleDatasetError}
            onModelChange={setSelectedModelId}
            onLoadModel={handleLoadModel}
            onStart={handleStart}
            onStop={stop}
            onClear={handleClear}
            onExport={handleExport}
            hasResults={hasResults}
          />
          {datasetError && (
            <div className="error-wrap" role="alert">
              <p className="error-title">Dataset Error</p>
              <p className="error-message">{datasetError}</p>
            </div>
          )}
        </div>

        <div className="main-content">
          {/* Hero heading — mirrors the Playground's "Interactive Playground" block */}
          <div className="page-heading">
            <h1>
              Benchmark <span>Lab</span>
            </h1>
            <p>
              Measure model accuracy and latency across English, Arabic, and Russian. Upload a
              labeled dataset, run inference in your browser, and export results as CSV — no server
              required.
            </p>
          </div>

          {hasResults ? (
            <ErrorBoundary label="BenchmarkResults">
              <BenchmarkStatsPanel results={displayResults} />
              <BenchmarkChart results={displayResults} />
              <ResultsTable results={displayResults} />
            </ErrorBoundary>
          ) : (
            <div className="bench-placeholder">
              <div className="bench-placeholder-icon" aria-hidden="true">
                <svg
                  width="52"
                  height="60"
                  viewBox="0 0 48 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path
                    d="M4 0h30l14 14v42a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z"
                    fill="var(--color-background-secondary)"
                    stroke="var(--color-border-primary)"
                    strokeWidth="1"
                  />
                  <path d="M34 0l14 14H38a4 4 0 01-4-4V0z" fill="var(--color-border-primary)" />
                  <rect
                    x="10"
                    y="22"
                    width="28"
                    height="2"
                    rx="1"
                    fill="var(--color-border-primary)"
                  />
                  <rect
                    x="10"
                    y="30"
                    width="20"
                    height="2"
                    rx="1"
                    fill="var(--color-border-primary)"
                  />
                  <rect
                    x="10"
                    y="38"
                    width="24"
                    height="2"
                    rx="1"
                    fill="var(--color-border-primary)"
                  />
                </svg>
              </div>
              <div className="bench-placeholder-text">
                <strong>No results yet</strong>
                <p>Load a dataset and a model, then press Run to start benchmarking.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      {isPending && (
        <div className="sr-only" aria-live="polite">
          Benchmark running…
        </div>
      )}
    </ErrorBoundary>
  );
}
