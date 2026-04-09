import type { BenchmarkResult, ExportRow } from "@/types";

export function resultsToCSV(results: BenchmarkResult[]): string {
  const headers: (keyof ExportRow)[] = [
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

  const rows = results.map((r) =>
    headers
      .map((h) => {
        const val = r[h as keyof BenchmarkResult];
        if (val === null || val === undefined) return "";
        if (typeof val === "number") return val.toFixed(4);
        return `"${String(val).replace(/"/g, '""')}"`;
      })
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
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

export function computeStats(results: BenchmarkResult[]) {
  if (results.length === 0) return null;

  const latencies = results.map((r) => r.time_ms);
  const memories = results.map((r) => r.memory_mb).filter((m): m is number => m !== null);

  const positiveCount = results.filter((r) => r.label === "POSITIVE").length;
  const negativeCount = results.filter((r) => r.label === "NEGATIVE").length;
  const neutralCount = results.filter((r) => r.label === "NEUTRAL").length;

  return {
    count: results.length,
    avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
    minLatency: Math.min(...latencies),
    maxLatency: Math.max(...latencies),
    avgMemory: memories.length > 0 ? memories.reduce((a, b) => a + b, 0) / memories.length : null,
    positiveCount,
    negativeCount,
    neutralCount,
    accuracy: null,
  };
}

export function formatMs(ms: number): string {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function formatMB(mb: number | null): string {
  if (mb === null) return "N/A";
  return `${mb.toFixed(1)} MB`;
}
