import { memo } from "react";
import { formatMs } from "@/lib/export";
import type { BenchmarkResult, SentimentLabel } from "@/types";

interface ResultsTableProps {
  results: BenchmarkResult[];
  maxRows?: number;
}

const LABEL_COLORS: Record<SentimentLabel, { color: string; bg: string; border: string }> = {
  POSITIVE: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" },
  NEGATIVE: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)" },
  NEUTRAL: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" },
};

function LabelBadge({ label }: { label: SentimentLabel }) {
  const { color, bg, border } = LABEL_COLORS[label];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.04em",
        fontFamily: "var(--font-mono)",
        color,
        background: bg,
        border: `1px solid ${border}`,
      }}
    >
      {label}
    </span>
  );
}

function CorrectBadge({ correct }: { correct: boolean | null }) {
  if (correct === null) {
    return (
      <span
        style={{
          color: "var(--color-text-tertiary)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        —
      </span>
    );
  }
  // FIX: aria-label is only valid on elements with a role.
  // role="img" turns the span into a labellable image/icon element.
  return (
    <span role="img" style={{ fontSize: 14 }} aria-label={correct ? "Correct" : "Incorrect"}>
      {correct ? "✓" : "✗"}
    </span>
  );
}

export const ResultsTable = memo(function ResultsTable({
  results,
  maxRows = 200,
}: ResultsTableProps) {
  const visible = results.slice(0, maxRows);

  return (
    <div className="results-table-wrap">
      <table className="results-table" aria-label="Benchmark results">
        <thead>
          <tr>
            <th>#</th>
            <th>Text</th>
            <th>Lang</th>
            <th>Predicted</th>
            <th>Expected</th>
            <th>Correct</th>
            <th>Score</th>
            <th>Latency</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((r, i) => {
            const isCorrect = r.expected !== null ? r.label === r.expected : null;

            // Highlight rows with wrong prediction
            const rowStyle =
              isCorrect === false ? { background: "rgba(239,68,68,0.04)" } : undefined;

            return (
              <tr key={r.id} style={rowStyle}>
                <td
                  style={{
                    color: "var(--color-text-tertiary)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                  }}
                >
                  {i + 1}
                </td>
                <td
                  style={{
                    maxWidth: 280,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                  title={r.input_text}
                  dir="auto"
                >
                  {r.input_text}
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{r.language}</td>
                <td>
                  <LabelBadge label={r.label} />
                </td>
                <td>
                  {r.expected ? (
                    <LabelBadge label={r.expected} />
                  ) : (
                    <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                  )}
                </td>
                <td style={{ textAlign: "center" }}>
                  <CorrectBadge correct={isCorrect} />
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {(r.score * 100).toFixed(1)}%
                </td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>
                  {formatMs(r.time_ms)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {results.length > maxRows && (
        <p
          style={{
            textAlign: "center",
            color: "var(--color-text-tertiary)",
            fontSize: 12,
            padding: "8px 0",
          }}
        >
          Showing {maxRows} of {results.length} results
        </p>
      )}
    </div>
  );
});
