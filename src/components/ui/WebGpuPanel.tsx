import { useClassifierContext } from "@/context/ClassifierContext";
import type { WebGpuState } from "@/types";

function GpuIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="1" y="3" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="3.5" y="5.5" width="4" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.1" />
      <line
        x1="3"
        y1="12"
        x2="3"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="7.5"
        y1="12"
        x2="7.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M2 5.5L4.5 8L9 3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
      <path
        d="M2.5 2.5L8.5 8.5M8.5 2.5L2.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatusBadge({ state, blockedByDtype }: { state: WebGpuState; blockedByDtype: boolean }) {
  if (state.status === "checking") {
    return (
      <span
        role="status"
        className="webgpu-badge webgpu-badge--checking"
        aria-label="Checking WebGPU support"
      >
        <span className="webgpu-spinner" aria-hidden="true" />
        Checking…
      </span>
    );
  }
  if (state.status === "unsupported") {
    return (
      <span
        role="status"
        className="webgpu-badge webgpu-badge--unsupported"
        aria-label="WebGPU not supported"
      >
        <CrossIcon />
        Not supported
      </span>
    );
  }
  if (blockedByDtype) {
    return (
      <span
        role="status"
        className="webgpu-badge webgpu-badge--unsupported"
        aria-label="WebGPU unavailable for this model"
      >
        <CrossIcon />
        INT8 — unavailable
      </span>
    );
  }
  return (
    <span
      role="status"
      className={`webgpu-badge ${state.enabled ? "webgpu-badge--active" : "webgpu-badge--supported"}`}
      aria-label="WebGPU supported"
    >
      <CheckIcon />
      GPU Supported ✓
    </span>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
  id: string;
}

function Toggle({ checked, onChange, disabled, id }: ToggleProps) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      className={`webgpu-toggle ${checked ? "webgpu-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      aria-label={checked ? "Disable WebGPU" : "Enable WebGPU"}
    >
      <span className="webgpu-toggle-thumb" aria-hidden="true" />
    </button>
  );
}

export function WebGpuPanel() {
  const { webGpu, setWebGpuEnabled, loadState, webGpuBlockedByDtype } = useClassifierContext();
  const isLoading = loadState.status === "loading";

  let description: string;
  if (webGpu.status === "checking") {
    description = "Detecting GPU capabilities…";
  } else if (webGpu.status === "unsupported") {
    description = "Your browser or device doesn't support WebGPU. Inference will use WebAssembly.";
  } else if (webGpuBlockedByDtype) {
    description =
      "INT8 quantized models are not supported on WebGPU. Switch to an FP32 model to enable GPU acceleration.";
  } else if (webGpu.enabled) {
    description = "Running inference on GPU. Toggle off to switch back to WebAssembly.";
  } else {
    description = "Enable to run model inference on the GPU for faster results.";
  }

  const showToggle = webGpu.status === "supported" && !webGpuBlockedByDtype;

  return (
    <div className="webgpu-panel">
      <div className="webgpu-panel-header">
        <span className="webgpu-panel-icon">
          <GpuIcon />
        </span>
        <span className="webgpu-panel-title">WebGPU</span>
        <StatusBadge state={webGpu} blockedByDtype={webGpuBlockedByDtype} />
      </div>

      <p className="webgpu-panel-desc">{description}</p>

      {showToggle && (
        <div className="webgpu-toggle-row">
          <label
            htmlFor="webgpu-toggle"
            className={`webgpu-toggle-label ${isLoading ? "webgpu-toggle-label--muted" : ""}`}
          >
            {webGpu.enabled ? "GPU acceleration on" : "Enable GPU acceleration"}
            {isLoading && <span className="webgpu-reload-hint"> — reloading model…</span>}
          </label>
          <Toggle
            id="webgpu-toggle"
            checked={webGpu.enabled}
            onChange={setWebGpuEnabled}
            disabled={isLoading}
          />
        </div>
      )}
    </div>
  );
}
