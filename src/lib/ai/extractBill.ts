import { callGroq, VISION_MODEL } from "./client";
import type { BillExtraction, LineItem } from "./types";

function guessMimeType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "pdf": return "application/pdf";
    case "tiff":
    case "tif": return "image/tiff";
    case "webp": return "image/webp";
    default: return "image/jpeg";
  }
}

interface ExtractBillInput {
  base64: string;
  filename: string;
}

export async function extractBill(input: ExtractBillInput): Promise<BillExtraction> {
  const mimeType = guessMimeType(input.filename);

  const systemPrompt = `You are a medical bill and EOB extraction specialist. Your job is to extract structured data from medical bills, Explanation of Benefits (EOB) documents, denial letters, invoices, and similar documents from ANY country.

Extract ALL of the following fields from the document image/PDF:

1. Provider name and facility name
2. Date(s) of service
3. EVERY line item — for each, extract:
   - Procedure/service code (CPT, HCPCS, or revenue code)
   - Description of the service
   - Billed amount (the amount the provider charged)
   - Paid amount (what the insurance paid, if shown)
   - Patient responsibility (what the patient owes, if shown)
4. Total billed amount
5. Total patient responsibility
6. Denial reason code (if present, e.g., CO-16, PR-5, etc.)
7. Denial reason text description
8. CURRENCY — detect the currency used in the document (e.g., "USD", "INR", "EUR", "GBP", "JPY", etc.). Look for currency symbols ($, ₹, €, £, ¥, etc.), currency codes (USD, INR, EUR), and any other signal in the document. If unsure, use null.
9. REGION — detect the country or region the document is from. Look for:
   - Addresses (state names, zip/postal codes, country names)
   - Tax ID formats (GSTIN for India, VAT for EU, EIN for US)
   - Phone number formats
   - Currency symbols and codes
   - Regulatory references (No Surprises Act → US, GST → India, VAT → EU, etc.)
   - Language and terminology
   If unsure, use null.
10. US STATE — if the region is US, detect the two-letter US state abbreviation from addresses or state names on the document (e.g., "CA", "NY", "TX"). If unsure or if the document is not from the US, use null.
11. DEADLINE DATE — if the document shows a response deadline, appeal deadline, or payment due date (e.g., "must be received by 07/15/2026", "appeal deadline: 30 days from receipt", "due by 08/01/2026"), extract that date as a string in MM/DD/YYYY format. If no deadline is visible, use null.

Return JSON in this exact shape (use these exact field names):

{
  "provider": "City General Hospital",
  "serviceDate": "06/15/2026",
  "lineItems": [
    {
      "code": "99213",
      "description": "Office Visit Level 3",
      "billedAmount": 250.00,
      "paidAmount": 180.00,
      "patientOwes": 70.00
    }
  ],
  "denialReasonCode": "CO-50",
  "denialReasonText": "Not medically necessary",
  "totalBilled": 790.00,
  "totalPatientResponsibility": 495.00,
  "currency": "USD",
  "region": "US",
  "usState": "CA",
  "deadlineDate": "08/15/2026"
}

Rules:
- Do NOT include any reasoning or thinking. Output ONLY the JSON object.
- Use the EXACT field names shown above (camelCase).
- Use number type for all monetary values (not strings).
- If a value is not present in the document, use null.
- If a denial code or text is not present, use null for both.
- Be thorough — extract every single line item you can find.
- For the line items array, include ALL items even if amounts are missing.
- IMPORTANT — For totalBilled and totalPatientResponsibility: read these values directly from the printed text on the document. Do NOT calculate or sum them from the line items, even if you can see the individual line item amounts. The document's printed totals are the source of truth: they may include fees, adjustments, copays, deductibles, or other amounts not reflected in individual line items. If the printed total is present, use it. Only use null if no total is printed anywhere on the document.
- For currency and region: base your detection ONLY on signals visible in the document text, layout, and formatting. Do not guess or default to "USD"/"US" — use null if you cannot identify them.`;

  const contentType = mimeType === "application/pdf" ? "image/png" : mimeType;

  const content: any[] = [
    { type: "text", text: "Extract structured data from this medical bill or EOB document." },
    { type: "image_url", image_url: { url: `data:${contentType};base64,${input.base64}` } },
  ];

  const response = await callGroq({
    model: VISION_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content },
    ],
    max_tokens: 4096,
    reasoning_effort: "none",
    response_format: { type: "json_object" },
  });

  let raw = response
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();
  if (raw.startsWith("```json")) {
    raw = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (raw.startsWith("```")) {
    raw = raw.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function toCamelCase(obj: any): any {
    if (Array.isArray(obj)) return obj.map(toCamelCase);
    if (obj !== null && typeof obj === "object") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const out: any = {};
      for (const key of Object.keys(obj)) {
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        out[camelKey] = toCamelCase(obj[key]);
      }
      return out;
    }
    return obj;
  }

  const parsed = toCamelCase(JSON.parse(raw)) as BillExtraction;

  if (!Array.isArray(parsed.lineItems)) {
    parsed.lineItems = [];
  }
  parsed.lineItems = parsed.lineItems.map((item: LineItem) => ({
    code: item.code || "UNKNOWN",
    description: item.description || "",
    billedAmount: typeof item.billedAmount === "number" ? item.billedAmount : null,
    paidAmount: typeof item.paidAmount === "number" ? item.paidAmount : null,
    patientOwes: typeof item.patientOwes === "number" ? item.patientOwes : null,
  }));

  return {
    provider: parsed.provider || "Unknown Provider",
    serviceDate: parsed.serviceDate || "Unknown Date",
    lineItems: parsed.lineItems,
    denialReasonCode: parsed.denialReasonCode || null,
    denialReasonText: parsed.denialReasonText || null,
    totalBilled: typeof parsed.totalBilled === "number" ? parsed.totalBilled : null,
    totalPatientResponsibility: typeof parsed.totalPatientResponsibility === "number" ? parsed.totalPatientResponsibility : null,
    currency: typeof parsed.currency === "string" ? parsed.currency.toUpperCase() : null,
    region: typeof parsed.region === "string" ? parsed.region.toUpperCase() : null,
    usState: typeof parsed.usState === "string" ? parsed.usState.toUpperCase() : null,
    deadlineDate: typeof parsed.deadlineDate === "string" ? parsed.deadlineDate : null,
  };
}

// TODO: Add server-side validation of currency/region detection (e.g., cross-reference detected
// currency against detected region for consistency — INR should pair with IN, not US). A future
// enhancement could also use a lightweight locale-detection library as a secondary signal.
