import type { ModelConfig, SentimentLabel } from "@/types";

// ─── Language scope ───────────────────────────────────────────────────────────

/** The only three languages this application evaluates. */
export const SUPPORTED_LANGUAGES = ["en", "ar", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ─── Model registry ───────────────────────────────────────────────────────────

export const MODELS: readonly ModelConfig[] = [
  {
    id: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilBERT Multilingual",
    description:
      "Lightweight student model distilled from a multilingual sentiment teacher. Fast inference with solid accuracy across EN, AR, and RU.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "BERT Multilingual (uncased)",
    description:
      "Full BERT base trained on multilingual product reviews. Higher accuracy at the cost of slower inference. Supports EN, AR, and RU.",
    languages: ["en", "ar", "ru"],
    size: "medium",
    task: "sentiment-analysis",
  },
] as const;

export const DEFAULT_MODEL_ID = MODELS[0].id;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

/**
 * Normalises a raw pipeline output label to one of the three canonical
 * SentimentLabel values. Handles the various label formats emitted by
 * HuggingFace models (e.g. "1 star" → NEGATIVE, "LABEL_2" → NEUTRAL, etc.).
 */
export function normalizeLabel(rawLabel: string): SentimentLabel {
  const upper = rawLabel.toUpperCase().trim();

  // Direct matches
  if (upper === "POSITIVE") return "POSITIVE";
  if (upper === "NEGATIVE") return "NEGATIVE";
  if (upper === "NEUTRAL") return "NEUTRAL";

  // Star-rating labels (1–2 stars = negative, 3 = neutral, 4–5 = positive)
  const starMatch = upper.match(/^(\d)\s*STAR/);
  if (starMatch) {
    const stars = parseInt(starMatch[1], 10);
    if (stars <= 2) return "NEGATIVE";
    if (stars === 3) return "NEUTRAL";
    return "POSITIVE";
  }

  // Generic LABEL_N where N is 0-based index
  const labelMatch = upper.match(/^LABEL_(\d+)$/);
  if (labelMatch) {
    const idx = parseInt(labelMatch[1], 10);
    if (idx === 0) return "NEGATIVE";
    if (idx === 1) return "NEUTRAL";
    return "POSITIVE";
  }

  // Partial keyword matches
  if (upper.includes("POS")) return "POSITIVE";
  if (upper.includes("NEG")) return "NEGATIVE";

  // Default fallback
  return "NEUTRAL";
}
