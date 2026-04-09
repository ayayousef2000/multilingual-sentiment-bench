import { useState } from "react";
import { BenchmarkView } from "@/components/layout/BenchmarkView";
import { Header } from "@/components/layout/Header";
import { PlaygroundView } from "@/components/layout/PlaygroundView";
import { useClassifier } from "@/hooks/useClassifier";

export default function App() {
  const [activeTab, setActiveTab] = useState<"playground" | "benchmark">("playground");

  // Single worker shared between both views — avoids double model downloads
  const { loadModel, classify, loadState } = useClassifier();

  return (
    <>
      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={{ flex: 1 }}>
        {activeTab === "playground" ? (
          <PlaygroundView loadState={loadState} onLoadModel={loadModel} classify={classify} />
        ) : (
          <BenchmarkView loadState={loadState} onLoadModel={loadModel} classify={classify} />
        )}
      </main>

      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "var(--space-4) var(--space-6)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: "0.6875rem",
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            letterSpacing: "0.04em",
          }}
        >
          Multilingual Sentiment Bench · Powered by{" "}
          <a
            href="https://huggingface.co/docs/transformers.js"
            target="_blank"
            rel="noreferrer"
            style={{ color: "var(--accent-primary)", textDecoration: "none" }}
          >
            Transformers.js
          </a>{" "}
          · All inference runs locally in your browser
        </p>
      </footer>
    </>
  );
}
