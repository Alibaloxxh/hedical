import fs from "fs";
import { extractBill } from "../src/lib/ai/extractBill";
import sharp from "sharp";

const envRaw = fs.readFileSync(".env.local", "utf8");
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx);
      const val = trimmed.slice(eqIdx + 1);
      process.env[key] = val;
    }
  }
}

interface Scenario {
  name: string;
  expectedLineItems: number;
  expectedProvider: string;
  expectedDenialCode: string | null;
  expectedTotalBilled: number;
  expectedTotalPatientResp: number;
  lineItems: { code: string; desc: string; billed: number }[];
  denial: { code: string; text: string } | null;
  total: number;
  patientOwes: number;
}

const SCENARIOS: Scenario[] = [
  {
    name: "Duplicate+CO50",
    expectedLineItems: 5,
    expectedProvider: "Northside Radiology",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 3250,
    expectedTotalPatientResp: 1200,
    lineItems: [
      { code: "72040", desc: "X-Ray Cervical Spine 2+ Views", billed: 350 },
      { code: "72050", desc: "X-Ray Thoracic Spine 2+ Views", billed: 380 },
      { code: "73030", desc: "X-Ray Shoulder Complete 2+", billed: 420 },
      { code: "72100", desc: "X-Ray Lumbar Spine 2+ Views", billed: 400 },
      { code: "72040", desc: "X-Ray Cervical Spine 2+ Views", billed: 350 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - duplicate of prior service" },
    total: 3250,
    patientOwes: 1200,
  },
  {
    name: "Upcoding",
    expectedLineItems: 2,
    expectedProvider: "Midtown Surgical Center",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 5800,
    expectedTotalPatientResp: 2100,
    lineItems: [
      { code: "99285", desc: "Emergency Dept Visit Level 5", billed: 3200 },
      { code: "99223", desc: "Initial Hospital Care Level 3", billed: 2600 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - upcoding suspected" },
    total: 5800,
    patientOwes: 2100,
  },
  {
    name: "Unbundling",
    expectedLineItems: 3,
    expectedProvider: "Downtown Medical Group",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 1800,
    expectedTotalPatientResp: 900,
    lineItems: [
      { code: "93005", desc: "EKG Tracing Only", billed: 250 },
      { code: "93010", desc: "EKG Interpretation/Report Only", billed: 200 },
      { code: "99213", desc: "Office Visit Level 3", billed: 350 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - unbundling of 93000" },
    total: 1800,
    patientOwes: 900,
  },
  {
    name: "Out-of-Network",
    expectedLineItems: 2,
    expectedProvider: "Westside Orthopedic Institute",
    expectedDenialCode: "CO-16",
    expectedTotalBilled: 4500,
    expectedTotalPatientResp: 2500,
    lineItems: [
      { code: "27447", desc: "Total Knee Arthroplasty", billed: 3500 },
      { code: "99214", desc: "Office Visit Level 4", billed: 450 },
    ],
    denial: { code: "CO-16", text: "Out of network - non-contracted provider" },
    total: 4500,
    patientOwes: 2500,
  },
  {
    name: "Missing Prior Auth",
    expectedLineItems: 2,
    expectedProvider: "Memorial Hospital",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 8200,
    expectedTotalPatientResp: 4100,
    lineItems: [
      { code: "43239", desc: "Upper GI Endoscopy with Biopsy", billed: 2200 },
      { code: "45380", desc: "Colonoscopy with Biopsy", billed: 2800 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - no prior authorization" },
    total: 8200,
    patientOwes: 4100,
  },
  {
    name: "Excessive Charge",
    expectedLineItems: 2,
    expectedProvider: "Prestige Medical Center",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 15000,
    expectedTotalPatientResp: 7500,
    lineItems: [
      { code: "27236", desc: "ORIF Femoral Neck Fracture", billed: 8500 },
      { code: "20680", desc: "Removal Deep Hardware", billed: 3200 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - charge exceeds usual/customary" },
    total: 15000,
    patientOwes: 7500,
  },
  {
    name: "Clean EOB",
    expectedLineItems: 3,
    expectedProvider: "Community Health Partners",
    expectedDenialCode: null,
    expectedTotalBilled: 780,
    expectedTotalPatientResp: 156,
    lineItems: [
      { code: "99213", desc: "Office Visit Level 3", billed: 250 },
      { code: "81001", desc: "Urinalysis Complete with Microscopy", billed: 180 },
      { code: "87430", desc: "Strep A Antigen Test", billed: 120 },
    ],
    denial: null,
    total: 780,
    patientOwes: 156,
  },
  {
    name: "Multiple Denials",
    expectedLineItems: 2,
    expectedProvider: "Advanced Pain Management",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 3400,
    expectedTotalPatientResp: 1800,
    lineItems: [
      { code: "64483", desc: "ESI Lumbar Transforaminal 1 Level", billed: 1200 },
      { code: "77003", desc: "Fluoroscopic Guidance", billed: 500 },
    ],
    denial: { code: "CO-50 / PR-5", text: "Not medically necessary / Non-covered service" },
    total: 3400,
    patientOwes: 1800,
  },
  {
    name: "ER Denial",
    expectedLineItems: 3,
    expectedProvider: "University Medical Center Emergency Dept",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 6400,
    expectedTotalPatientResp: 3200,
    lineItems: [
      { code: "99285", desc: "Emergency Dept Visit Level 5", billed: 2800 },
      { code: "80048", desc: "Basic Metabolic Panel", billed: 350 },
      { code: "74176", desc: "CT Abdomen/Pelvis Contrast", billed: 2200 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary - could have been treated in lower-cost setting" },
    total: 6400,
    patientOwes: 3200,
  },
  {
    name: "Complex EOB",
    expectedLineItems: 9,
    expectedProvider: "Comprehensive Medical Center",
    expectedDenialCode: "CO-50",
    expectedTotalBilled: 12350,
    expectedTotalPatientResp: 5600,
    lineItems: [
      { code: "99221", desc: "Initial Hospital Care Level 1", billed: 800 },
      { code: "99231", desc: "Subsequent Hospital Care Level 1", billed: 400 },
      { code: "99232", desc: "Subsequent Hospital Care Level 2", billed: 500 },
      { code: "99233", desc: "Subsequent Hospital Care Level 3", billed: 600 },
      { code: "80053", desc: "Comprehensive Metabolic Panel", billed: 250 },
      { code: "85025", desc: "Complete CBC Automated", billed: 180 },
      { code: "93005", desc: "EKG Tracing", billed: 200 },
      { code: "71046", desc: "Chest X-Ray 2 Views", billed: 300 },
      { code: "87070", desc: "Blood Culture Aerobic", billed: 220 },
    ],
    denial: { code: "CO-50", text: "Not medically necessary" },
    total: 12350,
    patientOwes: 5600,
  },
];

function generateBillSvg(s: Scenario): string {
  let items = "";
  let y = 55;
  for (const li of s.lineItems) {
    items += `<text x='6' y='${y}' font-size='8' font-family='Arial' fill='black'>${li.code} ${li.desc.padEnd(30, " ").slice(0, 30)} $${li.billed}</text>\n`;
    y += 12;
  }

  const denialLine = s.denial
    ? `<text x='6' y='${y + 10}' font-size='9' font-family='Arial' fill='red'>Denial: ${s.denial.code} - ${s.denial.text}</text>`
    : `<text x='6' y='${y + 10}' font-size='9' font-family='Arial' fill='green'>No Denials - Processed Clean</text>`;

  const svgHeight = Math.max(y + 40, 140);
  const expectedTotal = `Total Billed: $${s.total}`;

  return `<svg width='300' height='${svgHeight}' xmlns='http://www.w3.org/2000/svg'>
  <rect width='300' height='${svgHeight}' fill='white'/>
  <text x='6' y='15' font-size='11' font-family='Arial' fill='black' font-weight='bold'>EXPLANATION OF BENEFITS</text>
  <text x='6' y='30' font-size='9' font-family='Arial' fill='black'>Provider: ${s.expectedProvider}</text>
  <text x='6' y='42' font-size='9' font-family='Arial' fill='black'>Date: 07/15/2026</text>
  <line x1='6' y1='46' x2='294' y2='46' stroke='#999' stroke-width='1'/>
${items}
  <line x1='6' y1='${y}' x2='294' y2='${y}' stroke='#999' stroke-width='1'/>
  <text x='6' y='${y + 14}' font-size='9' font-family='Arial' fill='black' font-weight='bold'>${expectedTotal}</text>
  <text x='6' y='${y + 28}' font-size='9' font-family='Arial' fill='black' font-weight='bold'>Patient Responsibility: $${s.patientOwes}</text>
${denialLine}
</svg>`;
}

interface TestResult {
  scenario: string;
  expectedItems: number;
  actualItems: number;
  itemsMatch: boolean;
  provider: string;
  providerMatch: boolean;
  denialCode: string | null;
  denialMatch: boolean | null;
  totalBilled: number | null;
  expectedTotalBilled: number;
  totalExact: boolean;
  totalPatientResp: number | null;
  expectedPatientResp: number;
  respExact: boolean;
  error?: string;
}

async function runOneBill(s: Scenario, idx: number): Promise<TestResult> {
  const svg = generateBillSvg(s);
  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 40 }).toBuffer();
  const base64 = buf.toString("base64");

  process.stdout.write(`  [${idx + 1}/10] ${s.name}... `);

  try {
    const result = await extractBill({ base64, filename: "bill.jpg" });

    const itemsMatch = result.lineItems.length === s.expectedLineItems;
    const providerMatch = result.provider?.toLowerCase().includes(s.expectedProvider.toLowerCase().slice(0, 10).toLowerCase());
    const denialMatch = s.expectedDenialCode === null
      ? result.denialReasonCode === null
      : (result.denialReasonCode?.includes(s.expectedDenialCode.split(" ")[0]) ?? false);
    const totalExact = result.totalBilled === s.expectedTotalBilled;
    const respExact = result.totalPatientResponsibility === s.expectedTotalPatientResp;

    const issues: string[] = [];
    if (!itemsMatch) issues.push(`items ${result.lineItems.length}/${s.expectedLineItems}`);
    if (!totalExact) issues.push(`total ${result.totalBilled} vs ${s.expectedTotalBilled}`);
    if (!respExact) issues.push(`resp ${result.totalPatientResponsibility} vs ${s.expectedTotalPatientResp}`);

    const status = issues.length === 0 ? "PASS" : `FAIL: ${issues.join(", ")}`;
    process.stdout.write(`${status}\n`);

    return {
      scenario: s.name,
      expectedItems: s.expectedLineItems,
      actualItems: result.lineItems.length,
      itemsMatch,
      provider: result.provider ?? "",
      providerMatch: !!providerMatch,
      denialCode: result.denialReasonCode,
      denialMatch,
      totalBilled: result.totalBilled,
      expectedTotalBilled: s.expectedTotalBilled,
      totalExact,
      totalPatientResp: result.totalPatientResponsibility,
      expectedPatientResp: s.expectedTotalPatientResp,
      respExact,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const isRateLimit = msg.includes("429") || msg.includes("413") || msg.includes("rate_limit");
    process.stdout.write(`ERROR${isRateLimit ? " (rate limit)" : ""}\n`);
    return {
      scenario: s.name,
      expectedItems: s.expectedLineItems,
      actualItems: 0,
      itemsMatch: false,
      provider: "",
      providerMatch: false,
      denialCode: null,
      denialMatch: null,
      totalBilled: null,
      expectedTotalBilled: s.expectedTotalBilled,
      totalExact: false,
      totalPatientResp: null,
      expectedPatientResp: s.expectedTotalPatientResp,
      respExact: false,
      error: isRateLimit ? "RATE_LIMIT" : msg.slice(0, 200),
    };
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  let apiErrors = 0;
  let totalApiCalls = 0;
  let totalsCorrect = 0;
  let totalsAttempted = 0;

  console.log(`\n${"=".repeat(100)}`);
  console.log("  10-BILL TEST: Total Amount Accuracy (prompt fix)");
  console.log(`${"=".repeat(100)}\n`);

  const results: TestResult[] = [];

  for (let i = 0; i < SCENARIOS.length; i++) {
    const r = await runOneBill(SCENARIOS[i], i);
    results.push(r);

    if (r.error === "RATE_LIMIT") apiErrors++;
    totalApiCalls++;

    if (!r.error) {
      totalsAttempted++;
      if (r.totalExact) totalsCorrect++;
    }

    if (i < SCENARIOS.length - 1) {
      console.log("  (pausing 60s to respect 8K TPM free tier limit...)\n");
      await sleep(60000);
    }
  }

  console.log(`\n${"-".repeat(100)}`);
  console.log(`| ${"Scenario".padEnd(22)} | ${"Items".padEnd(5)} | ${"Got".padEnd(3)} | ${"Provider".padEnd(14)} | ${"Denial".padEnd(8)} | ${"Total Expected".padEnd(14)} | ${"Total Got".padEnd(12)} | ${"Total OK?".padEnd(9)} | ${"Resp OK?".padEnd(8)} |`);
  console.log(`${"-".repeat(100)}`);
  for (const r of results) {
    const itemsOk = r.itemsMatch ? "PASS" : `FAIL`;
    const itemsLabel = r.error ? "ERR" : itemsOk;
    const provLabel = r.error ? "ERR" : r.providerMatch ? "OK" : "MIS";
    const denLabel = r.error ? "ERR" : r.denialMatch === null ? "N/A" : r.denialMatch ? "OK" : "MIS";
    const totalLabel = r.error ? "ERR" : r.totalExact ? "OK" : r.totalBilled !== null ? `${r.totalBilled}` : "NULL";
    const respLabel = r.error ? "ERR" : r.respExact ? "OK" : r.totalPatientResp !== null ? `${r.totalPatientResp}` : "NULL";

    console.log(
      `| ${r.scenario.padEnd(22)} ` +
      `| ${r.expectedItems.toString().padEnd(5)} ` +
      `| ${(r.error ? "-" : r.actualItems.toString()).padEnd(3)} ` +
      `| ${provLabel.padEnd(14)} ` +
      `| ${denLabel.padEnd(8)} ` +
      `| $${r.expectedTotalBilled.toString().padEnd(11)} ` +
      `| $${totalLabel.padEnd(9)} ` +
      `| ${r.totalExact ? "  OK  " : r.error ? "  -   " : " FAIL "} ` +
      `| ${respLabel.padEnd(7)}`
    );
  }
  console.log(`${"-".repeat(100)}\n`);

  const itemsPass = results.filter((r) => r.itemsMatch).length;
  const totalPassFixed = results.filter((r) => r.totalExact).length;

  console.log(`Line-item accuracy: ${itemsPass}/${results.length - apiErrors} successful`);
  console.log(`Total-amount accuracy (with prompt fix): ${totalsCorrect}/${totalsAttempted} (${((totalsCorrect / totalsAttempted) * 100).toFixed(0)}%)`);
  console.log(`API error rate: ${apiErrors}/${totalApiCalls} (${((apiErrors / totalApiCalls) * 100).toFixed(0)}%)`);

  if (apiErrors > 0) {
    console.log("\nRate-limited scenarios:");
    for (const r of results) {
      if (r.error === "RATE_LIMIT") console.log(`  - ${r.scenario}`);
    }
  }

  console.log(`\n${"=".repeat(100)}`);
  if (totalsCorrect === totalsAttempted && totalsAttempted > 0) {
    console.log("  All totals now match the document's printed values. Bug fixed.");
  } else if (totalsCorrect > 0) {
    console.log(`  ${totalsCorrect}/${totalsAttempted} totals match. Partial improvement.`);
  }
  console.log(`${"=".repeat(100)}`);
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
