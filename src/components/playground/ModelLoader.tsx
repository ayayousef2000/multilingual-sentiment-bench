import { useClassifierContext } from "@/context/ClassifierContext";
import { MODELS } from "@/lib/models";
import type { ModelLoadState } from "@/types";
import { Button, ProgressBar, Select } from "../ui";

interface ModelLoaderProps {
  selectedModelId: string;
  loadState: ModelLoadState;
  onModelChange: (modelId: string) => void;
  onLoad: () => void;
}

export function ModelLoader({
  selectedModelId,
  loadState,
  onModelChange,
  onLoad,
}: ModelLoaderProps) {
  const { loadedModelId, modelLoadTimeMs } = useClassifierContext();

  const isLoading = loadState.status === "loading";
  const isNewModelSelected = selectedModelId !== loadedModelId;

  const options = MODELS.map((m) => ({ value: m.id, label: `${m.name} (${m.size})` }));
  const selectedModel = MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-title">MODEL</div>
      <p className="sidebar-section-desc">
        Select a multilingual model. Supports English, Arabic, and Russian.
      </p>

      {/* FIX: pass label="Model" so Select renders <label htmlFor={id}>Model</label>
          This wires the visible label text to the <select> via htmlFor/id,
          making getByLabelText("Model") resolve in tests and improving a11y. */}
      <Select
        label="Model"
        options={options}
        value={selectedModelId}
        onChange={onModelChange}
        disabled={isLoading}
      />

      {selectedModel && (
        <div className="model-desc-card">
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

      {isLoading && (
        <ProgressBar
          value={loadState.progress}
          label={isNewModelSelected ? "Load selected model" : "Model already loaded"}
          statusText={loadState.statusText}
        />
      )}

      <Button
        variant="primary"
        size="md"
        className="btn-full"
        onClick={onLoad}
        disabled={isLoading}
        loading={isLoading}
        aria-label="Load selected model"
        style={{ width: "100%" }}
      >
        {isLoading
          ? "Loading…"
          : isNewModelSelected && loadedModelId !== null
            ? "↺ Switch Model"
            : "Load Model"}
      </Button>

      {!isLoading && modelLoadTimeMs !== null && (
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-tertiary)",
          }}
        >
          <span style={{ opacity: 0.6 }}>⏱</span> Loaded in{" "}
          {modelLoadTimeMs >= 1000
            ? `${(modelLoadTimeMs / 1000).toFixed(2)}s`
            : `${modelLoadTimeMs}ms`}
        </p>
      )}
    </div>
  );
}
