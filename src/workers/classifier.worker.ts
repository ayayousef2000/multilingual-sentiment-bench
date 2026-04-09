import { pipeline } from "@huggingface/transformers";
import { normalizeLabel } from "@/lib/models";
import type { WorkerInbound, WorkerOutbound } from "@/types";

// ─── Types ─────────────────────────────────────────────────────────────────────

type PipelineInstance = Awaited<ReturnType<typeof pipeline>>;

// ─── Singleton Pipeline Cache ──────────────────────────────────────────────────

const pipelineInstances = new Map<string, PipelineInstance>();
const pipelineLoading = new Map<string, Promise<PipelineInstance>>();

async function getPipelineInstance(
  modelId: string,
  onProgress: (progress: number, status: string) => void
): Promise<PipelineInstance> {
  if (pipelineInstances.has(modelId)) {
    return pipelineInstances.get(modelId) as PipelineInstance;
  }

  if (pipelineLoading.has(modelId)) {
    return pipelineLoading.get(modelId) as Promise<PipelineInstance>;
  }

  const loadPromise = pipeline("sentiment-analysis", modelId, {
    progress_callback: (info: { status: string; progress?: number; file?: string }) => {
      if (info.status === "downloading" || info.status === "loading") {
        onProgress(info.progress ?? 0, `${info.status} ${info.file ?? ""}`.trim());
      }
      if (info.status === "ready") {
        onProgress(100, "ready");
      }
    },
  }) as Promise<PipelineInstance>;

  pipelineLoading.set(modelId, loadPromise);

  try {
    const instance = await loadPromise;
    pipelineInstances.set(modelId, instance);
    pipelineLoading.delete(modelId);
    return instance;
  } catch (err) {
    pipelineLoading.delete(modelId);
    throw err;
  }
}

// ─── Memory Helper ─────────────────────────────────────────────────────────────

function getMemoryMB(): number | null {
  if ("memory" in performance) {
    // @ts-expect-error — non-standard Chrome API
    return performance.memory.usedJSHeapSize / 1024 / 1024 ?? null;
  }
  return null;
}

// ─── Message Handler ───────────────────────────────────────────────────────────

self.onmessage = async (event: MessageEvent<WorkerInbound>) => {
  const msg = event.data;

  if (msg.type === "LOAD_MODEL") {
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
        message: err instanceof Error ? err.message : "Unknown error loading model",
        modelId: msg.modelId,
      };
      self.postMessage(error);
    }
    return;
  }

  if (msg.type === "CLASSIFY") {
    try {
      const classifier = await getPipelineInstance(msg.modelId, () => {});

      const memBefore = getMemoryMB();
      const t0 = performance.now();
      const raw = await classifier(msg.text, { topk: 1 });
      const time_ms = performance.now() - t0;
      const memAfter = getMemoryMB();

      const memory_mb =
        memBefore !== null && memAfter !== null ? Math.max(0, memAfter - memBefore) : null;

      const result = Array.isArray(raw) ? raw[0] : raw;
      const item = Array.isArray(result) ? result[0] : result;

      const out: WorkerOutbound = {
        type: "CLASSIFICATION_RESULT",
        id: msg.id,
        label: normalizeLabel((item as { label: string }).label),
        score: (item as { score: number }).score,
        time_ms,
        memory_mb,
      };
      self.postMessage(out);
    } catch (err) {
      const error: WorkerOutbound = {
        type: "ERROR",
        message: err instanceof Error ? err.message : "Classification failed",
      };
      self.postMessage(error);
    }
  }
};
