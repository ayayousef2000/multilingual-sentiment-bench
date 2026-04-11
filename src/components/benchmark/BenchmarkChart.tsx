import { memo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from "recharts";
import { formatMs } from "@/lib/export";
import type { BenchmarkResult } from "@/types";
import { Card } from "../ui";

interface BenchmarkChartProps {
  results: BenchmarkResult[];
}

interface ChartPoint {
  input_len: number;
  time_ms: number;
  label: string;
  score: number;
  sample_id: string;
}

function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as ChartPoint;
  return (
    <div
      role="tooltip"
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "8px 12px",
        fontSize: "12px",
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0, fontWeight: 500 }}>{d.sample_id}</p>
      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
        Input: {d.input_len} chars · {formatMs(d.time_ms)}
      </p>
      <p style={{ margin: 0, color: "var(--color-text-secondary)" }}>
        {d.label} ({(d.score * 100).toFixed(1)}%)
      </p>
    </div>
  );
}

export const BenchmarkChart = memo(function BenchmarkChart({ results }: BenchmarkChartProps) {
  if (results.length === 0) return null;

  const data: ChartPoint[] = results.map((r) => ({
    input_len: r.input_len,
    time_ms: r.time_ms,
    label: r.label,
    score: r.score,
    sample_id: r.sample_id,
  }));

  return (
    <Card>
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
        }}
      >
        Latency vs input length
      </p>
      <div
        role="img"
        aria-label={`Scatter chart showing inference latency against input length for ${results.length} samples`}
      >
        <ResponsiveContainer width="100%" height={260}>
          <ScatterChart margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-tertiary)" />
            <XAxis
              dataKey="input_len"
              name="Input length"
              tick={{ fontSize: 11 }}
              label={{
                value: "chars",
                position: "insideBottomRight",
                offset: -4,
                fontSize: 11,
              }}
            />
            <YAxis
              dataKey="time_ms"
              name="Latency (ms)"
              tick={{ fontSize: 11 }}
              tickFormatter={(v: number) => `${Math.round(v)}ms`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} fill="var(--color-accent, #1a6cff)" opacity={0.75} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});
