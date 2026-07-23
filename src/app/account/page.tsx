import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your Hedical account, subscription, and credits.",
  alternates: {
    canonical: `${siteUrl}/account`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return null;
  }

  const [subResult, creditsResult] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("plan, status, current_period_end, created_at")
      .eq("user_id", user.user.id)
      .maybeSingle(),
    supabase
      .from("credits")
      .select("product, remaining_count")
      .eq("user_id", user.user.id)
      .order("product"),
  ]);

  const sub = subResult.data;
  const credits = creditsResult.data || [];

  function getCreditFor(product: string) {
    return credits.find((c) => c.product === product)?.remaining_count ?? 0;
  }

  const productNames: Record<string, string> = {
    bill_navigator: "Bill & Denial Navigator",
    doc_tool: "Documentation Tool",
    polypharmacy: "Polypharmacy Manager",
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground">Account</h1>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
          >
            Sign out
          </button>
        </form>
      </div>

      <section className="mb-8 rounded-lg border border-border bg-white p-6">
        <h2 className="mb-1 text-lg font-semibold text-foreground">Plan</h2>
        <p className="text-sm text-muted mb-4">{user.user.email}</p>

        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              sub?.plan === "unlimited" && sub?.status === "active"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {sub?.plan === "unlimited" && sub?.status === "active"
              ? "Unlimited (Active)"
              : "Free"}
          </span>

          {sub?.current_period_end && (
            <span className="text-xs text-muted">
              Renews {new Date(sub.current_period_end).toLocaleDateString()}
            </span>
          )}
        </div>

        {sub?.plan === "unlimited" && sub?.status === "active" && (
          <p className="mt-4 text-sm text-muted">
            Manage your subscription —{" "}
            <a href="mailto:hedicalai@gmail.com" className="text-primary underline underline-offset-2">
              hedicalai@gmail.com
            </a>
          </p>
        )}
      </section>

      <section className="rounded-lg border border-border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Credits</h2>

        {sub?.plan === "unlimited" && sub?.status === "active" ? (
          <p className="text-sm text-muted">
            You have an unlimited plan. No per-use credits needed.
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(productNames).map(([key, name]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-md bg-gray-50 px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{name}</span>
                <span className="text-sm text-muted">
                  {getCreditFor(key)} credit{getCreditFor(key) !== 1 ? "s" : ""} remaining
                </span>
              </div>
            ))}
            <p className="mt-4 text-xs text-muted">
              Credits are used when you generate appeal letters or other paid features.
              <br />
              <Link href="/pricing" className="text-primary underline underline-offset-2">
                Buy credits or upgrade to Unlimited
              </Link>
            </p>
          </div>
        )}
      </section>

      <section className="mt-8 text-center">
        <Link
          href="/"
          className="text-sm text-muted underline underline-offset-2 hover:text-foreground"
        >
          &larr; Back to home
        </Link>
      </section>
    </div>
  );
}
