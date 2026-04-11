import { useState } from "react";
import { BenchmarkView } from "@/components/layout/BenchmarkView";
import { Header } from "@/components/layout/Header";
import { PlaygroundView } from "@/components/layout/PlaygroundView";
import { ErrorBoundary } from "@/components/ui";
import { ClassifierProvider } from "@/context/ClassifierContext";
import type { AppTab } from "@/types";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("playground");

  return (
    <ClassifierProvider>
      <div className="app-shell">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <ErrorBoundary label="App">
          {activeTab === "playground" ? <PlaygroundView /> : <BenchmarkView />}
        </ErrorBoundary>

        <footer className="app-footer">
          Multilingual Sentiment Bench · Powered by{" "}
          <a href="https://huggingface.co/docs/transformers.js" target="_blank" rel="noreferrer">
            Transformers.js
          </a>
          <span className="footer-sep">·</span>
          All inference runs locally in your browser
        </footer>
      </div>
    </ClassifierProvider>
  );
}
