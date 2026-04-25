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
  modelSizeMb: number | null;
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

  const loadedModelIdRef = useRef<string | null>(null);
  const [loadedModelId, setLoadedModelId] = useState<string | null>(null);

  const loadStartTimeRef = useRef<number | null>(null);
  const [modelLoadTimeMs, setModelLoadTimeMs] = useState<number | null>(null);

  // Actual downloaded size reported by the worker via MODEL_READY
  const [modelSizeMb, setModelSizeMb] = useState<number | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());

  const handleMessage = useCallback((event: MessageEvent<WorkerOutbound>) => {
    const msg = event.data;

    switch (msg.type) {
      case "MODEL_READY": {
        if (loadStartTimeRef.current !== null) {
          setModelLoadTimeMs(performance.now() - loadStartTimeRef.current);
          loadStartTimeRef.current = null;
        }

        // Persist the real downloaded size reported by the worker
        setModelSizeMb(msg.model_size_mb);

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
          const pending = pendingRef.current.get(msg.requestId);
          if (pending) {
            pendingRef.current.delete(msg.requestId);
            pending.reject(new Error(msg.message));
          }
        } else {
          loadStartTimeRef.current = null;
          setLoadState({
            status: "error",
            progress: 0,
            statusText: msg.message,
            error: msg.message,
          });
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

  useEffect(() => {
    const worker = spawnWorker();
    worker.addEventListener("message", handleMessage);
    workerRef.current = worker;

    return () => {
      worker.removeEventListener("message", handleMessage);
      worker.terminate();
      workerRef.current = null;
      loadStartTimeRef.current = null;
      for (const [, req] of pendingRef.current) {
        req.reject(new DOMException("Component unmounted", "AbortError"));
      }
      pendingRef.current.clear();
    };
  }, [handleMessage]);

  const loadModel = useCallback(
    (modelId: string) => {
      if (loadedModelIdRef.current !== null && loadedModelIdRef.current !== modelId) {
        workerRef.current?.removeEventListener("message", handleMessage);
        workerRef.current?.terminate();

        for (const [, req] of pendingRef.current) {
          req.reject(new DOMException("Model switched", "AbortError"));
        }
        pendingRef.current.clear();

        const fresh = spawnWorker();
        fresh.addEventListener("message", handleMessage);
        workerRef.current = fresh;
      }

      loadStartTimeRef.current = performance.now();
      setModelLoadTimeMs(null);
      setModelSizeMb(null); // reset size on each new load attempt

      loadedModelIdRef.current = null;
      setLoadedModelId(null);
      setLoadState({ status: "loading", progress: 0, statusText: "Initialising…" });

      const msg: WorkerInbound = { type: "LOAD_MODEL", modelId };
      workerRef.current?.postMessage(msg);
    },
    [handleMessage]
  );

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

  return { loadState, loadedModelId, modelLoadTimeMs, modelSizeMb, loadModel, classify };
}
