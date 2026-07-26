import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface PricingBenchmark {
  cptCode: string;
  description: string | null;
  amount: number;
  state: string | null;
  source: string;
  year: number;
}

let _supabase: SupabaseClient | null = null;
function getClient(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

export async function getPricingBenchmark(cptCode: string, state?: string | null): Promise<PricingBenchmark | null> {
  const { data } = await getClient()
    .from("cpt_pricing_benchmarks")
    .select("cpt_code, description, avg_medicare_allowed_national, avg_medicare_allowed_by_state, source, year")
    .eq("cpt_code", cptCode.toUpperCase())
    .maybeSingle();

  if (!data) return null;

  let amount = data.avg_medicare_allowed_national;
  let matchedState: string | null = null;

  if (state && data.avg_medicare_allowed_by_state && typeof data.avg_medicare_allowed_by_state === "object") {
    const stateMap = data.avg_medicare_allowed_by_state as Record<string, number>;
    const st = state.toUpperCase();
    if (stateMap[st] !== undefined) {
      amount = stateMap[st];
      matchedState = st;
    }
  }

  return {
    cptCode: data.cpt_code,
    description: data.description,
    amount,
    state: matchedState,
    source: data.source,
    year: data.year,
  };
}

export async function getPricingBenchmarks(
  cptCodes: string[],
  state?: string | null,
): Promise<Map<string, PricingBenchmark>> {
  const codes = [...new Set(cptCodes.filter(Boolean).map(c => c.toUpperCase()))];
  if (codes.length === 0) return new Map();

  const { data } = await getClient()
    .from("cpt_pricing_benchmarks")
    .select("cpt_code, description, avg_medicare_allowed_national, avg_medicare_allowed_by_state, source, year")
    .in("cpt_code", codes);

  const map = new Map<string, PricingBenchmark>();

  for (const row of data || []) {
    let amount = row.avg_medicare_allowed_national;
    let matchedState: string | null = null;

    if (state && row.avg_medicare_allowed_by_state && typeof row.avg_medicare_allowed_by_state === "object") {
      const stateMap = row.avg_medicare_allowed_by_state as Record<string, number>;
      const st = state.toUpperCase();
      if (stateMap[st] !== undefined) {
        amount = stateMap[st];
        matchedState = st;
      }
    }

    map.set(row.cpt_code, {
      cptCode: row.cpt_code,
      description: row.description,
      amount,
      state: matchedState,
      source: row.source,
      year: row.year,
    });
  }

  return map;
}
