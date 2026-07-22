import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analysis History",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const page = Math.max(1, parseInt((await searchParams).page ?? "1", 10) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/admin/analyze-analytics/history");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return <p className="p-8 text-center text-muted">Access denied.</p>;
  }

  // Total count for pagination
  const countResult = await supabase
    .from("analyses")
    .select("id", { count: "exact", head: true })
    .eq("product", "bill_navigator");

  const totalCount = countResult.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Paginated rows
  const { data: rows } = await supabase
    .from("analyses")
    .select("id, created_at, user_id, status, input_summary")
    .eq("product", "bill_navigator")
    .order("created_at", { ascending: false })
    .range(from, to);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
          <p className="mt-1 text-sm text-muted">
            {totalCount.toLocaleString()} total analyses
          </p>
        </div>
        <Link
          href="/admin/analyze-analytics"
          className="text-sm text-primary hover:text-primary-light transition-colors"
        >
          &larr; Back to analytics
        </Link>
      </div>

      {!rows || rows.length === 0 ? (
        <div className="rounded-xl border border-border bg-zinc-50 p-8 text-center">
          <p className="text-sm text-muted">No analyses yet.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-zinc-50 text-left text-muted">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Input</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 text-muted font-mono text-xs">
                      {r.user_id ?? <span className="italic">Anonymous</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "success"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted max-w-xs truncate">
                      {r.input_summary
                        ? r.input_summary.length > 80
                          ? `${r.input_summary.slice(0, 80)}...`
                          : r.input_summary
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              {page > 1 && (
                <Link
                  href={`/admin/analyze-analytics/history?page=${page - 1}`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  &larr; Previous
                </Link>
              )}
              {page < totalPages && (
                <Link
                  href={`/admin/analyze-analytics/history?page=${page + 1}`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  Next &rarr;
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
