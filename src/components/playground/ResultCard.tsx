import { formatMB, formatMs } from "@/lib/export";
import type { PlaygroundResult, SentimentLabel } from "@/types";

interface ResultCardProps {
  result: PlaygroundResult | null;
  isLoading: boolean;
}

const LABEL_META: Record<SentimentLabel, { cls: string; emoji: string; label: string }> = {
  POSITIVE: { cls: "badge-positive", emoji: "↑", label: "Positive" },
  NEGATIVE: { cls: "badge-negative", emoji: "↓", label: "Negative" },
  NEUTRAL: { cls: "badge-neutral", emoji: "→", label: "Neutral" },
};

export function ResultCard({ result, isLoading }: ResultCardProps) {
  if (isLoading) {
    return (
      <div className="panel results-empty">
        <span
          style={{ color: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: 12 }}
        >
          Classifying…
        </span>
      </div>
    );
  }

  if (!result) {
    return <div className="panel results-empty">Results will appear here</div>;
  }

  const meta = LABEL_META[result.label];
  const scorePct = Math.round(result.score * 100);

  return (
    <div className="result-card">
      {/* Label + score */}
      <div className="result-label-row">
        <span className={`result-label-badge ${meta.cls}`}>
          {meta.emoji} {meta.label}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--color-text-secondary)",
          }}
        >
          {scorePct}% confidence
        </span>
      </div>

      <div
        className="result-score-bar"
        role="progressbar"
        aria-valuenow={scorePct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence: ${scorePct}%`}
      >
        <div
          className="result-score-fill"
          style={{
            width: `${scorePct}%`,
            background:
              result.label === "POSITIVE"
                ? "var(--color-positive)"
                : result.label === "NEGATIVE"
                  ? "var(--color-negative)"
                  : "var(--color-neutral)",
          }}
        />
      </div>

      {/* Stats */}
      <div className="result-stats-grid">
        <div className="result-stat">
          <span className="result-stat-label">Latency</span>
          <span className="result-stat-value">{formatMs(result.time_ms)}</span>
        </div>
        <div className="result-stat">
          <span className="result-stat-label">Score</span>
          <span className="result-stat-value">{result.score.toFixed(4)}</span>
        </div>
        <div className="result-stat">
          <span className="result-stat-label">Memory</span>
          <span className="result-stat-value">{formatMB(result.memory_mb)}</span>
        </div>
      </div>
    </div>
  );
}
