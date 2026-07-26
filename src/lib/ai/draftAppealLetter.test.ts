import { describe, it, expect, vi, beforeAll } from "vitest";
import { parseDenialCodes, formatDenialContext, lookupDenialCodes } from "./lookupDenialCode";
import type { DenialCodeInfo } from "./lookupDenialCode";

describe("parseDenialCodes", () => {
  it("parses single CARC code", () => {
    expect(parseDenialCodes("CO-50")).toEqual(["CO-50"]);
  });

  it("parses multiple codes separated by slash", () => {
    expect(parseDenialCodes("CO-50 / PR-5")).toEqual(["CO-50", "PR-5"]);
  });

  it("parses codes separated by semicolon", () => {
    expect(parseDenialCodes("CO-50;PR-5")).toEqual(["CO-50", "PR-5"]);
  });

  it("handles mixed delimiters", () => {
    expect(parseDenialCodes("CO-50 / PR-5, N130")).toEqual(["CO-50", "PR-5", "N130"]);
  });

  it("trims whitespace and uppercases", () => {
    expect(parseDenialCodes(" co-50 ")).toEqual(["CO-50"]);
  });

  it("returns empty array for null", () => {
    expect(parseDenialCodes(null)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parseDenialCodes("")).toEqual([]);
  });
});

describe("formatDenialContext", () => {
  it("formats a single code", () => {
    const codes: DenialCodeInfo[] = [
      { code: "CO-50", code_type: "CARC", description: "Not medically necessary", category: null, common_appeal_argument: null },
    ];
    expect(formatDenialContext(codes)).toBe("  - CO-50 (CARC): Not medically necessary");
  });

  it("formats multiple codes", () => {
    const codes: DenialCodeInfo[] = [
      { code: "CO-50", code_type: "CARC", description: "Not medically necessary", category: null, common_appeal_argument: null },
      { code: "PR-5", code_type: "CARC", description: "Non-covered service", category: null, common_appeal_argument: null },
    ];
    const result = formatDenialContext(codes);
    expect(result).toContain("CO-50");
    expect(result).toContain("PR-5");
    expect(result).toContain("Non-covered service");
  });

  it("returns empty string for empty array", () => {
    expect(formatDenialContext([])).toBe("");
  });
});

describe("lookupDenialCodes", () => {
  const knownCodes: Record<string, DenialCodeInfo> = {
    "50": { code: "50", code_type: "CARC", description: "Not medically necessary", category: null, common_appeal_argument: null },
    "5": { code: "5", code_type: "CARC", description: "Non-covered service", category: null, common_appeal_argument: null },
    "N130": { code: "N130", code_type: "RARC", description: "Consultation not covered", category: null, common_appeal_argument: null },
  };

  function mockSupabase() {
    return {
      from: () => ({
        select: () => ({
          eq: (_col: string, val: string) => ({
            maybeSingle: () => {
              const info = knownCodes[val];
              return Promise.resolve({ data: info ?? null, error: null });
            },
          }),
        }),
      }),
    };
  }

  it("returns info for known CARC code with qualifier prefix (CO-50 → 50)", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, "CO-50");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("50");
    expect(result[0].description).toBe("Not medically necessary");
    expect(result[0].code_type).toBe("CARC");
  });

  it("returns info for known RARC code (no prefix needed)", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, "N130");
    expect(result).toHaveLength(1);
    expect(result[0].code_type).toBe("RARC");
  });

  it("returns multiple results for multi-code denial with mixed prefixes", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, "CO-50 / PR-5");
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.code)).toEqual(["50", "5"]);
  });

  it("returns empty array for unknown code", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, "XX-999");
    expect(result).toHaveLength(0);
  });

  it("returns empty array for null input", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, null);
    expect(result).toHaveLength(0);
  });

  it("gracefully handles partial match (some known, some unknown)", async () => {
    const result = await lookupDenialCodes(mockSupabase() as any, "CO-50 / XX-999");
    expect(result).toHaveLength(1);
    expect(result[0].code).toBe("50");
  });
});
