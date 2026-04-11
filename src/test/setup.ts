/**
 * Vitest global test setup.
 *
 * Runs before every test file. Add global mocks, polyfills,
 * and custom matchers here.
 */

import "@testing-library/jest-dom";
import { afterEach, beforeAll, vi } from "vitest";

// ── Web Worker mock ───────────────────────────────────────────────────────────
// jsdom does not support Web Workers. We replace the global with a no-op
// class so unit tests of hooks and components don't throw on instantiation.
// Integration/e2e tests should use a real browser environment (Playwright).

class MockWorker implements Worker {
  onmessage: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
  onmessageerror: ((this: Worker, ev: MessageEvent) => unknown) | null = null;
  onerror: ((this: AbstractWorker, ev: ErrorEvent) => unknown) | null = null;

  private _listeners: Map<string, EventListenerOrEventListenerObject[]> = new Map();

  postMessage(_data: unknown, _transfer?: Transferable[]): void {
    // No-op in tests — override per test with vi.spyOn or subclass
  }

  terminate(): void {
    /* no-op */
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    if (!this._listeners.has(type)) this._listeners.set(type, []);
    this._listeners.get(type)?.push(listener);
  }

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {
    const list = this._listeners.get(type);
    if (list) {
      const idx = list.indexOf(listener);
      if (idx > -1) list.splice(idx, 1);
    }
  }

  dispatchEvent(event: Event): boolean {
    const list = this._listeners.get(event.type);
    list?.forEach((l) => {
      if (typeof l === "function") l(event);
      else l.handleEvent(event);
    });
    return true;
  }
}

vi.stubGlobal("Worker", MockWorker);

// ── ResizeObserver stub ───────────────────────────────────────────────────────
// Required by Recharts (used in BenchmarkChart).

beforeAll(() => {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});
