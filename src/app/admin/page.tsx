import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return <p className="p-8 text-center text-muted">Access denied.</p>;
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [totalResult, uniqueResult, topResult, dailyResult] = await Promise.all([
    supabase
      .from("page_visits")
      .select("id", { count: "exact", head: true })
      .gte("visited_at", thirtyDaysAgo),
    supabase
      .from("page_visits")
      .select("session_id", { count: "exact", head: true })
      .gte("visited_at", thirtyDaysAgo)
      .not("session_id", "is", null),
    supabase
      .from("page_visits")
      .select("path, count")
      .gte("visited_at", thirtyDaysAgo)
      .order("count", { ascending: false })
      .limit(5),
    supabase
      .from("page_visits")
      .select("visited_at")
      .gte("visited_at", sevenDaysAgo)
      .order("visited_at", { ascending: true }),
  ]);

  const totalVisits = totalResult.count ?? 0;
  const uniqueVisitors = uniqueResult.count ?? 0;
  const topPages = topResult.data ?? [];
  const dailyRaw = dailyResult.data ?? [];

  const dailyMap: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const row of dailyRaw) {
    const day = new Date(row.visited_at).toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day]++;
  }
  const dailyLabels = Object.keys(dailyMap);
  const dailyCounts = Object.values(dailyMap);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold text-ink mb-8">Admin — site analytics</h1>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <MetricCard label="Total visits (30d)" value={totalVisits.toLocaleString()} />
        <MetricCard label="Unique visitors (30d)" value={uniqueVisitors.toLocaleString()} />
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-ink mb-3">Top pages (30d)</h2>
        {topPages.length === 0 ? (
          <p className="text-sm text-muted">No data yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hairline text-left text-muted">
                <th className="pb-2 font-medium">Page</th>
                <th className="pb-2 font-medium">Visits</th>
              </tr>
            </thead>
            <tbody>
              {topPages.map((p) => (
                <tr key={p.path} className="border-b border-hairline">
                  <td className="py-2 text-ink">{p.path}</td>
                  <td className="py-2 text-muted">{(p as any).count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-ink mb-3">Visits per day (7d)</h2>
        {dailyCounts.every((c) => c === 0) ? (
          <p className="text-sm text-muted">No data yet.</p>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {dailyCounts.map((count, i) => {
              const max = Math.max(...dailyCounts, 1);
              const height = (count / max) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <span className="text-xs text-muted mb-1">{count}</span>
                  <div
                    className="w-full bg-teal rounded-t"
                    style={{ height: `${Math.max(height, 1)}%` }}
                  />
                  <span className="text-xs text-muted mt-1">
                    {dailyLabels[i].slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-8 rounded-xl border border-hairline bg-white p-6">
        <h2 className="text-lg font-semibold text-ink mb-2">Bill Analyze</h2>
        <p className="text-sm text-muted mb-4">Request volume, success rates, and per-analysis history.</p>
        <Link
          href="/admin/analyze-analytics"
          className="inline-flex items-center rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-light transition-colors"
        >
          Bill Analyze Analytics &rarr;
        </Link>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold text-ink mt-1">{value}</p>
    </div>
  );
}
