import { formatMB, formatMs } from "@/lib/export";
import type { PlaygroundResult } from "@/types";
import { Badge, Card, ProgressBar, Stat } from "../ui";

interface ResultCardProps {
  result: PlaygroundResult | null;
  isLoading: boolean;
}

const LABEL_CONFIG = {
  POSITIVE: { color: "var(--sentiment-positive)", variant: "positive" as const, icon: "↑" },
  NEGATIVE: { color: "var(--sentiment-negative)", variant: "negative" as const, icon: "↓" },
  NEUTRAL: { color: "var(--sentiment-neutral)", variant: "neutral" as const, icon: "→" },
};

export function ResultCard({ result, isLoading }: ResultCardProps) {
  if (isLoading) {
    return (
      <Card
        style={{ minHeight: 160, display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid var(--border-default)",
              borderTopColor: "var(--accent-primary)",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
              margin: "0 auto 12px",
            }}
          />
          <p style={{ fontSize: "0.8125rem" }}>Running inference…</p>
        </div>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card
        style={{
          minHeight: 160,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed var(--border-subtle)",
          background: "transparent",
        }}
      >
        <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", textAlign: "center" }}>
          Results will appear here
        </p>
      </Card>
    );
  }

  const cfg = LABEL_CONFIG[result.label];

  return (
    <Card glow style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "var(--space-4)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
              marginBottom: "var(--space-2)",
            }}
          >
            Prediction
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "2rem",
                color: cfg.color,
                lineHeight: 1,
              }}
            >
              {cfg.icon} {result.label}
            </span>
            <Badge label={`${(result.score * 100).toFixed(1)}%`} variant={cfg.variant} />
          </div>
        </div>
      </div>

      {/* Confidence bar */}
      <ProgressBar value={result.score * 100} label="Confidence" color={cfg.color} size="md" />

      {/* Performance metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "var(--space-4)",
          paddingTop: "var(--space-4)",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Stat label="Latency" value={formatMs(result.time_ms)} accent />
        <Stat label="Memory Δ" value={formatMB(result.memory_mb)} />
        <Stat label="Score" value={result.score.toFixed(4)} sub="raw logit" />
      </div>
    </Card>
  );
}
