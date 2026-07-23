import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconClipboard } from "@tabler/icons-react";

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/history");
  }

  const { data: analyses } = await supabase
    .from("analyses")
    .select("id, product, input_summary, output_summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis history</h1>
          <p className="mt-1 text-sm text-muted">All your past uploads and results</p>
        </div>
        <Link
          href="/dashboard/analyze"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
        >
          New analysis
        </Link>
      </div>

      {!analyses || analyses.length === 0 ? (
        <div className="rounded-xl border border-border bg-zinc-50 p-8 text-center">
          <div className="mb-3"><IconClipboard size={28} /></div>
          <p className="text-sm text-muted">No analyses yet</p>
          <p className="mt-1 text-xs text-muted">
            Upload your first bill to get started.
          </p>
          <Link
            href="/dashboard/analyze"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
          >
            Analyze a bill
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-border bg-white p-5 transition-colors hover:bg-zinc-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {a.input_summary || "Untitled analysis"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {a.product === "bill_navigator" ? "Bill & Denial Navigator" : a.product}
                    {" · "}
                    {new Date(a.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {a.output_summary && (
                  <span className="shrink-0 text-xs text-muted">
                    {a.output_summary.length > 80
                      ? `${a.output_summary.slice(0, 80)}...`
                      : a.output_summary}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
