import { formatMB, formatMs } from "@/lib/export";
import type { PlaygroundResult, SentimentLabel } from "@/types";
import { Badge, Card, ProgressBar, Stat } from "../ui";

interface ResultCardProps {
  result: PlaygroundResult | null;
  isLoading: boolean;
}

const LABEL_VARIANT: Record<SentimentLabel, "positive" | "negative" | "neutral"> = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

export function ResultCard({ result, isLoading }: ResultCardProps) {
  return (
    <Card aria-live="polite" aria-busy={isLoading} aria-label="Classification result">
      {isLoading && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "var(--color-text-secondary)",
            animation: "pulse 1.2s ease-in-out infinite",
          }}
        >
          Classifying…
        </p>
      )}

      {!isLoading && !result && (
        <p style={{ margin: 0, fontSize: "13px", color: "var(--color-text-tertiary)" }}>
          Results will appear here.
        </p>
      )}

      {!isLoading && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Badge variant={LABEL_VARIANT[result.label]}>{result.label}</Badge>
            <span style={{ fontSize: "13px", color: "var(--color-text-secondary)" }}>
              {(result.score * 100).toFixed(1)}% confidence
            </span>
          </div>

          <ProgressBar
            value={result.score * 100}
            label={`Confidence score: ${(result.score * 100).toFixed(1)}%`}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
              gap: "10px",
            }}
          >
            <Stat label="Latency" value={formatMs(result.time_ms)} />
            {result.memory_mb != null && <Stat label="Memory" value={formatMB(result.memory_mb)} />}
          </div>
        </div>
      )}
    </Card>
  );
}
