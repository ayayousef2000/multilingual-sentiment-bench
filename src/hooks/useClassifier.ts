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

export interface UseClassifierReturn {
  loadState: ModelLoadState;
  loadedModelId: string | null;
  modelLoadTimeMs: number | null;
  loadModel: (modelId: string) => void;
  classify: (text: string, modelId: string, signal?: AbortSignal) => Promise<PlaygroundResult>;
}

const IDLE_STATE: ModelLoadState = {
  status: "idle",
  progress: 0,
  statusText: "",
};

function spawnWorker(): Worker {
  return new Worker(new URL("../workers/classifier.worker.ts", import.meta.url), {
    type: "module",
  });
}

export function useClassifier(): UseClassifierReturn {
  const [loadState, setLoadState] = useState<ModelLoadState>(IDLE_STATE);

  // The model ID that has been successfully loaded and is ready in the worker
  const loadedModelIdRef = useRef<string | null>(null);
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);

  // Tracks total wall-clock time for the model load phase (LOAD_MODEL → MODEL_READY)
  const loadStartTimeRef = useRef<number | null>(null);
  const [modelLoadTimeMs, setModelLoadTimeMs] = useState<number | null>(null);

  // Worker ref — stable, replaced on model switch
  const workerRef = useRef<Worker | null>(null);

  // Map of in-flight classify requests keyed by request id
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());

  // ── Message handler (defined once, re-used across worker instances) ─────────
  const handleMessage = useCallback((event: MessageEvent<WorkerOutbound>) => {
    const msg = event.data;

    switch (msg.type) {
      case "MODEL_READY": {
        // Compute wall-clock load duration from the moment LOAD_MODEL was dispatched
        if (loadStartTimeRef.current !== null) {
          setModelLoadTimeMs(performance.now() - loadStartTimeRef.current);
          loadStartTimeRef.current = null;
        }

        loadedModelIdRef.current = msg.modelId;
        setLoadedModelId(msg.modelId);
        setLoadState({ status: "ready", progress: 100, statusText: "Model ready" });
        break;
      }
      case "PROGRESS": {
        setLoadState({
          status: "loading",
          progress: msg.progress,
          statusText: msg.status,
        });
        break;
      }
      case "CLASSIFICATION_RESULT": {
        const pending = pendingRef.current.get(msg.id);
        if (!pending) break;
        pendingRef.current.delete(msg.id);
        if (pending.signal?.aborted) {
          pending.reject(new DOMException("Aborted", "AbortError"));
        } else {
          pending.resolve({
            label: msg.label,
            score: msg.score,
            time_ms: msg.time_ms,
            memory_mb: msg.memory_mb,
          });
        }
        break;
      }
      case "ERROR": {
        if (msg.requestId) {
          // Per-request error — reject only the affected promise
          const pending = pendingRef.current.get(msg.requestId);
          if (pending) {
            pendingRef.current.delete(msg.requestId);
            pending.reject(new Error(msg.message));
          }
        } else {
          // Model-level error — clear the load timer so it doesn't bleed into a retry
          loadStartTimeRef.current = null;

          setLoadState({
            status: "error",
            progress: 0,
            statusText: msg.message,
            error: msg.message,
          });
          // Reject all pending requests
          for (const [id, req] of pendingRef.current) {
            req.reject(new Error(msg.message));
            pendingRef.current.delete(id);
          }
        }
        break;
      }
      default:
        assertNever(msg);
    }
  }, []);

  // ── Spawn worker once, clean up on unmount ────────────────────────────────
  useEffect(() => {
    const worker = spawnWorker();
    worker.addEventListener("message", handleMessage);
    workerRef.current = worker;

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
      loadStartTimeRef.current = null;
      // Reject any pending requests on unmount
      for (const [, req] of pendingRef.current) {
        req.reject(new DOMException("Component unmounted", "AbortError"));
      }
      pendingRef.current.clear();
    };
  }, [handleMessage]);

  // ── Load model ────────────────────────────────────────────────────────────
  const loadModel = useCallback(
    (modelId: string) => {
      // If switching to a different model, terminate the current worker and spawn a fresh one
      if (loadedModelIdRef.current !== null && loadedModelIdRef.current !== modelId) {
        workerRef.current?.removeEventListener("message", handleMessage);
        workerRef.current?.terminate();

        // Reject all pending requests from the previous model
        for (const [, req] of pendingRef.current) {
          req.reject(new DOMException("Model switched", "AbortError"));
        }
        pendingRef.current.clear();

        const fresh = spawnWorker();
        fresh.addEventListener("message", handleMessage);
        workerRef.current = fresh;
      }

      // Reset load-time tracking for this new load attempt
      loadStartTimeRef.current = performance.now();
      setModelLoadTimeMs(null);

      loadedModelIdRef.current = null;
      setLoadedModelId(null);
      setLoadState({ status: "loading", progress: 0, statusText: "Initialising…" });

      const msg: WorkerInbound = { type: "LOAD_MODEL", modelId };
      workerRef.current?.postMessage(msg);
    },
    [handleMessage]
  );

  // ── Classify ──────────────────────────────────────────────────────────────
  const classify = useCallback(
    (text: string, modelId: string, signal?: AbortSignal): Promise<PlaygroundResult> => {
      return new Promise<PlaygroundResult>((resolve, reject) => {
        if (signal?.aborted) {
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }

        const id = `req-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        pendingRef.current.set(id, { resolve, reject, signal });

        signal?.addEventListener("abort", () => {
          const pending = pendingRef.current.get(id);
          if (pending) {
            pendingRef.current.delete(id);
            reject(new DOMException("Aborted", "AbortError"));
          }
        });

        const msg: WorkerInbound = { type: "CLASSIFY", id, text, modelId };
        workerRef.current?.postMessage(msg);
      });
    },
    []
  );

  return { loadState, loadedModelId, modelLoadTimeMs, loadModel, classify };
}
