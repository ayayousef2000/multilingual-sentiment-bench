import type { ModelConfig, SentimentLabel } from "@/types";

// ─── Language scope ───────────────────────────────────────────────────────────

/** The only three languages this application evaluates. */
export const SUPPORTED_LANGUAGES = ["en", "ar", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ─── Model registry ───────────────────────────────────────────────────────────

export const MODELS: readonly ModelConfig[] = [
  // ── XLM-RoBERTa (onnx-community) ─────────────────────────────────────────
  {
    id: "xlm-roberta-oc-fp32",
    repoId: "onnx-community/twitter-xlm-roberta-base-sentiment-ONNX",
    name: "XLM-RoBERTa OC (Fp32)",
    description:
      "ONNX export of cardiffnlp/twitter-xlm-roberta-base-sentiment. " +
      "100+ languages, ~278 M parameters. Full fp32 precision.",
    languages: ["multilingual"],
    size: "medium",
    task: "sentiment-analysis",
    dtype: "fp32",
  },
  {
    id: "xlm-roberta-oc-int8",
    repoId: "onnx-community/twitter-xlm-roberta-base-sentiment-ONNX",
    name: "XLM-RoBERTa OC (Int8)",
    description:
      "ONNX export of cardiffnlp/twitter-xlm-roberta-base-sentiment. " +
      "100+ languages, ~278 M parameters. Int8-quantised for faster inference.",
    languages: ["multilingual"],
    size: "medium",
    task: "sentiment-analysis",
    dtype: "q8",
  },

  // ── BERT Multilingual uncased (Xenova) ────────────────────────────────────
  {
    id: "mbert-xenova-fp32",
    repoId: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "mBERT Xenova (Fp32)",
    description:
      "Full BERT base trained on multilingual product reviews. Higher accuracy at " +
      "the cost of slower inference. Supports EN, AR, and RU. Full fp32 precision.",
    languages: ["en", "ar", "ru"],
    size: "medium",
    task: "sentiment-analysis",
    dtype: "fp32",
  },
  {
    id: "mbert-xenova-int8",
    repoId: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "mBERT Xenova (Int8)",
    description:
      "Full BERT base trained on multilingual product reviews. Higher accuracy at " +
      "the cost of slower inference. Supports EN, AR, and RU. Int8-quantised.",
    languages: ["en", "ar", "ru"],
    size: "medium",
    task: "sentiment-analysis",
    dtype: "q8",
  },

  // ── DistilBERT Multilingual student (Xenova) ──────────────────────────────
  {
    id: "distilmbert-xenova-fp32",
    repoId: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilmBERT Xenova (Fp32)",
    description:
      "Lightweight student model distilled from a multilingual sentiment teacher. " +
      "Fast inference with solid accuracy across EN, AR, and RU. Full fp32 precision.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
    dtype: "fp32",
  },
  {
    id: "distilmbert-xenova-int8",
    repoId: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilmBERT Xenova (Int8)",
    description:
      "Lightweight student model distilled from a multilingual sentiment teacher. " +
      "Fast inference with solid accuracy across EN, AR, and RU. Int8-quantised.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
    dtype: "q8",
  },

  // ── DistilBERT Fine-tuned (ayayousef) ─────────────────────────────────────
  {
    id: "distilbert-ft-fp32",
    repoId: "ayayousef/distilbert-multilingual-sentiment-finetuned",
    name: "DistilBERT FT (Fp32)",
    description:
      "Fine-tuned on Amazon Reviews, Arabic 100K, and RuReviews datasets. " +
      "Full fp32 precision.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
    dtype: "fp32",
  },
  {
    id: "distilbert-ft-int8",
    repoId: "ayayousef/distilbert-multilingual-sentiment-finetuned",
    name: "DistilBERT FT (Int8)",
    description:
      "Fine-tuned on Amazon Reviews, Arabic 100K, and RuReviews datasets. " +
      "INT8 per-channel quantized — 75% smaller than FP32, −1.99% accuracy delta.",
    languages: ["en", "ar", "ru"],
    size: "small",
    task: "sentiment-analysis",
    dtype: "q8",
  },
] as const;

// Thesis model fp32 variant pre-selected on load
export const DEFAULT_MODEL_ID = MODELS[6].id; // distilbert-ft-fp32

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
