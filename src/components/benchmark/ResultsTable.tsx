import { memo } from "react";
import { formatMs } from "@/lib/export";
import type { BenchmarkResult, SentimentLabel } from "@/types";
import { Badge, Card } from "../ui";

interface ResultsTableProps {
  results: BenchmarkResult[];
  /** Limit rows rendered — use pagination or virtualiser for >100 */
  maxRows?: number;
}

const LABEL_VARIANT: Record<SentimentLabel, "positive" | "negative" | "neutral"> = {
  POSITIVE: "positive",
  NEGATIVE: "negative",
  NEUTRAL: "neutral",
};

export const ResultsTable = memo(function ResultsTable({
  results,
  maxRows = 100,
}: ResultsTableProps) {
  if (results.length === 0) return null;

  const visible = results.slice(-maxRows);
  const truncated = results.length > maxRows;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "1rem 1.25rem 0.75rem",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
          }}
        >
          Results
          {truncated && (
            <span
              style={{ marginLeft: "8px", fontSize: "11px", color: "var(--color-text-tertiary)" }}
            >
              (showing last {maxRows} of {results.length})
            </span>
          )}
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          aria-label={`Benchmark results — ${results.length} samples`}
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
            tableLayout: "fixed",
          }}
        >
          <colgroup>
            <col style={{ width: "18%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "30%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "12%" }} />
          </colgroup>
          <thead>
            <tr style={{ background: "var(--color-background-secondary)" }}>
              {["Sample", "Lang", "Text", "Label", "Score", "Latency"].map((h) => (
                <th
                  key={h}
                  scope="col"
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    fontWeight: 500,
                    color: "var(--color-text-secondary)",
                    borderBottom: "0.5px solid var(--color-border-tertiary)",
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((r, i) => (
              <tr
                key={r.id}
                style={{
                  background: i % 2 === 0 ? "transparent" : "var(--color-background-secondary)",
                  borderBottom: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <td
                  style={{
                    padding: "8px 12px",
                    fontFamily: "var(--font-mono)",
                    color: "var(--color-text-secondary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {r.sample_id}
                </td>
                <td style={{ padding: "8px 12px", color: "var(--color-text-tertiary)" }}>
                  {r.language}
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: "var(--color-text-primary)",
                  }}
                >
                  {r.input_len > 60
                    ? `${r.sample_id}` // show id since text isn't stored in result
                    : `${r.input_len} chars`}
                </td>
                <td style={{ padding: "8px 12px" }}>
                  <Badge variant={LABEL_VARIANT[r.label]}>{r.label}</Badge>
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    color: "var(--color-text-primary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {(r.score * 100).toFixed(1)}%
                </td>
                <td
                  style={{
                    padding: "8px 12px",
                    color: "var(--color-text-secondary)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatMs(r.time_ms)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
