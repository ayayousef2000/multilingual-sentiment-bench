# ⚗ Multilingual Sentiment Bench

> A **browser-native NLP evaluation platform** for sentiment analysis across 100+ languages — zero backend, zero latency, full reproducibility.

All inference runs entirely **in your browser** via a dedicated Web Worker powered by [`@huggingface/transformers`](https://huggingface.co/docs/transformers.js). No server. No API key. No data leaves your machine.

---

## ✨ Features

| Feature | Details |
|---|---|
| **Interactive Playground** | Classify any text in real time, with quick-example chips for EN, DE, FR, AR |
| **Benchmark Lab** | Run full datasets through any model; collect latency, memory delta, and label distribution |
| **Recharts Visualisation** | Scatter plot of latency vs. input length, colour-coded by predicted label |
| **CSV Export** | One-click export of all benchmark results for downstream statistical analysis |
| **Model Registry** | 4 pre-configured HuggingFace models (small → medium, mono → multilingual) |
| **4 Built-in Datasets** | EN · DE · FR · AR — each with expected labels for accuracy measurement |
| **Shared Worker** | Single Web Worker instance shared across Playground and Benchmark Lab — no double downloads |
| **Fully Typed** | Strict TypeScript 5.8, discriminated union worker message protocol, zero `any` |

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
│   │   └── index.ts                  # All shared TypeScript types & interfaces
│   ├── lib/
│   │   ├── models.ts                 # Model registry + normalizeLabel()
│   │   ├── datasets.ts               # EN / DE / FR / AR benchmark datasets
│   │   └── export.ts                 # CSV serialisation + stats computation
│   ├── workers/
│   │   └── classifier.worker.ts      # HF Transformers pipeline (singleton cache per modelId)
│   ├── hooks/
│   │   ├── useClassifier.ts          # Worker lifecycle, Promise-based classify()
│   │   └── useBenchmark.ts           # Abortable sequential benchmark loop
│   ├── components/
│   │   ├── ui/
│   │   │   └── index.tsx             # Button · Badge · Card · Select · ProgressBar · Stat · Spinner
│   │   ├── layout/
│   │   │   ├── Header.tsx            # Sticky nav with tab switcher
│   │   │   ├── PlaygroundView.tsx    # Interactive single-text classification view
│   │   │   └── BenchmarkView.tsx     # Full benchmark lab view
│   │   ├── playground/
│   │   │   ├── ModelLoader.tsx       # Model selector + load progress panel
│   │   │   ├── TextInput.tsx         # Textarea + multilingual example chips
│   │   │   └── ResultCard.tsx        # Animated result card with performance metrics
│   │   └── benchmark/
│   │       ├── BenchmarkControls.tsx # Dataset / model pickers, run / stop / export
│   │       ├── BenchmarkStats.tsx    # Latency stats + label distribution bars
│   │       ├── BenchmarkChart.tsx    # Recharts scatter: latency vs input length
│   │       └── ResultsTable.tsx      # Scrollable results table with hover rows
│   ├── styles/
│   │   └── globals.css               # Full CSS custom property design token system
│   ├── test/
│   │   ├── setup.ts                  # @testing-library/jest-dom bootstrap
│   │   ├── export.test.ts            # computeStats · formatMs · resultsToCSV tests
│   │   └── models.test.ts            # normalizeLabel · getModelById · MODELS tests
│   ├── App.tsx                       # Root — shared worker instance, tab router
│   └── main.tsx                      # createRoot entry point
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
| DistilBERT SST-2 | `Xenova/distilbert-base-uncased-finetuned-sst-2-english` | EN | Small |
| mBERT Sentiment | `Xenova/bert-base-multilingual-uncased-sentiment` | 104 languages | Medium |
| RoBERTa Twitter | `Xenova/twitter-roberta-base-sentiment-latest` | EN | Medium |
| DistilBERT Multilingual | `Xenova/distilbert-base-multilingual-cased-sentiments-student` | EN DE FR ES IT NL PT | Small |

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
| `en-mixed` | English | 15 | POSITIVE · NEGATIVE · NEUTRAL |
| `de-mixed` | German | 10 | POSITIVE · NEGATIVE · NEUTRAL |
| `fr-mixed` | French | 10 | POSITIVE · NEGATIVE · NEUTRAL |
| `ar-mixed` | Arabic | 8 | POSITIVE · NEGATIVE · NEUTRAL |

To add a custom dataset, append to [`src/lib/datasets.ts`](src/lib/datasets.ts). Each sample accepts an optional `expected` label which will be used for future accuracy scoring.

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React UI (Main Thread)             │
│                                                      │
│  useClassifier ──► Worker messages (postMessage)     │
│  useBenchmark  ──► Sequential classify() promises    │
│                                                      │
│  PlaygroundView  ◄──┐                                │
│  BenchmarkView   ◄──┤── App.tsx (shared worker)      │
└────────────────────────┬────────────────────────────┘
                         │ Web Worker boundary
┌────────────────────────▼────────────────────────────┐
│           classifier.worker.ts (Worker Thread)       │
│                                                      │
│  ClassifierPipeline (singleton cache per modelId)    │
│  ├── LOAD_MODEL  → PROGRESS* → MODEL_READY           │
│  └── CLASSIFY    → CLASSIFICATION_RESULT             │
│                                                      │
│  @huggingface/transformers pipeline()                │
│  Models cached in browser Cache API                  │
└─────────────────────────────────────────────────────┘
```

**Key design choices:**

- **Single worker, shared state** — `useClassifier` is instantiated once in `App.tsx` and passed down as props. Both Playground and Benchmark Lab share the same worker instance, so a model loaded in Playground is immediately available in Benchmark Lab with no re-download.
- **Promise-based classify()** — each classification request is assigned a UUID and stored in a `Map<id, {resolve, reject}>`. The worker responds with the same ID, allowing concurrent in-flight requests without race conditions.
- **Singleton pipeline cache in the worker** — `ClassifierPipeline.getInstance()` deduplicates concurrent load requests for the same model ID using a loading promise map, preventing double-instantiation.
- **Abortable benchmark loop** — `useBenchmark` uses a `useRef` abort flag rather than an `AbortController`, keeping the loop logic simple and avoiding async cancellation edge cases.

---

## 🧪 Testing

```bash
pnpm test             # Run all unit tests
pnpm test:coverage    # Generate coverage report → ./coverage/
```

Test coverage targets pure utility functions in `src/lib/` (no DOM, no worker mocking needed). Component integration tests mock `useClassifier` to avoid spawning real workers in jsdom.

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

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with <a href="https://huggingface.co/docs/transformers.js">Transformers.js</a> · All inference runs locally in your browser
</p>
