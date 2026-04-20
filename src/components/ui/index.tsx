import {
  type ButtonHTMLAttributes,
  Component,
  type CSSProperties,
  type ErrorInfo,
  type ReactNode,
  useId,
} from "react";

/* ─── Button ────────────────────────────────────────────────────────────────── */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : size === "lg" ? "btn-lg" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      {...rest}
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={loading}
    >
      {children}
    </button>
  );
}

/* ─── ProgressBar ───────────────────────────────────────────────────────────── */

export interface ProgressBarProps {
  /**
   * Progress fraction 0–1, or -1 to indicate an indeterminate / unknown state.
   * When -1, the bar renders a continuous shimmer animation instead of a
   * fixed-width fill, giving the user clear feedback that work is in progress
   * even when the server omits a Content-Length header.
   */
  value: number;
  label: string;
  statusText?: string;
}

export function ProgressBar({ value, label, statusText }: ProgressBarProps) {
  const isIndeterminate = value === -1;
  const pct = isIndeterminate ? 0 : Math.min(100, Math.max(0, value * 100));

  return (
    <div className="progress-wrap">
      <div className="progress-meta">
        <span>{label}</span>
        {statusText && <span>{statusText}</span>}
      </div>
      <div
        className="progress-track"
        role="progressbar"
        // Omit aria-valuenow when indeterminate — screen readers announce "unknown"
        {...(!isIndeterminate && { "aria-valuenow": pct })}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        {isIndeterminate ? (
          // Shimmer block: slides from left to right in a continuous loop.
          // Pure CSS — no JS timer, no layout thrash.
          <div
            className="progress-fill"
            style={{
              width: "40%",
              animation: "progress-indeterminate 1.4s ease-in-out infinite",
              transformOrigin: "left center",
            }}
          />
        ) : (
          <div
            className="progress-fill"
            style={{
              width: `${pct}%`,
              transition: "width 0.2s ease",
            }}
          />
        )}
      </div>

      {/*
        Keyframe injected once as an inline <style> so no changes to globals.css
        are required. The animation slides the 40%-wide fill block across the
        full track width, giving a smooth indeterminate effect.
      */}
      <style>{`
        @keyframes progress-indeterminate {
          0%   { transform: translateX(-100%) scaleX(1); }
          50%  { transform: translateX(150%) scaleX(1.2); }
          100% { transform: translateX(250%) scaleX(1); }
        }
      `}</style>
    </div>
  );
}

/* ─── Select ────────────────────────────────────────────────────────────────── */

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  /** Visible label text — renders a real <label> associated with the <select> */
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  disabled = false,
  id: externalId,
}: SelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label htmlFor={id} className="sidebar-label">
        {label}
      </label>
      <select
        id={id}
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

/* ─── Stat / Card ───────────────────────────────────────────────────────────── */

interface StatProps {
  label: string;
  value: ReactNode;
  style?: CSSProperties;
}

export function Stat({ label, value, style }: StatProps) {
  const titleText =
    typeof value === "string" || typeof value === "number" ? String(value) : undefined;

  return (
    <div className="stat-block" style={style}>
      <span className="stat-block-label">{label}</span>
      <span className="stat-block-value" title={titleText}>
        {value}
      </span>
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div className="panel" style={style}>
      {children}
    </div>
  );
}

/* ─── ErrorBoundary ─────────────────────────────────────────────────────────── */

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
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[ErrorBoundary:${this.props.label ?? "unknown"}]`, error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="error-wrap" role="alert">
            <p className="error-title">Something went wrong</p>
            <p className="error-message">{this.state.error?.message}</p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
