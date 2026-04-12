export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
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
  readonly requestId?: string;
}

export type WorkerOutbound =
  | WorkerOutboundReady
  | WorkerOutboundProgress
  | WorkerOutboundResult
  | WorkerOutboundError;

export type WorkerMessageType = WorkerOutbound["type"];

export interface BenchmarkSample {
  readonly id: string;
  readonly text: string;
  readonly language: string;
  /**
   * Expected sentiment label. Accepted from both the canonical "expected"
   * field and the flat-array "ground_truth" field used in uploaded datasets.
   */
  readonly expected?: SentimentLabel;
}

export interface BenchmarkDataset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly language: string;
  readonly samples: readonly BenchmarkSample[];
}

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
  readonly input_text: string;
  readonly language: string;
  readonly timestamp: number;
  readonly expected: SentimentLabel | null;
}

export interface BenchmarkRunState {
  readonly isRunning: boolean;
  readonly currentIdx: number;
  readonly total: number;
  readonly datasetId: string | null;
  readonly datasetName: string | null;
  readonly modelId: string | null;
  /** UUID generated once per benchmark run — used to group rows in CSV export. */
  readonly runId: string | null;
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

export interface ExportRow {
  /** UUID that groups all rows from the same benchmark run. */
  readonly run_id: string;
  /** Application version string for downstream tracking. */
  readonly app_version: string;
  readonly model_id: string;
  readonly model_name: string;
  readonly dataset_id: string;
  readonly dataset_name: string;
  readonly sample_id: string;
  readonly language: string;
  readonly input_text: string;
  readonly input_len: number;
  readonly expected: string | null;
  readonly label: string;
  readonly is_correct: boolean | null;
  readonly score: number;
  readonly score_pct: number;
  readonly time_ms: number;
  readonly memory_mb: number | null;
  readonly timestamp: number;
  readonly iso_datetime: string;
}

export type AppTab = "playground" | "benchmark";
