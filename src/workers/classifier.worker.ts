import { pipeline, type TextClassificationPipeline } from "@huggingface/transformers";
import { getModelById, normalizeLabel } from "@/lib/models";
import type { WorkerInbound, WorkerOutbound } from "@/types";
import { assertNever } from "@/utils/assert";

// ── Pipeline cache ────────────────────────────────────────────────────────────

let cachedModelId: string | null = null;
let cachedPipeline: TextClassificationPipeline | null = null;
let cachedLoadTimeMs: number | null = null;

// ── Progress callback types ───────────────────────────────────────────────────

interface ProgressCallbackInfo {
  status: string;
  progress?: number; // 0–100 or undefined when content-length is absent
  file?: string; // filename being downloaded
  loaded?: number;
  total?: number;
}

async function getPipelineInstance(
  modelId: string,
  onProgress: (progress: number, statusText: string) => void
): Promise<{ pipe: TextClassificationPipeline; load_time_ms: number }> {
  if (cachedPipeline && cachedModelId === modelId && cachedLoadTimeMs !== null) {
    return { pipe: cachedPipeline, load_time_ms: cachedLoadTimeMs };
  }

  cachedPipeline = null;
  cachedModelId = null;
  cachedLoadTimeMs = null;

  // ── Resolve task and ONNX path from model registry ───────────────────────
  const modelConfig = getModelById(modelId);
  const task = modelConfig?.task ?? "sentiment-analysis";

  // FIX: transformers.js defaults to looking for ONNX files inside an `onnx/`
  // subfolder (e.g. onnx/model_quantized.onnx). The thesis model repo has
  // model_quantized.onnx at the REPO ROOT, not inside an onnx/ directory.
  // The `model_file_name` option overrides the resolved path so transformers.js
  // fetches the correct file directly from the root.
  const modelFileName = modelConfig?.onnxFile ?? undefined;

  const loadStart = performance.now(); // thesis Chapter 4: start load timer

  const pipelineOptions: Record<string, unknown> = {
    device: "wasm",
    dtype: "q8",
    ...(modelFileName ? { model_file_name: modelFileName } : {}),
    progress_callback: (info: ProgressCallbackInfo) => {
      switch (info.status) {
        case "initiate":
          onProgress(-1, `Fetching ${info.file ?? "model files"}…`);
          break;

        case "download":
        case "downloading": {
          if (typeof info.progress === "number") {
            const pct = Math.min(100, Math.max(0, info.progress));
            onProgress(pct, `Downloading ${info.file ?? "model"} — ${pct.toFixed(0)}%`);
          } else {
            onProgress(-1, `Downloading ${info.file ?? "model"}…`);
          }
          break;
        }

        case "progress": {
          if (typeof info.progress === "number") {
            const pct = Math.min(100, Math.max(0, info.progress));
            onProgress(pct, `Loading ${info.file ?? "model"} — ${pct.toFixed(0)}%`);
          } else {
            onProgress(-1, `Loading ${info.file ?? "model"}…`);
          }
          break;
        }

        case "loading":
          onProgress(-1, "Loading model into WASM runtime…");
          break;

        case "loaded":
          onProgress(100, "Model loaded — initialising pipeline…");
          break;

        case "ready":
          onProgress(100, "Pipeline ready.");
          break;

        default:
          onProgress(-1, info.status);
          break;
      }
    },
  };

  // Double assertion required: transformers.js v3 pipeline() overloads resolve
  // to a complex union type when task is a runtime string — ts(2590).
  const instance = (await pipeline(
    task,
    modelId,
    pipelineOptions
  )) as unknown as TextClassificationPipeline;

  const load_time_ms = performance.now() - loadStart; // thesis Chapter 4: end load timer

  cachedPipeline = instance;
  cachedModelId = modelId;
  cachedLoadTimeMs = load_time_ms;

  return { pipe: instance, load_time_ms };
}

// ── Memory helper ─────────────────────────────────────────────────────────────

function getMemoryMB(): number | null {
  // @ts-expect-error — non-standard but available in Chromium workers
  const mem = performance?.memory;
  if (!mem) return null;
  return Math.round(mem.usedJSHeapSize / 1_048_576);
}

// ── Message dispatch ──────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;

  switch (msg.type) {
    case "LOAD_MODEL": {
      try {
        const { load_time_ms } = await getPipelineInstance(msg.modelId, (progress, statusText) => {
          const out: WorkerOutbound = {
            type: "PROGRESS",
            modelId: msg.modelId,
            // Normalise to 0–1 fraction for the host, preserving -1 as the
            // indeterminate sentinel so ProgressBar renders an animated shimmer
            progress: progress === -1 ? -1 : progress / 100,
            status: statusText,
          };
          self.postMessage(out);
        });

        // thesis Chapter 4: emit load_time_ms in MODEL_READY for display + CSV
        const ready: WorkerOutbound = {
          type: "MODEL_READY",
          modelId: msg.modelId,
          load_time_ms,
        };
        self.postMessage(ready);
      } catch (err) {
        const error: WorkerOutbound = {
          type: "ERROR",
          message: err instanceof Error ? err.message : String(err),
          modelId: msg.modelId,
        };
        self.postMessage(error);
      }
      break;
    }

    case "CLASSIFY": {
      const { id, text, modelId } = msg;
      try {
        const { pipe } = await getPipelineInstance(modelId, () => {});

        const t0 = performance.now();
        const raw = await pipe(text);
        const time_ms = performance.now() - t0;

        // Transformers.js returns an array; take the top result
        const top = Array.isArray(raw) ? raw[0] : raw;

        const result: WorkerOutbound = {
          type: "CLASSIFICATION_RESULT",
          id,
          label: normalizeLabel((top as { label: string }).label),
          score: (top as { score: number }).score,
          time_ms,
          memory_mb: getMemoryMB(),
        };
        self.postMessage(result);
      } catch (err) {
        const error: WorkerOutbound = {
          type: "ERROR",
          message: err instanceof Error ? err.message : String(err),
          requestId: id,
        };
        self.postMessage(error);
      }
      break;
    }

    default:
      assertNever(msg);
  }
};
