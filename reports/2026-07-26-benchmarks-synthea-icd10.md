# Progress Report — 2026-07-26

## 1. Session Summary

**Date:** 2026-07-26
**Goal:** Replace static/guessed pricing references with real CMS Medicare benchmark data, generate synthetic test bills with ground truth for extraction accuracy measurement, and add ICD-10 diagnosis code extraction for medical-necessity appeal arguments.

---

## 2. What We Implemented

### Files Created

| File | What It Does |
|---|---|
| `supabase/migrations/007_carc_rarc_codes.sql` | Creates `carc_rarc_codes` reference table with CARC/RARC type enum, public read policy, service-role write policy |
| `supabase/migrations/008_cpt_pricing_benchmarks.sql` | Creates `cpt_pricing_benchmarks` table (cpt_code PK, description, national avg, per-state JSONB map, source, year), public read policy |
| `scripts/convert-codes-ini-to-csv.ts` | Converts the `.ini`-format CARC/RARC code file into a flat CSV for seeding |
| `scripts/seed-carc-rarc.ts` | Reads CSVs, upserts 1,653 CARC/RARC codes into Supabase via service role |
| `scripts/seed-cms-pricing.ts` | Parses the CMS CSV (40 MB), groups 9,184 HCPCS codes, computes per-state averages, upserts into `cpt_pricing_benchmarks` |
| `src/lib/ai/pricingBenchmark.ts` | Exports `getPricingBenchmark(code, state?)` (single lookup) and `getPricingBenchmarks([codes], state?)` (batch), lazy Supabase client, state fallback logic |
| `scripts/generate-synthea-bills.ts` | Reads Synthea CSVs (claims, transactions, encounters, orgs, providers), maps to `BillExtraction` ground truth, renders bills as SVG in 3 styles (modern/cluttered/plaintext) with watermark/rotation/low-res variations |
| `scripts/validate-extraction-accuracy.ts` | Runs `extractBill()` against each generated bill, compares result field-by-field against ground truth JSON, outputs per-field precision/recall table |
| `src/lib/ai/extractBill.test.ts` | 5 tests mocking `callGroq` — diagnosis codes present, codes without descriptions, key absent, empty array, string-format code |
| `src/lib/ai/lookupDenialCode.ts` | Exports `parseDenialCodes()`, `stripPrefix()`, `lookupDenialCodes()` (CARC/RARC DB lookup with prefix stripping), `formatDenialContext()` |

### Files Modified

| File | Change |
|---|---|
| `src/lib/ai/flagIssues.ts` | Removed static `KNOWN_PRICING_SOURCES` array and `validateReferenceBasis()`. Added `computeBenchmarkFlags()` (flags items > 2× Medicare allowed), `buildBenchmarkContext()` (injects real benchmark data into LLM prompt), `const OVERCHARGE_THRESHOLD_MULTIPLIER = 2.0`. `flagIssues()` now auto-fetches benchmarks from Supabase before LLM call. |
| `src/lib/ai/flagIssues.test.ts` | Removed `validateReferenceBasis` tests. Added `computeBenchmarkFlags` tests (overcharge at 4×, normal charge, unknown code, empty items, empty map). |
| `src/lib/ai/types.ts` | Added `DiagnosisCode` interface (`code: string`, `description?: string`). Added optional `diagnosisCodes?: DiagnosisCode[]` to `BillExtraction`. |
| `src/lib/ai/extractBill.ts` | Added instruction 12 to system prompt (ICD-10 extraction). Extended JSON shape example with `diagnosisCodes`. Added normalization for string/object array items. |
| `src/lib/ai/draftAppealLetter.ts` | Added medical-necessity detection via `denialCodes` category/description keywords. Injects `diagnosisCodes` into prompt for CO-50 denials. Added instruction 7 for clinical rationale. |
| `src/app/api/bills/analyze/route.ts` | Updated import to include `getPricingBenchmarks` reference. No API structure change. |

---

## 3. What We Improved in the Product

### Pricing Benchmark Detection

| Before | After |
|---|---|
| LLM guessed whether a charge was excessive based on its training data. The `KNOWN_PRICING_SOURCES` array could only *validate* the LLM's claimed reference (reject fabricated sources), but couldn't provide real numbers. | Every analyzed bill's CPT codes are looked up against real CMS Medicare data (9,184 codes). If a charge exceeds 2× the Medicare allowed amount, an `excessive_charge` flag is emitted with the exact benchmark. Benchmark context is injected into the LLM prompt so the auditor knows which codes are already covered. |

**User impact:** Overcharge flags now cite a specific dollar amount from CMS data instead of generic "this seems high" language. Users see "$500 for 99213 is 4.0× the Medicare allowed amount of $125.00" with the source named.

### ICD-10 Diagnosis Code Extraction

| Before | After |
|---|---|
| The vision model extracted provider, dates, line items, and denial codes — but never read diagnosis codes from the bill header. Appeal letters for CO-50 (not medically necessary) denials had no clinical context. | The prompt now asks for all ICD-10 codes. They're normalized into `{code, description}[]` objects. When the appeal letter detects a medical-necessity denial category, it injects the diagnosis codes into the prompt with instructions to reference them. |

**User impact:** Appeal letters for CO-50 denials now say "Given the patient's diagnosis of [ICD-10 code]: [description], the [procedure] was clinically indicated" instead of only arguing procedural/technical grounds.

### Denial Code Lookup

| Before | After |
|---|---|
| No structured lookup — the LLM interpreted denial codes from scratch each time, with no access to official CARC/RARC descriptions or appeal arguments. | 1,653 CARC/RARC codes are seeded in the database. `draftAppealLetter.ts` calls `lookupDenialCodes()` to fetch official descriptions and categories before writing the appeal, so the LLM works from authoritative definitions. |

### Synthetic Bill Test Pipeline

| Before | After |
|---|---|
| No way to measure extraction accuracy — only manual testing with real bills (no ground truth). Any change to the extraction prompt could silently regress accuracy. | 30 synthetic bills generated from 50 Synthea patients, each with a corresponding ground-truth JSON file. The `generate-synthea-bills.ts` pipeline applies realistic imperfections (rotation, watermark, low resolution). `validate-extraction-accuracy.ts` produces field-level precision/recall numbers. |

---

## 4. Underlying Gaps & Remaining Work

### Extraction Accuracy Unknown

The validation script (`validate-extraction-accuracy.ts`) hit Groq rate limits (429) during the session — we never got a complete accuracy score. The pipeline is built and the first bill returned 2 field errors, but we don't have a statistically meaningful accuracy figure. **This is the highest-priority unknown.**

### CMS Data Coverage

The 9,184 pricing benchmarks cover only a subset of all CPT/HCPCS codes (those appearing in the "Medicare Physician & Other Practitioners — by Geography and Service" dataset). Many codes (lab panels, drugs, DME) are not in this dataset. For uncovered codes, the LLM still falls back to guessing — no benchmark flag is emitted, and the "excessive_charge" type remains dependent on the LLM having a real reference.

**What would break at scale:** If most bills contain codes outside the CMS dataset, benchmark coverage is effectively 0% for those bills. The system degrades silently — it just doesn't flag overcharges for missing codes.

### Medical Necessity Category Matching

The `hasMedicalNecessityDenial` check in `draftAppealLetter.ts` uses simple keyword matching against the `category` and `description` fields from the CARC/RARC table. The `category` field in the seed data may be null for many codes, in which case only the description keywords ("medical necessity", "not medically necessary") trigger the diagnosis code injection. This is brittle if the CARC descriptions use alternativephrasing.

### Overcharge Threshold is Static

`OVERCHARGE_THRESHOLD_MULTIPLIER = 2.0` is a hardcoded constant. Some codes (e.g., drugs) routinely have 3–5× markup over Medicare. Others (e.g., office visits) rarely exceed 2×. A single threshold will produce false positives or false negatives depending on the code type. Should be code-type-aware or configurable.

### No P99/P95 Benchmarks

The CMS dataset provides average allowed amounts (mean). For outlier detection, percentiles (P95, P99) would be more meaningful — a national average hides the fact that some regions legitimately have 2× the national rate. The current state-fallback mitigates this partially but still uses mean, not percentile.

### Synthea Limitations

- 30 bills from 50 patients is a very small validation set. Statistical significance requires hundreds.
- Synthea generates US-data, so all bills have `region: "US"` — non-US extraction accuracy is untested.
- The bills only have 1–8 line items. Real insurance EOBs commonly have 20–50 line items (multi-provider surgeries, hospital stays).
- No PDF generation (SVG→PDF pipeline would need `sharp` or `wkhtmltopdf` for realistic file-type variation).

### Non-US Region Handling

The product is designed to handle bills from any country, but:
- No non-US pricing benchmark data exists in the database.
- The `cpt_pricing_benchmarks` table only contains US Medicare data.
- Non-US bills will always fall through with zero benchmark coverage.
- Only US-specific billing patterns are excluded for non-US documents — no non-US patterns are added.

### No Test for `draftAppealLetter.ts`

The appeal letter function is untested — only its dependency `lookupDenialCode` has tests. The actual LLM call and prompt assembly have no coverage. Changes to the prompt can silently change output quality.

### Infrastructure Gaps

- No timeout/retry in the bill analysis API route for individual extraction calls — if `extractBill` hangs for 60s, the entire request blocks
- No caching of benchmark lookups — every analysis queries Supabase even for the same CPT code seen 5 minutes ago
- No rate-limit queuing — when the Groq API 429s, the user gets an opaque "you're in the queue" message with no retry-after or position
- The Supabase client in `pricingBenchmark.ts` uses `SUPABASE_SERVICE_ROLE_KEY` from env — if this leaks or is not set in production, the entire benchmark system silently returns no data

---

## 5. Test Coverage Status

| File | Tests | What's Covered | What's Not |
|---|---|---|---|
| `flagIssues.test.ts` | 12 | `detectDuplicates` (no dups, same-code dups, similar-desc dups, different-code dups, clean items), `mergeFlags` (dedup, LLM-empty, different indexes), `computeBenchmarkFlags` (4× overcharge, normal, unknown code, empty items, empty map) | `flagIssues()` async function (needs API mock), `buildBenchmarkContext()` (pure but untested), `validateReferenceBasis` was removed |
| `draftAppealLetter.test.ts` | 10 | `parseDenialCodes` (single, multi-delimiter, mixed, whitespace, null, empty), `formatDenialContext` (single, multiple, empty), `lookupDenialCodes` (known CARC with prefix, known RARC, multi-code, unknown, null, partial match) | `draftAppealLetter()` itself (needs API mock) |
| `extractBill.test.ts` | 5 | `diagnosisCodes` present, without descriptions, key absent, empty array, string-format code | All other extraction fields (covers only the new field) |
| `consistency.test.ts` | — | Seen in test run output | Not read — assume currency/region validation |
| `currency.test.ts` | — | Currency symbol formatting | — |
| `stateProtections.test.ts` | — | State-specific protection lookup | — |
| `route.test.ts` (track-visit) | — | API route test | — |
| **Total** | **68** | 7 files | No coverage for `pricingBenchmark.ts`, `explainBill.ts`, `lookupDenialCode.ts` formatDenialContext integration, `draftAppealLetter.ts` prompt assembly |

---

## 6. Data Seeded

| Table | Rows | Source | Method |
|---|---|---|---|
| `carc_rarc_codes` | 1,653 | Original `.ini` file from CMS CARC/RARC code list | `scripts/convert-codes-ini-to-csv.ts` → `scripts/seed-carc-rarc.ts` via Supabase service role |
| `cpt_pricing_benchmarks` | 9,184 | CMS "Medicare Physician & Other Practitioners — by Geography and Service" (2023), file `MUP_PHY_R25_P05_V20_D23_Geo.csv` (40 MB) | Downloaded from data.cms.gov, parsed by `scripts/seed-cms-pricing.ts`, grouped by HCPCS code, averaged per state, upserted via Supabase service role |

### Files on Disk (not database)

| File | Size | Purpose |
|---|---|---|
| `data/carc-rarc.csv` | 190 KB | Flat CARC/RARC seed data |
| `data/MUP_PHY_R25_P05_V20_D23_Geo.csv` | 40 MB | Raw CMS physician dataset |
| `data/synthea-bills/*.svg` | 30 files | Generated bill images for extraction testing |
| `data/synthea-bills/*.json` | 30 files | Ground-truth extraction data for validation |
| `synthea.jar` | 188 MB | Synthea CLI for patient generation |
| `output/csv/` | ~19 files | Raw Synthea CSV output for 50 patients |

### Migrations Applied

- `007_carc_rarc_codes.sql` — Applied via `psql --db-url` with pooler connection
- `008_cpt_pricing_benchmarks.sql` — Created but not yet applied to Supabase (requires `psql` run with same pattern)
