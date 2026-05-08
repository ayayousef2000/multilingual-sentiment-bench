import { env, pipeline, type TextClassificationPipeline } from "@huggingface/transformers";
import { getModelById, normalizeLabel } from "@/lib/models";
import type { WorkerInbound, WorkerOutbound } from "@/types";
import { assertNever } from "@/utils/assert";

// ── Pipeline cache ────────────────────────────────────────────────────────────

let cachedModelId: string | null = null;
let cachedPipeline: TextClassificationPipeline | null = null;
let cachedLoadTimeMs: number | null = null;
let cachedSizeMb: number | null = null;
let cachedUseWebGpu: boolean = false;

// ── Progress callback types ───────────────────────────────────────────────────

interface ProgressCallbackInfo {
  status: string;
  progress?: number;
  file?: string;
  loaded?: number;
  total?: number;
}

async function getPipelineInstance(
  modelId: string,
  useWebGpu: boolean,
  onProgress: (progress: number, statusText: string) => void
): Promise<{
  pipe: TextClassificationPipeline;
  load_time_ms: number;
  model_size_mb: number | null;
}> {
  if (
    cachedPipeline &&
    cachedModelId === modelId &&
    cachedUseWebGpu === useWebGpu &&
    cachedLoadTimeMs !== null
  ) {
    return { pipe: cachedPipeline, load_time_ms: cachedLoadTimeMs, model_size_mb: cachedSizeMb };
  }

  cachedPipeline = null;
  cachedModelId = null;
  cachedLoadTimeMs = null;
  cachedSizeMb = null;
  cachedUseWebGpu = false;

  const modelConfig = getModelById(modelId);
  const task = modelConfig?.task ?? "sentiment-analysis";
  const dtype = modelConfig?.dtype ?? "q8";
  const modelFileName = modelConfig?.onnxFile ?? undefined;
  const repoId = modelConfig?.repoId ?? modelId;

  let maxTotalBytes = 0;

  const loadStart = performance.now();

  if (useWebGpu && env.backends?.onnx?.wasm) {
    env.backends.onnx.wasm.proxy = false;
  }

  const device = useWebGpu ? "webgpu" : "wasm";

  const pipelineOptions: Record<string, unknown> = {
    device,
    dtype,
    ...(modelFileName ? { model_file_name: modelFileName } : {}),
    progress_callback: (info: ProgressCallbackInfo) => {
      if (typeof info.total === "number" && info.total > maxTotalBytes) {
        maxTotalBytes = info.total;
      }

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
          onProgress(-1, `Loading model into ${useWebGpu ? "WebGPU" : "WASM"} runtime…`);
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

  const instance = (await pipeline(
    task,
    repoId,
    pipelineOptions
  )) as unknown as TextClassificationPipeline;

  const load_time_ms = performance.now() - loadStart;
  const model_size_mb =
    maxTotalBytes > 0 ? Math.round((maxTotalBytes / 1_048_576) * 10) / 10 : null;

  cachedPipeline = instance;
  cachedModelId = modelId;
  cachedLoadTimeMs = load_time_ms;
  cachedSizeMb = model_size_mb;
  cachedUseWebGpu = useWebGpu;

  return { pipe: instance, load_time_ms, model_size_mb };
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
        const { load_time_ms, model_size_mb } = await getPipelineInstance(
          msg.modelId,
          msg.useWebGpu,
          (progress, statusText) => {
            const out: WorkerOutbound = {
              type: "PROGRESS",
              modelId: msg.modelId,
              progress: progress === -1 ? -1 : progress / 100,
              status: statusText,
            };
            self.postMessage(out);
          }
        );

        const ready: WorkerOutbound = {
          type: "MODEL_READY",
          modelId: msg.modelId,
          load_time_ms,
          model_size_mb,
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
        const { pipe } = await getPipelineInstance(modelId, cachedUseWebGpu, () => {});

        const t0 = performance.now();
        const raw = await pipe(text);
        const time_ms = performance.now() - t0;

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
