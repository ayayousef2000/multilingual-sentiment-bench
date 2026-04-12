import { useClassifierContext } from "@/context/ClassifierContext";
import { MODELS } from "@/lib/models";
import type { BenchmarkDataset, BenchmarkRunState } from "@/types";
import { Button, ProgressBar, Select } from "../ui";
import { FileUpload } from "./FileUpload";

interface BenchmarkControlsProps {
  loadedDataset: BenchmarkDataset | null;
  selectedModelId: string;
  runState: BenchmarkRunState;
  onDatasetLoad: (dataset: BenchmarkDataset) => void;
  onDatasetError: (msg: string) => void;
  onModelChange: (id: string) => void;
  onLoadModel: () => void;
  onStart: () => void;
  onStop: () => void;
  onClear: () => void;
  onExport: () => void;
  hasResults: boolean;
}

export function BenchmarkControls({
  loadedDataset,
  selectedModelId,
  runState,
  onDatasetLoad,
  onDatasetError,
  onModelChange,
  onLoadModel,
  onStart,
  onStop,
  onClear,
  onExport,
  hasResults,
}: BenchmarkControlsProps) {
  const { loadState, loadedModelId, modelLoadTimeMs } = useClassifierContext();

  const modelOptions = MODELS.map((m) => ({
    value: m.id,
    label: `${m.name} (${m.size})`,
  }));

  const selectedModel = MODELS.find((m) => m.id === selectedModelId);

  const isLoadInProgress = loadState.status === "loading";
  const isNewModelSelected = selectedModelId !== loadedModelId;
  const canLoad = isNewModelSelected && !isLoadInProgress;
  const canRun = !!loadedDataset && loadState.status === "ready" && !runState.isRunning;

  const progress =
    runState.total > 0 ? Math.round((runState.currentIdx / runState.total) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ── Dataset ─────────────────────────────────────────── */}
      <div>
        <div className="sidebar-section-title" style={{ marginBottom: 6 }}>
          DATASET
        </div>
        <p className="sidebar-section-desc" style={{ marginBottom: 8 }}>
          Upload a JSON file containing benchmark samples
        </p>
        <FileUpload
          onDatasetLoad={onDatasetLoad}
          onError={onDatasetError}
          loadedDataset={loadedDataset}
        />
      </div>

      <div className="divider" />

      {/* ── Model ────────────────────────────────────────────── */}
      <div>
        <div className="sidebar-section-title" style={{ marginBottom: 6 }}>
          MODEL
        </div>

        <div className="sidebar-label" style={{ marginBottom: 4 }}>
          Model
        </div>
        <Select
          value={selectedModelId}
          onChange={onModelChange}
          options={modelOptions}
          disabled={isLoadInProgress || runState.isRunning}
          aria-label="Select model"
        />

        {selectedModel && (
          <div className="model-desc-card" style={{ marginTop: 8 }}>
            <p className="model-desc-text">{selectedModel.description}</p>
            <div className="model-tags">
              <span className="model-tag model-tag-size">{selectedModel.size}</span>
              {selectedModel.languages.map((lang) => (
                <span key={lang} className="model-tag model-tag-lang">
                  {lang.toUpperCase()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Load model button — full width within card */}
        <div style={{ marginTop: 10 }}>
          <Button
            variant="primary"
            size="md"
            style={{ width: "100%", boxSizing: "border-box" }}
            onClick={onLoadModel}
            disabled={!canLoad}
            loading={isLoadInProgress}
          >
            {isLoadInProgress
              ? "Loading…"
              : isNewModelSelected && loadedModelId !== null
                ? "↺ Switch Model"
                : "Load Model"}
          </Button>
        </div>

        {(loadState.status === "loading" || loadState.status === "ready") && (
          <div style={{ marginTop: 8 }}>
            <ProgressBar
              value={loadState.progress}
              label={loadState.status === "ready" ? "Model ready" : "Loading model"}
              statusText={loadState.statusText}
            />
          </div>
        )}

        {/* Model load time */}
        {loadState.status === "ready" && modelLoadTimeMs !== null && (
          <p
            style={{
              marginTop: 6,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--color-accent)",
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span style={{ opacity: 0.6 }}>⏱</span>
            Loaded in{" "}
            {modelLoadTimeMs >= 1000
              ? `${(modelLoadTimeMs / 1000).toFixed(2)}s`
              : `${modelLoadTimeMs}ms`}
          </p>
        )}

        {loadState.status === "error" && (
          <p className="error-message" style={{ marginTop: 6 }} role="alert">
            {loadState.error ?? "Failed to load model."}
          </p>
        )}
      </div>

      <div className="divider" />

      {/* ── Run ──────────────────────────────────────────────── */}
      <div>
        <div className="sidebar-section-title" style={{ marginBottom: 8 }}>
          RUN
        </div>

        {runState.isRunning ? (
          <>
            <div style={{ marginBottom: 8 }}>
              <ProgressBar
                value={progress}
                label={`Running ${runState.currentIdx} / ${runState.total}`}
                statusText={`${runState.currentIdx} of ${runState.total} samples`}
              />
            </div>
            <Button
              variant="danger"
              size="md"
              style={{ width: "100%", boxSizing: "border-box" }}
              onClick={onStop}
            >
              Stop
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="md"
            style={{ width: "100%", boxSizing: "border-box" }}
            onClick={onStart}
            disabled={!canRun}
          >
            Run Benchmark
          </Button>
        )}

        {!loadedDataset && !runState.isRunning && (
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Upload a dataset to run.
          </p>
        )}
        {loadedDataset && loadState.status !== "ready" && !runState.isRunning && (
          <p
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "var(--color-text-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            Load a model to run.
          </p>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      {hasResults && (
        <>
          <div className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Button
              variant="primary"
              size="sm"
              style={{ width: "100%", boxSizing: "border-box" }}
              onClick={onExport}
            >
              Export CSV
            </Button>
            <Button
              variant="danger"
              size="sm"
              style={{ width: "100%", boxSizing: "border-box" }}
              onClick={onClear}
            >
              Clear Results
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
