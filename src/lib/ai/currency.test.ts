import { describe, it, expect } from "vitest";
import { currencySymbol } from "./currency";

describe("currencySymbol", () => {
  it("returns $ for USD", () => {
    expect(currencySymbol("USD")).toBe("$");
  });

  it("returns ₹ for INR", () => {
    expect(currencySymbol("INR")).toBe("₹");
  });

  it("returns € for EUR", () => {
    expect(currencySymbol("EUR")).toBe("€");
  });

  it("returns the code itself for unknown currencies", () => {
    expect(currencySymbol("XYZ")).toBe("XYZ");
  });

  it("returns $ when null", () => {
    expect(currencySymbol(null)).toBe("$");
  });

  it("returns $ when undefined", () => {
    expect(currencySymbol(undefined)).toBe("$");
  });
});
