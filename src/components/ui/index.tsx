/**
 * Primitive UI components.
 *
 * Each component is a focused, accessible building block.
 * All interactive elements meet WCAG 2.2 AA requirements.
 */

import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

// ─── Button ───────────────────────────────────────────────────────────────────

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const BUTTON_BASE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  fontFamily: "inherit",
  fontWeight: 500,
  borderRadius: "var(--radius-md, 8px)",
  border: "1.5px solid transparent",
  cursor: "pointer",
  transition: "background 0.15s, opacity 0.15s, transform 0.1s",
  userSelect: "none",
};

const VARIANT_STYLES: Record<NonNullable<ButtonProps["variant"]>, CSSProperties> = {
  primary: {
    background: "var(--color-accent, #1a6cff)",
    color: "#fff",
    borderColor: "transparent",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    borderColor: "var(--color-border-secondary)",
  },
  danger: {
    background: "var(--color-background-danger)",
    color: "var(--color-text-danger)",
    borderColor: "var(--color-border-danger, transparent)",
  },
};

const SIZE_STYLES: Record<NonNullable<ButtonProps["size"]>, CSSProperties> = {
  sm: { padding: "5px 12px", fontSize: "12px", height: "30px" },
  md: { padding: "7px 16px", fontSize: "13px", height: "36px" },
  lg: { padding: "10px 20px", fontSize: "14px", height: "42px" },
};

export function Button({
  children,
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
      style={{
        ...BUTTON_BASE,
        ...VARIANT_STYLES[variant],
        ...SIZE_STYLES[size],
        opacity: isDisabled ? 0.5 : 1,
        cursor: isDisabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            width: "12px",
            height: "12px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            display: "inline-block",
            animation: "spin 0.6s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export function Card({ children, style, className }: CardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: "var(--border-radius-lg)",
        padding: "1rem 1.25rem",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────

export interface ProgressBarProps {
  /** 0–100 */
  value: number;
  label: string;
  /** Optional visible status text displayed beside the bar */
  statusText?: string;
}

export function ProgressBar({ value, label, statusText }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {statusText && (
        <span style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{statusText}</span>
      )}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        style={{
          width: "100%",
          height: "6px",
          background: "var(--color-background-tertiary)",
          borderRadius: "999px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${clamped}%`,
            height: "100%",
            background: "var(--color-accent, #1a6cff)",
            borderRadius: "999px",
            transition: "width 0.2s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  disabled?: boolean;
}

export function Select({ id, value, onChange, options, label, disabled }: SelectProps) {
  const selectId = id ?? `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {label && (
        <label
          htmlFor={selectId}
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "var(--color-text-secondary)",
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
        aria-disabled={disabled}
        style={{
          fontFamily: "inherit",
          fontSize: "13px",
          padding: "0 10px",
          height: "36px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.5 : 1,
          width: "100%",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────

export type BadgeVariant = "default" | "positive" | "negative" | "neutral" | "info" | "warning";

export interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

const BADGE_STYLES: Record<BadgeVariant, CSSProperties> = {
  default: {
    background: "var(--color-background-secondary)",
    color: "var(--color-text-secondary)",
  },
  positive: {
    background: "#EAF3DE",
    color: "#3B6D11",
  },
  negative: {
    background: "#FCEBEB",
    color: "#A32D2D",
  },
  neutral: {
    background: "#F1EFE8",
    color: "#5F5E5A",
  },
  info: {
    background: "var(--color-background-info)",
    color: "var(--color-text-info)",
  },
  warning: {
    background: "var(--color-background-warning)",
    color: "var(--color-text-warning)",
  },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "11px",
        fontWeight: 500,
        padding: "3px 8px",
        borderRadius: "var(--border-radius-md)",
        lineHeight: 1.4,
        ...BADGE_STYLES[variant],
      }}
    >
      {children}
    </span>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

export interface StatProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
}

export function Stat({ label, value, sub }: StatProps) {
  return (
    <div
      style={{
        background: "var(--color-background-secondary)",
        borderRadius: "var(--border-radius-md)",
        padding: "14px 12px",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "11px",
          color: "var(--color-text-secondary)",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: "4px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: "22px",
          fontWeight: 500,
          color: "var(--color-text-primary)",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      {sub && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "12px",
            color: "var(--color-text-tertiary)",
          }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── ErrorBoundary ────────────────────────────────────────────────────────────

import { Component, type ErrorInfo } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary: ${this.props.label ?? "unknown"}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            role="alert"
            style={{
              padding: "1rem",
              borderRadius: "var(--border-radius-lg)",
              border: "0.5px solid var(--color-border-danger)",
              background: "var(--color-background-danger)",
              color: "var(--color-text-danger)",
              fontSize: "13px",
            }}
          >
            <strong>Something went wrong</strong>
            {this.state.error && (
              <p style={{ margin: "4px 0 0", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                {this.state.error.message}
              </p>
            )}
          </div>
        )
      );
    }
    return this.props.children;
  }
}
