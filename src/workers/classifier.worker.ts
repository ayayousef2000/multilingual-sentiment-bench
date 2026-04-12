import { pipeline, type TextClassificationPipeline } from "@huggingface/transformers";
import { normalizeLabel } from "@/lib/models";
import type { WorkerInbound, WorkerOutbound } from "@/types";
import { assertNever } from "@/utils/assert";

// ── Pipeline cache ────────────────────────────────────────────────────────────

let cachedModelId: string | null = null;
let cachedPipeline: TextClassificationPipeline | null = null;

async function getPipelineInstance(
  modelId: string,
  onProgress: (progress: number, status: string) => void
): Promise<TextClassificationPipeline> {
  if (cachedPipeline && cachedModelId === modelId) return cachedPipeline;

  cachedPipeline = null;
  cachedModelId = null;

  // pipeline() with task "sentiment-analysis" always returns TextClassificationPipeline.
  // Double assertion (unknown → TextClassificationPipeline) is required because
  // transformers.js v3 overloads resolve to an overly complex union type when the
  // task is passed as a plain string, making a direct cast fail with ts(2590).
  const instance = (await pipeline("sentiment-analysis", modelId, {
    progress_callback: (info: { progress?: number; status: string }) => {
      onProgress((info.progress ?? 0) / 100, info.status);
    },
  })) as unknown as TextClassificationPipeline;

  cachedPipeline = instance;
  cachedModelId = modelId;
  return instance;
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
        await getPipelineInstance(msg.modelId, (progress, status) => {
          const out: WorkerOutbound = {
            type: "PROGRESS",
            modelId: msg.modelId,
            progress,
            status,
          };
          self.postMessage(out);
        });

        const ready: WorkerOutbound = { type: "MODEL_READY", modelId: msg.modelId };
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
        const classifier = await getPipelineInstance(modelId, () => {});

        const t0 = performance.now();
        const raw = await classifier(text);
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
