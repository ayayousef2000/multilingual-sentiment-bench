import { formatMs } from "@/lib/export";
import type { BenchmarkResult, SentimentLabel } from "@/types";
import { Badge, Card } from "../ui";

interface ResultsTableProps {
  results: BenchmarkResult[];
}

const LABEL_VARIANT: Record<SentimentLabel, "positive" | "negative" | "neutral"> = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

export function ResultsTable({ results }: ResultsTableProps) {
  if (results.length === 0) return null;

  const latest = [...results].reverse().slice(0, 50);

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
          }}
        >
          Results
        </h2>
        <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
          Showing last {Math.min(results.length, 50)} of {results.length}
        </span>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "80px 1fr 90px 70px 70px 80px",
          gap: "var(--space-3)",
          padding: "6px var(--space-3)",
          background: "var(--bg-overlay)",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--border-subtle)",
        }}
      >
        {["Sample", "Text Preview", "Label", "Score", "Latency", "Lang"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: "0.6rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontFamily: "var(--font-display)",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Scrollable rows */}
      <div
        style={{
          maxHeight: 360,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {latest.map((r) => (
          <div
            key={r.id}
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 90px 70px 70px 80px",
              gap: "var(--space-3)",
              padding: "8px var(--space-3)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
              alignItems: "center",
              background: "var(--bg-elevated)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.sample_id}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={r.sample_id}
            >
              <span style={{ color: "var(--text-muted)" }}>{r.input_len} chars</span>
            </span>
            <Badge label={r.label} variant={LABEL_VARIANT[r.label]} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {r.score.toFixed(3)}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.75rem",
                color: "var(--accent-primary)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMs(r.time_ms)}
            </span>
            <Badge label={r.language} variant="muted" />
          </div>
        ))}
      </div>
    </Card>
  );
}
