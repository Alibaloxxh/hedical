export interface AnalysisData {
  extraction: {
    provider: string;
    serviceDate: string;
    lineItems: {
      code: string;
      description: string;
      billedAmount: number | null;
      paidAmount: number | null;
      patientOwes: number | null;
    }[];
    totalBilled: number | null;
    totalPatientResponsibility: number | null;
    denialReasonCode: string | null;
    denialReasonText: string | null;
    currency: string | null;
    region: string | null;
    usState?: string | null;
    deadlineDate?: string | null;
  };
  explanation: string;
  flags: {
    type: string;
    severity: string;
    description: string;
    lineItemIndex?: number;
    citation?: string;
    referenceBasis?: string | null;
  }[];
}

export interface ConsistencyResult {
  ok: boolean;
  message?: string;
}

export function checkConsistency(data: AnalysisData): ConsistencyResult {
  const e = data.extraction;

  // TODO: Add additional consistency checks — e.g., flag if totalBilled doesn't match sum of
  // line item billedAmounts (as a cross-check), or if currency/region pairing is suspicious
  // (INR detected with region=US).

  const flagsClaimNoDenial = data.flags.some(
    (f) => f.description.toLowerCase().includes("no denial") && f.severity === "info"
  );
  if (flagsClaimNoDenial && e.denialReasonCode) {
    return {
      ok: false,
      message:
        "We couldn't fully parse this document. The extracted data contains conflicting information about whether a denial is present. Please review the raw output below.",
    };
  }

  const flagsReferenceDenial = data.flags.some(
    (f) => f.description.toLowerCase().includes("denial") || f.type === "missing_prior_auth"
  );
  if (flagsReferenceDenial && !e.denialReasonCode && !e.denialReasonText) {
    return {
      ok: false,
      message:
        "We couldn't fully parse this document. Some flags reference a denial, but the document didn't clearly show a denial reason. Please review the raw output below.",
    };
  }

  return { ok: true };
}

export function selfPayDetected(data: AnalysisData): boolean {
  const e = data.extraction;
  if (e.totalPatientResponsibility === null || e.totalBilled === null) return false;
  const allPaidNull = e.lineItems.every((li) => li.paidAmount === null);
  return allPaidNull && Math.abs(e.totalPatientResponsibility - e.totalBilled) < 0.01;
}

export function isNonUSDoc(region: string | null | undefined): boolean {
  if (!region) return false;
  return region !== "US" && region !== "USA";
}
