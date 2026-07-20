export interface LineItem {
  code: string;
  description: string;
  billedAmount: number | null;
  paidAmount: number | null;
  patientOwes: number | null;
}

export interface DocumentLocale {
  currency: string | null;
  region: string | null;
}

export interface BillExtraction {
  provider: string;
  serviceDate: string;
  lineItems: LineItem[];
  denialReasonCode: string | null;
  denialReasonText: string | null;
  totalBilled: number | null;
  totalPatientResponsibility: number | null;
  currency: string | null;
  region: string | null;
  usState: string | null;
  deadlineDate: string | null;
}

export interface FlaggedIssue {
  type: "duplicate_charge" | "upcoding" | "unbundling" | "out_of_network" | "missing_prior_auth" | "excessive_charge" | "other";
  severity: "info" | "warning" | "error";
  description: string;
  lineItemIndex?: number;
  citation?: string;
  referenceBasis?: string | null;
}

export interface AnalysisResult {
  extraction: BillExtraction;
  explanation: string;
  flags: FlaggedIssue[];
}

export interface AppealLetterResult {
  letterText: string;
  recipientName: string;
  recipientAddress: string;
  claimNumber: string;
  patientName: string;
}
