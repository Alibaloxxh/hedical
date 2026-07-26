import { describe, it, expect, vi, beforeAll } from "vitest";
import { extractBill } from "./extractBill";

vi.mock("./client", () => ({
  callGroq: vi.fn(),
  VISION_MODEL: "qwen/qwen3.6-27b",
}));

const { callGroq } = await import("./client");

function makeResponse(diagnosisCodes: unknown): string {
  return JSON.stringify({
    provider: "Test Hospital",
    serviceDate: "01/15/2026",
    lineItems: [
      { code: "99213", description: "Office Visit", billedAmount: 250, paidAmount: 200, patientOwes: 50 },
    ],
    denialReasonCode: null,
    denialReasonText: null,
    totalBilled: 250,
    totalPatientResponsibility: 50,
    currency: "USD",
    region: "US",
    usState: "CA",
    deadlineDate: null,
    diagnosisCodes,
  });
}

beforeAll(() => {
  vi.mocked(callGroq).mockReset();
});

describe("extractBill — diagnosisCodes", () => {
  it("extracts diagnosis codes when present", async () => {
    vi.mocked(callGroq).mockResolvedValueOnce(makeResponse([
      { code: "F41.1", description: "Generalized anxiety disorder" },
      { code: "M54.5", description: "Low back pain" },
    ]));

    const result = await extractBill({ base64: "fake", filename: "bill.png" });
    expect(result.diagnosisCodes).toHaveLength(2);
    expect(result.diagnosisCodes![0].code).toBe("F41.1");
    expect(result.diagnosisCodes![0].description).toBe("Generalized anxiety disorder");
    expect(result.diagnosisCodes![1].code).toBe("M54.5");
  });

  it("handles diagnosis codes without descriptions", async () => {
    vi.mocked(callGroq).mockResolvedValueOnce(makeResponse([
      { code: "Z23" },
    ]));

    const result = await extractBill({ base64: "fake", filename: "bill.png" });
    expect(result.diagnosisCodes).toHaveLength(1);
    expect(result.diagnosisCodes![0].code).toBe("Z23");
    expect(result.diagnosisCodes![0].description).toBeUndefined();
  });

  it("returns undefined when diagnosisCodes key is absent", async () => {
    vi.mocked(callGroq).mockResolvedValueOnce(JSON.stringify({
      provider: "Test Hospital",
      serviceDate: "01/15/2026",
      lineItems: [],
      denialReasonCode: null,
      denialReasonText: null,
      totalBilled: null,
      totalPatientResponsibility: null,
      currency: "USD",
      region: "US",
      usState: null,
      deadlineDate: null,
    }));

    const result = await extractBill({ base64: "fake", filename: "bill.png" });
    expect(result.diagnosisCodes).toBeUndefined();
  });

  it("returns empty array when diagnosisCodes is empty", async () => {
    vi.mocked(callGroq).mockResolvedValueOnce(makeResponse([]));

    const result = await extractBill({ base64: "fake", filename: "bill.png" });
    expect(result.diagnosisCodes).toEqual([]);
  });

  it("does not crash when a single code is a string instead of object", async () => {
    vi.mocked(callGroq).mockResolvedValueOnce(makeResponse([
      "F41.1",
    ]));

    const result = await extractBill({ base64: "fake", filename: "bill.png" });
    expect(result.diagnosisCodes).toHaveLength(1);
    expect(result.diagnosisCodes![0].code).toBe("F41.1");
  });
});
