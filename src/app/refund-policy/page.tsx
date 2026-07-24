import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Hedical's refund and cancellation policy for subscriptions and per-use purchases.",
  alternates: {
    canonical: `${siteUrl}/refund-policy`,
  },
  openGraph: {
    title: "Refund & Cancellation Policy | Hedical",
    description: "Hedical's refund and cancellation policy for subscriptions and per-use purchases.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Refund & Cancellation Policy | Hedical",
    description: "Hedical's refund and cancellation policy for subscriptions and per-use purchases.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function RefundPolicyPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Refund &amp; Cancellation Policy</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        <div className="mt-8 prose prose-sm text-muted space-y-6">
          <h2 className="text-xl font-semibold text-ink">1. Subscriptions (Unlimited Plan)</h2>
          <p>
            Your <strong>Unlimited</strong> subscription renews monthly at $9/month. You may cancel at any time
            from your account settings. After cancellation, you retain access to the service until the end of
            the current billing period. No partial refunds are given for the remainder of a billing period.
          </p>

          <h2 className="text-xl font-semibold text-ink">2. Per-Use Purchases</h2>
          <p>
            Per-use purchases ($19/letter) are final sale. Because each purchase grants immediate access to an
            AI-generated letter, refunds are not offered after the letter has been generated. If a technical
            error prevents you from receiving or accessing your letter, contact us for a replacement or refund.
          </p>

          <h2 className="text-xl font-semibold text-ink">3. Technical Issues</h2>
          <p>
            If you experience a bug, failed payment, or cannot access the service you paid for, contact us at{" "}
            <a href="mailto:hedicalai@gmail.com" className="text-teal underline">hedicalai@gmail.com</a>.
            We review each case individually and will issue a refund or credit if the issue is on our side.
          </p>

          <h2 className="text-xl font-semibold text-ink">4. How to Cancel</h2>
          <p>
            To cancel your subscription:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-sm">
            <li>Log in to your Hedical account</li>
            <li>Go to Account → Manage Subscription</li>
            <li>Click Cancel Subscription</li>
          </ul>
          <p>
            You will receive a confirmation email. If you do not see it, contact{" "}
            <a href="mailto:hedicalai@gmail.com" className="text-teal underline">hedicalai@gmail.com</a>.
          </p>

          <h2 className="text-xl font-semibold text-ink">5. Contact</h2>
          <p>
            Questions about this policy? Email us at{" "}
            <a href="mailto:hedicalai@gmail.com" className="text-teal underline">hedicalai@gmail.com</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
