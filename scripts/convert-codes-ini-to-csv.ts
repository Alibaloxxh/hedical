import fs from "node:fs";
import path from "node:path";

const iniPath = path.resolve(__dirname, "..", "data", "Codes.ini");
const outPath = path.resolve(__dirname, "..", "data", "carc-rarc.csv");

const raw = fs.readFileSync(iniPath, "utf-8");

const entries = raw.split(/\n(?=\[)/).filter((e) => e.trim().startsWith("["));

interface Row {
  code: string;
  code_type: "CARC" | "RARC";
  description: string;
}

function classifyCodeType(code: string): "CARC" | "RARC" {
  if (/^M/i.test(code) || /^N\d/i.test(code)) return "RARC";
  return "CARC";
}

const rows: Row[] = [];

for (const entry of entries) {
  const codeMatch = entry.match(/^\[([^\]]+)\]/);
  const msgMatch = entry.match(/Message=([\s\S]*?)(?=\nEffDate=)/);
  if (!codeMatch || !msgMatch) continue;

  const code = codeMatch[1].trim();
  const description = msgMatch[1].trim().replace(/\s+/g, " ");

  rows.push({
    code,
    code_type: classifyCodeType(code),
    description,
  });
}

function csvEscape(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const header = "code,code_type,description,category,common_appeal_argument";
const lines = rows.map(
  (r) => `${csvEscape(r.code)},${r.code_type},${csvEscape(r.description)},,`
);

fs.writeFileSync(outPath, [header, ...lines].join("\n"), "utf-8");
console.log(`Wrote ${rows.length} codes to ${outPath}`);
