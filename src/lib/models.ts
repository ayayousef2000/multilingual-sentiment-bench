import type { ModelConfig, SentimentLabel } from "@/types";

// ─── Language scope ───────────────────────────────────────────────────────────

/** The only three languages this application evaluates. */
export const SUPPORTED_LANGUAGES = ["en", "ar", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ─── Model registry ───────────────────────────────────────────────────────────

export const MODELS: readonly ModelConfig[] = [
  // ── Thesis fine-tuned model ───────────────────────────────────────────────
  // Listed first so it is DEFAULT_MODEL_ID and pre-selected in the UI.
  // INT8 per-channel quantized (75% size reduction, −1.99% accuracy delta).
  // Fine-tuned on Amazon Reviews 2023 (EN) + Arabic 100K (AR) + RuReviews (RU).
  // Repo layout: onnx/model_quantized.onnx — matches transformers.js default.
  {
    id: "ayayousef/distilbert-multilingual-sentiment-finetuned",
    name: "DistilBERT Fine-tuned (EN/AR/RU)",
    description:
      "Fine-tuned on Amazon Reviews, Arabic 100K, and RuReviews datasets. " +
      "INT8 per-channel quantized — 75% smaller than FP32, −1.99% accuracy delta. " +
      "Thesis model evaluated in Chapter 4.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilBERT Multilingual (Base)",
    description:
      "Lightweight student model distilled from a multilingual sentiment teacher. " +
      "Fast inference with solid accuracy across EN, AR, and RU.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "BERT Multilingual (uncased)",
    description:
      "Full BERT base trained on multilingual product reviews. Higher accuracy at " +
      "the cost of slower inference. Supports EN, AR, and RU.",
    languages: ["en", "ar", "ru"],
    size: "medium",
    task: "sentiment-analysis",
  },
] as const;

// Thesis model is first — pre-selected on load
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

  if (upper === "POSITIVE") return "POSITIVE";
  if (upper === "NEGATIVE") return "NEGATIVE";
  if (upper === "NEUTRAL") return "NEUTRAL";

  const starMatch = upper.match(/^(\d)\s*STAR/);
  if (starMatch) {
    const stars = parseInt(starMatch[1], 10);
    if (stars <= 2) return "NEGATIVE";
    if (stars === 3) return "NEUTRAL";
    return "POSITIVE";
  }

  const labelMatch = upper.match(/^LABEL_(\d+)$/);
  if (labelMatch) {
    const idx = parseInt(labelMatch[1], 10);
    if (idx === 0) return "NEGATIVE";
    if (idx === 1) return "NEUTRAL";
    return "POSITIVE";
  }

  if (upper.includes("POS")) return "POSITIVE";
  if (upper.includes("NEG")) return "NEGATIVE";

  return "NEUTRAL";
}
