import { describe, it, expect } from "vitest";
import { detectDuplicates, mergeFlags, validateReferenceBasis } from "./flagIssues";
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
    // Each flagged item should reference the correct line
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
    // Should still match since descriptions are very similar
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

describe("validateReferenceBasis", () => {
  it("keeps referenceBasis when it names a known source (NADAC)", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "warning",
      description: "Charge exceeds NADAC average",
      lineItemIndex: 0,
      referenceBasis: "NADAC average for this drug is $150",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBe("NADAC average for this drug is $150");
  });

  it("keeps referenceBasis when it names CMS fee schedule", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "warning",
      description: "Above CMS fee schedule",
      lineItemIndex: 0,
      referenceBasis: "CMS Physician Fee Schedule for this locality",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBe("CMS Physician Fee Schedule for this locality");
  });

  it("keeps referenceBasis when it mentions FAIR Health", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "warning",
      description: "Above fair health benchmark",
      lineItemIndex: 0,
      referenceBasis: "FAIR Health regional benchmark",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBe("FAIR Health regional benchmark");
  });

  it("clears referenceBasis when it names an unrecognized source", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "warning",
      description: "Vastly overpriced",
      lineItemIndex: 0,
      referenceBasis: "My private pricing database says this should be $50",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBeNull();
  });

  it("does nothing for non-excessive_charge types", () => {
    const flag: FlaggedIssue = {
      type: "upcoding",
      severity: "warning",
      description: "Upcoding detected",
      lineItemIndex: 0,
      referenceBasis: "Some random basis",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBe("Some random basis");
  });

  it("does nothing when referenceBasis is null", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "warning",
      description: "Above typical rate",
      lineItemIndex: 0,
      referenceBasis: null,
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBeNull();
  });

  it("accepts 'usual customary and reasonable' as a valid source", () => {
    const flag: FlaggedIssue = {
      type: "excessive_charge",
      severity: "info",
      description: "Above UCR",
      lineItemIndex: 0,
      referenceBasis: "Usual customary and reasonable rate for this geographic area",
    };
    validateReferenceBasis(flag);
    expect(flag.referenceBasis).toBeTruthy();
  });
});
