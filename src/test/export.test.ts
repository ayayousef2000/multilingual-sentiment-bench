import { describe, expect, it } from "vitest";
import { computeStats, formatMB, formatMs, resultsToCSV } from "@/lib/export";
import type { BenchmarkResult } from "@/types";

const mockResults: BenchmarkResult[] = [
  {
    id: "r1",
    sample_id: "en-01",
    model_id: "model-a",
    dataset_id: "en-mixed",
    label: "POSITIVE",
    score: 0.98,
    time_ms: 120,
    memory_mb: 2.5,
    input_len: 50,
    input_text: "This is a great product!",
    language: "en",
    timestamp: 1700000000000,
    expected: "POSITIVE",
  },
  {
    id: "r2",
    sample_id: "en-02",
    model_id: "model-a",
    dataset_id: "en-mixed",
    label: "NEGATIVE",
    score: 0.87,
    time_ms: 80,
    memory_mb: 1.2,
    input_len: 60,
    input_text: "Terrible experience, would not recommend.",
    language: "en",
    timestamp: 1700000001000,
    expected: "NEGATIVE",
  },
  {
    id: "r3",
    sample_id: "en-03",
    model_id: "model-a",
    dataset_id: "en-mixed",
    label: "NEUTRAL",
    score: 0.55,
    time_ms: 100,
    memory_mb: null,
    input_len: 30,
    input_text: "The package arrived on time.",
    language: "en",
    timestamp: 1700000002000,
    expected: null,
  },
];

describe("computeStats", () => {
  it("returns null for empty results", () => {
    expect(computeStats([])).toBeNull();
  });

  it("computes correct averages", () => {
    const stats = computeStats(mockResults);
    expect(stats).not.toBeNull();
    expect(stats?.count).toBe(3);
    expect(stats?.avgLatency).toBeCloseTo((120 + 80 + 100) / 3);
    expect(stats?.minLatency).toBe(80);
    expect(stats?.maxLatency).toBe(120);
  });

  it("counts labels correctly", () => {
    const stats = computeStats(mockResults);
    expect(stats?.positiveCount).toBe(1);
    expect(stats?.negativeCount).toBe(1);
    expect(stats?.neutralCount).toBe(1);
  });

  it("computes avgMemory only from non-null values", () => {
    const stats = computeStats(mockResults);
    expect(stats?.avgMemory).toBeCloseTo((2.5 + 1.2) / 2);
  });
});

describe("formatMs", () => {
  it("formats sub-second values", () => {
    expect(formatMs(120)).toBe("120ms");
  });

  it("formats multi-second values", () => {
    expect(formatMs(2500)).toBe("2.50s");
  });
});

describe("formatMB", () => {
  it("formats number", () => {
    expect(formatMB(3.14)).toBe("3.1 MB");
  });

  it("returns N/A for null", () => {
    expect(formatMB(null)).toBe("N/A");
  });
});

describe("resultsToCSV", () => {
  it("includes header row", () => {
    const csv = resultsToCSV(mockResults);
    expect(csv.split("\n")[0]).toContain("model_id");
    expect(csv.split("\n")[0]).toContain("time_ms");
  });

  it("has correct number of rows", () => {
    const csv = resultsToCSV(mockResults);
    const lines = csv.trim().split("\n");
    expect(lines).toHaveLength(mockResults.length + 1);
  });
});
