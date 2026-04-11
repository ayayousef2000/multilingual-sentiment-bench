import { useId, useRef, useState } from "react";
import { Button } from "../ui";

interface TextInputProps {
  onClassify: (text: string) => void;
  isLoading: boolean;
  isModelReady: boolean;
}

const QUICK_EXAMPLES = [
  { lang: "EN", text: "This product is absolutely fantastic! Best purchase I've made all year." },
  { lang: "EN", text: "Completely broken on arrival. Total waste of money." },
  { lang: "DE", text: "Absolut begeistert! Qualität ist hervorragend." },
  { lang: "FR", text: "Vraiment décevant. Le produit ne correspond pas à la description." },
  { lang: "AR", text: "منتج رائع جداً، سأشتري منه مجدداً" },
] as const;

const LANG_CLASS: Record<string, string> = {
  EN: "chip-lang-en",
  DE: "chip-lang-de",
  FR: "chip-lang-fr",
  AR: "chip-lang-ar",
};

const MAX_CHARS = 512;

export function TextInput({ onClassify, isLoading, isModelReady }: TextInputProps) {
  const [text, setText] = useState("");
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (trimmed) onClassify(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExample = (exampleText: string) => {
    setText(exampleText);
    textareaRef.current?.focus();
  };

  const remaining = MAX_CHARS - text.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {/* Input panel */}
      <div className="panel">
        <label htmlFor={textareaId} className="panel-label">
          Input Text
        </label>
        <p
          style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: "var(--space-3)" }}
        >
          Enter text in any supported language to classify sentiment
        </p>

        <div className="text-area-wrap">
          <textarea
            id={textareaId}
            ref={textareaRef}
            className="text-input"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            onKeyDown={handleKeyDown}
            placeholder="Type or paste text here…"
            rows={5}
            aria-label="Text to classify"
          />
          <span className="char-counter" aria-live="polite">
            {remaining}
          </span>
        </div>

        {/* Quick examples */}
        <div style={{ marginTop: "var(--space-4)" }}>
          <p className="quick-examples-label">Quick Examples</p>
          <div className="quick-examples">
            {QUICK_EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                className="example-chip"
                onClick={() => handleExample(ex.text)}
                title={ex.text}
                type="button"
              >
                <span className={`chip-lang ${LANG_CLASS[ex.lang] ?? ""}`}>{ex.lang}</span>
                {ex.text.slice(0, 38)}&hellip;
              </button>
            ))}
          </div>
        </div>

        {/* Action row */}
        <div className="classify-row">
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isModelReady || !text.trim() || isLoading}
          >
            Classify
          </Button>
          {!isModelReady && <span className="classify-hint">Load a model first</span>}
          {isModelReady && (
            <span className="classify-hint" style={{ opacity: 0.5 }}>
              ⌘↵ to run
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
