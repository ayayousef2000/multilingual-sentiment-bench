import type { AppTab } from "@/types";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    // FIX: <header> already has an implicit "banner" landmark role — the explicit
    // role="banner" attribute is redundant and Biome flags it as assigning a
    // non-interactive role to an interactive element.
    <header className="app-header">
      {/* Brand — left */}
      <div className="header-brand">
        {/* aria-hidden hides the decorative logo SVG from assistive tech */}
        <div className="header-brand-logo" aria-hidden="true">
          {/* FIX: SVG is inside an aria-hidden container so it needs no <title>.
              Adding focusable="false" prevents IE/Edge from focusing it. */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="9" cy="9" r="6" stroke="#00e5c0" strokeWidth="1.5" />
            <circle cx="9" cy="9" r="2.5" fill="#00e5c0" />
          </svg>
        </div>
        <div className="header-brand-name">
          Sentiment<span>Bench</span>
          <span className="header-brand-sub">multilingual</span>
        </div>
      </div>

      {/* Tabs — absolutely centered in the header */}
      {/* FIX: <nav> is a landmark element and must not carry role="tablist"
          (non-interactive → interactive is forbidden). Use a plain <div>
          with role="tablist" instead so the ARIA pattern is valid. */}
      <div className="header-tabs" role="tablist" aria-label="Application sections">
        <button
          type="button"
          className={`header-tab${activeTab === "playground" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "playground"}
          onClick={() => onTabChange("playground")}
        >
          <span className="tab-icon" aria-hidden="true">
            ⚡
          </span>
          Playground
        </button>
        <button
          type="button"
          className={`header-tab${activeTab === "benchmark" ? " active" : ""}`}
          role="tab"
          aria-selected={activeTab === "benchmark"}
          onClick={() => onTabChange("benchmark")}
        >
          <span className="tab-icon" aria-hidden="true">
            ⊞
          </span>
          Benchmark Lab
        </button>
      </div>

      {/* Status — right */}
      {/* FIX: A plain <div> does not support aria-label. Wrap the status text
          in a <section> or use an aria-label-compatible role. Using role="status"
          is the simplest correct choice here — it also live-announces updates. */}
      <div className="header-status" role="status" aria-label="Runtime status">
        <span className="header-status-dot" aria-hidden="true" />
        In-Browser · WebWorker
      </div>
    </header>
  );
}
