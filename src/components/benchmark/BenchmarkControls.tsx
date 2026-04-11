import { useClassifierContext } from "@/context/ClassifierContext";
import { DATASETS } from "@/lib/datasets";
import { MODELS } from "@/lib/models";
import type { BenchmarkRunState } from "@/types";
import { Button, Card, ProgressBar, Select } from "../ui";

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

  const isModelReady = loadState.status === "ready";
  const isModelLoading = loadState.status === "loading";
  const canStart = isModelReady && !runState.isRunning;
  const canLoad = !isModelLoading && !runState.isRunning;

  return (
    <Card>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
          marginBottom: "14px",
        }}
      >
        <Select
          label="Model"
          value={selectedModelId}
          onChange={onModelChange}
          disabled={isModelLoading || runState.isRunning}
          options={MODELS.map((m) => ({ value: m.id, label: m.name }))}
        />
        <Select
          label="Dataset"
          value={selectedDatasetId}
          onChange={onDatasetChange}
          disabled={runState.isRunning}
          options={DATASETS.map((d) => ({ value: d.id, label: d.name }))}
        />
      </div>

      {isModelLoading && (
        <div style={{ marginBottom: "14px" }}>
          <ProgressBar
            value={loadState.progress}
            label="Model loading progress"
            statusText={loadState.statusText}
          />
        </div>
      )}

      {runState.isRunning && (
        <div style={{ marginBottom: "14px" }}>
          <ProgressBar
            value={runState.total > 0 ? (runState.currentIdx / runState.total) * 100 : 0}
            label="Benchmark progress"
            statusText={`${runState.currentIdx} / ${runState.total} samples`}
          />
        </div>
      )}

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {!isModelReady && (
          <Button
            variant="primary"
            size="sm"
            onClick={onLoadModel}
            disabled={!canLoad}
            loading={isModelLoading}
          >
            {isModelLoading ? "Loading model…" : "Load model"}
          </Button>
        )}

        {!runState.isRunning ? (
          <Button variant="primary" size="sm" onClick={onStart} disabled={!canStart}>
            Run benchmark
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={onStop}>
            Stop
          </Button>
        )}

        {hasResults && (
          <>
            <Button variant="ghost" size="sm" onClick={onExport} disabled={runState.isRunning}>
              Export CSV
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} disabled={runState.isRunning}>
              Clear
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
