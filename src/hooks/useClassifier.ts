import { useCallback, useEffect, useRef, useState } from "react";
import type { ModelLoadState, PlaygroundResult, WorkerInbound, WorkerOutbound } from "@/types";
import { assertNever } from "@/utils/assert";

type PendingResolve = (result: PlaygroundResult) => void;
type PendingReject = (err: Error) => void;

interface PendingRequest {
  resolve: PendingResolve;
  reject: PendingReject;
  signal?: AbortSignal;
}

const INITIAL_LOAD_STATE: ModelLoadState = {
  status: "idle",
  progress: 0,
  statusText: "",
};

export interface UseClassifierReturn {
  loadState: ModelLoadState;
  loadModel: (modelId: string) => void;
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
}

export function useClassifier(): UseClassifierReturn {
  const [loadState, setLoadState] = useState<ModelLoadState>(INITIAL_LOAD_STATE);

  // Worker ref — stable across renders, terminated on unmount
  const workerRef = useRef<Worker | null>(null);

  // Map of in-flight classify requests keyed by request id
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());

  // ── Spawn worker once, clean up on unmount ────────────────────────────────
  useEffect(() => {
    const worker = new Worker(new URL("../workers/classifier.worker.ts", import.meta.url), {
      type: "module",
    });

    worker.onmessage = (event: MessageEvent<WorkerOutbound>) => {
      const msg = event.data;

      switch (msg.type) {
        case "MODEL_READY":
          setLoadState({ status: "ready", progress: 100, statusText: "Ready" });
          break;

        case "PROGRESS":
          setLoadState({
            status: "loading",
            progress: Math.round(msg.progress * 100),
            statusText: msg.status,
          });
          break;

        case "CLASSIFICATION_RESULT": {
          const pending = pendingRef.current.get(msg.id);
          if (!pending) break;
          pendingRef.current.delete(msg.id);

          // Ignore if the caller already aborted
          if (pending.signal?.aborted) {
            pending.reject(new DOMException("Aborted", "AbortError"));
            break;
          }

          pending.resolve({
            label: msg.label,
            score: msg.score,
            time_ms: msg.time_ms,
            memory_mb: msg.memory_mb,
          });
          break;
        }

        case "ERROR": {
          const errorMsg = new Error(msg.message);

          // If a specific request errored, reject only that promise
          if (msg.requestId) {
            const pending = pendingRef.current.get(msg.requestId);
            if (pending) {
              pendingRef.current.delete(msg.requestId);
              pending.reject(errorMsg);
            }
          } else {
            // Global model error — reject all pending requests and mark as errored
            for (const p of pendingRef.current.values()) p.reject(errorMsg);
            pendingRef.current.clear();
            setLoadState((prev) => ({
              ...prev,
              status: "error",
              statusText: msg.message,
              error: msg.message,
            }));
          }
          break;
        }

        default:
          assertNever(msg);
      }
    };

    worker.onerror = (e) => {
      const errorMsg = new Error(e.message ?? "Worker crashed");
      for (const p of pendingRef.current.values()) p.reject(errorMsg);
      pendingRef.current.clear();
      setLoadState({
        status: "error",
        progress: 0,
        statusText: "Worker crashed",
        error: e.message,
      });
    };

    workerRef.current = worker;

    return () => {
      // Reject all in-flight requests before terminating
      for (const p of pendingRef.current.values()) {
        p.reject(new DOMException("Worker terminated", "AbortError"));
      }
      pendingRef.current.clear();
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // ── Load model ────────────────────────────────────────────────────────────
  const loadModel = useCallback((modelId: string) => {
    const worker = workerRef.current;
    if (!worker) return;

    setLoadState({ status: "loading", progress: 0, statusText: "Initialising…" });

    const msg: WorkerInbound = { type: "LOAD_MODEL", modelId };
    worker.postMessage(msg);
  }, []);

  // ── Classify ──────────────────────────────────────────────────────────────
  const classify = useCallback(
    (text: string, modelId: string, signal?: AbortSignal): Promise<PlaygroundResult> => {
      return new Promise<PlaygroundResult>((resolve, reject) => {
        const worker = workerRef.current;
        if (!worker) {
          reject(new Error("Worker not available"));
          return;
        }

        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        pendingRef.current.set(id, { resolve, reject, signal });

        // Auto-reject if the caller aborts before the worker responds
        signal?.addEventListener(
          "abort",
          () => {
            if (pendingRef.current.has(id)) {
              pendingRef.current.delete(id);
              reject(new DOMException("Aborted", "AbortError"));
            }
          },
          { once: true }
        );

        const msg: WorkerInbound = { type: "CLASSIFY", id, text, modelId };
        worker.postMessage(msg);
      });
    },
    []
  );

  return { loadState, loadModel, classify };
}
