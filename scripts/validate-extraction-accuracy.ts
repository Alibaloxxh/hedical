import fs from "node:fs";
import path from "node:path";
import { extractBill } from "../src/lib/ai/extractBill";

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

interface FieldResult {
  field: string;
  correct: number;
  total: number;
  errors: { file: string; expected: string; got: string }[];
}

function matrixDiff(gt: GroundTruth, result: Record<string, any>, idx: number): { field: string; expected: string; got: string }[] {
  const errs: { field: string; expected: string; got: string }[] = [];

  const c = (field: string, expected: any, got: any) => {
    const es = expected == null ? "null" : String(expected);
    const gs = got == null ? "null" : String(got);
    if (es !== gs) errs.push({ field, expected: es, got: gs });
  };

  c("provider", gt.provider, result.provider);
  c("serviceDate", gt.serviceDate, result.serviceDate);
  c("lineItems.count", gt.lineItems.length, result.lineItems?.length);
  c("totalBilled", gt.totalBilled, result.totalBilled);
  c("totalPatientResponsibility", gt.totalPatientResponsibility, result.totalPatientResponsibility);
  c("denialReasonCode", gt.denialReasonCode, result.denialReasonCode);
  c("denialReasonText", gt.denialReasonText, result.denialReasonText);
  c("currency", gt.currency, result.currency);
  c("region", gt.region, result.region);

  if (Array.isArray(result.lineItems) && gt.lineItems.length > 0) {
    const maxItems = Math.min(gt.lineItems.length, result.lineItems.length);
    for (let i = 0; i < maxItems; i++) {
      c(`lineItems[${i}].code`, gt.lineItems[i].code, result.lineItems[i].code);
      c(`lineItems[${i}].billedAmount`, gt.lineItems[i].billedAmount, result.lineItems[i].billedAmount);
    }
    if (gt.lineItems.length !== result.lineItems.length) {
      errs.push({
        field: "lineItems.count.mismatch",
        expected: `${gt.lineItems.length} items`,
        got: `${result.lineItems.length} items`,
      });
    }
  }

  return errs;
}

async function evaluateDir(billDir: string) {
  const files = fs.readdirSync(billDir).filter(f => f.endsWith(".json"));
  if (files.length === 0) {
    console.error(`No ground truth JSON files found in ${billDir}`);
    process.exit(1);
  }

  const fieldResults: Record<string, FieldResult> = {};
  let totalErrors = 0;
  let totalChecks = 0;

  console.log(`\n${"=".repeat(90)}`);
  console.log("  EXTRACTION ACCURACY VALIDATION");
  console.log(`${"=".repeat(90)}\n`);

  for (const gf of files) {
    const gtPath = path.join(billDir, gf);
    const imgPath = gtPath.replace(/\.json$/, ".jpg").replace(/\.json$/, ".jpeg");
    const svgPath = gtPath.replace(/\.json$/, ".svg");

    const imgFile = fs.existsSync(imgPath) ? imgPath : fs.existsSync(svgPath) ? svgPath : null;
    if (!imgFile) {
      console.error(`  No image found for ${gf}`);
      continue;
    }

    const gt: GroundTruth = JSON.parse(fs.readFileSync(gtPath, "utf-8"));
    const ext = path.extname(imgFile);
    const mime = ext === ".svg" ? "image/png" : "image/jpeg";

    const buf = fs.readFileSync(imgFile);
    const base64 = buf.toString("base64");

    process.stdout.write(`  ${gf.replace(/\.json$/, "")}... `);

    try {
      const result = await extractBill({ base64, filename: `bill${ext}` });

      const errs = matrixDiff(gt, result as any, 0);

      if (errs.length === 0) {
        process.stdout.write("PASS\n");
      } else {
        process.stdout.write(`FAIL (${errs.length} field(s))\n`);
        for (const e of errs) {
          const shortFile = gf.replace(/\.json$/, "");
          if (!fieldResults[e.field]) {
            fieldResults[e.field] = { field: e.field, correct: 1, total: 1, errors: [] };
          }
          fieldResults[e.field].total++;
          fieldResults[e.field].correct--;
          fieldResults[e.field].errors.push({ file: shortFile, expected: e.expected, got: e.got });
          totalErrors++;
        }
      }

      const checkedFields = ["provider", "serviceDate", "lineItems.count", "totalBilled",
        "totalPatientResponsibility", "denialReasonCode", "denialReasonText", "currency", "region"];
      for (const f of checkedFields) {
        if (!fieldResults[f]) fieldResults[f] = { field: f, correct: 1, total: 1, errors: [] };
        if (errs.filter(e => e.field === f).length === 0) {
          fieldResults[f].correct++;
          fieldResults[f].total++;
        } else {
          fieldResults[f].total++;
        }
      }

      totalChecks++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stdout.write(`ERROR: ${msg.slice(0, 100)}\n`);
    }

    if (files.indexOf(gf) < files.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n${"-".repeat(90)}`);
  console.log("  FIELD-LEVEL ACCURACY REPORT");
  console.log(`${"-".repeat(90)}`);
  console.log(`  ${"Field".padEnd(35)} ${"Correct".padEnd(8)} ${"Total".padEnd(6)} ${"Accuracy".padEnd(10)} ${"Errors"}`);
  console.log(`  ${"-".repeat(84)}`);

  for (const fr of Object.values(fieldResults).sort((a, b) => (a.correct / a.total) - (b.correct / b.total))) {
    const pct = ((fr.correct / fr.total) * 100).toFixed(1);
    const pctBar = pct.padStart(6);
    const errList = fr.errors.slice(0, 3).map(e => `${e.file}: expected "${e.expected}" got "${e.got}"`).join("; ");
    console.log(`  ${fr.field.padEnd(35)} ${String(fr.correct).padEnd(8)} ${String(fr.total).padEnd(6)} ${pctBar.padEnd(10)} ${errList ? errList.slice(0, 50) : ""}`);
  }

  console.log(`\n${"-".repeat(90)}`);
  const totalCorrect = Object.values(fieldResults).reduce((s, r) => s + r.correct, 0);
  const totalAll = Object.values(fieldResults).reduce((s, r) => s + r.total, 0);
  const overall = totalAll > 0 ? ((totalCorrect / totalAll) * 100).toFixed(1) : "0.0";
  console.log(`  Overall accuracy: ${totalCorrect}/${totalAll} (${overall}%) across ${totalChecks} bills`);
  console.log(`${"=".repeat(90)}\n`);
}

const args = process.argv.slice(2);
let billDir = "./data/synthea-bills";
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--dir" && i + 1 < args.length) billDir = args[++i];
}

evaluateDir(billDir);
