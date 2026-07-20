import { callGroq, TEXT_MODEL, MAX_TOKENS } from "./client";
import type { BillExtraction, FlaggedIssue } from "./types";
import { billingPatterns } from "./patterns";
import { getStateProtection } from "./stateProtections";

const US_ONLY_PATTERN_IDS = new Set(["oon-001", "pa-001", "non-001"]);

// Known authoritative pricing references — used to validate model claims in referenceBasis.
// The model may fabricate a reference (e.g. "CMS fee schedule rate $450") even when it has no
// real data. This list lets us reject claims that don't name a known source.
// TODO: Replace this static list with live API calls to the actual data sources.
const KNOWN_PRICING_SOURCES = [
  "nadac", "national average drug acquisition cost",
  "cms physician fee schedule", "medicare physician fee schedule",
  "fair health", "fairhealth",
  "medicare fee schedule",
  "usual customary and reasonable", "ucr rate",
  "regional benchmark",
  "all-payer claims database", "apcd",
  "state", "geographic area", "locality",
];

function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
}

function descSimilarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;

  const tokensA = new Set(na.split(/\s+/));
  const tokensB = new Set(nb.split(/\s+/));
  const intersection = new Set([...tokensA].filter((t) => tokensB.has(t)));
  const union = new Set([...tokensA, ...tokensB]);
  return intersection.size / union.size;
}

export function detectDuplicates(extraction: BillExtraction): FlaggedIssue[] {
  const flags: FlaggedIssue[] = [];
  const items = extraction.lineItems;

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];

      if (!a.code || !b.code) continue;

      const sameCode = a.code === b.code;
      const sim = descSimilarity(a.description || "", b.description || "");

      if (sameCode) {
        flags.push({
          type: "duplicate_charge",
          severity: "warning",
          description: `Line ${i + 1} and line ${j + 1} both show code ${a.code} ("${a.description}") — this may be a duplicate charge for the same service.`,
          lineItemIndex: i,
          citation: "CMS Medicare Claims Processing Manual, Chapter 23, §20.9",
          referenceBasis: null,
        });
        flags.push({
          type: "duplicate_charge",
          severity: "warning",
          description: `Line ${i + 1} and line ${j + 1} both show code ${a.code} ("${a.description}") — this may be a duplicate charge for the same service.`,
          lineItemIndex: j,
          citation: "CMS Medicare Claims Processing Manual, Chapter 23, §20.9",
          referenceBasis: null,
        });
      } else if (sim >= 0.8) {
        flags.push({
          type: "duplicate_charge",
          severity: "info",
          description: `Line ${i + 1} ("${a.description}") and line ${j + 1} ("${b.description}") describe very similar services under different codes (${a.code} vs ${b.code}) — worth verifying both are distinct.`,
          lineItemIndex: i,
          citation: undefined,
          referenceBasis: null,
        });
      }
    }
  }

  return flags;
}

export function mergeFlags(deterministic: FlaggedIssue[], llmFlags: FlaggedIssue[]): FlaggedIssue[] {
  const seen = new Set<string>();

  const key = (f: FlaggedIssue): string =>
    `${f.type}|${f.lineItemIndex ?? -1}|${normalize(f.description).slice(0, 60)}`;

  for (const f of deterministic) {
    seen.add(key(f));
  }

  const filtered = llmFlags.filter((f) => {
    const k = key(f);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return [...deterministic, ...filtered];
}

export function validateReferenceBasis(flag: FlaggedIssue): void {
  if (flag.type !== "excessive_charge") return;
  if (!flag.referenceBasis) return;

  const lower = flag.referenceBasis.toLowerCase();
  const recognized = KNOWN_PRICING_SOURCES.some((src) => lower.includes(src));

  if (!recognized) {
    flag.referenceBasis = null;
  }
}

export async function flagIssues(extraction: BillExtraction): Promise<FlaggedIssue[]> {
  const deterministic = detectDuplicates(extraction);

  const isNonUS = extraction.region && extraction.region !== "US" && extraction.region !== "USA";

  const filteredPatterns = isNonUS
    ? billingPatterns.filter((p) => !US_ONLY_PATTERN_IDS.has(p.id))
    : billingPatterns;

  const patternsJson = JSON.stringify(filteredPatterns, null, 2);

  const regionNotice = isNonUS
    ? `\nNOTE: This document appears to be from ${extraction.region}. Do NOT apply US-specific regulations (No Surprises Act, prior-authorization rules, EOB/insurance responsibility framing). Instead, any region-specific patterns should note that US protections don't apply.`
    : "";

  const stateInfo = (() => {
    if (!extraction.usState) return "";
    const prot = getStateProtection(extraction.usState);
    if (!prot) return "";
    return `\nSTATE-SPECIFIC PROTECTIONS (${prot.name}): Surprise billing: ${prot.surpriseBilling}. External review: ${prot.externalReview}. Balance billing: ${prot.balanceBilling}. Appeal deadline: ${prot.appealDeadlineDays} days. Reference these when relevant to the data above.`;
  })();

  const prompt = `You are a medical billing auditor. Analyze the following bill/EOB data against the known error patterns provided below.

PATIENT BILL DATA:
${JSON.stringify(extraction, null, 2)}

DETECTED CURRENCY: ${extraction.currency || "Not detected"}
DETECTED REGION: ${extraction.region || "Not detected"}${regionNotice}${stateInfo}

KNOWN BILLING ERROR PATTERNS (reference knowledge base — cite these when applicable):
${patternsJson}

For each issue you find, return a JSON array of issue objects with this structure:
[
  {
    "type": "upcoding" | "unbundling" | "out_of_network" | "missing_prior_auth" | "excessive_charge" | "other",
    "severity": "info" | "warning" | "error",
    "description": "Clear explanation of what was found and why it may be an issue",
    "lineItemIndex": null or the 0-based index of the relevant line item,
    "citation": "Name of the relevant pattern or regulation, if applicable",
    "referenceBasis": "For excessive_charge type only: the specific comparator used (e.g., 'NADAC average for this drug', 'CMS fee schedule for this geographic area', 'published regional benchmark'). If no reliable reference is available, set this to null."
  }
]

Rules:
- Do NOT flag "duplicate_charge" — that is handled by a separate deterministic system and will be merged automatically.
- Only flag something if there is reasonable evidence from the data.
- Use "error" for clear billing violations, "warning" for likely issues, "info" for things worth noting.
- If no issues are found, return an empty array [].
- For "excessive_charge" type: you MUST provide a real referenceBasis naming the actual comparator used. If you have no reliable comparison point for that line item, do NOT label it "excessive_charge" — instead output a lower-confidence "other" type entry with "worth verifying" language and referenceBasis set to null.
- Do NOT infer "excessive" purely from general pricing intuition. Only flag if you can cite a specific fee schedule, drug pricing reference (like NADAC), or explicit regional benchmark.
- Return ONLY valid JSON, no markdown, no extra text.`;

  const response = await callGroq({
    model: TEXT_MODEL,
    messages: [{ role: "user", content: prompt }],
    max_tokens: MAX_TOKENS,
  });

  let raw = response
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim();
  if (raw.startsWith("```json")) {
    raw = raw.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  } else if (raw.startsWith("```")) {
    raw = raw.replace(/^```\n?/, "").replace(/\n?```$/, "");
  }

  const llmFlags = JSON.parse(raw) as FlaggedIssue[];

  // Post-processing: validate referenceBasis and downgrade excessive_charge flags
  // that lack a recognized pricing reference.
  for (const flag of llmFlags) {
    validateReferenceBasis(flag);
    if (flag.type === "excessive_charge" && !flag.referenceBasis) {
      flag.type = "other";
      flag.severity = "info";
      flag.description = `Worth verifying: ${flag.description}. No reliable pricing reference was available to confirm this as an overcharge.`;
    }
  }

  // TODO: Integrate real pricing reference APIs (e.g., CMS fee schedule, NADAC drug pricing, regional
  // benchmark databases) to provide authoritative referenceBasis values for excessive-charge detection.
  // Without an API, the model may still hallucinate fee schedules — a future enhancement should pass
  // actual fee data into the prompt and validate referenceBasis claims server-side.

  return mergeFlags(deterministic, llmFlags);
}
