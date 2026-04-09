import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelLoadState, PlaygroundResult, WorkerInbound, WorkerOutbound } from "@/types";

type PendingResolve = (result: PlaygroundResult) => void;
type PendingReject = (err: Error) => void;

export function useClassifier() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, { resolve: PendingResolve; reject: PendingReject }>>(
    new Map()
  );

  const [loadState, setLoadState] = useState<ModelLoadState>({
    status: "idle",
    progress: 0,
    statusText: "",
  });

  const [currentModelId, setCurrentModelId] = useState<string | null>(null);

  // ── Spawn worker once ────────────────────────────────────────────────────────
  useEffect(() => {
    const worker = new Worker(new URL("../workers/classifier.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      const msg = event.data;

      switch (msg.type) {
        case "PROGRESS":
          setLoadState({
            status: "loading",
            progress: msg.progress,
            statusText: msg.status,
          });
          break;

        case "MODEL_READY":
          setLoadState({ status: "ready", progress: 100, statusText: "Model ready" });
          break;

        case "CLASSIFICATION_RESULT": {
          const pending = pendingRef.current.get(msg.id);
          if (pending) {
            pending.resolve({
              label: msg.label,
              score: msg.score,
              time_ms: msg.time_ms,
              memory_mb: msg.memory_mb,
            });
            pendingRef.current.delete(msg.id);
          }
          break;
        }

        case "ERROR": {
          setLoadState((prev) => ({
            ...prev,
            status: "error",
            statusText: msg.message,
          }));
          // Reject all pending
          for (const [id, { reject }] of pendingRef.current) {
            reject(new Error(msg.message));
            pendingRef.current.delete(id);
          }
          break;
        }
      }
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  // ── Load model ───────────────────────────────────────────────────────────────
  const loadModel = useCallback((modelId: string) => {
    if (!workerRef.current) return;
    setCurrentModelId(modelId);
    setLoadState({ status: "loading", progress: 0, statusText: "Initializing…" });
    const msg: WorkerInbound = { type: "LOAD_MODEL", modelId };
    workerRef.current.postMessage(msg);
  }, []);

  // ── Classify ─────────────────────────────────────────────────────────────────
  const classify = useCallback((text: string, modelId: string): Promise<PlaygroundResult> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error("Worker not initialised"));
        return;
      }
      const id = `${Date.now()}-${Math.random()}`;
      pendingRef.current.set(id, { resolve, reject });
      const msg: WorkerInbound = { type: "CLASSIFY", id, text, modelId };
      workerRef.current.postMessage(msg);
    });
  }, []);

  return { loadModel, classify, loadState, currentModelId };
}
