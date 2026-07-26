import { callGroq, TEXT_MODEL, MAX_TOKENS } from "./client";
import type { BillExtraction, FlaggedIssue } from "./types";
import { billingPatterns } from "./patterns";
import { getStateProtection } from "./stateProtections";
import { getPricingBenchmarks } from "./pricingBenchmark";

const US_ONLY_PATTERN_IDS = new Set(["oon-001", "pa-001", "non-001"]);

const OVERCHARGE_THRESHOLD_MULTIPLIER = 2.0;

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

function buildBenchmarkContext(
  benchmarks: Map<string, { cptCode: string; description: string | null; amount: number; state: string | null; source: string; year: number }>,
  items: { code?: string; description?: string; billedAmount?: number | null }[],
): string {
  if (benchmarks.size === 0) return "";

  const lines: string[] = [];
  for (const item of items) {
    if (!item.code) continue;
    const b = benchmarks.get(item.code.toUpperCase());
    if (!b) continue;
    const charged = item.billedAmount != null ? `$${item.billedAmount.toFixed(2)}` : "unknown";
    const ratio = item.billedAmount != null && item.billedAmount > 0
      ? ` (${(item.billedAmount / b.amount).toFixed(1)}x benchmark)`
      : "";
    lines.push(
      `  - ${b.cptCode} "${b.description || item.description || ""}": Medicare allowed = $${b.amount.toFixed(2)}${b.state ? ` (${b.state})` : " (national)"}, charged = ${charged}${ratio}`,
    );
  }
  return lines.length > 0 ? `\nPRICING BENCHMARKS (${benchmarks.values().next().value?.source || "CMS"}, ${benchmarks.values().next().value?.year || ""}):\n${lines.join("\n")}\n` : "";
}

export function computeBenchmarkFlags(
  items: BillExtraction["lineItems"],
  benchmarks: Map<string, { cptCode: string; description: string | null; amount: number; state: string | null; source: string; year: number }>,
): FlaggedIssue[] {
  const flags: FlaggedIssue[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.code || item.billedAmount == null) continue;
    const b = benchmarks.get(item.code.toUpperCase());
    if (!b) continue;
    if (item.billedAmount > b.amount * OVERCHARGE_THRESHOLD_MULTIPLIER) {
      const ratio = (item.billedAmount / b.amount).toFixed(1);
      flags.push({
        type: "excessive_charge",
        severity: "warning",
        description: `Line ${i + 1}: ${item.code} ("${item.description}") billed $${item.billedAmount.toFixed(2)}, which is ${ratio}x the ${b.state ? `${b.state} ` : ""}Medicare allowed amount of $${b.amount.toFixed(2)}.`,
        lineItemIndex: i,
        citation: "CMS Medicare Physician & Other Practitioners benchmark",
        referenceBasis: `${b.source} (${b.year})${b.state ? ` ${b.state}` : " national"}: $${b.amount.toFixed(2)}`,
      });
    }
  }
  return flags;
}

export async function flagIssues(extraction: BillExtraction): Promise<FlaggedIssue[]> {
  const deterministic = detectDuplicates(extraction);

  const cptCodes = extraction.lineItems.map(i => i.code).filter(Boolean) as string[];
  const benchmarks = await getPricingBenchmarks(cptCodes, extraction.usState);

  const benchmarkFlags = computeBenchmarkFlags(extraction.lineItems, benchmarks);

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

  const benchmarkCtx = buildBenchmarkContext(benchmarks, extraction.lineItems);

  const prompt = `You are a medical billing auditor. Analyze the following bill/EOB data against the known error patterns provided below.

PATIENT BILL DATA:
${JSON.stringify(extraction, null, 2)}

DETECTED CURRENCY: ${extraction.currency || "Not detected"}
DETECTED REGION: ${extraction.region || "Not detected"}${regionNotice}${stateInfo}${benchmarkCtx}

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
    "referenceBasis": "For excessive_charge type only: the specific comparator used. If no reliable reference is available, set this to null."
  }
]

Rules:
- Do NOT flag "duplicate_charge" — that is handled by a separate deterministic system and will be merged automatically.
- Do NOT flag "excessive_charge" for items where a PRICING BENCHMARK is shown above — those are already evaluated by the benchmark system. Focus on other issue types (upcoding, unbundling, out-of-network, missing prior auth, etc.).
- Only flag something if there is reasonable evidence from the data.
- Use "error" for clear billing violations, "warning" for likely issues, "info" for things worth noting.
- If no issues are found, return an empty array [].
- For "excessive_charge" type (for items NOT covered by benchmarks above): you MUST provide a real referenceBasis naming the actual comparator used. If you have no reliable comparison point for that line item, do NOT label it "excessive_charge" — instead output a lower-confidence "other" type entry with "worth verifying" language and referenceBasis set to null.
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

  for (const flag of llmFlags) {
    if (flag.type === "excessive_charge" && !flag.referenceBasis) {
      flag.type = "other";
      flag.severity = "info";
      flag.description = `Worth verifying: ${flag.description}. No reliable pricing reference was available to confirm this as an overcharge.`;
    }
  }

  return mergeFlags([...deterministic, ...benchmarkFlags], llmFlags);
}
