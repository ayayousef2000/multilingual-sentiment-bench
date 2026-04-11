import { useId, useRef, useState } from "react";
import { Button, Card } from "../ui";

interface TextInputProps {
  onClassify: (text: string) => void;
  isLoading: boolean;
  isModelReady: boolean;
}

const MAX_CHARS = 512;

export function TextInput({ onClassify, isLoading, isModelReady }: TextInputProps) {
  const [text, setText] = useState("");
  const textareaId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const trimmed = text.trim();
  const canSubmit = isModelReady && !isLoading && trimmed.length > 0;
  const remaining = MAX_CHARS - text.length;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onClassify(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Card>
      <label
        htmlFor={textareaId}
        style={{
          display: "block",
          fontSize: "12px",
          fontWeight: 500,
          color: "var(--color-text-secondary)",
          marginBottom: "8px",
        }}
      >
        Input text
      </label>

      <textarea
        ref={textareaRef}
        id={textareaId}
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
        onKeyDown={handleKeyDown}
        placeholder={
          isModelReady
            ? "Enter text to analyse… (⌘ Enter to run)"
            : "Load a model first, then enter text here"
        }
        disabled={!isModelReady || isLoading}
        aria-describedby={`${textareaId}-hint`}
        rows={4}
        style={{
          width: "100%",
          resize: "vertical",
          fontFamily: "inherit",
          fontSize: "13px",
          padding: "10px 12px",
          borderRadius: "var(--border-radius-md)",
          border: "0.5px solid var(--color-border-secondary)",
          background: "var(--color-background-primary)",
          color: "var(--color-text-primary)",
          lineHeight: 1.6,
          boxSizing: "border-box",
          opacity: !isModelReady ? 0.5 : 1,
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "8px",
        }}
      >
        <span
          id={`${textareaId}-hint`}
          style={{
            fontSize: "11px",
            color: remaining < 50 ? "var(--color-text-warning)" : "var(--color-text-tertiary)",
          }}
        >
          {remaining} chars remaining
        </span>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isLoading}
          aria-label="Classify sentiment"
        >
          {isLoading ? "Classifying…" : "Classify"}
        </Button>
      </div>
    </Card>
  );
}
