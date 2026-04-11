import type { BenchmarkDataset, BenchmarkSample, SentimentLabel } from "@/types";
import { invariant } from "@/utils/assert";

const VALID_LABELS = new Set<SentimentLabel>(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

/**
 * Validates a raw dataset object at runtime.
 * Throws an `Invariant violation` error if the shape is unexpected.
 */
function validateDataset(raw: unknown): BenchmarkDataset {
  invariant(typeof raw === "object" && raw !== null, "Dataset must be an object");

  const d = raw as Record<string, unknown>;

  invariant(typeof d.id === "string" && d.id.length > 0, "Dataset.id must be a non-empty string");
  invariant(typeof d.name === "string", "Dataset.name must be a string");
  invariant(typeof d.description === "string", "Dataset.description must be a string");
  invariant(typeof d.language === "string", "Dataset.language must be a string");
  invariant(Array.isArray(d.samples), "Dataset.samples must be an array");

  const samples: BenchmarkSample[] = (d.samples as unknown[]).map((s, i) => {
    invariant(typeof s === "object" && s !== null, `samples[${i}] must be an object`);
    const sample = s as Record<string, unknown>;

    invariant(typeof sample.id === "string", `samples[${i}].id must be a string`);
    invariant(typeof sample.text === "string", `samples[${i}].text must be a string`);
    invariant(typeof sample.language === "string", `samples[${i}].language must be a string`);

    if (sample.expected !== undefined) {
      invariant(
        VALID_LABELS.has(sample.expected as SentimentLabel),
        `samples[${i}].expected must be POSITIVE | NEGATIVE | NEUTRAL`
      );
    }

    return {
      id: sample.id as string,
      text: sample.text as string,
      language: sample.language as string,
      expected: sample.expected as SentimentLabel | undefined,
    };
  });

  return {
    id: d.id as string,
    name: d.name as string,
    description: d.description as string,
    language: d.language as string,
    samples,
  };
}

// ── Static dataset definitions ────────────────────────────────────────────────
// Replace or extend with dynamic imports / API fetches as needed.

export const DATASETS: BenchmarkDataset[] = [
  validateDataset({
    id: "en-sentiment-basic",
    name: "English — Basic Sentiment",
    description: "Short English sentences covering positive, negative, and neutral sentiment.",
    language: "en",
    samples: [
      {
        id: "en-001",
        text: "I love this product, it works perfectly!",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-002",
        text: "Terrible experience, would not recommend.",
        language: "en",
        expected: "NEGATIVE",
      },
      {
        id: "en-003",
        text: "The package arrived on Tuesday.",
        language: "en",
        expected: "NEUTRAL",
      },
      {
        id: "en-004",
        text: "Absolutely fantastic — exceeded all expectations.",
        language: "en",
        expected: "POSITIVE",
      },
      {
        id: "en-005",
        text: "Broken on arrival and support was unhelpful.",
        language: "en",
        expected: "NEGATIVE",
      },
    ],
  }),
  validateDataset({
    id: "de-sentiment-basic",
    name: "German — Basic Sentiment",
    description: "Short German sentences covering positive, negative, and neutral sentiment.",
    language: "de",
    samples: [
      {
        id: "de-001",
        text: "Ich liebe dieses Produkt, es funktioniert perfekt!",
        language: "de",
        expected: "POSITIVE",
      },
      {
        id: "de-002",
        text: "Schreckliche Erfahrung, ich würde es nicht empfehlen.",
        language: "de",
        expected: "NEGATIVE",
      },
      { id: "de-003", text: "Das Paket kam am Dienstag an.", language: "de", expected: "NEUTRAL" },
    ],
  }),
];

export function getDatasetById(id: string): BenchmarkDataset | undefined {
  return DATASETS.find((d) => d.id === id);
}
