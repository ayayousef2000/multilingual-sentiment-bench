import { MODELS } from "@/lib/models";
import type { ModelLoadState } from "@/types";
import { Badge, Button, Card, ProgressBar, Select } from "../ui";

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

  return (
    <Card>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Section title */}
        <div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: "var(--space-1)",
            }}
          >
            Model Selection
          </h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            All inference runs locally in a Web Worker via{" "}
            <code
              style={{
                color: "var(--accent-primary)",
                background: "var(--accent-primary-dim)",
                padding: "1px 5px",
                borderRadius: "3px",
              }}
            >
              @huggingface/transformers
            </code>
          </p>
        </div>

        {/* Model select */}
        <Select
          label="Model"
          value={selectedModelId}
          onChange={onModelChange}
          disabled={isLoading}
          options={MODELS.map((m) => ({
            value: m.id,
            label: `${m.name} (${m.size})`,
          }))}
        />

        {/* Model info */}
        {model && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-2)",
              padding: "var(--space-3) var(--space-4)",
              background: "var(--bg-elevated)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div style={{ flex: 1, minWidth: 140 }}>
              <div
                style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "4px" }}
              >
                {model.description}
              </div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <Badge label={model.size} variant="accent" />
                {model.languages.slice(0, 5).map((lang) => (
                  <Badge key={lang} label={lang} variant="muted" />
                ))}
                {model.languages.length > 5 && (
                  <Badge label={`+${model.languages.length - 5}`} variant="muted" />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Load button + status */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Button onClick={onLoad} disabled={isLoading || isReady} variant="primary" size="md">
            {isLoading ? "Loading model…" : isReady ? "✓ Model Ready" : "Load Model"}
          </Button>

          {(isLoading || isReady || loadState.status === "error") && (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <ProgressBar
                value={loadState.progress}
                showPercent
                color={
                  loadState.status === "error"
                    ? "var(--sentiment-negative)"
                    : isReady
                      ? "var(--sentiment-positive)"
                      : "var(--accent-primary)"
                }
                size="sm"
              />
              <span
                style={{
                  fontSize: "0.6875rem",
                  color:
                    loadState.status === "error"
                      ? "var(--sentiment-negative)"
                      : "var(--text-muted)",
                  fontFamily: "var(--font-mono)",
                  wordBreak: "break-all",
                }}
              >
                {loadState.statusText}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
