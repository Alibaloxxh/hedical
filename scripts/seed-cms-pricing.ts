import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const STATE_ABBR: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "District of Columbia": "DC", "Florida": "FL", "Georgia": "GA",
  "Hawaii": "HI", "Idaho": "ID", "Illinois": "IL", "Indiana": "IN",
  "Iowa": "IA", "Kansas": "KS", "Kentucky": "KY", "Louisiana": "LA",
  "Maine": "ME", "Maryland": "MD", "Massachusetts": "MA", "Michigan": "MI",
  "Minnesota": "MN", "Mississippi": "MS", "Missouri": "MO", "Montana": "MT",
  "Nebraska": "NE", "Nevada": "NV", "New Hampshire": "NH", "New Jersey": "NJ",
  "New Mexico": "NM", "New York": "NY", "North Carolina": "NC",
  "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK", "Oregon": "OR",
  "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "American Samoa": "AS",
  "Guam": "GU", "Northern Mariana Islands": "MP", "Puerto Rico": "PR",
  "Virgin Islands": "VI",
};

function parseYearFromFilename(filename: string): number {
  const m = filename.match(/D(\d{2})/);
  if (m) return 2000 + parseInt(m[1], 10);
  return 2023;
}

interface GroupedBenchmark {
  description: string;
  nationalAmounts: number[];
  states: Map<string, number[]>;
}

function main() {
  const args = process.argv.slice(2);
  let csvPath: string | null = null;
  let year: number | null = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--csv" && i + 1 < args.length) csvPath = args[++i];
    if (args[i] === "--year" && i + 1 < args.length) year = parseInt(args[++i], 10);
  }

  if (!csvPath) {
    const dataDir = path.resolve(__dirname, "..", "data");
    const files = fs.readdirSync(dataDir).filter(f => f.startsWith("MUP_PHY_") && f.endsWith(".csv"));
    if (files.length === 0) {
      console.error("No MUP_PHY_*.csv found in data/. Download from:");
      console.error("  https://data.cms.gov/provider-summary-by-type-of-service/medicare-physician-other-practitioners/medicare-physician-other-practitioners-by-geography-and-service");
      console.error("  Click 'Export' → CSV, or use the direct download link for the latest year.");
      console.error("  Save as data/MUP_PHY_R25_P05_V20_D23_Geo.csv (or similar).");
      console.error("\nUsage: npx tsx scripts/seed-cms-pricing.ts --csv path/to/file.csv --year 2023");
      process.exit(1);
    }
    csvPath = path.resolve(dataDir, files[0]);
    console.log(`Auto-selected: ${path.relative(path.resolve(__dirname, ".."), csvPath)}`);
  }

  year = year || parseYearFromFilename(path.basename(csvPath));
  console.log(`Using year: ${year}`);

  const envRaw = fs.readFileSync(path.resolve(__dirname, "..", ".env.local"), "utf8");
  for (const line of envRaw.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx !== -1) process.env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env");
    process.exit(1);
  }

  const raw = fs.readFileSync(csvPath, "utf-8");
  const lines = raw.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length < 2) { console.error("CSV has no data rows"); process.exit(1); }

  const header = lines[0].split(",").map(h => h.trim());
  const idx = (name: string) => {
    const i = header.indexOf(name);
    if (i === -1) throw new Error(`Column "${name}" not found in CSV header: ${header.join(", ")}`);
    return i;
  };

  const iGeo = idx("Rndrng_Prvdr_Geo_Lvl");
  const iGeoDesc = idx("Rndrng_Prvdr_Geo_Desc");
  const iHcpcs = idx("HCPCS_Cd");
  const iDesc = idx("HCPCS_Desc");
  const iAllowed = idx("Avg_Mdcr_Alowd_Amt");

  const groups = new Map<string, GroupedBenchmark>();

  for (let r = 1; r < lines.length; r++) {
    const cols = lines[r].split(",");
    const hcpcs = cols[iHcpcs]?.trim();
    if (!hcpcs) continue;

    const geoLevel = cols[iGeo]?.trim();
    const geoDesc = cols[iGeoDesc]?.trim();
    const desc = cols[iDesc]?.trim();
    const allowed = parseFloat(cols[iAllowed]?.trim());
    if (isNaN(allowed)) continue;

    let g = groups.get(hcpcs);
    if (!g) {
      g = { description: desc, nationalAmounts: [], states: new Map() };
      groups.set(hcpcs, g);
    }

    if (!g.description && desc) g.description = desc;

    if (geoLevel === "National") {
      g.nationalAmounts.push(allowed);
    } else if (geoDesc) {
      const abbr = STATE_ABBR[geoDesc];
      if (abbr) {
        const arr = g.states.get(abbr) || [];
        arr.push(allowed);
        g.states.set(abbr, arr);
      }
    }
  }

  const payload: {
    cpt_code: string;
    description: string | null;
    avg_medicare_allowed_national: number;
    avg_medicare_allowed_by_state: Record<string, number> | null;
    source: string;
    year: number;
  }[] = [];

  const avg = (arr: number[]) => Math.round((arr.reduce((s, v) => s + v, 0) / arr.length) * 100) / 100;

  for (const [cpt_code, g] of groups) {
    const national = g.nationalAmounts.length > 0 ? avg(g.nationalAmounts) : 0;
    if (national === 0) continue;

    const stateMap: Record<string, number> = {};
    for (const [st, amounts] of g.states) {
      stateMap[st] = avg(amounts);
    }

    payload.push({
      cpt_code,
      description: g.description || null,
      avg_medicare_allowed_national: national,
      avg_medicare_allowed_by_state: Object.keys(stateMap).length > 0 ? stateMap : null,
      source: "CMS Medicare Physician & Other Practitioners",
      year,
    });
  }

  console.log(`Grouped ${payload.length} CPT codes from ${groups.size} raw codes`);

  const supabase = createClient(supabaseUrl, serviceKey);

  supabase.from("cpt_pricing_benchmarks").upsert(payload, { onConflict: "cpt_code" }).then(({ error }) => {
    if (error) {
      console.error("Batch upsert error:", error.message);
      process.exit(1);
    }
    console.log(`Inserted/updated ${payload.length} pricing benchmarks`);
    process.exit(0);
  });
}

main();
