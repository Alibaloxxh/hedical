import { callGroq, TEXT_MODEL, MAX_TOKENS } from "./client";
import type { BillExtraction, FlaggedIssue } from "./types";
import { currencySymbol } from "./currency";
import { lookupDenialCodes, formatDenialContext } from "./lookupDenialCode";
import { createClient } from "@/lib/supabase/server";

interface DraftAppealInput {
  extraction: BillExtraction;
  flags: FlaggedIssue[];
  patientName: string;
  claimNumber?: string;
  recipientName?: string;
  recipientAddress?: string;
}

export async function draftAppealLetter(input: DraftAppealInput): Promise<string> {
  const sym = currencySymbol(input.extraction.currency);
  const isNonUS = input.extraction.region && input.extraction.region !== "US" && input.extraction.region !== "USA";
  const regionNotice = isNonUS
    ? `\nIMPORTANT: This document is from ${input.extraction.region}. US insurance protections (No Surprises Act, ERISA, state-level appeals rights) do NOT apply. Include a notice at the top of the letter explaining that this is a non-US document and the appeal process may differ.\n`
    : "";

  const supabase = await createClient();
  const denialCodes = await lookupDenialCodes(supabase, input.extraction.denialReasonCode);
  const denialContext = formatDenialContext(denialCodes);

  const hasMedicalNecessityDenial = denialCodes.some(
    (d) =>
      d.category?.toLowerCase().includes("medical necessity") ||
      d.category?.toLowerCase().includes("medical-necessity") ||
      d.description?.toLowerCase().includes("medical necessity") ||
      d.description?.toLowerCase().includes("not medically necessary")
  );

  const diagnosisSection = hasMedicalNecessityDenial && input.extraction.diagnosisCodes?.length
    ? `\nDIAGNOSIS CODES ON CLAIM:\n${input.extraction.diagnosisCodes
        .map((d) => `  - ${d.code}${d.description ? `: ${d.description}` : ""}`)
        .join("\n")}\n`
    : "";

  const prompt = `You are a medical billing advocate. Draft a formal appeal letter on behalf of a patient challenging an insurance denial or billing error.

PATIENT NAME: ${input.patientName}
CLAIM NUMBER: ${input.claimNumber || "Not provided"}
RECIPIENT: ${input.recipientName || "Insurance Appeals Department"}
RECIPIENT ADDRESS: ${input.recipientAddress || ""}
CURRENCY: ${input.extraction.currency || "USD"} (use ${sym} for monetary amounts)
REGION: ${input.extraction.region || "Not detected"}${regionNotice}

BILL DATA:
${JSON.stringify(input.extraction, null, 2)}

DENIAL CODE REFERENCE:
${denialContext || "  (No standard denial code found — see raw denial text above.)"}${diagnosisSection}

FLAGGED ISSUES:
${JSON.stringify(input.flags, null, 2)}

Write a professional, formal appeal letter that:
1. Is addressed to the insurance company's appeals department.
2. Includes the patient's name and claim number at the top.
3. Clearly states that this is an appeal of a denial or billing error.
4. For each flagged issue, explains clearly why the charge should be reconsidered, citing specific reasons.
5. Requests a formal review of the claim.
6. Includes a request for a written response within the legally required timeframe.
7. If the denial is based on medical necessity, reference the patient's listed diagnosis codes and explain the clinical rationale for the service in the context of those diagnoses.
8. Is formatted as a proper business letter with date, addresses, salutation, body, closing, and signature block.

Format as plain text suitable for copying into a letter or email. Use a professional but persuasive tone. Do NOT make guarantees about outcomes — frame it as a request for review and reconsideration.

IMPORTANT: Include this disclaimer at the very bottom of the letter (after the signature):
"[This letter was drafted with AI assistance based on the documents provided. The patient should review all content for accuracy before submitting.]"

Return ONLY the letter text, no additional commentary.`;

  const response = await callGroq({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: MAX_TOKENS,
  });

  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
