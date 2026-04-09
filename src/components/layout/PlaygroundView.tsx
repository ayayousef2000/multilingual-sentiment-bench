import { useState } from "react";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { ModelLoadState, PlaygroundResult } from "@/types";
import { ModelLoader } from "../playground/ModelLoader";
import { ResultCard } from "../playground/ResultCard";
import { TextInput } from "../playground/TextInput";

interface PlaygroundViewProps {
  loadState: ModelLoadState;
  onLoadModel: (modelId: string) => void;
  classify: (text: string, modelId: string) => Promise<PlaygroundResult>;
}

export function PlaygroundView({ loadState, onLoadModel, classify }: PlaygroundViewProps) {
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_MODEL_ID);
  const [result, setResult] = useState<PlaygroundResult | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);

  const handleClassify = async (text: string) => {
    setIsClassifying(true);
    try {
      const res = await classify(text, selectedModelId);
      setResult(res);
    } catch (err) {
      console.error("Classification failed:", err);
    } finally {
      setIsClassifying(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "var(--space-8) var(--space-6)",
        display: "grid",
        gridTemplateColumns: "320px 1fr",
        gap: "var(--space-6)",
        alignItems: "start",
      }}
    >
      {/* Left sidebar */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          position: "sticky",
          top: 76,
        }}
      >
        <ModelLoader
          selectedModelId={selectedModelId}
          loadState={loadState}
          onModelChange={(id) => {
            setSelectedModelId(id);
            setResult(null);
          }}
          onLoad={() => onLoadModel(selectedModelId)}
        />
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* Hero */}
        <div style={{ marginBottom: "var(--space-2)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "clamp(1.5rem, 3vw, 2.25rem)",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
              lineHeight: 1.1,
              marginBottom: "var(--space-2)",
            }}
          >
            Interactive <span style={{ color: "var(--accent-primary)" }}>Playground</span>
          </h1>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", maxWidth: 540 }}>
            Classify sentiment across 100+ languages directly in your browser. Zero server latency —
            all inference runs in a Web Worker.
          </p>
        </div>

        <TextInput
          onClassify={handleClassify}
          isLoading={isClassifying}
          isModelReady={loadState.status === "ready"}
        />

        <ResultCard result={result} isLoading={isClassifying} />
      </div>
    </div>
  );
}
