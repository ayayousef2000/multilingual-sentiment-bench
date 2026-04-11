import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the header", () => {
    render(<App />);
    expect(screen.getByText("Sentiment Bench")).toBeInTheDocument();
  });

  it("shows playground tab by default", () => {
    render(<App />);
    // The playground panel is active by default — the model selector is visible
    expect(screen.getByLabelText("Model")).toBeInTheDocument();
  });
});
