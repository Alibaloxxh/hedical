import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { IconFile, IconClipboard } from "@tabler/icons-react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Upload medical bills and EOBs for AI-powered analysis, view recent analyses, and manage your Hedical account.",
  alternates: {
    canonical: `${siteUrl}/dashboard`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const [subResult, creditsResult, analysesResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end")
      .eq("user_id", user.id)
      .eq("plan", "unlimited")
      .eq("status", "active")
      .maybeSingle(),
    supabase
      .from("credits")
      .select("product, remaining_count")
      .eq("user_id", user.id)
      .order("product"),
    supabase
      .from("analyses")
      .select("id, product, input_summary, output_summary, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const sub = subResult.data;
  const creditsList = creditsResult.data || [];
  const recentAnalyses = analysesResult.data || [];

  const isUnlimited =
    sub?.plan === "unlimited" &&
    sub?.status === "active" &&
    (!sub.current_period_end || new Date(sub.current_period_end) > new Date());

  const navCredits = creditsList.find((c) => c.product === "bill_navigator")?.remaining_count ?? 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Welcome + plan badge */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">{user.email}</p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
            isUnlimited
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {isUnlimited ? "Unlimited (Active)" : navCredits > 0 ? `${navCredits} credits` : "Free"}
        </span>
      </div>

      {/* Primary action */}
      <Link
        href="/dashboard/analyze"
        className="group relative block rounded-xl border-2 border-dashed border-teal/30 bg-teal/5 p-8 text-center transition-colors hover:border-teal hover:bg-teal/10"
      >
          <div className="mb-3"><IconFile size={36} /></div>
          <h2 className="text-lg font-semibold text-ink">Analyze a new bill or EOB</h2>
        <p className="mt-1 text-sm text-muted">
          Upload a medical bill, EOB, or denial letter to decode charges, flag errors, and generate an appeal letter.
        </p>
      </Link>

      {/* Recent analyses */}
      <section className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Recent analyses</h2>
          <Link
            href="/dashboard/history"
            className="text-sm text-teal hover:text-teal-light transition-colors"
          >
            View all
          </Link>
        </div>
        {recentAnalyses.length === 0 ? (
          <div className="rounded-xl border border-hairline bg-paper-light p-8 text-center">
            <div className="mb-3"><IconClipboard size={28} /></div>
            <p className="text-sm text-muted">No analyses yet</p>
            <p className="mt-1 text-xs text-muted">
              Upload your first bill to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentAnalyses.map((a, i) => (
              <div
                key={a.id}
                className={`animate-fade-in animate-stagger-${i + 1} rounded-xl border border-hairline bg-white p-4 transition-colors hover:bg-paper-light`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {a.input_summary || "Untitled analysis"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {new Date(a.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
