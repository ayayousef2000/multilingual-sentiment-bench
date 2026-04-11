import type { BenchmarkResult, BenchmarkStats, ExportRow } from "@/types";

// ─── CSV export ───────────────────────────────────────────────────────────────

const CSV_COLUMNS: ReadonlyArray<keyof ExportRow> = [
  "model_id",
  "dataset_id",
  "sample_id",
  "language",
  "input_len",
  "label",
  "score",
  "time_ms",
  "memory_mb",
  "timestamp",
];

function escapeCSV(value: string | number | null): string {
  if (value === null) return "";
  const str = String(value);
  // Wrap in quotes if value contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function resultsToCSV(results: BenchmarkResult[]): string {
  const header = CSV_COLUMNS.join(",");

  const rows = results.map((r) => {
    const row: ExportRow = {
      model_id: r.model_id,
      dataset_id: r.dataset_id,
      sample_id: r.sample_id,
      language: r.language,
      input_len: r.input_len,
      label: r.label,
      score: r.score,
      time_ms: r.time_ms,
      memory_mb: r.memory_mb,
      timestamp: r.timestamp,
    };
    return CSV_COLUMNS.map((col) => escapeCSV(row[col])).join(",");
  });

  return [header, ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Revoke after a short delay to allow the download to start
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export function computeStats(results: BenchmarkResult[]): BenchmarkStats | null {
  if (results.length === 0) {
    return null;
  }

  const latencies = results.map((r) => r.time_ms);
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  const memValues = results.map((r) => r.memory_mb).filter((m): m is number => m !== null);
  const avgMemory =
    memValues.length > 0 ? memValues.reduce((a, b) => a + b, 0) / memValues.length : null;

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (const r of results) {
    if (r.label === "POSITIVE") positiveCount++;
    else if (r.label === "NEGATIVE") negativeCount++;
    else neutralCount++;
  }

  // Accuracy: fraction of results where label matches expected
  const withExpected = results.filter((_r) => {
    // Expected is stored on the dataset sample, not the result;
    // accuracy must be computed externally if needed. Placeholder: null.
    return false;
  });
  const accuracy = withExpected.length > 0 ? withExpected.length / results.length : null;

  return {
    count: results.length,
    avgLatency,
    minLatency,
    maxLatency,
    avgMemory,
    positiveCount,
    negativeCount,
    neutralCount,
    accuracy,
  };
}

// ─── Formatters ───────────────────────────────────────────────────────────────

/**
 * Format milliseconds. Shows decimals only when < 100ms.
 */
export function formatMs(ms: number): string {
  if (!Number.isFinite(ms)) return "—";
  if (ms < 1) return `${ms.toFixed(2)}ms`;
  if (ms < 100) return `${ms.toFixed(1)}ms`;
  if (ms < 1_000) return `${Math.round(ms)}ms`;
  return `${(ms / 1_000).toFixed(2)}s`;
}

/**
 * Format megabytes. Returns em-dash for null/undefined.
 */
export function formatMB(mb: number | null | undefined): string {
  if (mb == null || !Number.isFinite(mb)) return "N/A";
  if (mb < 1) return `${Math.round(mb * 1_000)} KB`;
  return `${mb.toFixed(1)} MB`;
}
