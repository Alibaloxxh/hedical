import type { SupabaseClient } from "@supabase/supabase-js";

export interface DenialCodeInfo {
  code: string;
  code_type: "CARC" | "RARC";
  description: string;
  category: string | null;
  common_appeal_argument: string | null;
}

export function parseDenialCodes(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(/[/;,]+/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

function stripPrefix(code: string): string {
  const parts = code.split("-");
  if (parts.length === 2 && /^\d+$/.test(parts[1])) return parts[1];
  return code;
}

export async function lookupDenialCodes(
  supabase: SupabaseClient,
  rawCode: string | null
): Promise<DenialCodeInfo[]> {
  const codes = parseDenialCodes(rawCode);
  if (codes.length === 0) return [];

  const results: DenialCodeInfo[] = [];
  for (const code of codes) {
    let { data } = await supabase
      .from("carc_rarc_codes")
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (!data) {
      const base = stripPrefix(code);
      if (base !== code) {
        const r = await supabase
          .from("carc_rarc_codes")
          .select("*")
          .eq("code", base)
          .maybeSingle();
        data = r.data;
      }
    }
    if (data) results.push(data as DenialCodeInfo);
  }
  return results;
}

export function formatDenialContext(codes: DenialCodeInfo[]): string {
  if (codes.length === 0) return "";
  return codes
    .map(
      (c) =>
        `  - ${c.code} (${c.code_type}): ${c.description}`
    )
    .join("\n");
}
