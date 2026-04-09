import { computeStats, formatMB, formatMs } from "@/lib/export";
import type { BenchmarkResult } from "@/types";
import { Card, Stat } from "../ui";

interface BenchmarkStatsProps {
  results: BenchmarkResult[];
}

export function BenchmarkStatsPanel({ results }: BenchmarkStatsProps) {
  if (results.length === 0) return null;

  const stats = computeStats(results);
  if (!stats) return null;

  const posRatio = (stats.positiveCount / stats.count) * 100;
  const negRatio = (stats.negativeCount / stats.count) * 100;
  const neutRatio = (stats.neutralCount / stats.count) * 100;

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
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
        Run Statistics
      </h2>

      {/* Key metrics grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
          gap: "var(--space-5)",
        }}
      >
        <Stat label="Samples" value={String(stats.count)} accent />
        <Stat label="Avg Latency" value={formatMs(stats.avgLatency)} />
        <Stat label="Min Latency" value={formatMs(stats.minLatency)} sub="best" />
        <Stat label="Max Latency" value={formatMs(stats.maxLatency)} sub="worst" />
        {stats.avgMemory !== null && (
          <Stat label="Avg Memory Δ" value={formatMB(stats.avgMemory)} />
        )}
      </div>

      {/* Label distribution */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          Label Distribution
        </div>

        {[
          {
            label: "Positive",
            count: stats.positiveCount,
            pct: posRatio,
            color: "var(--sentiment-positive)",
          },
          {
            label: "Negative",
            count: stats.negativeCount,
            pct: negRatio,
            color: "var(--sentiment-negative)",
          },
          {
            label: "Neutral",
            count: stats.neutralCount,
            pct: neutRatio,
            color: "var(--sentiment-neutral)",
          },
        ].map(({ label, count, pct, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <span
              style={{
                width: 72,
                fontSize: "0.75rem",
                color: "var(--text-secondary)",
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: "var(--bg-overlay)",
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  background: color,
                  borderRadius: 4,
                  transition: "width 600ms var(--ease-default)",
                  boxShadow: `0 0 6px ${color}60`,
                }}
              />
            </div>
            <span
              style={{
                width: 52,
                textAlign: "right",
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                fontVariantNumeric: "tabular-nums",
                flexShrink: 0,
              }}
            >
              {count} ({pct.toFixed(0)}%)
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
