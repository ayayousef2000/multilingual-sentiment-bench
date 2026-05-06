import { useClassifierContext } from "@/context/ClassifierContext";
import { formatMs } from "@/lib/export";
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
  const { loadedModelId, modelLoadTimeMs, modelSizeMb } = useClassifierContext();

  const isLoading = loadState.status === "loading";
  const isReady = loadState.status === "ready";
  const isNewModelSelected = selectedModelId !== loadedModelId;

  const isButtonDisabled = isLoading || (isReady && !isNewModelSelected);

  const options = MODELS.map((m) => ({ value: m.id, label: m.name }));
  const selectedModel = MODELS.find((m) => m.id === selectedModelId);

  return (
    <div className="sidebar-section">
      <div className="sidebar-section-title">MODEL</div>
      <p className="sidebar-section-desc">
        Select a multilingual model. Supports English, Arabic, and Russian.
      </p>

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
        disabled={isButtonDisabled}
        loading={isLoading}
        aria-label="Load selected model"
        style={{ width: "100%" }}
      >
        {isLoading
          ? "Loading…"
          : isNewModelSelected && loadedModelId !== null
            ? "↺ Switch Model"
            : isReady
              ? "Model ready"
              : "Load Model"}
      </Button>

      {!isLoading && modelLoadTimeMs !== null && (
        <p
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-tertiary)",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <span>
            <span style={{ opacity: 0.6 }}>⏱</span> Loaded in {formatMs(modelLoadTimeMs)}
          </span>
          {modelSizeMb !== null && (
            <span>
              <span style={{ opacity: 0.6 }}>⬇</span> {modelSizeMb.toFixed(1)} MB
            </span>
          )}
        </p>
      )}
    </div>
  );
}
