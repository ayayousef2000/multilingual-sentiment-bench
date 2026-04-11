import { memo } from "react";
import { formatMs } from "@/lib/export";
import type { BenchmarkResult, SentimentLabel } from "@/types";

interface ResultsTableProps {
  results: BenchmarkResult[];
  maxRows?: number;
}

const LABEL_CLS: Record<SentimentLabel, string> = {
  POSITIVE: "badge badge-positive",
  NEGATIVE: "badge badge-negative",
  NEUTRAL: "badge badge-neutral",
};

export const ResultsTable = memo(function ResultsTable({
  results,
  maxRows = 50,
}: ResultsTableProps) {
  const rows = results.slice(0, maxRows);

  return (
    <table className="results-table" aria-label="Benchmark results">
      <thead>
        <tr>
          <th>#</th>
          <th>Sample</th>
          <th>Lang</th>
          <th>Label</th>
          <th>Score</th>
          <th>Latency</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.id}>
            <td style={{ color: "var(--color-text-muted)" }}>{i + 1}</td>
            <td
              style={{
                maxWidth: 260,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--color-text-primary)",
              }}
              title={r.sample_id}
            >
              {r.sample_id}
            </td>
            <td>
              <span style={{ color: "var(--color-accent)", fontSize: 11, fontWeight: 700 }}>
                {r.language.toUpperCase()}
              </span>
            </td>
            <td>
              <span className={LABEL_CLS[r.label]}>{r.label}</span>
            </td>
            <td>{r.score.toFixed(3)}</td>
            <td>{formatMs(r.time_ms)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
});
