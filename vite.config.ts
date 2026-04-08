import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import type { defineConfig as defineVitestConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: true,
    port: 5173,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    pool: "vmForks",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
    },
  },
} as Parameters<typeof defineVitestConfig>[0]);
