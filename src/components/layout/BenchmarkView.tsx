import { useState } from "react";
import { useBenchmark } from "@/hooks/useBenchmark";
import { DATASETS } from "@/lib/datasets";
import { downloadCSV, resultsToCSV } from "@/lib/export";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { ModelLoadState, PlaygroundResult } from "@/types";
import { BenchmarkChart } from "../benchmark/BenchmarkChart";
import { BenchmarkControls } from "../benchmark/BenchmarkControls";
import { BenchmarkStatsPanel } from "../benchmark/BenchmarkStats";
import { ResultsTable } from "../benchmark/ResultsTable";

interface BenchmarkViewProps {
  loadState: ModelLoadState;
  onLoadModel: (modelId: string) => void;
  classify: (text: string, modelId: string) => Promise<PlaygroundResult>;
}

export function BenchmarkView({ loadState, onLoadModel, classify }: BenchmarkViewProps) {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [selectedDatasetId, setSelectedDatasetId] = useState(DATASETS[0].id);

  const { results, runState, startBenchmark, stopBenchmark, clearResults } = useBenchmark({
    classify,
  });

  const handleStart = async () => {
    await startBenchmark(selectedDatasetId, selectedModelId);
  };

  const handleExport = () => {
    if (results.length === 0) return;
    const csv = resultsToCSV(results);
    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
    downloadCSV(csv, `sentiment-bench-${selectedModelId.split("/").pop()}-${ts}.csv`);
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "var(--space-8) var(--space-6)",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "var(--space-6)",
        alignItems: "start",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          position: "sticky",
          top: 76,
        }}
      >
        <BenchmarkControls
          selectedDatasetId={selectedDatasetId}
          selectedModelId={selectedModelId}
          loadState={loadState}
          runState={runState}
          onDatasetChange={setSelectedDatasetId}
          onModelChange={(id) => {
            setSelectedModelId(id);
            clearResults();
          }}
          onLoadModel={() => onLoadModel(selectedModelId)}
          onStart={handleStart}
          onStop={stopBenchmark}
          onClear={clearResults}
          onExport={handleExport}
          hasResults={results.length > 0}
        />
      </div>

      {/* Results area */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Hero */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "var(--space-2)",
            }}
          >
            Benchmark <span style={{ color: "var(--accent-primary)" }}>Lab</span>
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: 540 }}>
            Run systematic evaluations across multilingual datasets. Export results as CSV for
            downstream statistical analysis.
          </p>
        </div>

        {results.length === 0 && !runState.isRunning && (
          <div
            style={{
              padding: "var(--space-12) var(--space-6)",
              background: "var(--bg-surface)",
              border: "1px dashed var(--border-default)",
              borderRadius: "var(--radius-xl)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "var(--space-3)" }}>📊</div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
              Select a model and dataset, then click{" "}
              <strong style={{ color: "var(--text-secondary)" }}>Run Benchmark</strong> to start
            </p>
          </div>
        )}

        <BenchmarkStatsPanel results={results} />
        <BenchmarkChart results={results} />
        <ResultsTable results={results} />
      </div>
    </div>
  );
}
