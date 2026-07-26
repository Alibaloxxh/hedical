import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

interface CsvRow {
  columns: string[];
  [key: string]: string | string[];
}

function unq(s: string): string { return s.replace(/^"+|"+$/g, "").trim(); }

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(",").map(h => unq(h));
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => unq(v));
    const row: Record<string, string> = {};
    header.forEach((h, i) => { row[h] = vals[i] ?? ""; });
    return row;
  });
}

interface GroundTruth {
  provider: string;
  serviceDate: string;
  lineItems: { code: string; description: string; billedAmount: number; paidAmount: number | null; patientOwes: number | null }[];
  totalBilled: number;
  totalPatientResponsibility: number;
  denialReasonCode: string | null;
  denialReasonText: string | null;
  currency: string;
  region: string;
  usState: string | null;
  deadlineDate: string | null;
}

type BillStyle = "modern" | "cluttered" | "plaintext";

function pickStyle(idx: number, totalItems: number): BillStyle {
  const styles: BillStyle[] = ["modern", "cluttered", "plaintext"];
  if (totalItems > 6) return "cluttered";
  return styles[idx % styles.length];
}

function generateBillSvg(gt: GroundTruth, style: BillStyle): string {
  const lines = gt.lineItems.map((li, i) => ({
    idx: i + 1,
    code: li.code,
    desc: li.description,
    billed: li.billedAmount.toFixed(2),
  }));

  switch (style) {
    case "modern":
      return generateModern(lines, gt);
    case "cluttered":
      return generateCluttered(lines, gt);
    case "plaintext":
      return generatePlainText(lines, gt);
  }
}

function generateModern(lines: { idx: number; code: string; desc: string; billed: string }[], gt: GroundTruth): string {
  const margin = 20;
  const colX = [margin, margin + 80, margin + 240, margin + 340];
  const rowH = 22;
  const headerY = 90;
  let y = headerY + rowH;

  for (const _ of lines) y += rowH;

  const footerY = y + 20;
  const ht = Math.max(footerY + 120, 500);
  const denialY = footerY + 80;

  let rows = "";
  let ry = headerY + rowH;
  for (const l of lines) {
    rows += `<text x='${colX[0]}' y='${ry}' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#111'>${l.code}</text>
<text x='${colX[1]}' y='${ry}' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#111'>${l.desc.slice(0, 40)}</text>
<text x='${colX[2]}' y='${ry}' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#111' text-anchor='end'>$${l.billed}</text>
`;
    ry += rowH;
  }

  const denialSection = gt.denialReasonCode
    ? `<text x='${margin}' y='${denialY}' font-size='10' font-family='Arial, Helvetica, sans-serif' fill='#c00' font-weight='bold'>DENIAL: ${gt.denialReasonCode}</text>
<text x='${margin}' y='${denialY + 16}' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#c00'>${gt.denialReasonText}</text>`
    : `<text x='${margin}' y='${denialY}' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#0a0'>No Denials</text>`;

  return `<svg width='500' height='${ht}' xmlns='http://www.w3.org/2000/svg'>
  <rect width='500' height='${ht}' fill='#fff'/>
  <text x='${margin}' y='30' font-size='14' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#003366'>EXPLANATION OF BENEFITS</text>
  <text x='${margin}' y='52' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#555'>${gt.provider}</text>
  <text x='${margin}' y='68' font-size='9' font-family='Arial, Helvetica, sans-serif' fill='#555'>Date of Service: ${gt.serviceDate}</text>
  <line x1='${margin}' y1='78' x2='480' y2='78' stroke='#003366' stroke-width='2'/>
  <text x='${colX[0]}' y='${headerY}' font-size='8' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#666'>CODE</text>
  <text x='${colX[1]}' y='${headerY}' font-size='8' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#666'>DESCRIPTION</text>
  <text x='${colX[2]}' y='${headerY}' font-size='8' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#666' text-anchor='end'>AMOUNT</text>
  <line x1='${margin}' y1='${headerY + 4}' x2='480' y2='${headerY + 4}' stroke='#ccc' stroke-width='1'/>
${rows}
  <line x1='${margin}' y1='${footerY}' x2='480' y2='${footerY}' stroke='#333' stroke-width='1'/>
  <text x='${colX[1]}' y='${footerY + 16}' font-size='10' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#111'>Total Billed</text>
  <text x='${colX[2]}' y='${footerY + 16}' font-size='10' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#111' text-anchor='end'>$${gt.totalBilled.toFixed(2)}</text>
  <text x='${colX[1]}' y='${footerY + 34}' font-size='10' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#111'>Patient Responsibility</text>
  <text x='${colX[2]}' y='${footerY + 34}' font-size='10' font-weight='bold' font-family='Arial, Helvetica, sans-serif' fill='#111' text-anchor='end'>$${gt.totalPatientResponsibility.toFixed(2)}</text>
  ${denialSection}
</svg>`;
}

function generateCluttered(lines: { idx: number; code: string; desc: string; billed: string }[], gt: GroundTruth): string {
  const rowH = 18;
  const headerY = 110;
  let ry = headerY + rowH;
  for (const _ of lines) ry += rowH;
  const ht = Math.max(ry + 160, 500);

  let rows = "";
  let y = headerY + rowH;
  for (const l of lines) {
    rows += `<text x='20' y='${y}' font-size='8' font-family='Courier New, monospace' fill='#000'>${l.code.padEnd(8)} ${l.desc.padEnd(36).slice(0, 36)} $${l.billed.padStart(8)}</text>
`;
    y += rowH;
  }
  const footerY = y;

  const denialSection = gt.denialReasonCode
    ? `<text x='20' y='${footerY + 60}' font-size='9' font-family='Courier New, monospace' fill='#800'>*** DENIED: ${gt.denialReasonCode} *** ${gt.denialReasonText}</text>`
    : `<text x='20' y='${footerY + 60}' font-size='9' font-family='Courier New, monospace' fill='#080'>PAID AS BILLED</text>`;

  return `<svg width='500' height='${ht}' xmlns='http://www.w3.org/2000/svg'>
  <rect width='500' height='${ht}' fill='#fafaf0'/>
  <rect x='0' y='0' width='500' height='60' fill='#222'/>
  <text x='250' y='24' font-size='13' font-weight='bold' font-family='Courier New, monospace' fill='#fff' text-anchor='middle'>CLAIMS PROCESSING SUMMARY</text>
  <text x='250' y='44' font-size='8' font-family='Courier New, monospace' fill='#aaa' text-anchor='middle'>${gt.provider}</text>
  <text x='20' y='80' font-size='8' font-family='Courier New, monospace' fill='#000'>CLAIM#: SYN-${Math.abs(gt.provider.length * 100000 + gt.totalBilled).toString().slice(0, 8)}</text>
  <text x='20' y='95' font-size='8' font-family='Courier New, monospace' fill='#000'>DOS: ${gt.serviceDate}</text>
  <line x1='20' y1='100' x2='480' y2='100' stroke='#000' stroke-dasharray='2,2' stroke-width='1'/>
  <text x='20' y='${headerY}' font-size='8' font-weight='bold' font-family='Courier New, monospace' fill='#000'>CODE     DESCRIPTION                          AMOUNT</text>
  <line x1='20' y1='${headerY + 2}' x2='480' y2='${headerY + 2}' stroke='#000' stroke-width='1'/>
${rows}
  <line x1='20' y1='${footerY}' x2='480' y2='${footerY}' stroke='#000' stroke-width='1'/>
  <text x='20' y='${footerY + 16}' font-size='9' font-weight='bold' font-family='Courier New, monospace' fill='#000'>TOTAL BILLED:                  $${gt.totalBilled.toFixed(2).padStart(8)}</text>
  <text x='20' y='${footerY + 34}' font-size='9' font-weight='bold' font-family='Courier New, monospace' fill='#000'>PATIENT RESPONSIBILITY:        $${gt.totalPatientResponsibility.toFixed(2).padStart(8)}</text>
  ${denialSection}
</svg>`;
}

function generatePlainText(lines: { idx: number; code: string; desc: string; billed: string }[], gt: GroundTruth): string {
  const rowH = 16;
  let y = 110;
  for (const _ of lines) y += rowH;
  const ht = Math.max(y + 140, 400);

  let rows = "";
  let ry = 110;
  for (const l of lines) {
    rows += `<text x='16' y='${ry}' font-size='8' font-family='Consolas, monospace' fill='#000'>  ${l.code.padEnd(7)} ${l.desc.padEnd(34).slice(0, 34)} $${l.billed.padStart(7)}</text>
`;
    ry += rowH;
  }

  const footerY = ry;

  return `<svg width='500' height='${ht}' xmlns='http://www.w3.org/2000/svg'>
  <rect width='500' height='${ht}' fill='#fff'/>
  <text x='16' y='20' font-size='10' font-family='Consolas, monospace' fill='#000'>BILLING STATEMENT</text>
  <text x='16' y='38' font-size='8' font-family='Consolas, monospace' fill='#000'>${"=".repeat(56)}</text>
  <text x='16' y='54' font-size='8' font-family='Consolas, monospace' fill='#000'>Provider: ${gt.provider}</text>
  <text x='16' y='68' font-size='8' font-family='Consolas, monospace' fill='#000'>Date:     ${gt.serviceDate}</text>
  <text x='16' y='82' font-size='8' font-family='Consolas, monospace' fill='#000'>${"-".repeat(56)}</text>
  <text x='16' y='98' font-size='8' font-family='Consolas, monospace' fill='#000'>CODE    DESCRIPTION                       AMOUNT</text>
  <text x='16' y='104' font-size='8' font-family='Consolas, monospace' fill='#000'>${"-".repeat(56)}</text>
${rows}
  <text x='16' y='${footerY + 8}' font-size='8' font-family='Consolas, monospace' fill='#000'>${"-".repeat(56)}</text>
  <text x='16' y='${footerY + 24}' font-size='9' font-family='Consolas, monospace' fill='#000'>TOTAL BILLED:              $${gt.totalBilled.toFixed(2).padStart(8)}</text>
  <text x='16' y='${footerY + 40}' font-size='9' font-family='Consolas, monospace' fill='#000'>PATIENT RESPONSIBILITY:    $${gt.totalPatientResponsibility.toFixed(2).padStart(8)}</text>
  <text x='16' y='${footerY + 60}' font-size='8' font-family='Consolas, monospace' fill='#800'>${gt.denialReasonCode ? `DENIED: ${gt.denialReasonCode}` : "PAID IN FULL"}</text>
</svg>`;
}

function addWatermark(svg: string): string {
  return svg.replace("</svg>", `<text x='250' y='300' font-size='60' font-family='Arial' fill='rgba(200,0,0,0.12)' transform='rotate(-25, 250, 300)' text-anchor='middle' font-weight='bold'>PAST DUE</text>\n</svg>`);
}

async function render(input: Buffer, quality: number): Promise<Buffer> {
  const result = await sharp(input).jpeg({ quality }).toBuffer();
  return result as unknown as Buffer;
}

async function main() {
  const args = process.argv.slice(2);
  let syntheaDir = "./data/synthea";
  let outDir = "./data/synthea-bills";
  let count = 0;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--synthea-dir" && i + 1 < args.length) syntheaDir = args[++i];
    if (args[i] === "--out-dir" && i + 1 < args.length) outDir = args[++i];
  }

  if (!fs.existsSync(syntheaDir)) {
    console.error(`Synthea directory not found: ${syntheaDir}`);
    console.error("Usage: npx tsx scripts/generate-synthea-bills.ts --synthea-dir path/to/synthea/output/csv --out-dir data/synthea-bills");
    console.error("\nExpected files: claims.csv, claims_transactions.csv, encounters.csv, organizations.csv, providers.csv");
    process.exit(1);
  }

  const required = ["claims.csv", "claims_transactions.csv", "encounters.csv", "organizations.csv", "providers.csv"];
  for (const f of required) {
    if (!fs.existsSync(path.join(syntheaDir, f))) {
      console.error(`Missing required file: ${f} in ${syntheaDir}`);
      process.exit(1);
    }
  }

  console.log(`Reading Synthea CSVs from ${syntheaDir}...`);

  const claims = parseCsv(fs.readFileSync(path.join(syntheaDir, "claims.csv"), "utf-8"));
  const transactions = parseCsv(fs.readFileSync(path.join(syntheaDir, "claims_transactions.csv"), "utf-8"));
  const encounters = parseCsv(fs.readFileSync(path.join(syntheaDir, "encounters.csv"), "utf-8"));
  const organizations = parseCsv(fs.readFileSync(path.join(syntheaDir, "organizations.csv"), "utf-8"));
  const providers = parseCsv(fs.readFileSync(path.join(syntheaDir, "providers.csv"), "utf-8"));

  const orgMap = new Map(organizations.map(o => [o.Id, o.NAME]));
  const providerMap = new Map(providers.map(p => [p.Id, p.NAME]));
  const encounterMap = new Map(encounters.map(e => [e.Id, e]));

  const claimTxns = new Map<string, Record<string, string>[]>();
  for (const txn of transactions) {
    const list = claimTxns.get(txn.CLAIMID) || [];
    list.push(txn);
    claimTxns.set(txn.CLAIMID, list);
  }

  let claimIdx = 0;
  const maxOutput = 30;

  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Generating bills from ${claims.length} claims (max ${maxOutput})...\n`);

  for (const claim of claims) {
    if (claimIdx >= maxOutput) break;
    const claimId = claim.Id;
    const txns = claimTxns.get(claimId) || [];
    const charges = txns.filter(t => t.TYPE === "CHARGE");
    if (charges.length === 0) continue;

    const orgId = charges[0].PLACEOFSERVICE;
    const providerId = charges[0].PROVIDERID;
    const orgName = orgMap.get(orgId) || "Unknown Facility";
    const providerName = providerMap.get(providerId) || orgName;

    const lineItems = charges.map(c => ({
      code: c.PROCEDURECODE || "UNKNOWN",
      description: c.NOTES || c.LINENOTE || encounterMap.get(claim.APPOINTMENTID || "")?.DESCRIPTION || "Medical service",
      billedAmount: parseFloat(c.AMOUNT) || 0,
      paidAmount: null,
      patientOwes: null,
    }));

    const totalBilled = lineItems.reduce((s, li) => s + li.billedAmount, 0);
    const patientResp = parseFloat(claim.OUTSTANDINGP || "0") || 0;
    const svcDate = (claim.SERVICEDATE || "").slice(0, 10).replace(/-/g, "/");

    const gt: GroundTruth = {
      provider: providerName,
      serviceDate: svcDate || "01/01/2025",
      lineItems,
      totalBilled,
      totalPatientResponsibility: patientResp,
      denialReasonCode: patientResp > 0 && totalBilled > 0 ? "CO-50" : null,
      denialReasonText: patientResp > 0 && totalBilled > 0 ? "Patient responsibility balance due" : null,
      currency: "USD",
      region: "US",
      usState: null,
      deadlineDate: null,
    };

    const style = pickStyle(claimIdx, lineItems.length);
    let svg = generateBillSvg(gt, style);

    const doRotate = claimIdx % 4 === 0;
    const doWatermark = claimIdx % 5 === 0;
    const doLowRes = claimIdx % 6 === 0;

    if (doWatermark) svg = addWatermark(svg);

    const prefix = `synthea-${String(claimIdx + 1).padStart(3, "0")}`;
    const svgPath = path.join(outDir, `${prefix}.svg`);
    const jsonPath = path.join(outDir, `${prefix}.json`);

    let buf: Buffer = Buffer.from(svg);

    if (doRotate) {
      const angle = (claimIdx % 3) + 1;
      const rotated = await sharp(buf).rotate(angle, { background: { r: 255, g: 255, b: 255, alpha: 1 } }).jpeg({ quality: 80 }).toBuffer();
      buf = rotated as unknown as Buffer;
    }

    buf = await render(buf, doLowRes ? 30 : doWatermark ? 60 : 80);

    fs.writeFileSync(svgPath, buf);
    fs.writeFileSync(jsonPath, JSON.stringify(gt, null, 2));

    const mods: string[] = [];
    if (doWatermark) mods.push("watermark");
    if (doRotate) mods.push(`rotated`);
    if (doLowRes) mods.push("lowres");
    const modStr = mods.length > 0 ? ` [${mods.join(", ")}]` : "";

    console.log(`  [${claimIdx + 1}/${maxOutput}] ${providerName.slice(0, 30).padEnd(30)} ${lineItems.length} items ${style.padEnd(12)}${modStr}`);
    claimIdx++;
  }

  console.log(`\nGenerated ${claimIdx} bills in ${outDir}/`);
  console.log(`Run: npx tsx scripts/validate-extraction-accuracy.ts --dir ${outDir}`);
}

main().catch(err => { console.error("Fatal:", err); process.exit(1); });
