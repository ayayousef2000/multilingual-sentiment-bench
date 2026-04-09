import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import App from "./App";

// Mock the Web Worker so tests don't try to spawn real workers
vi.mock("@/hooks/useClassifier", () => ({
  useClassifier: () => ({
    loadModel: vi.fn(),
    classify: vi.fn(),
    loadState: { status: "idle", progress: 0, statusText: "" },
    currentModelId: null,
  }),
}));

describe("App", () => {
  it("renders the header", () => {
    render(<App />);
    expect(
      screen.getByText(
        (_, element) => element?.textContent?.replace(/\s+/g, "") === "SentimentBench"
      )
    ).toBeInTheDocument();
  });

  it("shows playground tab by default", () => {
    render(<App />);
    expect(screen.getByText(/Interactive/i)).toBeInTheDocument();
  });
});
