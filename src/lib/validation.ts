/**
 * Lightweight runtime validation layer.
 *
 * No external dependencies — uses the `invariant` utility for clear error messages.
 * Add Zod here as a drop-in replacement when/if the bundle budget allows.
 */

import type {
  BenchmarkResult,
  ModelLoadState,
  PlaygroundResult,
  SentimentLabel,
  WorkerOutbound,
} from "@/types";
import { invariant } from "@/utils/assert";

const SENTIMENT_LABELS = new Set<SentimentLabel>(["POSITIVE", "NEGATIVE", "NEUTRAL"]);
const MODEL_LOAD_STATUSES = new Set(["idle", "loading", "ready", "error"]);
const WORKER_OUTBOUND_TYPES = new Set([
  "MODEL_READY",
  "PROGRESS",
  "CLASSIFICATION_RESULT",
  "ERROR",
]);

// ─── WorkerOutbound ───────────────────────────────────────────────────────────

export function isWorkerOutbound(value: unknown): value is WorkerOutbound {
  if (typeof value !== "object" || value === null) return false;
  const type = (value as Record<string, unknown>).type;
  return typeof type === "string" && WORKER_OUTBOUND_TYPES.has(type);
}

export function assertWorkerOutbound(value: unknown): asserts value is WorkerOutbound {
  invariant(isWorkerOutbound(value), `Invalid WorkerOutbound message: ${JSON.stringify(value)}`);
}

// ─── PlaygroundResult ─────────────────────────────────────────────────────────

export function assertPlaygroundResult(value: unknown): asserts value is PlaygroundResult {
  invariant(typeof value === "object" && value !== null, "PlaygroundResult must be an object");
  const v = value as Record<string, unknown>;
  invariant(SENTIMENT_LABELS.has(v.label as SentimentLabel), `Invalid label: ${v.label}`);
  invariant(typeof v.score === "number" && v.score >= 0 && v.score <= 1, "score must be 0–1");
  invariant(
    typeof v.time_ms === "number" && v.time_ms >= 0,
    "time_ms must be a non-negative number"
  );
  invariant(
    v.memory_mb === null || typeof v.memory_mb === "number",
    "memory_mb must be number | null"
  );
}

// ─── BenchmarkResult ──────────────────────────────────────────────────────────

export function assertBenchmarkResult(value: unknown): asserts value is BenchmarkResult {
  invariant(typeof value === "object" && value !== null, "BenchmarkResult must be an object");
  const v = value as Record<string, unknown>;
  invariant(typeof v.id === "string", "BenchmarkResult.id must be a string");
  invariant(typeof v.sample_id === "string", "BenchmarkResult.sample_id must be a string");
  invariant(typeof v.model_id === "string", "BenchmarkResult.model_id must be a string");
  invariant(typeof v.dataset_id === "string", "BenchmarkResult.dataset_id must be a string");
  invariant(SENTIMENT_LABELS.has(v.label as SentimentLabel), `Invalid label: ${v.label}`);
  invariant(typeof v.score === "number", "BenchmarkResult.score must be a number");
  invariant(typeof v.time_ms === "number", "BenchmarkResult.time_ms must be a number");
  invariant(typeof v.input_len === "number", "BenchmarkResult.input_len must be a number");
  invariant(typeof v.language === "string", "BenchmarkResult.language must be a string");
  invariant(typeof v.timestamp === "number", "BenchmarkResult.timestamp must be a number");
}

// ─── ModelLoadState ───────────────────────────────────────────────────────────

export function assertModelLoadState(value: unknown): asserts value is ModelLoadState {
  invariant(typeof value === "object" && value !== null, "ModelLoadState must be an object");
  const v = value as Record<string, unknown>;
  invariant(MODEL_LOAD_STATUSES.has(v.status as string), `Invalid status: ${v.status}`);
  invariant(typeof v.progress === "number", "progress must be a number");
  invariant(typeof v.statusText === "string", "statusText must be a string");
}
