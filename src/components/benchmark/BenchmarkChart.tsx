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
import { Card } from "../ui";

interface BenchmarkChartProps {
  results: BenchmarkResult[];
}

const LABEL_COLORS: Record<string, string> = {
  POSITIVE: "#34d399",
  NEGATIVE: "#f87171",
  NEUTRAL: "#94a3b8",
};

interface TooltipPayload {
  payload: {
    input_len: number;
    time_ms: number;
    label: string;
    score: number;
    sample_id: string;
  };
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontSize: "0.75rem",
        fontFamily: "var(--font-mono)",
        boxShadow: "var(--shadow-lg)",
        color: "var(--text-secondary)",
      }}
    >
      <div style={{ color: LABEL_COLORS[d.label], fontWeight: 700, marginBottom: 4 }}>
        {d.label}
      </div>
      <div>
        Latency: <span style={{ color: "var(--text-primary)" }}>{formatMs(d.time_ms)}</span>
      </div>
      <div>
        Input: <span style={{ color: "var(--text-primary)" }}>{d.input_len} chars</span>
      </div>
      <div>
        Score: <span style={{ color: "var(--text-primary)" }}>{d.score.toFixed(4)}</span>
      </div>
      <div style={{ color: "var(--text-muted)", marginTop: 4 }}>{d.sample_id}</div>
    </div>
  );
}

export function BenchmarkChart({ results }: BenchmarkChartProps) {
  if (results.length === 0) return null;

  const byLabel = {
    POSITIVE: results.filter((r) => r.label === "POSITIVE"),
    NEGATIVE: results.filter((r) => r.label === "NEGATIVE"),
    NEUTRAL: results.filter((r) => r.label === "NEUTRAL"),
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-3)",
        }}
      >
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
          Latency vs Input Length
        </h2>
        <div style={{ display: "flex", gap: "var(--space-4)" }}>
          {Object.entries(LABEL_COLORS).map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ width: "100%", height: 280 }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 24, left: 8 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis
              dataKey="input_len"
              name="Input Length"
              type="number"
              label={{
                value: "Input chars",
                position: "insideBottomRight",
                offset: -8,
                style: { fill: "var(--text-muted)", fontSize: 11 },
              }}
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--border-subtle)" }}
              tickLine={false}
            />
            <YAxis
              dataKey="time_ms"
              name="Latency (ms)"
              tick={{ fill: "var(--text-muted)", fontSize: 11, fontFamily: "var(--font-mono)" }}
              axisLine={{ stroke: "var(--border-subtle)" }}
              tickLine={false}
              tickFormatter={(v: number) => `${v.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border-strong)" }} />
            {Object.entries(byLabel).map(([label, data]) => (
              <Scatter
                key={label}
                name={label}
                data={data}
                fill={LABEL_COLORS[label]}
                fillOpacity={0.75}
                r={4}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
