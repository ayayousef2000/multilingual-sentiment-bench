import type { ModelConfig } from "@/types";

export const MODELS: ModelConfig[] = [
  {
    id: "Xenova/distilbert-base-uncased-finetuned-sst-2-english",
    name: "DistilBERT SST-2",
    description: "Fast English sentiment model, distilled from BERT",
    languages: ["en"],
    size: "small",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/bert-base-multilingual-uncased-sentiment",
    name: "mBERT Sentiment",
    description: "Multilingual BERT fine-tuned on product reviews (104 languages)",
    languages: ["en", "de", "fr", "es", "ar", "zh", "ja", "pt", "nl", "it"],
    size: "medium",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/twitter-roberta-base-sentiment-latest",
    name: "RoBERTa Twitter",
    description: "RoBERTa trained on 124M tweets, 3-class output",
    languages: ["en"],
    size: "medium",
    task: "sentiment-analysis",
  },
  {
    id: "Xenova/distilbert-base-multilingual-cased-sentiments-student",
    name: "DistilBERT Multilingual",
    description: "Distilled multilingual sentiment student model",
    languages: ["en", "de", "fr", "es", "it", "nl", "pt"],
    size: "small",
    task: "sentiment-analysis",
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

export function getModelById(id: string): ModelConfig | undefined {
  return MODELS.find((m) => m.id === id);
}

export function normalizeLabel(rawLabel: string): "POSITIVE" | "NEGATIVE" | "NEUTRAL" {
  const upper = rawLabel.toUpperCase();
  if (upper.includes("POS") || upper === "LABEL_2" || upper === "5 STARS" || upper === "4 STARS") {
    return "POSITIVE";
  }
  if (upper.includes("NEG") || upper === "LABEL_0" || upper === "1 STAR" || upper === "2 STARS") {
    return "NEGATIVE";
  }
  return "NEUTRAL";
}
