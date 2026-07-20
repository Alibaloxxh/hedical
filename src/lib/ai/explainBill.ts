import { callGroq, TEXT_MODEL, MAX_TOKENS } from "./client";
import type { BillExtraction } from "./types";
import { currencySymbol } from "./currency";

export async function explainBill(extraction: BillExtraction): Promise<string> {
  const sym = currencySymbol(extraction.currency);

  const isNonUS = extraction.region && extraction.region !== "US" && extraction.region !== "USA";
  const regionNotice = isNonUS
    ? `IMPORTANT: This document appears to be from ${extraction.region}. US insurance protections (No Surprises Act, state-level appeals rights, etc.) generally do not apply. Include a notice at the top explaining that this is a non-US document and US-specific protections don't apply.`
    : "";

  const prompt = `You are a friendly medical bill translator. Your job is to explain a medical bill, invoice, or EOB in plain, simple English that a patient can understand.

Here is the structured data extracted from the document:

Provider/Facility: ${extraction.provider}
Date of Service: ${extraction.serviceDate}
Currency: ${extraction.currency || "Not detected"}
Region: ${extraction.region || "Not detected"}
Total Billed: ${extraction.totalBilled !== null ? `${sym}${extraction.totalBilled.toFixed(2)}` : "Not shown"}
Total Patient Responsibility: ${extraction.totalPatientResponsibility !== null ? `${sym}${extraction.totalPatientResponsibility.toFixed(2)}` : "Not shown"}
Denial Reason Code: ${extraction.denialReasonCode || "None"}
Denial Reason Text: ${extraction.denialReasonText || "None"}
Deadline Date: ${extraction.deadlineDate || "Not shown"}

Line Items:
${extraction.lineItems.map((item, i) => `  ${i + 1}. Code: ${item.code} — ${item.description}
     Billed: ${item.billedAmount !== null ? `${sym}${item.billedAmount.toFixed(2)}` : "N/A"}
     Insurance Paid: ${item.paidAmount !== null ? `${sym}${item.paidAmount.toFixed(2)}` : "N/A"}
     You Owe: ${item.patientOwes !== null ? `${sym}${item.patientOwes.toFixed(2)}` : "N/A"}`).join("\n")}

${regionNotice}

Write a clear, friendly explanation for the patient. Structure it as follows:

1. BOTTOM LINE FIRST — Start with one sentence that tells the patient the most important thing they need to know: how much they owe (if shown), whether there's a denial to deal with, and/or whether something looks wrong. Do NOT begin by describing what the document is — begin with what matters.

2. KEY DETAILS — In 2-3 short paragraphs, explain only what's most important: what the main charge is for, whether insurance covered any of it, and any specific items that need attention. Do NOT narrate every single line item — only mention ones that are unusual or important.

3. IF THERE'S A DENIAL — In one paragraph, explain in plain language why the claim was denied and what that means for the patient.

4. WHAT TO DO NEXT — 2-3 practical steps the patient can take. Include a reminder that this information is not a substitute for professional advice.

Format with short paragraphs for readability. Do not use markdown formatting. Keep the tone helpful and calm — medical bills are stressful, and this explanation should reduce anxiety, not add to it.`;

  const response = await callGroq({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: MAX_TOKENS,
  });

  return response.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
}
