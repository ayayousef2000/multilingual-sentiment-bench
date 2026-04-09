import { DATASETS } from "@/lib/datasets";
import { MODELS } from "@/lib/models";
import type { BenchmarkRunState, ModelLoadState } from "@/types";
import { Button, Card, ProgressBar, Select } from "../ui";

interface BenchmarkControlsProps {
  selectedDatasetId: string;
  selectedModelId: string;
  loadState: ModelLoadState;
  runState: BenchmarkRunState;
  onDatasetChange: (id: string) => void;
  onModelChange: (id: string) => void;
  onLoadModel: () => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onExport: () => void;
  hasResults: boolean;
}

export function BenchmarkControls({
  selectedDatasetId,
  selectedModelId,
  loadState,
  runState,
  onDatasetChange,
  onModelChange,
  onLoadModel,
  onStart,
  onStop,
  onClear,
  onExport,
  hasResults,
}: BenchmarkControlsProps) {
  const isModelReady = loadState.status === "ready";
  const isModelLoading = loadState.status === "loading";
  const progress = runState.total > 0 ? (runState.currentIdx / runState.total) * 100 : 0;

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "4px",
          }}
        >
          Benchmark Configuration
        </h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Run a full dataset through any model and collect latency & accuracy metrics
        </p>
      </div>

      <Select
        label="Model"
        value={selectedModelId}
        onChange={onModelChange}
        disabled={runState.isRunning || isModelLoading}
        options={MODELS.map((m) => ({ value: m.id, label: `${m.name} (${m.size})` }))}
      />

      <Select
        label="Dataset"
        value={selectedDatasetId}
        onChange={onDatasetChange}
        disabled={runState.isRunning}
        options={DATASETS.map((d) => ({
          value: d.id,
          label: `${d.name} — ${d.samples.length} samples`,
        }))}
      />

      {/* Model load */}
      {!isModelReady && (
        <Button onClick={onLoadModel} disabled={isModelLoading} variant="ghost" size="md">
          {isModelLoading ? "Loading…" : "Load Model First"}
        </Button>
      )}

      {isModelLoading && (
        <ProgressBar value={loadState.progress} label={loadState.statusText} size="sm" />
      )}

      {/* Run controls */}
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <Button
          onClick={onStart}
          disabled={!isModelReady || runState.isRunning}
          variant="primary"
          size="md"
        >
          {runState.isRunning ? "Running…" : "▶ Run Benchmark"}
        </Button>
        {runState.isRunning && (
          <Button onClick={onStop} variant="danger" size="md">
            ■ Stop
          </Button>
        )}
        {hasResults && !runState.isRunning && (
          <>
            <Button onClick={onExport} variant="ghost" size="md">
              ↓ Export CSV
            </Button>
            <Button onClick={onClear} variant="ghost" size="md">
              Clear
            </Button>
          </>
        )}
      </div>

      {/* Run progress */}
      {(runState.isRunning || runState.currentIdx > 0) && runState.total > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <ProgressBar
            value={progress}
            label={`${runState.currentIdx} / ${runState.total} samples`}
            color={runState.isRunning ? "var(--accent-primary)" : "var(--sentiment-positive)"}
          />
        </div>
      )}
    </Card>
  );
}
