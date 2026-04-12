# ⚗ Multilingual Sentiment Bench

> A **browser-native NLP evaluation platform** for sentiment analysis across English, Arabic, and Russian — zero backend, zero latency, full reproducibility.

All inference runs entirely **in your browser** via a dedicated Web Worker powered by [`@huggingface/transformers`](https://huggingface.co/docs/transformers.js). No server. No API key. No data leaves your machine.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Interactive Playground** | Classify any text in real time with a character-counted textarea (⌘ Enter to run) |
| **Benchmark Lab** | Upload any JSON dataset and run it through any model; collect latency, memory delta, label distribution, and accuracy |
| **JSON Dataset Upload** | Drag-and-drop or click-to-upload your own `.json` dataset; validated at load time with descriptive errors. Accepts both envelope format and flat array format. |
| **Recharts Visualisation** | Scatter plot of latency vs. input length, colour-coded by predicted label |
| **Google Colab-ready CSV** | One-click export with 19 columns including `run_id`, `app_version`, raw text, expected label, accuracy flag, and ISO datetime |
| **Model Registry** | 2 pre-configured HuggingFace models (small → medium, multilingual) |
| **Model Hot-swap** | Changing the model dropdown re-enables "Load model" and cleanly terminates the prior model worker before spawning a new one |
| **Runtime Validation** | All dataset shapes validated at upload time with descriptive `Invariant violation` errors |
| **Fully Typed** | Strict TypeScript 5.8, discriminated union worker message protocol, exhaustive switch guards, zero `any` |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| Node.js | ≥ 22.0.0 |
| pnpm | ≥ 10.0.0 |

```bash
# 1. Clone
git clone https://github.com/your-org/multilingual-sentiment-bench.git
cd multilingual-sentiment-bench

# 2. Copy env
cp .env.example .env

# 3. Install
pnpm install

# 4. Run dev server
pnpm dev
# → http://localhost:5173
```

### Available Scripts

```bash
pnpm dev             # Vite dev server with HMR
pnpm build           # TypeScript check + production build
pnpm preview         # Preview production build locally
pnpm typecheck       # tsc --noEmit strict check
pnpm lint            # Biome linter
pnpm lint:fix        # Biome linter with auto-fix
pnpm format          # Biome formatter
pnpm test            # Vitest unit suite (run once)
pnpm test:watch      # Vitest in watch mode
pnpm test:coverage   # Coverage report (v8)
```

---

## 🗂 Project Structure

```
multilingual-sentiment-bench/
├── public/
│   └── favicon.svg
├── src/
│   ├── types/
│   │   └── index.ts                  # All shared TypeScript types & interfaces (readonly, branded)
│   ├── utils/
│   │   └── assert.ts                 # assertNever · invariant · defined — runtime safety utilities
│   ├── context/
│   │   └── ClassifierContext.tsx     # React context wrapping useClassifier — eliminates prop drilling
│   ├── lib/
│   │   ├── models.ts                 # Model registry + normalizeLabel() (EN · AR · RU scope)
│   │   ├── parseDataset.ts           # Runtime JSON file validator — supports envelope & flat array formats
│   │   ├── export.ts                 # CSV serialisation (19-col Colab-ready schema) + stats + formatters
│   ├── workers/
│   │   └── classifier.worker.ts      # HF Transformers pipeline (singleton cache, echoes requestId on error)
│   ├── hooks/
│   │   ├── useClassifier.ts          # Worker lifecycle, model hot-swap, AbortSignal-aware classify()
│   │   └── useBenchmark.ts           # AbortController benchmark loop, runId per run, accepts BenchmarkDataset
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx             # Button · Badge · Card · Select · ProgressBar · Stat · ErrorBoundary
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Sticky nav with accessible role=tablist tab switcher
│   │   │   ├── PlaygroundView.tsx    # Interactive single-text classification view
│   │   │   └── BenchmarkView.tsx     # Benchmark lab — file upload state, export, results layout
│   │   ├── playground/
│   │   │   ├── ModelLoader.tsx       # Model selector + load progress — re-enables on model change
│   │   │   ├── TextInput.tsx         # Textarea with char counter, ⌘ Enter shortcut
│   │   │   └── ResultCard.tsx        # Result card with aria-live, confidence bar, perf metrics
│   │   └── benchmark/
│   │       ├── FileUpload.tsx        # Drag-and-drop JSON dataset picker (idle/loaded/error states)
│   │       ├── BenchmarkControls.tsx # File picker + model picker + run / stop / export controls
│   │       ├── BenchmarkStats.tsx    # Latency stats + accuracy + label distribution
│   │       ├── BenchmarkChart.tsx    # Recharts scatter: latency vs input length
│   │       └── ResultsTable.tsx      # Results table with maxRows cap
│   ├── styles/
│   │   └── globals.css               # CSS custom property design tokens, dark mode, DM Sans + DM Mono
│   ├── test/
│   │   ├── setup.ts                  # Vitest globals, MockWorker, ResizeObserver stub
│   │   ├── export.test.ts            # computeStats · formatMs · resultsToCSV · buildExportRow tests
│   │   └── models.test.ts            # normalizeLabel · getModelById · MODELS tests (EN/AR/RU scope)
│   ├── App.tsx                       # Root — ClassifierProvider, tab router, tabpanel aria wiring
│   └── main.tsx                      # createRoot entry point (guarded root element lookup)
├── index.html
├── vite.config.ts                    # Path aliases (@/*), ES worker format
├── tsconfig.*.json                   # Strict mode, bundler resolution
├── biome.json                        # Linter + formatter (v1.9.4)
├── commitlint.config.mjs
├── docker-compose.yml
└── package.json
```

---

## 🤖 Supported Models

| Model | HuggingFace ID | Languages | Size |
|---|---|---|---|
| DistilBERT Multilingual | `Xenova/distilbert-base-multilingual-cased-sentiments-student` | EN · AR · RU | Small |
| BERT Multilingual (uncased) | `Xenova/bert-base-multilingual-uncased-sentiment` | EN · AR · RU | Medium |

Models are downloaded once from the HuggingFace Hub CDN and cached in the browser's `Cache API`. Subsequent loads are instant.

**Model hot-swap**: Selecting a different model in the dropdown immediately re-enables the "Load model" button (which relabels to "↺ Switch Model"). Clicking it terminates the current worker, spawns a fresh one, resets load state to `idle`, and downloads the new model — no stale pipeline is left in memory.

To add a new model, append an entry to [`src/lib/models.ts`](src/lib/models.ts):

```ts
{
  id: "Xenova/your-model-id",
  name: "Display Name",
  description: "Short description",
  languages: ["en", "ar", "ru"],
  size: "small",
  task: "sentiment-analysis",
}
```

---

## 📂 Benchmark Datasets

The Benchmark Lab accepts any `.json` file. **There are no pre-bundled datasets** — upload your own from your local machine using the drag-and-drop area or the file picker in the Benchmark Lab tab.

Two JSON shapes are accepted:

### 1 — Flat array format *(matches `test_set_en.json` / `test_set_ar.json` / `test_set_ru.json`)*

```json
[
  {
    "id": "en_000",
    "text": "This product is absolutely fantastic!",
    "language": "en",
    "ground_truth": "POSITIVE"
  },
  {
    "id": "en_001",
    "text": "Terrible experience, never again.",
    "language": "en",
    "ground_truth": "NEGATIVE"
  }
]
```

Flat arrays are automatically wrapped into a `BenchmarkDataset` envelope at parse time. The dataset `id` is auto-generated and the `name` is set to `"Uploaded Dataset"`.

### 2 — Envelope format *(explicit metadata)*

```json
{
  "id": "my-en-dataset",
  "name": "My English Dataset",
  "description": "Optional description",
  "language": "en",
  "samples": [
    {
      "id": "s1",
      "text": "This product is absolutely fantastic!",
      "language": "en",
      "expected": "POSITIVE"
    }
  ]
}
```

### Field reference

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | ✅ | Unique sample identifier |
| `text` | string | ✅ | Raw text to classify |
| `language` | string | ✅ | Must be `en`, `ar`, or `ru` |
| `expected` | string | — | Envelope format: `POSITIVE`, `NEGATIVE`, or `NEUTRAL` |
| `ground_truth` | string | — | Flat array format: same values as `expected` |

The file is validated immediately on upload using `parseDataset()`. Any shape mismatch or unsupported language throws a descriptive error shown inline — no silent failures.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React UI (Main Thread)             │
│                                                      │
│  ClassifierProvider (Context)                        │
│  ├── useClassifier ──► Worker messages (postMessage) │
│  │    └── loadedModelId (tracks last ready model)    │
│  └── useBenchmark  ──► AbortController loop          │
│       ├── runId (crypto.randomUUID per run)          │
│       └── accepts BenchmarkDataset directly          │
│                                                      │
│  PlaygroundView  ◄──┐                                │
│  BenchmarkView   ◄──┤── useClassifierContext()       │
│    └── FileUpload (JSON drag-and-drop + validation)  │
└────────────────────────┬────────────────────────────┘
                         │ Web Worker boundary
┌────────────────────────▼────────────────────────────┐
│           classifier.worker.ts (Worker Thread)       │
│                                                      │
│  Pipeline cache (singleton per modelId)              │
│  ├── LOAD_MODEL  → PROGRESS* → MODEL_READY           │
│  └── CLASSIFY    → CLASSIFICATION_RESULT             │
│       └── ERROR  (echoes requestId for per-promise   │
│                   rejection in useClassifier)        │
│                                                      │
│  @huggingface/transformers pipeline()                │
│  Models cached in browser Cache API                  │
└─────────────────────────────────────────────────────┘
```

**Key design choices:**

- **Context-provided classifier** — `ClassifierProvider` wraps the app root and exposes `loadState`, `loadedModelId`, `loadModel`, and `classify` via `useClassifierContext()`.
- **Model hot-swap** — `loadModel` compares the requested ID against `loadedModelIdRef`. On a switch it terminates the existing worker, spawns a fresh one, rejects all pending promises, and resets load state to `idle`. The "Load model" button re-enables (and relabels to "↺ Switch Model") whenever `selectedModelId !== loadedModelId`.
- **File-based datasets** — `parseDataset()` in `src/lib/parseDataset.ts` validates every field with `invariant()` at upload time. Supports both flat array (with `ground_truth`) and envelope (with `expected`) formats. Language is locked to `en`, `ar`, `ru`.
- **Run-scoped export** — `useBenchmark` generates a `crypto.randomUUID()` at the start of every `start()` call. This `runId` flows through to every result row so Colab can group and compare runs with `df.groupby("run_id")`.
- **Worker cleanup on unmount** — `useClassifier` terminates the worker in its `useEffect` cleanup, preventing Strict Mode double-spawn and memory leaks.
- **AbortController benchmark loop** — `useBenchmark` creates a fresh `AbortController` on each `start()` call. `classify()` receives the signal directly; in-flight responses are ignored after abort.
- **Per-request error rejection** — the worker echoes a `requestId` in `ERROR` messages so only the affected promise is rejected.
- **`useTransition` for bulk appends** — result appends during benchmark runs are wrapped in `startTransition`.
- **Exhaustive switch guards** — all worker message `switch` statements use `assertNever()` on the default branch.

---

## 🧪 Testing

```bash
pnpm test             # Run all unit tests
pnpm test:coverage    # Generate coverage report → ./coverage/
```

Test coverage targets pure utility functions in `src/lib/` and `src/utils/`. Component tests mock `useClassifierContext` to avoid spawning real workers.

When updating tests after these changes:
- `src/test/export.test.ts` — `buildExportRow` now requires a `runId` string (4th argument); `resultsToCSV` accepts an optional 3rd `runId` argument. Update all call sites.
- `src/test/models.test.ts` — verify `SUPPORTED_LANGUAGES` is `["en", "ar", "ru"]` only.

---

## 📦 Export Format

Benchmark results export as UTF-8 CSV ready for import into Google Colab or any pandas-based analysis pipeline.

```
run_id,app_version,model_id,model_name,dataset_id,dataset_name,sample_id,language,input_text,input_len,expected,label,is_correct,score,score_pct,time_ms,memory_mb,timestamp,iso_datetime
```

| Column | Type | Description |
|---|---|---|
| `run_id` | string | UUID generated once per benchmark run — use `df.groupby("run_id")` to compare runs |
| `app_version` | string | Application version (`1.1.0`) — lets you detect schema changes in Colab |
| `model_id` | string | HuggingFace model ID |
| `model_name` | string | Human-readable model display name |
| `dataset_id` | string | Dataset `id` from the uploaded JSON |
| `dataset_name` | string | Dataset `name` from the uploaded JSON |
| `sample_id` | string | Sample identifier within the dataset |
| `language` | string | ISO 639-1 language code (`en`, `ar`, `ru`) |
| `input_text` | string | Full raw input text (quoted if contains commas or newlines) |
| `input_len` | integer | Character count of input text |
| `expected` | string \| empty | Expected label if provided (`POSITIVE` / `NEGATIVE` / `NEUTRAL`) |
| `label` | string | Predicted label |
| `is_correct` | `TRUE` / `FALSE` / empty | Whether predicted label matches expected; empty if no expected label |
| `score` | float | Model confidence 0–1 |
| `score_pct` | float | `score × 100`, 2 decimal places |
| `time_ms` | float | Inference wall-clock time in milliseconds |
| `memory_mb` | float \| empty | JS heap delta in MB (Chrome only, empty elsewhere) |
| `timestamp` | integer | Unix timestamp in milliseconds |
| `iso_datetime` | string | ISO 8601 datetime string |

### Example Colab snippet

```python
import pandas as pd

df = pd.read_csv("sentiment-bench-2026-04-11T12-00-00.csv")

# Overall accuracy (only rows with expected label)
accuracy = df[df["expected"].notna()]["is_correct"].map({"TRUE": True, "FALSE": False}).mean()
print(f"Accuracy: {accuracy:.1%}")

# Latency by model
df.groupby("model_id")["time_ms"].describe()

# Confusion matrix
pd.crosstab(df["expected"], df["label"])

# Compare multiple runs
df.groupby(["run_id", "model_id"])["is_correct"].apply(
    lambda x: x.map({"TRUE": True, "FALSE": False}).mean()
).rename("accuracy")

# Latency by language
df.groupby("language")["time_ms"].mean()

# Filter to a specific app version
df_v1 = df[df["app_version"] == "1.1.0"]
```

---

## 🐳 Docker Dev Container

```bash
cp .env.example .env
# Set DOCKERHUB_USERNAME in .env

docker compose up -d
docker compose exec react_app pnpm install
docker compose exec react_app pnpm dev
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19.1 |
| Language | TypeScript | 5.8 |
| Bundler | Vite | 6.3 |
| NLP Runtime | @huggingface/transformers | 3.5 |
| Charts | Recharts | 2.15 |
| Linter/Formatter | Biome | 1.9 |
| Test Runner | Vitest | 3.1 |
| Test Utilities | @testing-library/react | 16.3 |
| Package Manager | pnpm | 10.33 |
| Commit Linting | commitlint (conventional) | 19.8 |
| Git Hooks | Husky | 9.1 |

---

<p align="center">
  Built with <a href="https://huggingface.co/docs/transformers.js">Transformers.js</a> · All inference runs locally in your browser · EN · AR · RU
</p>
