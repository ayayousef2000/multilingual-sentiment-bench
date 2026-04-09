// ─── Model Types ─────────────────────────────────────────────────────────────

export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  languages: string[];
  size: "small" | "medium" | "large";
  task: "sentiment-analysis" | "text-classification";
}

// ─── Worker Message Types ─────────────────────────────────────────────────────

export type WorkerMessageType =
  | "LOAD_MODEL"
  | "CLASSIFY"
  | "MODEL_READY"
  | "CLASSIFICATION_RESULT"
  | "PROGRESS"
  | "ERROR";

export interface WorkerInboundLoad {
  type: "LOAD_MODEL";
  modelId: string;
}

export interface WorkerInboundClassify {
  type: "CLASSIFY";
  id: string;
  text: string;
  modelId: string;
}

export type WorkerInbound = WorkerInboundLoad | WorkerInboundClassify;

export interface WorkerOutboundReady {
  type: "MODEL_READY";
  modelId: string;
}

export interface WorkerOutboundProgress {
  type: "PROGRESS";
  modelId: string;
  progress: number;
  status: string;
}

export interface WorkerOutboundResult {
  type: "CLASSIFICATION_RESULT";
  id: string;
  label: SentimentLabel;
  score: number;
  time_ms: number;
  memory_mb: number | null;
}

export interface WorkerOutboundError {
  type: "ERROR";
  message: string;
  modelId?: string;
}

export type WorkerOutbound =
  | WorkerOutboundReady
  | WorkerOutboundProgress
  | WorkerOutboundResult
  | WorkerOutboundError;

// ─── Benchmark Types ──────────────────────────────────────────────────────────

export interface BenchmarkSample {
  id: string;
  text: string;
  language: string;
  expected?: SentimentLabel;
}

export interface BenchmarkDataset {
  id: string;
  name: string;
  description: string;
  language: string;
  samples: BenchmarkSample[];
}

export interface BenchmarkResult {
  id: string;
  sample_id: string;
  model_id: string;
  dataset_id: string;
  label: SentimentLabel;
  score: number;
  time_ms: number;
  memory_mb: number | null;
  input_len: number;
  language: string;
  timestamp: number;
}

export interface BenchmarkRunState {
  isRunning: boolean;
  currentIdx: number;
  total: number;
  datasetId: string | null;
  modelId: string | null;
}

export interface BenchmarkStats {
  count: number;
  avgLatency: number;
  minLatency: number;
  maxLatency: number;
  avgMemory: number | null;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  accuracy: number | null;
}

// ─── Playground Types ─────────────────────────────────────────────────────────

export interface PlaygroundResult {
  label: SentimentLabel;
  score: number;
  time_ms: number;
  memory_mb: number | null;
}

export type ModelLoadStatus = "idle" | "loading" | "ready" | "error";

export interface ModelLoadState {
  status: ModelLoadStatus;
  progress: number;
  statusText: string;
}

// ─── Export Types ─────────────────────────────────────────────────────────────

export interface ExportRow {
  model_id: string;
  dataset_id: string;
  sample_id: string;
  language: string;
  input_len: number;
  label: string;
  score: number;
  time_ms: number;
  memory_mb: number | null;
  timestamp: number;
}
