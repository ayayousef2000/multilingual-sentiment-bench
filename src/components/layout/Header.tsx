interface HeaderProps {
  activeTab: "playground" | "benchmark";
  onTabChange: (tab: "playground" | "benchmark") => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(10, 11, 15, 0.85)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 var(--space-6)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-6)",
        }}
      >
        {/* Logo */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexShrink: 0 }}
        >
          <span style={{ fontSize: "1.25rem" }}>⚗</span>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "0.9375rem",
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              Sentiment<span style={{ color: "var(--accent-primary)" }}>Bench</span>
            </div>
            <div
              style={{
                fontSize: "0.625rem",
                color: "var(--text-muted)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "var(--font-display)",
              }}
            >
              Multilingual NLP Evaluation
            </div>
          </div>
        </div>

        {/* Tabs */}
        <nav
          style={{
            display: "flex",
            gap: "2px",
            background: "var(--bg-elevated)",
            padding: "3px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          {(["playground", "benchmark"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "0.75rem",
                letterSpacing: "0.04em",
                textTransform: "capitalize",
                padding: "5px 16px",
                borderRadius: "calc(var(--radius-md) - 2px)",
                border: "none",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-default)",
                background: activeTab === tab ? "var(--bg-overlay)" : "transparent",
                color: activeTab === tab ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: activeTab === tab ? "var(--shadow-sm)" : "none",
              }}
            >
              {tab === "playground" ? "⚡ Playground" : "📊 Benchmark Lab"}
            </button>
          ))}
        </nav>

        {/* Right badge */}
        <div
          style={{
            fontSize: "0.6875rem",
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "var(--accent-primary)" }}>●</span>{" "}
          <span>In-Browser · WebWorker</span>
        </div>
      </div>
    </header>
  );
}
