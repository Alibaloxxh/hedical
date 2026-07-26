import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
for (const line of env.split('\n')) {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const i = t.indexOf('=');
    if (i !== -1) process.env[t.slice(0, i)] = t.slice(i + 1);
  }
}

async function main() {
  const { createClient } = await import('@supabase/supabase-js');
  const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

  const { count, error } = await s
    .from('cpt_pricing_benchmarks')
    .select('*', { count: 'exact', head: true });

  console.log('Count:', count, 'Error:', error?.message || 'none');
}
main();
