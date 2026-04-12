import { useId, useRef, useState } from "react";
import { Button } from "../ui";

interface TextInputProps {
  onClassify: (text: string) => void;
  isLoading: boolean;
  isModelReady: boolean;
}

const MAX_CHARS = 512;

const EXAMPLES = [
  { text: "This product is absolutely amazing!", lang: "EN", langClass: "chip-lang-en" },
  { text: "Terrible experience, never again.", lang: "EN", langClass: "chip-lang-en" },
  { text: "هذا المنتج رائع جداً وأنصح به الجميع", lang: "AR", langClass: "chip-lang-ar" },
  { text: "Это было ужасно, я очень разочарован.", lang: "RU", langClass: "chip-lang-ru" },
];

export function TextInput({ onClassify, isLoading, isModelReady }: TextInputProps) {
  const [text, setText] = useState("");
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading || !isModelReady) return;
    onClassify(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleExample = (exampleText: string) => {
    setText(exampleText);
    textareaRef.current?.focus();
  };

  const charCount = text.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSubmit = text.trim().length > 0 && !isLoading && isModelReady && !isOverLimit;

  return (
    <div className="panel">
      <label className="panel-label" htmlFor={textareaId}>
        Input Text
      </label>
      <div className="text-area-wrap">
        <textarea
          id={textareaId}
          ref={textareaRef}
          className="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type or paste text to classify…"
          rows={5}
          disabled={isLoading}
          aria-describedby="char-counter classify-hint"
          dir="auto"
        />
      </div>
      <div className="classify-row">
        <span
          id="char-counter"
          className="char-counter"
          aria-live="polite"
          style={{ color: isOverLimit ? "var(--color-error)" : undefined }}
        >
          {charCount}/{MAX_CHARS}
        </span>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isLoading}
          aria-label="Classify text"
        >
          {isLoading ? "Classifying…" : "Classify"}
        </Button>
      </div>
      <p id="classify-hint" className="classify-hint">
        Press <kbd>Ctrl+Enter</kbd> / <kbd>⌘+Enter</kbd> to classify
      </p>

      <p className="quick-examples-label">QUICK EXAMPLES</p>

      {/* FIX: Use a semantic <ul> instead of <div role="list">.
          Each interactive chip is a <button> inside a <li>, which is the
          correct pattern — buttons must not carry role="listitem". */}
      <ul className="quick-examples" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {EXAMPLES.map((ex) => (
          <li key={ex.text}>
            <button
              type="button"
              className="example-chip"
              onClick={() => handleExample(ex.text)}
              title={ex.text}
              dir="auto"
            >
              <span className={`chip-lang ${ex.langClass}`}>{ex.lang}</span>
              {ex.text}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
