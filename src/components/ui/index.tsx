import type { CSSProperties, ReactNode } from "react";

/* ─── Button ─────────────────────────────────────────────────────────────────── */

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  type?: "button" | "submit" | "reset";
  style?: CSSProperties;
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  type = "button",
  style,
}: ButtonProps) {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    letterSpacing: "0.03em",
    border: "1px solid transparent",
    borderRadius: "var(--radius-md)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition:
      "background var(--duration-fast) var(--ease-default), box-shadow var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default)",
    userSelect: "none",
    whiteSpace: "nowrap",
    ...(size === "sm" && { padding: "5px 12px", fontSize: "0.75rem" }),
    ...(size === "md" && { padding: "8px 18px", fontSize: "0.8125rem" }),
    ...(size === "lg" && { padding: "11px 24px", fontSize: "0.875rem" }),
    ...(variant === "primary" && {
      background: "var(--accent-primary)",
      color: "#0a0b0f",
      borderColor: "var(--accent-primary)",
    }),
    ...(variant === "ghost" && {
      background: "transparent",
      color: "var(--text-secondary)",
      borderColor: "var(--border-default)",
    }),
    ...(variant === "danger" && {
      background: "var(--sentiment-negative-dim)",
      color: "var(--sentiment-negative)",
      borderColor: "var(--sentiment-negative)",
    }),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={base}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (variant === "primary") {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-accent)";
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }
        if (variant === "ghost") {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.boxShadow = "";
        (e.currentTarget as HTMLButtonElement).style.transform = "";
        if (variant === "ghost") {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        }
      }}
    >
      {children}
    </button>
  );
}

/* ─── Badge ──────────────────────────────────────────────────────────────────── */

interface BadgeProps {
  label: string;
  variant?: "positive" | "negative" | "neutral" | "accent" | "muted";
}

export function Badge({ label, variant = "muted" }: BadgeProps) {
  const colors: Record<string, { bg: string; color: string; border: string }> = {
    positive: {
      bg: "var(--sentiment-positive-dim)",
      color: "var(--sentiment-positive)",
      border: "rgba(52,211,153,0.25)",
    },
    negative: {
      bg: "var(--sentiment-negative-dim)",
      color: "var(--sentiment-negative)",
      border: "rgba(248,113,113,0.25)",
    },
    neutral: {
      bg: "var(--sentiment-neutral-dim)",
      color: "var(--sentiment-neutral)",
      border: "rgba(148,163,184,0.25)",
    },
    accent: {
      bg: "var(--accent-primary-dim)",
      color: "var(--accent-primary)",
      border: "rgba(0,229,200,0.25)",
    },
    muted: {
      bg: "rgba(255,255,255,0.04)",
      color: "var(--text-muted)",
      border: "var(--border-subtle)",
    },
  };
  const c = colors[variant];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: "var(--radius-sm)",
        fontSize: "0.6875rem",
        fontWeight: 600,
        fontFamily: "var(--font-display)",
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
      }}
    >
      {label}
    </span>
  );
}

/* ─── ProgressBar ────────────────────────────────────────────────────────────── */

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
  showPercent?: boolean;
  color?: string;
  size?: "sm" | "md";
}

export function ProgressBar({
  value,
  label,
  showPercent = true,
  color = "var(--accent-primary)",
  size = "md",
}: ProgressBarProps) {
  const clamp = Math.max(0, Math.min(100, value));
  const height = size === "sm" ? 3 : 6;

  return (
    <div style={{ width: "100%" }}>
      {(label || showPercent) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: "0.75rem",
            color: "var(--text-secondary)",
          }}
        >
          {label && <span>{label}</span>}
          {showPercent && (
            <span style={{ fontVariantNumeric: "tabular-nums" }}>{clamp.toFixed(0)}%</span>
          )}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height,
          background: "var(--bg-overlay)",
          borderRadius: height,
          overflow: "hidden",
          border: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            width: `${clamp}%`,
            height: "100%",
            background: color,
            borderRadius: height,
            transition: "width 300ms var(--ease-default)",
            boxShadow: clamp > 0 ? `0 0 8px ${color}60` : "none",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────────────────────────── */

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  glow?: boolean;
}

export function Card({ children, style, glow }: CardProps) {
  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-xl)",
        padding: "var(--space-6)",
        boxShadow: glow ? "var(--shadow-accent), var(--shadow-md)" : "var(--shadow-sm)",
        transition: "box-shadow var(--duration-default) var(--ease-default)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Select ─────────────────────────────────────────────────────────────────── */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  disabled?: boolean;
}

export function Select({ value, onChange, options, label, disabled }: SelectProps) {
  const selectId = label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
          }}
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8125rem",
          padding: "8px 32px 8px 12px",
          appearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%238b92a8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 10px center",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          transition: "border-color var(--duration-fast) var(--ease-default)",
          width: "100%",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ─── Spinner ────────────────────────────────────────────────────────────────── */

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `2px solid var(--border-default)`,
        borderTopColor: "var(--accent-primary)",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

/* ─── Stat ───────────────────────────────────────────────────────────────────── */

interface StatProps {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}

export function Stat({ label, value, sub, accent }: StatProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      <span
        style={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontFamily: "var(--font-display)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "1.5rem",
          fontWeight: 700,
          fontFamily: "var(--font-display)",
          color: accent ? "var(--accent-primary)" : "var(--text-primary)",
          lineHeight: 1.1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      {sub && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{sub}</span>}
    </div>
  );
}
