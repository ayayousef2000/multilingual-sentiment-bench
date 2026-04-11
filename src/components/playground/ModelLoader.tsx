import { MODELS } from "@/lib/models";
import type { ModelLoadState } from "@/types";
import { Button, ProgressBar } from "../ui";

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
  const model = MODELS.find((m) => m.id === selectedModelId);
  const isLoading = loadState.status === "loading";
  const isReady = loadState.status === "ready";

  const modelOptions = MODELS.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
      <div>
        <span className="sidebar-section-title">Model Selection</span>
        <p className="sidebar-section-desc">
          All inference runs locally in a Web Worker via{" "}
          <code style={{ fontSize: 11 }}>@huggingface/transformers</code>
        </p>
      </div>

      <div>
        <label htmlFor="model-select" className="sidebar-label">
          Model
        </label>
        <div className="select-wrap">
          <select
            id="model-select"
            value={selectedModelId}
            onChange={(e) => onModelChange(e.target.value)}
            disabled={isLoading}
            aria-disabled={isLoading}
          >
            {modelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">
            ▾
          </span>
        </div>
      </div>

      {model && (
        <div className="model-desc-card">
          <p className="model-desc-text">{model.description}</p>
          <div className="model-tags">
            <span className="model-tag model-tag-size">{model.size}</span>
            {model.languages.slice(0, 3).map((lang) => (
              <span key={lang} className="model-tag model-tag-lang">
                {lang.toUpperCase()}
              </span>
            ))}
            {model.languages.length > 3 && (
              <span className="model-tag model-tag-lang">+{model.languages.length - 3}</span>
            )}
          </div>
        </div>
      )}

      {isLoading && (
        <ProgressBar
          value={loadState.progress}
          label="Loading model…"
          statusText={loadState.statusText}
        />
      )}

      {loadState.status === "error" && (
        <div
          style={{ fontSize: 12, color: "var(--color-negative)", fontFamily: "var(--font-mono)" }}
        >
          ⚠ {loadState.error}
        </div>
      )}

      <Button
        variant={isReady ? "ghost" : "primary"}
        className="btn-full"
        onClick={onLoad}
        loading={isLoading}
        disabled={isLoading}
      >
        {isReady ? "✓ Model Loaded" : "Load Model"}
      </Button>
    </div>
  );
}
