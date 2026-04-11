import type { ModelConfig, SentimentLabel } from "@/types";

// ─── Model registry ───────────────────────────────────────────────────────────

export const MODELS: ReadonlyArray<ModelConfig> = [
  {
    id: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilBERT multilingual",
    description:
      "Compact multilingual sentiment model distilled from a larger teacher. Supports 6 languages: English, French, German, Spanish, Italian, Dutch.",
    languages: ["en", "fr", "de", "es", "it", "nl"],
    size: "small",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "BERT multilingual (uncased)",
    description:
      "Fine-tuned multilingual BERT for 5-class sentiment (1–5 stars). Mapped to POSITIVE / NEGATIVE / NEUTRAL for this benchmark.",
    languages: ["en", "fr", "de", "es", "it", "nl", "pt", "ru", "ar", "zh"],
    size: "medium",
    task: "sentiment-analysis",
  },
] as const;

export const DEFAULT_MODEL_ID = MODELS[0].id;

// ─── Lookup ───────────────────────────────────────────────────────────────────

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

// ─── Label normalisation ──────────────────────────────────────────────────────

/**
 * Normalises the raw label string returned by the Transformers.js pipeline
 * to the canonical SentimentLabel union.
 *
 * Handles common variants:
 *   - "LABEL_0" / "LABEL_1" / "LABEL_2" → star-based heuristics
 *   - "1 star" … "5 stars" → mapped to NEG / NEU / POS
 *   - "positive" / "negative" / "neutral" → upper-cased
 */
export function normalizeLabel(rawLabel: string): SentimentLabel {
  const upper = rawLabel.toUpperCase().trim();

  // Already canonical
  if (upper === "POSITIVE" || upper === "NEGATIVE" || upper === "NEUTRAL") {
    return upper as SentimentLabel;
  }

  // "POS" / "NEG" / "NEU" shorthands
  if (upper.startsWith("POS")) return "POSITIVE";
  if (upper.startsWith("NEG")) return "NEGATIVE";
  if (upper.startsWith("NEU")) return "NEUTRAL";

  // LABEL_X from generic classifiers (0 = lowest / most negative)
  const labelMatch = upper.match(/^LABEL_(\d+)$/);
  if (labelMatch) {
    const n = parseInt(labelMatch[1], 10);
    if (n === 0) return "NEGATIVE";
    if (n === 1) return "NEUTRAL";
    return "POSITIVE";
  }

  // "N STAR(S)" pattern from BERT multilingual (1–5)
  const starMatch = upper.match(/^(\d)\s+STARS?$/);
  if (starMatch) {
    const stars = parseInt(starMatch[1], 10);
    if (stars <= 2) return "NEGATIVE";
    if (stars === 3) return "NEUTRAL";
    return "POSITIVE";
  }

  // Unknown label — default to NEUTRAL and log a warning
  console.warn(`normalizeLabel: unrecognised label "${rawLabel}", defaulting to NEUTRAL`);
  return "NEUTRAL";
}
