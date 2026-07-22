import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bill Analyze Analytics",
  robots: { index: false, follow: false },
};

const RANGES = ["today", "7d", "30d", "all"] as const;
type Range = (typeof RANGES)[number];

function rangeStart(range: Range): Date {
  const now = Date.now();
  switch (range) {
    case "today": return new Date(now - 24 * 60 * 60 * 1000);
    case "7d": return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case "30d": return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "all": return new Date(0);
  }
}

function fillDailyLabels(range: Range): string[] {
  const days: string[] = [];
  const now = new Date();
  if (range === "today") {
    days.push(now.toISOString().slice(0, 10));
  } else {
    const count = range === "7d" ? 7 : 30;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      days.push(d.toISOString().slice(0, 10));
    }
  }
  return days;
}

export default async function AnalyzeAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const range = (await searchParams).range as Range | undefined;
  const activeRange = RANGES.includes(range ?? ("" as Range)) ? (range as Range) : "7d";
  const start = rangeStart(activeRange).toISOString();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/analyze-analytics");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return <p className="p-8 text-center text-muted">Access denied.</p>;
  }

  const product = "bill_navigator";
  const labels = fillDailyLabels(activeRange);

  const [totalResult, activeResult, dailyResult, statusResult, usersResult] = await Promise.all([
    // a) Total requests
    supabase
      .from("analyses")
      .select("id", { count: "exact", head: true })
      .eq("product", product)
      .gte("created_at", start),
    // c) Active analyzers (distinct user_id with analyses, non-null)
    supabase
      .from("analyses")
      .select("user_id", { count: "exact", head: true })
      .eq("product", product)
      .not("user_id", "is", null)
      .gte("created_at", start),
    // e) Requests per day
    supabase
      .from("analyses")
      .select("created_at")
      .eq("product", product)
      .gte("created_at", start)
      .order("created_at", { ascending: true }),
    // f) Success/error breakdown
    supabase
      .from("analyses")
      .select("status")
      .eq("product", product)
      .gte("created_at", start),
    // Total registered users
    supabase
      .from("users")
      .select("id", { count: "exact", head: true }),
  ]);

  const totalRequests = totalResult.count ?? 0;
  const activeAnalyzers = activeResult.count ?? 0;
  const totalUsers = usersResult.count ?? 0;

  // b) Site visitors from page_visits
  const visitorResult = await supabase
    .from("page_visits")
    .select("user_id, session_id")
    .gte("visited_at", start);

  const visitorUsers = new Set<string>();
  for (const v of visitorResult.data ?? []) {
    const key = v.user_id ?? v.session_id;
    if (key) visitorUsers.add(key);
  }
  const siteVisitors = visitorUsers.size;

  // d) New vs returning among active analyzers
  const activeUserIds: string[] = [];
  if (activeResult.count && activeResult.count > 0) {
    const activeUsersResult = await supabase
      .from("analyses")
      .select("user_id")
      .eq("product", product)
      .not("user_id", "is", null)
      .gte("created_at", start);
    const seen = new Set<string>();
    for (const r of activeUsersResult.data ?? []) {
      if (r.user_id && !seen.has(r.user_id)) {
        seen.add(r.user_id);
        activeUserIds.push(r.user_id);
      }
    }
  }

  let newCount = 0;
  let returningCount = 0;
  if (activeUserIds.length > 0) {
    const priorResult = await supabase
      .from("analyses")
      .select("user_id")
      .eq("product", product)
      .lt("created_at", start)
      .in("user_id", activeUserIds);
    const priorUsers = new Set((priorResult.data ?? []).map((r) => r.user_id).filter(Boolean));
    for (const uid of activeUserIds) {
      if (priorUsers.has(uid)) returningCount++;
      else newCount++;
    }
  }

  // e) Daily trend (fill missing days with 0)
  const dailyMap: Record<string, number> = {};
  for (const l of labels) dailyMap[l] = 0;
  for (const row of dailyResult.data ?? []) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    if (day in dailyMap) dailyMap[day]++;
  }
  const dailyCounts = labels.map((l) => dailyMap[l]);

  // f) Status breakdown
  let successCount = 0;
  let errorCount = 0;
  for (const row of statusResult.data ?? []) {
    if (row.status === "success") successCount++;
    else errorCount++;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bill Analyze Analytics</h1>
        <Link
          href="/admin/analyze-analytics/history"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          View history &rarr;
        </Link>
      </div>

      {/* Time-range selector */}
      <div className="flex gap-2 mb-8">
        {RANGES.map((r) => {
          const params = new URLSearchParams(r === "7d" ? undefined : { range: r });
          const href = r === "7d" ? "/admin/analyze-analytics" : `/admin/analyze-analytics?range=${r}`;
          return (
            <Link
              key={r}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeRange === r
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {r === "today" ? "Today" : r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All time"}
            </Link>
          );
        })}
      </div>

      {/* Stat cards */}
      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <MetricCard label="Total requests" value={totalRequests.toLocaleString()} />
        <MetricCard label="Total users" value={totalUsers.toLocaleString()} />
        <MetricCard label="Site visitors" value={siteVisitors.toLocaleString()} />
        <MetricCard label="Active analyzers" value={activeAnalyzers.toLocaleString()} />
        <MetricCard
          label="New vs returning"
          value={`${newCount} new · ${returningCount} returning`}
        />
      </div>

      {/* Trend chart */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Requests per day ({activeRange === "today" ? "today" : activeRange === "7d" ? "7 days" : activeRange === "30d" ? "30 days" : "all time"})
        </h2>
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
                    className="w-full bg-primary rounded-t"
                    style={{ height: `${Math.max(height, 1)}%` }}
                  />
                  <span className="text-xs text-muted mt-1">
                    {labels[i].slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Status breakdown */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-3">Request status</h2>
        <p className="text-sm text-muted">
          {successCount > 0 || errorCount > 0
            ? `${successCount.toLocaleString()} success · ${errorCount.toLocaleString()} errors`
            : "No data yet."}
        </p>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-white p-6">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
    </div>
  );
}
