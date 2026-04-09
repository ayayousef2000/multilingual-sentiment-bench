import { useState } from "react";
import { Button, Card } from "../ui";

const EXAMPLES = [
  { lang: "EN", text: "This product is absolutely fantastic! Best purchase I've made this year." },
  {
    lang: "EN",
    text: "Completely broken on arrival. Terrible customer support. Never buying again.",
  },
  { lang: "DE", text: "Absolut begeistert! Qualität und Lieferung waren hervorragend." },
  { lang: "FR", text: "Vraiment décevant. Le produit ne correspond pas à la description." },
  { lang: "AR", text: "منتج رائع جداً، سعيد جداً بالشراء!" },
];

interface TextInputProps {
  onClassify: (text: string) => void;
  isLoading: boolean;
  isModelReady: boolean;
}

export function TextInput({ onClassify, isLoading, isModelReady }: TextInputProps) {
  const [text, setText] = useState("");
  const charLimit = 512;
  const remaining = charLimit - text.length;

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !isModelReady) return;
    onClassify(trimmed);
  };

  return (
    <Card style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "4px",
          }}
        >
          Input Text
        </h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          Enter text in any supported language to classify sentiment
        </p>
      </div>

      {/* Textarea */}
      <div style={{ position: "relative" }}>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, charLimit))}
          placeholder="Type or paste text here…"
          rows={5}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit();
          }}
          style={{
            width: "100%",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-md)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.875rem",
            lineHeight: 1.6,
            padding: "var(--space-3) var(--space-4)",
            resize: "vertical",
            minHeight: 110,
            outline: "none",
            transition: "border-color var(--duration-fast) var(--ease-default)",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
        />
        <span
          style={{
            position: "absolute",
            bottom: "8px",
            right: "10px",
            fontSize: "0.6875rem",
            color: remaining < 50 ? "var(--sentiment-negative)" : "var(--text-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {remaining}
        </span>
      </div>

      {/* Examples */}
      <div>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-display)",
            marginBottom: "var(--space-2)",
          }}
        >
          Quick examples
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.text}
              type="button"
              onClick={() => setText(ex.text)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "4px 10px",
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                color: "var(--text-secondary)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.6875rem",
                cursor: "pointer",
                transition: "all var(--duration-fast) var(--ease-default)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-subtle)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 700,
                  fontSize: "0.5625rem",
                  background: "var(--accent-primary-dim)",
                  color: "var(--accent-primary)",
                  padding: "1px 4px",
                  borderRadius: "2px",
                }}
              >
                {ex.lang}
              </span>
              {ex.text.slice(0, 28)}…
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading || !isModelReady}
          size="md"
          variant="primary"
        >
          {isLoading ? "Classifying…" : "Classify"}
        </Button>
        {!isModelReady && (
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Load a model first
          </span>
        )}
        {isModelReady && (
          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
            ⌘ + Enter to run
          </span>
        )}
      </div>
    </Card>
  );
}
