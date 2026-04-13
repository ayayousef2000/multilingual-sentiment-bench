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

      {/* FIX: char-counter moved inside .text-area-wrap so position:absolute
          places it in the bottom-right corner of the textarea, not below it */}
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
        <span
          id="char-counter"
          className="char-counter"
          aria-live="polite"
          style={{ color: isOverLimit ? "var(--color-negative)" : undefined }}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>

      <div className="classify-row">
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isLoading}
          aria-label="Classify text"
        >
          {isLoading ? "Classifying…" : "Classify"}
        </Button>
        <p id="classify-hint" className="classify-hint">
          Press <kbd>Ctrl+Enter</kbd> / <kbd>⌘+Enter</kbd> to classify
        </p>
      </div>

      <p className="quick-examples-label">QUICK EXAMPLES</p>

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
