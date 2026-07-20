import { describe, it, expect } from "vitest";
import { checkConsistency, selfPayDetected, isNonUSDoc } from "./consistency";
import type { AnalysisData } from "./consistency";

const BASE: AnalysisData = {
  extraction: {
    provider: "Test Hospital",
    serviceDate: "01/15/2026",
    lineItems: [
      { code: "99213", description: "Office visit", billedAmount: 250, paidAmount: 200, patientOwes: 50 },
    ],
    totalBilled: 250,
    totalPatientResponsibility: 50,
    denialReasonCode: null,
    denialReasonText: null,
    currency: "USD",
    region: "US",
  },
  explanation: "Test explanation",
  flags: [],
};

describe("checkConsistency", () => {
  it("returns ok when data is consistent", () => {
    const result = checkConsistency(BASE);
    expect(result.ok).toBe(true);
  });

  it("returns not ok when flags say 'no denial' but denial code is present", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: { ...BASE.extraction, denialReasonCode: "CO-50", denialReasonText: "Not medically necessary" },
      flags: [
        { type: "other", severity: "info", description: "No denial found in this document" },
      ],
    };
    const result = checkConsistency(data);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("couldn't fully parse");
  });

  it("returns not ok when flag references denial but no denial code extracted", () => {
    const data: AnalysisData = {
      ...BASE,
      flags: [
        { type: "missing_prior_auth", severity: "warning", description: "Denial may apply due to missing prior authorization" },
      ],
    };
    const result = checkConsistency(data);
    expect(result.ok).toBe(false);
    expect(result.message).toContain("couldn't fully parse");
  });

  it("returns ok when flag mentions 'denial' and denial code is also present (not contradictory)", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: { ...BASE.extraction, denialReasonCode: "CO-50", denialReasonText: "Not medically necessary" },
      flags: [
        { type: "missing_prior_auth", severity: "warning", description: "Denial due to prior auth" },
      ],
    };
    const result = checkConsistency(data);
    expect(result.ok).toBe(true);
  });
});

describe("selfPayDetected", () => {
  it("returns true when total equals billed and no paid amounts exist", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: {
        ...BASE.extraction,
        lineItems: [
          { code: "99213", description: "Office visit", billedAmount: 500, paidAmount: null, patientOwes: 500 },
        ],
        totalBilled: 500,
        totalPatientResponsibility: 500,
      },
    };
    expect(selfPayDetected(data)).toBe(true);
  });

  it("returns false when paidAmount exists on a line item", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: {
        ...BASE.extraction,
        lineItems: [
          { code: "99213", description: "Office visit", billedAmount: 500, paidAmount: 300, patientOwes: 200 },
        ],
        totalBilled: 500,
        totalPatientResponsibility: 200,
      },
    };
    expect(selfPayDetected(data)).toBe(false);
  });

  it("returns false when totalPatientResponsibility differs from totalBilled", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: {
        ...BASE.extraction,
        lineItems: [
          { code: "99213", description: "Office visit", billedAmount: 500, paidAmount: null, patientOwes: 200 },
        ],
        totalBilled: 500,
        totalPatientResponsibility: 200,
      },
    };
    expect(selfPayDetected(data)).toBe(false);
  });

  it("returns false when totalPatientResponsibility is null", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: { ...BASE.extraction, totalPatientResponsibility: null },
    };
    expect(selfPayDetected(data)).toBe(false);
  });

  it("returns false when totalBilled is null", () => {
    const data: AnalysisData = {
      ...BASE,
      extraction: { ...BASE.extraction, totalBilled: null },
    };
    expect(selfPayDetected(data)).toBe(false);
  });
});

describe("isNonUSDoc", () => {
  it("returns false for US", () => {
    expect(isNonUSDoc("US")).toBe(false);
  });

  it("returns false for USA", () => {
    expect(isNonUSDoc("USA")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isNonUSDoc(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isNonUSDoc(undefined)).toBe(false);
  });

  it("returns true for IN", () => {
    expect(isNonUSDoc("IN")).toBe(true);
  });

  it("returns true for GB", () => {
    expect(isNonUSDoc("GB")).toBe(true);
  });

  it("returns true for AU", () => {
    expect(isNonUSDoc("AU")).toBe(true);
  });
});
