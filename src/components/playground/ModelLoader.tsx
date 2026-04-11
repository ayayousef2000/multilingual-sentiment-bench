import { MODELS } from "@/lib/models";
import type { ModelLoadState } from "@/types";
import { Badge, Button, Card, ProgressBar, Select } from "../ui";

interface ModelLoaderProps {
  selectedModelId: string;
  loadState: ModelLoadState;
  onModelChange: (modelId: string) => void;
  onLoad: () => void;
}

const STATUS_BADGE: Record<
  ModelLoadState["status"],
  { label: string; variant: "default" | "positive" | "negative" | "info" | "warning" }
> = {
  idle: { label: "Not loaded", variant: "default" },
  loading: { label: "Loading…", variant: "info" },
  ready: { label: "Ready", variant: "positive" },
  error: { label: "Error", variant: "negative" },
};

export function ModelLoader({
  selectedModelId,
  loadState,
  onModelChange,
  onLoad,
}: ModelLoaderProps) {
  const isLoading = loadState.status === "loading";
  const isReady = loadState.status === "ready";
  const { label, variant } = STATUS_BADGE[loadState.status];

  return (
    <Card>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 200px" }}>
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
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingBottom: "1px" }}>
          <Badge variant={variant}>{label}</Badge>
          {!isReady && (
            <Button
              variant="primary"
              size="sm"
              onClick={onLoad}
              disabled={isLoading}
              loading={isLoading}
            >
              {isLoading ? "Loading…" : "Load model"}
            </Button>
          )}
        </div>
      </div>

      {isLoading && (
        <div style={{ marginTop: "12px" }}>
          <ProgressBar
            value={loadState.progress}
            label="Model download and initialisation progress"
            statusText={loadState.statusText}
          />
        </div>
      )}

      {loadState.status === "error" && loadState.error && (
        <p
          role="alert"
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "var(--color-text-danger)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {loadState.error}
        </p>
      )}

      {isReady && (
        <p
          style={{
            marginTop: "10px",
            fontSize: "12px",
            color: "var(--color-text-tertiary)",
          }}
        >
          {MODELS.find((m) => m.id === selectedModelId)?.description}
        </p>
      )}
    </Card>
  );
}
