import { describe, it, expect } from "vitest";
import { detectDuplicates, mergeFlags, computeBenchmarkFlags } from "./flagIssues";
import type { BillExtraction, FlaggedIssue } from "./types";

const BASE: BillExtraction = {
  provider: "Test Hospital",
  serviceDate: "01/15/2026",
  lineItems: [
    { code: "99213", description: "Office Visit Level 3", billedAmount: 250, paidAmount: 200, patientOwes: 50 },
  ],
  totalBilled: 250,
  totalPatientResponsibility: 50,
  denialReasonCode: null,
  denialReasonText: null,
  currency: "USD",
  region: "US",
  usState: null,
  deadlineDate: null,
};

describe("detectDuplicates", () => {
  it("returns empty when no duplicates", () => {
    const result = detectDuplicates(BASE);
    expect(result).toHaveLength(0);
  });

  it("flags two line items with the same code as duplicate_charge", () => {
    const data: BillExtraction = {
      ...BASE,
      lineItems: [
        { code: "99213", description: "Office Visit Level 3", billedAmount: 250, paidAmount: null, patientOwes: 250 },
        { code: "99213", description: "Office Visit Level 3", billedAmount: 250, paidAmount: null, patientOwes: 250 },
      ],
    };
    const result = detectDuplicates(data);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.every((f) => f.type === "duplicate_charge")).toBe(true);
    expect(result.some((f) => f.lineItemIndex === 0)).toBe(true);
    expect(result.some((f) => f.lineItemIndex === 1)).toBe(true);
  });

  it("flags same-code but slightly different descriptions as duplicates", () => {
    const data: BillExtraction = {
      ...BASE,
      lineItems: [
        { code: "99213", description: "Office Visit Level 3", billedAmount: 250, paidAmount: null, patientOwes: 250 },
        { code: "99213", description: "OFFICE VISIT LVL 3 (repeat)", billedAmount: 250, paidAmount: null, patientOwes: 250 },
      ],
    };
    const result = detectDuplicates(data);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result[0].type).toBe("duplicate_charge");
  });

  it("flags different codes with very similar descriptions as info duplicates", () => {
    const data: BillExtraction = {
      ...BASE,
      lineItems: [
        { code: "99213", description: "Comprehensive metabolic panel", billedAmount: 150, paidAmount: null, patientOwes: 150 },
        { code: "80048", description: "Comprehensive metabolic panel basic", billedAmount: 150, paidAmount: null, patientOwes: 150 },
      ],
    };
    const result = detectDuplicates(data);
    expect(result.some((f) => f.type === "duplicate_charge")).toBe(true);
  });

  it("does not flag completely different items", () => {
    const data: BillExtraction = {
      ...BASE,
      lineItems: [
        { code: "99213", description: "Office Visit Level 3", billedAmount: 250, paidAmount: null, patientOwes: 250 },
        { code: "80048", description: "Blood work", billedAmount: 100, paidAmount: null, patientOwes: 100 },
      ],
    };
    const result = detectDuplicates(data);
    expect(result).toHaveLength(0);
  });
});

describe("mergeFlags", () => {
  it("deduplicates overlapping flags by type + lineItemIndex + normalized description", () => {
    const det: FlaggedIssue[] = [
      { type: "duplicate_charge", severity: "warning", description: "Line 1 and 2 duplicate", lineItemIndex: 0 },
    ];
    const llm: FlaggedIssue[] = [
      { type: "duplicate_charge", severity: "warning", description: "Line 1 and 2 duplicate", lineItemIndex: 0 },
      { type: "upcoding", severity: "warning", description: "E&M code may be too high", lineItemIndex: 0 },
    ];
    const result = mergeFlags(det, llm);
    expect(result).toHaveLength(2);
    expect(result[0].type).toBe("duplicate_charge");
    expect(result[1].type).toBe("upcoding");
  });

  it("keeps deterministic flags even when LLM returns empty", () => {
    const det: FlaggedIssue[] = [
      { type: "duplicate_charge", severity: "warning", description: "Found duplicate", lineItemIndex: 0 },
    ];
    const result = mergeFlags(det, []);
    expect(result).toHaveLength(1);
  });

  it("does not deduplicate different lineItemIndexes for same type", () => {
    const det: FlaggedIssue[] = [
      { type: "duplicate_charge", severity: "warning", description: "Duplicate on line 0", lineItemIndex: 0 },
    ];
    const llm: FlaggedIssue[] = [
      { type: "duplicate_charge", severity: "warning", description: "Duplicate on line 1", lineItemIndex: 1 },
    ];
    const result = mergeFlags(det, llm);
    expect(result).toHaveLength(2);
  });
});

describe("computeBenchmarkFlags", () => {
  const benchMap = new Map([
    ["99213", { cptCode: "99213", description: "Office Visit Level 3", amount: 125, state: null, source: "CMS Medicare Physician & Other Practitioners", year: 2023 }],
    ["99214", { cptCode: "99214", description: "Office Visit Level 4", amount: 180, state: null, source: "CMS Medicare Physician & Other Practitioners", year: 2023 }],
    ["80048", { cptCode: "80048", description: "Basic metabolic panel", amount: 12, state: null, source: "CMS Medicare Physician & Other Practitioners", year: 2023 }],
  ]);

  it("flags known CPT code with real overcharge (>2x benchmark)", () => {
    const items = [
      { code: "99213", description: "Office Visit Level 3", billedAmount: 500, paidAmount: null, patientOwes: 500 },
    ];
    const flags = computeBenchmarkFlags(items, benchMap);
    expect(flags).toHaveLength(1);
    expect(flags[0].type).toBe("excessive_charge");
    expect(flags[0].referenceBasis).toContain("$125.00");
    expect(flags[0].lineItemIndex).toBe(0);
  });

  it("does not flag known CPT code with normal charge", () => {
    const items = [
      { code: "99213", description: "Office Visit Level 3", billedAmount: 150, paidAmount: null, patientOwes: 150 },
    ];
    const flags = computeBenchmarkFlags(items, benchMap);
    expect(flags).toHaveLength(0);
  });

  it("does not flag unknown CPT code (no crash)", () => {
    const items = [
      { code: "99999", description: "Unknown code", billedAmount: 9999, paidAmount: null, patientOwes: 9999 },
    ];
    const flags = computeBenchmarkFlags(items, benchMap);
    expect(flags).toHaveLength(0);
  });

  it("returns empty array for empty items", () => {
    const flags = computeBenchmarkFlags([], benchMap);
    expect(flags).toHaveLength(0);
  });

  it("returns empty array when benchmark map is empty", () => {
    const items = [
      { code: "99213", description: "Office Visit", billedAmount: 500, paidAmount: null, patientOwes: 500 },
    ];
    const flags = computeBenchmarkFlags(items, new Map());
    expect(flags).toHaveLength(0);
  });
});
