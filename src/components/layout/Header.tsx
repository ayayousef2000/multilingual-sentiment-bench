import type { AppTab } from "@/types";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string }[] = [
  { id: "playground", label: "Playground" },
  { id: "benchmark", label: "Benchmark" },
];

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header
      style={{
        borderBottom: "0.5px solid var(--color-border-tertiary)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "52px",
        background: "var(--color-background-primary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Sentiment Bench
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 500,
            padding: "2px 6px",
            borderRadius: "999px",
            background: "var(--color-background-info)",
            color: "var(--color-text-info)",
          }}
        >
          multilingual
        </span>
      </div>

      <nav aria-label="App navigation">
        <div role="tablist" aria-label="Main sections" style={{ display: "flex", gap: "2px" }}>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                style={{
                  padding: "5px 14px",
                  fontSize: "13px",
                  fontWeight: isActive ? 500 : 400,
                  border: "none",
                  borderRadius: "var(--border-radius-md)",
                  background: isActive ? "var(--color-background-secondary)" : "transparent",
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  cursor: "pointer",
                  transition: "background 0.12s, color 0.12s",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
