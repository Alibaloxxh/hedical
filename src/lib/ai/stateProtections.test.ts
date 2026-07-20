import { describe, it, expect } from "vitest";
import { getStateProtection, getStateName } from "./stateProtections";

describe("getStateProtection", () => {
  it("returns protection data for California", () => {
    const prot = getStateProtection("CA");
    expect(prot).not.toBeNull();
    expect(prot!.surpriseBilling).toBe("comprehensive");
    expect(prot!.externalReview).toBe("mandatory");
    expect(prot!.appealDeadlineDays).toBe(180);
  });

  it("returns protection data for Texas", () => {
    const prot = getStateProtection("TX");
    expect(prot).not.toBeNull();
    expect(prot!.balanceBilling).toBe("restricted");
  });

  it("handles lowercase input", () => {
    const prot = getStateProtection("ny");
    expect(prot).not.toBeNull();
    expect(prot!.state).toBe("NY");
  });

  it("returns null for unknown state", () => {
    expect(getStateProtection("XX")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getStateProtection(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(getStateProtection(undefined)).toBeNull();
  });
});

describe("getStateName", () => {
  it("returns full state name for valid code", () => {
    expect(getStateName("CA")).toBe("California");
  });

  it("returns null for unknown code", () => {
    expect(getStateName("ZZ")).toBeNull();
  });
});
