import type { BenchmarkDataset, BenchmarkSample, SentimentLabel } from "@/types";

// ─── Supported languages ──────────────────────────────────────────────────────

const SUPPORTED_LANGUAGES = ["en", "ar", "ru"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(value as SupportedLanguage);
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Invariant violation: ${message}`);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const VALID_LABELS = new Set<string>(["POSITIVE", "NEGATIVE", "NEUTRAL"]);

function parseSentimentLabel(
  raw: unknown,
  fieldName: string,
  sampleIndex: number
): SentimentLabel | undefined {
  if (raw === undefined || raw === null || raw === "") return undefined;
  invariant(
    typeof raw === "string",
    `samples[${sampleIndex}].${fieldName} must be a string, got ${typeof raw}`
  );
  const upper = raw.toUpperCase().trim();
  invariant(
    VALID_LABELS.has(upper),
    `samples[${sampleIndex}].${fieldName} must be POSITIVE, NEGATIVE, or NEUTRAL — got "${raw}"`
  );
  return upper as SentimentLabel;
}

/**
 * Parses a single sample object.
 * Accepts both canonical format (expected) and flat-array format (ground_truth).
 */
function parseSample(raw: unknown, index: number): BenchmarkSample {
  invariant(isPlainObject(raw), `samples[${index}] must be an object`);

  const { id, text, language, expected, ground_truth } = raw;

  invariant(
    typeof id === "string" && id.trim().length > 0,
    `samples[${index}].id must be a non-empty string`
  );
  invariant(
    typeof text === "string" && text.trim().length > 0,
    `samples[${index}].text must be a non-empty string`
  );
  invariant(
    typeof language === "string" && isSupportedLanguage(language),
    `samples[${index}].language must be one of: ${SUPPORTED_LANGUAGES.join(", ")} — got "${String(language)}"`
  );

  // Accept "expected" (canonical envelope format) or "ground_truth" (flat array format)
  const rawLabel = expected !== undefined ? expected : ground_truth;
  const parsedExpected = parseSentimentLabel(
    rawLabel,
    expected !== undefined ? "expected" : "ground_truth",
    index
  );

  return {
    id: id.trim(),
    text: text.trim(),
    language: language as SupportedLanguage,
    ...(parsedExpected !== undefined && { expected: parsedExpected }),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses and validates a JSON value into a BenchmarkDataset.
 *
 * Accepts two shapes:
 *
 * 1. **Envelope format** (canonical):
 *    ```json
 *    { "id": "...", "name": "...", "language": "en", "samples": [...] }
 *    ```
 *
 * 2. **Flat array format** (matches uploaded test_set_*.json files):
 *    ```json
 *    [{ "id": "en_000", "text": "...", "language": "en", "ground_truth": "POSITIVE" }, ...]
 *    ```
 *    Flat arrays are auto-wrapped into a BenchmarkDataset envelope.
 */
export function parseDataset(raw: unknown): BenchmarkDataset {
  // ── Flat array format ──────────────────────────────────────────────────────
  if (Array.isArray(raw)) {
    invariant(raw.length > 0, "Dataset array must contain at least one sample");

    const samples = raw.map((item, i) => parseSample(item, i));

    // Derive a dataset language from the first sample's language.
    const datasetLanguage = samples[0].language;

    return {
      id: `uploaded-${Date.now()}`,
      name: "Uploaded Dataset",
      description: "",
      language: datasetLanguage,
      samples,
    };
  }

  // ── Envelope format ────────────────────────────────────────────────────────
  invariant(isPlainObject(raw), "Dataset must be a JSON object or a JSON array of samples");

  const { id, name, description, language, samples } = raw;

  invariant(
    typeof id === "string" && id.trim().length > 0,
    "dataset.id must be a non-empty string"
  );
  invariant(
    typeof name === "string" && name.trim().length > 0,
    "dataset.name must be a non-empty string"
  );
  invariant(
    typeof language === "string" && isSupportedLanguage(language),
    `dataset.language must be one of: ${SUPPORTED_LANGUAGES.join(", ")} — got "${String(language)}"`
  );
  invariant(
    Array.isArray(samples) && samples.length > 0,
    "dataset.samples must be a non-empty array"
  );

  return {
    id: id.trim(),
    name: name.trim(),
    description: typeof description === "string" ? description.trim() : "",
    language: language as SupportedLanguage,
    samples: samples.map((s, i) => parseSample(s, i)),
  };
}

/**
 * Formats a caught error value into a user-readable string.
 */
export function formatParseError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error while parsing dataset";
}
