import { describe, expect, it } from "vitest";
import { getModelById, MODELS, normalizeLabel } from "@/lib/models";

describe("normalizeLabel", () => {
  it("maps POSITIVE variations", () => {
    expect(normalizeLabel("POSITIVE")).toBe("POSITIVE");
    expect(normalizeLabel("positive")).toBe("POSITIVE");
    expect(normalizeLabel("LABEL_2")).toBe("POSITIVE");
    expect(normalizeLabel("5 stars")).toBe("POSITIVE");
  });

  it("maps NEGATIVE variations", () => {
    expect(normalizeLabel("NEGATIVE")).toBe("NEGATIVE");
    expect(normalizeLabel("negative")).toBe("NEGATIVE");
    expect(normalizeLabel("LABEL_0")).toBe("NEGATIVE");
    expect(normalizeLabel("1 star")).toBe("NEGATIVE");
  });

  it("defaults unknown labels to NEUTRAL", () => {
    expect(normalizeLabel("LABEL_1")).toBe("NEUTRAL");
    expect(normalizeLabel("mixed")).toBe("NEUTRAL");
    expect(normalizeLabel("")).toBe("NEUTRAL");
  });
});

describe("getModelById", () => {
  it("returns model for valid id", () => {
    const model = getModelById(MODELS[0].id);
    expect(model).toBeDefined();
    expect(model?.id).toBe(MODELS[0].id);
  });

  it("returns undefined for unknown id", () => {
    expect(getModelById("not-a-real-model")).toBeUndefined();
  });
});

describe("MODELS", () => {
  it("has at least one model", () => {
    expect(MODELS.length).toBeGreaterThan(0);
  });

  it("all models have required fields", () => {
    for (const m of MODELS) {
      expect(m.id).toBeTruthy();
      expect(m.name).toBeTruthy();
      expect(m.languages.length).toBeGreaterThan(0);
    }
  });
});
