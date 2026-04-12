import { useCallback, useId, useRef, useState } from "react";
import { formatParseError, parseDataset } from "@/lib/parseDataset";
import type { BenchmarkDataset } from "@/types";

interface FileUploadProps {
  onDatasetLoad: (dataset: BenchmarkDataset) => void;
  onError: (msg: string) => void;
  loadedDataset: BenchmarkDataset | null;
}

type UploadState = "empty" | "loading" | "loaded" | "error";

export function FileUpload({ onDatasetLoad, onError, loadedDataset }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>(loadedDataset ? "loaded" : "empty");
  const [fileName, setFileName] = useState<string | null>(loadedDataset ? "dataset loaded" : null);

  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  const processFile = useCallback(
    async (file: File) => {
      setUploadState("loading");
      setFileName(file.name);
      try {
        const text = await file.text();
        const raw: unknown = JSON.parse(text);
        const dataset = parseDataset(raw);
        setUploadState("loaded");
        onDatasetLoad(dataset);
      } catch (err) {
        setUploadState("error");
        onError(formatParseError(err));
      }
    },
    [onDatasetLoad, onError]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const triggerInput = () => inputRef.current?.click();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerInput();
    }
  };

  const isLoaded = uploadState === "loaded";
  const isError = uploadState === "error";
  const isLoading = uploadState === "loading";

  return (
    <div className="file-upload-area">
      <input
        ref={inputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      {isLoaded ? (
        /* ── Loaded state — shows dataset info + replace button ── */
        <div className="file-upload-loaded">
          <span className="file-upload-icon" aria-hidden="true">
            ✓
          </span>
          <span className="file-upload-title">{fileName}</span>
          {loadedDataset && (
            <span className="file-upload-hint">
              {loadedDataset.samples.length} samples · {loadedDataset.language}
            </span>
          )}
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={triggerInput}
            aria-label="Replace dataset file"
          >
            Replace
          </button>
        </div>
      ) : (
        /* ── Drop-zone (empty / error / loading) ── */
        /* FIX: Replace <div role="button"> with a semantic <button>.
           A <button> is keyboard-accessible by default, supports click/Enter/Space
           natively, and removes the need for manual tabIndex + onKeyDown. */
        <button
          type="button"
          id={labelId}
          className={`file-upload-dropzone${isError ? " error" : ""}${isLoading ? " loading" : ""}`}
          onClick={triggerInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onKeyDown={handleKeyDown}
          aria-label={
            isLoading
              ? "Loading dataset…"
              : isError
                ? "Upload failed — click to try again"
                : "Upload a JSON dataset file"
          }
          aria-busy={isLoading}
          disabled={isLoading}
          style={{
            // Reset button defaults so it looks like the original drop-zone
            background: "none",
            border: "none",
            width: "100%",
            cursor: isLoading ? "wait" : "pointer",
            padding: 0,
            textAlign: "center",
          }}
        >
          <span className="file-upload-icon" aria-hidden="true">
            {isLoading ? "⏳" : isError ? "✕" : "↑"}
          </span>
          <span className="file-upload-title">
            {isLoading ? "Loading…" : isError ? "Upload failed" : "Drop JSON or click to upload"}
          </span>
          <span className="file-upload-hint">
            {isLoading
              ? "Parsing dataset…"
              : isError
                ? "Click to try again"
                : "Accepts envelope or flat-array JSON format"}
          </span>
        </button>
      )}
    </div>
  );
}
