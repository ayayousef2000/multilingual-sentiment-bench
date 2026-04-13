import { memo } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMs } from "@/lib/export";
import type { BenchmarkResult } from "@/types";

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

// recharts 3.x: TooltipProps describes the <Tooltip> component itself and does
// not expose `payload`. Custom content renderers receive their own injected
// props — type them explicitly instead of reusing TooltipProps.
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    payload: ChartPoint;
  }>;
  label?: string | number;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        color: "var(--color-text-secondary)",
        boxShadow: "var(--shadow-md)",
        minWidth: 140,
      }}
    >
      <div style={{ color: "var(--color-accent)", fontWeight: 700, marginBottom: 6 }}>
        {d.label}
      </div>
      <div>
        Latency:{" "}
        <strong style={{ color: "var(--color-text-primary)" }}>{formatMs(d.time_ms)}</strong>
      </div>
      <div>
        Input: <strong style={{ color: "var(--color-text-primary)" }}>{d.input_len} chars</strong>
      </div>
      <div>
        Score: <strong style={{ color: "var(--color-text-primary)" }}>{d.score.toFixed(3)}</strong>
      </div>
    </div>
  );
}

const LABEL_COLORS: Record<string, string> = {
  POSITIVE: "#00e5c3",
  NEGATIVE: "#ff4d6d",
  NEUTRAL: "#6b7c99",
};

export const BenchmarkChart = memo(function BenchmarkChart({ results }: BenchmarkChartProps) {
  const points: ChartPoint[] = results.map((r) => ({
    input_len: r.input_len,
    time_ms: r.time_ms,
    label: r.label,
    score: r.score,
    sample_id: r.sample_id,
  }));

  return (
    <>
      <div className="panel-label" style={{ marginBottom: "var(--space-4)" }}>
        Latency vs Input Length
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="input_len"
            name="Input length"
            type="number"
            tick={{ fill: "#555", fontFamily: "var(--font-mono)", fontSize: 10 }}
            axisLine={{ stroke: "#2a2a2a" }}
            tickLine={false}
            label={{
              value: "chars",
              position: "insideBottomRight",
              offset: -4,
              fill: "#555",
              fontSize: 10,
            }}
          />
          <YAxis
            dataKey="time_ms"
            name="Latency"
            type="number"
            tick={{ fill: "#555", fontFamily: "var(--font-mono)", fontSize: 10 }}
            axisLine={{ stroke: "#2a2a2a" }}
            tickLine={false}
            tickFormatter={(v) => `${v}ms`}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "rgba(0,229,195,0.2)", strokeWidth: 1 }}
          />
          {["POSITIVE", "NEGATIVE", "NEUTRAL"].map((lbl) => (
            <Scatter
              key={lbl}
              name={lbl}
              data={points.filter((p) => p.label === lbl)}
              fill={LABEL_COLORS[lbl]}
              fillOpacity={0.75}
              r={4}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </>
  );
});
