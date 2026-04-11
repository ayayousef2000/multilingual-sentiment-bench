# ⚗ Multilingual Sentiment Bench

> A **browser-native NLP evaluation platform** for sentiment analysis across 100+ languages — zero backend, zero latency, full reproducibility.

All inference runs entirely **in your browser** via a dedicated Web Worker powered by [`@huggingface/transformers`](https://huggingface.co/docs/transformers.js). No server. No API key. No data leaves your machine.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Interactive Playground** | Classify any text in real time with a character-counted textarea (⌘ Enter to run) |
| **Benchmark Lab** | Run full datasets through any model; collect latency, memory delta, and label distribution |
| **Recharts Visualisation** | Scatter plot of latency vs. input length, colour-coded by predicted label |
| **CSV Export** | One-click export of all benchmark results for downstream statistical analysis |
| **Model Registry** | 2 pre-configured HuggingFace models (small → medium, multilingual) |
| **2 Built-in Datasets** | EN · RU · AR — each with expected labels for accuracy measurement |
| **Runtime Validation** | All dataset shapes and worker messages validated at runtime with descriptive errors |
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
│   │   ├── models.ts                 # Model registry + normalizeLabel() (handles all HF label variants)
│   │   ├── datasets.ts               # EN / DE benchmark datasets with runtime shape validation
│   │   ├── export.ts                 # CSV serialisation + stats computation + formatMs / formatMB
│   │   └── validation.ts             # Runtime assertors for WorkerOutbound, BenchmarkResult, etc.
│   ├── workers/
│   │   └── classifier.worker.ts      # HF Transformers pipeline (singleton cache, echoes requestId on error)
│   ├── hooks/
│   │   ├── useClassifier.ts          # Worker lifecycle, AbortSignal-aware classify(), cleanup on unmount
│   │   └── useBenchmark.ts           # AbortController benchmark loop, useTransition for bulk appends
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx             # Button · Badge · Card · Select · ProgressBar · Stat · ErrorBoundary
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Sticky nav with accessible role=tablist tab switcher
│   │   │   ├── PlaygroundView.tsx    # Interactive single-text classification view (context-aware)
│   │   │   └── BenchmarkView.tsx     # Full benchmark lab view (context-aware, ErrorBoundary per panel)
│   │   ├── playground/
│   │   │   ├── ModelLoader.tsx       # Model selector + load progress panel + error display
│   │   │   ├── TextInput.tsx         # Textarea with char counter, ⌘ Enter shortcut, aria-describedby
│   │   │   └── ResultCard.tsx        # Result card with aria-live, confidence bar, perf metrics
│   │   └── benchmark/
│   │       ├── BenchmarkControls.tsx # Dataset / model pickers, run / stop / export (reads context)
│   │       ├── BenchmarkStats.tsx    # Latency stats + label distribution (React.memo + useMemo)
│   │       ├── BenchmarkChart.tsx    # Recharts scatter: latency vs input length (React.memo, role=img)
│   │       └── ResultsTable.tsx      # Results table with maxRows cap, fixed col widths, scope=col headers
│   ├── styles/
│   │   └── globals.css               # CSS custom property design tokens, dark mode, DM Sans + DM Mono
│   ├── test/
│   │   ├── setup.ts                  # Vitest globals, MockWorker, ResizeObserver stub
│   │   ├── export.test.ts            # computeStats · formatMs · resultsToCSV tests
│   │   └── models.test.ts            # normalizeLabel · getModelById · MODELS tests
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
| DistilBERT Multilingual | `Xenova/distilbert-base-multilingual-cased-sentiments-student` | EN RU AR | Small |
| BERT Multilingual (uncased) | `Xenova/bert-base-multilingual-uncased-sentiment` | 104 languages | Medium |

Models are downloaded once from the HuggingFace Hub CDN and cached in the browser's `Cache API`. Subsequent loads are instant.

To add a new model, append an entry to [`src/lib/models.ts`](src/lib/models.ts):

```ts
{
  id: "Xenova/your-model-id",
  name: "Display Name",
  description: "Short description",
  languages: ["en", "de"],
  size: "small",
  task: "sentiment-analysis",
}
```

---

## 📊 Benchmark Datasets

| Dataset ID | Language | Samples | Labels |
|---|---|---|---|
| `en-sentiment-basic` | English | 5 | POSITIVE · NEGATIVE · NEUTRAL |
| `ru-sentiment-basic` | German | 3 | POSITIVE · NEGATIVE · NEUTRAL |

To add a custom dataset, append to [`src/lib/datasets.ts`](src/lib/datasets.ts). Each entry is validated at module load time — malformed shapes throw descriptive `Invariant violation` errors immediately. Each sample accepts an optional `expected` label used for accuracy scoring.

```ts
validateDataset({
  id: "fr-sentiment-basic",
  name: "French — Basic Sentiment",
  description: "Short French sentences.",
  language: "fr",
  samples: [
    { id: "fr-001", text: "J'adore ce produit!", language: "fr", expected: "POSITIVE" },
  ],
})
```

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React UI (Main Thread)             │
│                                                      │
│  ClassifierProvider (Context)                        │
│  ├── useClassifier ──► Worker messages (postMessage) │
│  └── useBenchmark  ──► AbortController loop          │
│                                                      │
│  PlaygroundView  ◄──┐                                │
│  BenchmarkView   ◄──┤── useClassifierContext()       │
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

- **Context-provided classifier** — `ClassifierProvider` wraps the app root and exposes `loadState`, `loadModel`, and `classify` via `useClassifierContext()`. Views consume the context directly — no prop drilling through layout components.
- **Worker cleanup on unmount** — `useClassifier` terminates the worker in its `useEffect` cleanup function, preventing the Strict Mode double-spawn bug and memory leaks. All pending promises are rejected with `AbortError` before termination.
- **AbortController benchmark loop** — `useBenchmark` creates a fresh `AbortController` on each `start()` call, cancelling any prior run. `classify()` receives the signal directly, so in-flight worker responses are ignored cleanly after abort — no stale state appends.
- **Per-request error rejection** — the worker echoes a `requestId` in `ERROR` messages. `useClassifier` uses this to reject only the affected promise rather than tearing down all pending requests on a single classification failure.
- **`useTransition` for bulk appends** — result appends during benchmark runs are wrapped in `startTransition`, keeping the UI responsive when processing large datasets.
- **Exhaustive switch guards** — all worker message `switch` statements use `assertNever()` on the default branch. Adding a new `WorkerOutbound` variant without handling it is a compile-time error.
- **Runtime dataset validation** — `validateDataset()` in `datasets.ts` checks every field with descriptive `invariant()` calls at module load time. Malformed dataset entries fail loudly at startup rather than silently at run time.

---

## 🧪 Testing

```bash
pnpm test             # Run all unit tests
pnpm test:coverage    # Generate coverage report → ./coverage/
```

The test setup in `src/test/setup.ts` provides:
- A `MockWorker` class implementing the full `Worker` interface — hooks that instantiate workers don't throw in jsdom
- A `ResizeObserver` stub — prevents Recharts from crashing in the test environment
- `vi.clearAllMocks()` in `afterEach` — prevents mock state leaking between tests

Test coverage targets pure utility functions in `src/lib/` and `src/utils/`. Component integration tests mock `useClassifierContext` to avoid spawning real workers.

---

## 📦 Export Format

Benchmark results export as UTF-8 CSV with the following schema:

```
model_id, dataset_id, sample_id, language, input_len, label, score, time_ms, memory_mb, timestamp
```

| Column | Type | Description |
|---|---|---|
| `model_id` | string | HuggingFace model ID |
| `dataset_id` | string | Dataset identifier |
| `sample_id` | string | Sample identifier within dataset |
| `language` | string | ISO 639-1 language code |
| `input_len` | integer | Character count of input text |
| `label` | string | `POSITIVE` · `NEGATIVE` · `NEUTRAL` |
| `score` | float | Model confidence (0–1) |
| `time_ms` | float | Inference wall-clock time in milliseconds |
| `memory_mb` | float \| null | JS heap delta in MB (Chrome only, `null` elsewhere) |
| `timestamp` | integer | Unix timestamp in milliseconds |

---

## 🐳 Docker Dev Container

```bash
cp .env.example .env
# Set DOCKERHUB_USERNAME in .env

docker compose up -d
docker compose exec react_app pnpm install
docker compose exec react_app pnpm dev
```

The container mounts your local SSH keys and `.gitconfig` for seamless Git operations inside the dev container.

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
  Built with <a href="https://huggingface.co/docs/transformers.js">Transformers.js</a> · All inference runs locally in your browser
</p>
