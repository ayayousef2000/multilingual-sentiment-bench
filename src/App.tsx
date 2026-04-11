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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100dvh",
          background: "var(--color-background-tertiary)",
        }}
      >
        <Header activeTab={activeTab} onTabChange={setActiveTab} />

        <main
          style={{
            flex: 1,
            padding: "24px",
            maxWidth: "960px",
            width: "100%",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Playground panel */}
          <div
            role="tabpanel"
            id="panel-playground"
            aria-labelledby="tab-playground"
            hidden={activeTab !== "playground"}
          >
            <ErrorBoundary label="PlaygroundView">
              <PlaygroundView />
            </ErrorBoundary>
          </div>

          {/* Benchmark panel */}
          <div
            role="tabpanel"
            id="panel-benchmark"
            aria-labelledby="tab-benchmark"
            hidden={activeTab !== "benchmark"}
          >
            <ErrorBoundary label="BenchmarkView">
              <BenchmarkView />
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </ClassifierProvider>
  );
}
