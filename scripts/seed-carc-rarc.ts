import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envRaw = fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf8");
for (const line of envRaw.split("\n")) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith("#")) {
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }
}

interface CsvRow {
  code: string;
  code_type: string;
  description: string;
  category: string;
  common_appeal_argument: string;
}

function parseCsv(text: string): CsvRow[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) throw new Error("CSV must have a header + at least one row");

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const codeIdx = header.indexOf("code");
  const typeIdx = header.indexOf("code_type");
  const descIdx = header.indexOf("description");
  const catIdx = header.indexOf("category");
  const argIdx = header.indexOf("common_appeal_argument");
  if (codeIdx === -1 || typeIdx === -1 || descIdx === -1) {
    throw new Error("CSV must have columns: code, code_type, description [, category, common_appeal_argument]");
  }

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim());
    return {
      code: cols[codeIdx] ?? "",
      code_type: cols[typeIdx] ?? "",
      description: cols[descIdx] ?? "",
      category: catIdx !== -1 ? (cols[catIdx] ?? "") : "",
      common_appeal_argument: argIdx !== -1 ? (cols[argIdx] ?? "") : "",
    };
  }).filter((r) => r.code && r.code_type && r.description);
}

async function main() {
  const csvPath = path.resolve(__dirname, "..", "data", "carc-rarc.csv");
  if (!fs.existsSync(csvPath)) {
    console.error(`File not found: ${csvPath}`);
    console.error("\nDownload the CARC and RARC code lists from WPC-EDI:");
    console.error("  CARC: https://www.wpc-edi.com/reference/codelists/claims/claim-adjustment-reason-codes/");
    console.error("  RARC: https://www.wpc-edi.com/reference/codelists/claims/remittance-advice-remark-codes/");
    console.error("\nCombine both into data/carc-rarc.csv with columns:");
    console.error("  code,code_type,description,category,common_appeal_argument");
    console.error("  CO-50,CARC,Not medically necessary,,{leave empty for now}");
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const rows = parseCsv(raw);
  console.log(`Parsed ${rows.length} rows from CSV`);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const payload = rows.map((r) => ({
    code: r.code,
    code_type: r.code_type.toUpperCase() === "RARC" ? "RARC" : "CARC",
    description: r.description,
    category: r.category || null,
    common_appeal_argument: r.common_appeal_argument || null,
  }));

  const { error } = await supabase.from("carc_rarc_codes").upsert(payload, { onConflict: "code" });

  if (error) {
    console.error("Batch upsert error:", error.message);
    process.exit(1);
  }

  console.log(`Inserted/updated ${payload.length} codes`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
