// ─── Sentiment ───────────────────────────────────────────────────────────────

export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

// ─── Models ──────────────────────────────────────────────────────────────────

export type ModelSize = "small" | "medium" | "large";
export type ModelTask = "sentiment-analysis" | "text-classification";
export type ModelLoadStatus = "idle" | "loading" | "ready" | "error";

export interface ModelConfig {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly languages: readonly string[];
  readonly size: ModelSize;
  readonly task: ModelTask;
}

export interface ModelLoadState {
  readonly status: ModelLoadStatus;
  readonly progress: number;
  readonly statusText: string;
  readonly error?: string;
}

// ─── Worker messages (discriminated unions) ──────────────────────────────────

export interface WorkerInboundLoad {
  readonly type: "LOAD_MODEL";
  readonly modelId: string;
}

export interface WorkerInboundClassify {
  readonly type: "CLASSIFY";
  readonly id: string;
  readonly text: string;
  readonly modelId: string;
}

export type WorkerInbound = WorkerInboundLoad | WorkerInboundClassify;

export interface WorkerOutboundReady {
  readonly type: "MODEL_READY";
  readonly modelId: string;
}

export interface WorkerOutboundProgress {
  readonly type: "PROGRESS";
  readonly modelId: string;
  readonly progress: number;
  readonly status: string;
}

export interface WorkerOutboundResult {
  readonly type: "CLASSIFICATION_RESULT";
  readonly id: string;
  readonly label: SentimentLabel;
  readonly score: number;
  readonly time_ms: number;
  readonly memory_mb: number | null;
}

export interface WorkerOutboundError {
  readonly type: "ERROR";
  readonly message: string;
  readonly modelId?: string;
  /** If present, the pending classify request that should be rejected */
  readonly requestId?: string;
}

export type WorkerOutbound =
  | WorkerOutboundReady
  | WorkerOutboundProgress
  | WorkerOutboundResult
  | WorkerOutboundError;

export type WorkerMessageType = WorkerOutbound["type"];

// ─── Datasets ────────────────────────────────────────────────────────────────

export interface BenchmarkSample {
  readonly id: string;
  readonly text: string;
  readonly language: string;
  readonly expected?: SentimentLabel;
}

export interface BenchmarkDataset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly language: string;
  readonly samples: readonly BenchmarkSample[];
}

// ─── Results ─────────────────────────────────────────────────────────────────

export interface BenchmarkResult {
  readonly id: string;
  readonly sample_id: string;
  readonly model_id: string;
  readonly dataset_id: string;
  readonly label: SentimentLabel;
  readonly score: number;
  readonly time_ms: number;
  readonly memory_mb: number | null;
  readonly input_len: number;
  readonly language: string;
  readonly timestamp: number;
}

export interface BenchmarkRunState {
  readonly isRunning: boolean;
  readonly currentIdx: number;
  readonly total: number;
  readonly datasetId: string | null;
  readonly modelId: string | null;
}

export interface BenchmarkStats {
  readonly count: number;
  readonly avgLatency: number;
  readonly minLatency: number;
  readonly maxLatency: number;
  readonly avgMemory: number | null;
  readonly positiveCount: number;
  readonly negativeCount: number;
  readonly neutralCount: number;
  readonly accuracy: number | null;
}

export interface PlaygroundResult {
  readonly label: SentimentLabel;
  readonly score: number;
  readonly time_ms: number;
  readonly memory_mb: number | null;
}

// ─── Export ──────────────────────────────────────────────────────────────────

export interface ExportRow {
  readonly model_id: string;
  readonly dataset_id: string;
  readonly sample_id: string;
  readonly language: string;
  readonly input_len: number;
  readonly label: string;
  readonly score: number;
  readonly time_ms: number;
  readonly memory_mb: number | null;
  readonly timestamp: number;
}

// ─── Tab routing ─────────────────────────────────────────────────────────────

export type AppTab = "playground" | "benchmark";
