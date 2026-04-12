import { getModelById } from "@/lib/models";
import type { BenchmarkResult, BenchmarkStats, ExportRow } from "@/types";

/** Increment when the CSV schema changes so Colab notebooks can version-guard. */
const CSV_SCHEMA_VERSION = "1";
const APP_VERSION = `schema-v${CSV_SCHEMA_VERSION}`;

function escapeCSV(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Wrap in quotes if it contains a comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildExportRow(
  result: BenchmarkResult,
  modelName: string,
  datasetName: string,
  runId: string
): ExportRow {
  return {
    run_id: runId,
    app_version: APP_VERSION,
    model_id: result.model_id,
    model_name: modelName,
    dataset_id: result.dataset_id,
    dataset_name: datasetName,
    sample_id: result.sample_id,
    language: result.language,
    input_text: result.input_text,
    input_len: result.input_len,
    expected: result.expected,
    label: result.label,
    is_correct: result.expected !== null ? result.label === result.expected : null,
    score: result.score,
    score_pct: Math.round(result.score * 10000) / 100,
    time_ms: result.time_ms,
    memory_mb: result.memory_mb,
    timestamp: result.timestamp,
    iso_datetime: new Date(result.timestamp).toISOString(),
  };
}

const CSV_HEADERS: (keyof ExportRow)[] = [
  "run_id",
  "app_version",
  "model_id",
  "model_name",
  "dataset_id",
  "dataset_name",
  "sample_id",
  "language",
  "input_text",
  "input_len",
  "expected",
  "label",
  "is_correct",
  "score",
  "score_pct",
  "time_ms",
  "memory_mb",
  "timestamp",
  "iso_datetime",
];

export function resultsToCSV(
  results: BenchmarkResult[],
  datasetName = "unknown-dataset",
  runId?: string
): string {
  const id = runId ?? `run-${Date.now()}`;
  const rows = results.map((r) => {
    const model = getModelById(r.model_id);
    const row = buildExportRow(r, model?.name ?? r.model_id, datasetName, id);
    return CSV_HEADERS.map((k) => escapeCSV(row[k])).join(",");
  });
  return [CSV_HEADERS.join(","), ...rows].join("\n");
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function computeStats(results: BenchmarkResult[]): BenchmarkStats | null {
  if (results.length === 0) return null;

  const latencies = results.map((r) => r.time_ms);
  const memories = results.map((r) => r.memory_mb).filter((m): m is number => m !== null);

  const withExpected = results.filter((r) => r.expected !== null);
  const correct = withExpected.filter((r) => r.label === r.expected);

  return {
    count: results.length,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    minLatency: Math.min(...latencies),
    maxLatency: Math.max(...latencies),
    avgMemory: memories.length > 0 ? memories.reduce((a, b) => a + b, 0) / memories.length : null,
    positiveCount: results.filter((r) => r.label === "POSITIVE").length,
    negativeCount: results.filter((r) => r.label === "NEGATIVE").length,
    neutralCount: results.filter((r) => r.label === "NEUTRAL").length,
    accuracy: withExpected.length > 0 ? correct.length / withExpected.length : null,
  };
}

export function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${ms}ms`;
}

export function formatMB(mb: number | null | undefined): string {
  if (mb === null || mb === undefined) return "N/A";
  return `${mb.toFixed(1)} MB`;
}
