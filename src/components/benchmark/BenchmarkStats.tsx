import { memo, useMemo } from "react";
import { computeStats, formatMB, formatMs } from "@/lib/export";
import type { BenchmarkResult } from "@/types";
import { Card, Stat } from "../ui";

interface BenchmarkStatsPanelProps {
  results: BenchmarkResult[];
}

export const BenchmarkStatsPanel = memo(function BenchmarkStatsPanel({
  results,
}: BenchmarkStatsPanelProps) {
  const stats = useMemo(() => computeStats(results), [results]);

  if (results.length === 0 || !stats) return null;

  return (
    <Card aria-label="Benchmark statistics">
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
        }}
      >
        Run statistics
      </p>
      <div className="stats-row">
        <Stat label="Samples" value={stats.count} />
        <Stat label="Avg latency" value={formatMs(stats.avgLatency)} />
        <Stat
          label="Min / Max"
          value={`${formatMs(stats.minLatency)} / ${formatMs(stats.maxLatency)}`}
        />
        {stats.avgMemory != null && <Stat label="Avg memory" value={formatMB(stats.avgMemory)} />}
        {stats.accuracy != null && (
          <Stat label="Accuracy" value={`${(stats.accuracy * 100).toFixed(1)}%`} />
        )}
        <Stat
          label="Distribution"
          value={`${stats.positiveCount}+ / ${stats.negativeCount}− / ${stats.neutralCount}○`}
        />
      </div>
    </Card>
  );
});
