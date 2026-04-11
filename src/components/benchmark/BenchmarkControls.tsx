import { useClassifierContext } from "@/context/ClassifierContext";
import { DATASETS } from "@/lib/datasets";
import { MODELS } from "@/lib/models";
import type { BenchmarkRunState } from "@/types";
import { Button, ProgressBar, Select } from "../ui";

interface BenchmarkControlsProps {
  selectedDatasetId: string;
  selectedModelId: string;
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
  const { loadState } = useClassifierContext();

  const modelOptions = MODELS.map((m) => ({ value: m.id, label: m.name }));
  const datasetOptions = DATASETS.map((d) => ({ value: d.id, label: d.name }));

  const isModelReady = loadState.status === "ready";
  const isModelLoading = loadState.status === "loading";
  const isRunning = runState.isRunning;

  const progress = runState.total > 0 ? runState.currentIdx / runState.total : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <span className="sidebar-section-title">Benchmark Configuration</span>
        <p className="sidebar-section-desc">
          Run a full dataset through any model and collect latency &amp; accuracy metrics
        </p>
      </div>

      {/* Model */}
      <div>
        <span className="sidebar-label">Model</span>
        <Select
          options={modelOptions}
          value={selectedModelId}
          onChange={onModelChange}
          disabled={isRunning || isModelLoading}
        />
      </div>

      {/* Dataset */}
      <div>
        <span className="sidebar-label">Dataset</span>
        <Select
          options={datasetOptions}
          value={selectedDatasetId}
          onChange={onDatasetChange}
          disabled={isRunning}
        />
      </div>

      {/* Load model */}
      <Button
        variant="ghost"
        className="btn-full"
        onClick={onLoadModel}
        loading={isModelLoading}
        disabled={isModelReady || isModelLoading || isRunning}
      >
        {isModelReady ? "✓ Model Ready" : isModelLoading ? "Loading…" : "Load Model First"}
      </Button>

      {isModelLoading && (
        <ProgressBar
          value={loadState.progress}
          label="Loading model"
          statusText={loadState.statusText}
        />
      )}

      {/* Run / Stop */}
      {isRunning ? (
        <>
          <ProgressBar
            value={progress}
            label={`${runState.currentIdx} / ${runState.total} samples`}
          />
          <Button variant="danger" className="btn-full" onClick={onStop}>
            ■ Stop
          </Button>
        </>
      ) : (
        <Button variant="primary" className="btn-full" onClick={onStart} disabled={!isModelReady}>
          ▶ Run Benchmark
        </Button>
      )}

      {/* Export / Clear */}
      {hasResults && !isRunning && (
        <div style={{ display: "flex", gap: "var(--space-2)" }}>
          <Button variant="ghost" style={{ flex: 1 }} onClick={onExport}>
            Export CSV
          </Button>
          <Button variant="danger" style={{ flex: 1 }} onClick={onClear}>
            Clear
          </Button>
        </div>
      )}
    </div>
  );
}
