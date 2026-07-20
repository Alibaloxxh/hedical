/**
 * Reference knowledge base of known billing error patterns.
 *
 * These patterns are used as citations in AI prompts rather than
 * relying on model guesswork. Each pattern includes:
 *   - A descriptive name
 *   - What to look for in the data
 *   - Why it's likely an error
 *   - A citation source where applicable
 *
 * NOTE: This is an initial set based on industry research. The user
 * will provide a more comprehensive pattern list for fine-tuning.
 */

export interface BillingPattern {
  id: string;
  name: string;
  category: "duplicate" | "upcoding" | "unbundling" | "noncovered" | "out_of_network" | "prior_auth" | "excessive";
  detectionHint: string;
  explanation: string;
  citation?: string;
}

export const billingPatterns: BillingPattern[] = [
  {
    id: "dup-001",
    name: "Duplicate charge — same code, same date",
    category: "duplicate",
    detectionHint: "The same CPT/HCPCS code appears more than once on the same service date with matching descriptions.",
    explanation: "Charging the same procedure code twice for the same date of service is generally not allowed unless separately documented and justified.",
    citation: "CMS Medicare Claims Processing Manual, Chapter 23, §20.9",
  },
  {
    id: "dup-002",
    name: "Duplicate charge — overlapping dates",
    category: "duplicate",
    detectionHint: "The same or equivalent service code appears for overlapping date ranges (e.g., daily monitoring billed for two overlapping admission periods).",
    explanation: "Overlapping service dates for identical codes typically indicate a billing error or double-billing.",
  },
  {
    id: "upc-001",
    name: "Upcoding — evaluation and management",
    category: "upcoding",
    detectionHint: "An E&M code (99201–99215, 99221–99239, 99281–99285) is at the highest level (e.g., 99285 for ED) without corresponding procedure codes suggesting that level of complexity.",
    explanation: "Upcoding occurs when a provider bills a higher-level code than the service performed warrants. High-level E&M codes require specific documentation of medical necessity.",
    citation: "OIG Work Plan: Evaluation and Management Services — Annual focus area for upcoding review.",
  },
  {
    id: "upc-002",
    name: "Modifier overuse or misuse",
    category: "upcoding",
    detectionHint: "Modifier -25 or -59 is applied frequently, especially on the same date of service across many line items.",
    explanation: "Modifier -25 (significant, separately identifiable E&M) and -59 (distinct procedural service) are frequently misused to unbundle or double-charge. Insurers scrutinize these patterns.",
    citation: "AMA CPT Guidelines: Modifiers -25 and -59 require clear documentation of distinct services.",
  },
  {
    id: "unb-001",
    name: "Unbundling — code that includes the components",
    category: "unbundling",
    detectionHint: "A comprehensive code (e.g., a surgical package) appears alongside individual component codes that are normally included in the global fee.",
    explanation: "Unbundling is billing separately for procedures that are normally included in a single comprehensive code. Example: billing a global surgical code AND separately billing the closure or follow-up visit.",
    citation: "NCCI Procedure-to-Procedure (PTP) edits — CMS National Correct Coding Initiative.",
  },
  {
    id: "non-001",
    name: "Non-covered or investigational service",
    category: "noncovered",
    detectionHint: "Service code is for an experimental, investigational, or generally non-covered procedure (common denial codes: CO-50, CO-11).",
    explanation: "Some services are explicitly excluded from coverage. If denied with reason code CO-50 (non-covered service), check whether the patient signed an ABN (Advance Beneficiary Notice).",
  },
  {
    id: "oon-001",
    name: "Out-of-network surprise billing",
    category: "out_of_network",
    detectionHint: "An out-of-network provider or facility was used at an in-network facility (e.g., out-of-network anesthesiologist at an in-network hospital).",
    explanation: "The No Surprises Act (effective Jan 2022) generally prohibits surprise billing for emergency services and for out-of-network providers at in-network facilities. Patients should only owe their in-network cost-sharing amount.",
    citation: "No Surprises Act, 2022 — 45 CFR §149.610, §149.620; CMS Surprise Billing protections.",
  },
  {
    id: "pa-001",
    name: "Missing or denied prior authorization",
    category: "prior_auth",
    detectionHint: "Denial reason code references prior authorization (e.g., CO-26, CO-204, PR-26, or remark code N382).",
    explanation: "If a service required prior authorization and it wasn't obtained, the claim may be denied. However, in many states, insurers cannot retroactively deny in-network services for lack of prior auth if the service was medically necessary.",
    citation: "AMA 2025 Prior Authorization Survey: 92% of physicians report negative clinical outcomes from prior auth processes.",
  },
  {
    id: "exc-001",
    name: "Charge exceeds usual and customary",
    category: "excessive",
    detectionHint: "The billed amount is significantly higher than typical rates for the same procedure in the same geographic area.",
    explanation: "Some providers charge well above the usual, customary, and reasonable (UCR) rate. Patients with out-of-network benefits or balance billing may be liable for the excess. Negotiation or financial aid may be appropriate.",
    // TODO: Replace generic UCR reference with real fee schedule lookups (CMS Physician Fee Schedule,
    // NADAC drug pricing, FAIR Health database, or state-specific all-payer claims databases). Without
    // live data, the model has no authoritative comparison point — this pattern currently relies on
    // the model's training knowledge, which is not reliable for specific regional benchmarks.
  },
];

export function getPatternsByCategory(category: BillingPattern["category"]): BillingPattern[] {
  return billingPatterns.filter((p) => p.category === category);
}

export function getPatternById(id: string): BillingPattern | undefined {
  return billingPatterns.find((p) => p.id === id);
}
