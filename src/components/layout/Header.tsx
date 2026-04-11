import type { AppTab } from "@/types";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="app-header">
      {/* Brand */}
      <div className="header-brand">
        <div className="header-brand-logo">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            role="img"
            aria-label="SentimentBench logo"
          >
            <title>SentimentBench logo</title>
            <circle cx="7" cy="7" r="3" fill="currentColor" opacity="0.8" />
            <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
        <div>
          <span className="header-brand-name">Sentiment Bench</span>
          <span className="header-brand-sub">Multilingual NLP Evaluation</span>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="header-tabs" role="tablist" aria-label="App sections">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "playground"}
          className={`header-tab${activeTab === "playground" ? " active" : ""}`}
          onClick={() => onTabChange("playground")}
        >
          <span className="tab-icon">⚡</span>
          Playground
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "benchmark"}
          className={`header-tab${activeTab === "benchmark" ? " active" : ""}`}
          onClick={() => onTabChange("benchmark")}
        >
          <span className="tab-icon">▦</span>
          Benchmark Lab
        </button>
      </div>

      {/* Status */}
      <div className="header-status">
        <span className="header-status-dot" aria-hidden="true" />
        In-Browser · WebWorker
      </div>
    </header>
  );
}
