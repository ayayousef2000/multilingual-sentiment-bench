import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./workers/App";

describe("App", () => {
  it("renders the header", () => {
    render(<App />);

    // "Sentiment Bench" is split across two nodes:
    //   "Sentiment" (text node) + <span>Bench</span>
    // Use a function matcher so RTL concatenates all text content
    // within the element before comparing.
    expect(
      screen.getByText((_, element) => {
        if (!element) return false;
        // Only match on the brand-name container itself, not its children individually
        return (
          element.className === "header-brand-name" &&
          (element.textContent ?? "").replace(/\s+/g, " ").trim().startsWith("SentimentBench")
        );
      })
    ).toBeInTheDocument();
  });

  it("shows playground tab by default", () => {
    render(<App />);
    // ModelLoader passes label="Model" to <Select>, which renders a real
    // <label htmlFor={id}>Model</label> associated with the <select>.
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
  });
});
