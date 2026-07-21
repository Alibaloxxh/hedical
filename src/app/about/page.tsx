import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "About",
  description:
    "Hedical was founded in 2026 with a mission to bring clarity, fairness, and control back to patients and caregivers navigating the US healthcare system.",
  alternates: {
    canonical: `${siteUrl}/about`,
  },
  openGraph: {
    title: "About | Hedical",
    description:
      "Hedical was founded in 2026 with a mission to bring clarity, fairness, and control back to patients and caregivers navigating the US healthcare system.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About | Hedical",
    description:
      "Hedical was founded in 2026 with a mission to bring clarity, fairness, and control back to patients and caregivers navigating the US healthcare system.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const values = [
  {
    title: "Clarity over complexity",
    description: "Healthcare billing and insurance are deliberately opaque. We translate jargon into plain language so you can make informed decisions.",
    icon: "\u{1F4A1}",
  },
  {
    title: "Patient-first, always",
    description: "We don't sell patient data, link insurance accounts, or take kickbacks from pharma or insurers. Your interests come first.",
    icon: "\u{1F91D}",
  },
  {
    title: "Buildable, not hypothetical",
    description: "Every product Hedical ships is designed for a solo founder to build and monetize — no clinical trials, no enterprise sales, no billion-dollar compute.",
    icon: "\u{1F6E0}\uFE0F",
  },
  {
    title: "Evidence-based",
    description: "Every letter, explanation, and recommendation is grounded in cited sources — your policy, peer-reviewed research, and state/federal regulations.",
    icon: "\u{1F4DA}",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-hedical-50 via-white to-hedical-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              About Hedical
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Hedical was founded in 2026 with a single insight: the US healthcare system spends billions on
              AI tools for insurers and hospitals, but leaves the patient — the most important stakeholder —
              with nothing but confusing bills and form letters.
            </p>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              We&apos;re building AI tools that level the playing field. Not to diagnose disease or replace doctors,
              but to help patients and caregivers understand their bills, fight unfair denials, simplify paperwork,
              and manage medications — all in plain English, all under your control.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our values
            </h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value.title} className="rounded-xl border border-border bg-zinc-50 p-6 sm:p-8">
                <div className="text-3xl mb-4">{value.icon}</div>
                <h3 className="text-lg font-semibold text-foreground">{value.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-center">
              The research behind the products
            </h2>
            <div className="mt-12 space-y-6">
              {[
                { stat: "19%", detail: "of in-network claims on HealthCare.gov were denied in 2024 (KFF)." },
                { stat: "<1%", detail: "of denied claims are ever appealed — even though 44-78% could be overturned." },
                { stat: "80%", detail: "of medical bills contain errors according to industry estimates (range: 30-90%)." },
                { stat: "$20B", detail: "hospitals spent in 2025 overturning denials. Only 14% use AI for denials (patient side is wide open)." },
                { stat: "40%", detail: "of older adults take 5+ medications daily, creating serious polypharmacy risks." },
                { stat: "92%", detail: "of physicians say prior authorization negatively affects clinical outcomes (AMA 2025)." },
              ].map((item) => (
                <div key={item.stat} className="flex items-start gap-4 rounded-lg border border-border bg-white p-4">
                  <div className="shrink-0 text-2xl font-bold text-primary">{item.stat}</div>
                  <p className="text-sm text-muted pt-1">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why &ldquo;Hedical&rdquo;?
          </h2>
          <p className="mt-4 text-lg text-muted leading-relaxed">
            A portmanteau of <strong>health</strong> and <strong>medical</strong> — with a nod to
            &ldquo;hedical&rdquo; as in practical, actionable, grounded. We&apos;re not here to promise
            miracles. We&apos;re here to help you navigate the system that exists, one bill, one denial,
            one prescription at a time.
          </p>
        </div>
      </section>

      <CTASection
        title="Join the mission"
        description="Be part of the first generation of patients who fight back — with AI on their side."
        buttonText="Get Early Access"
        buttonHref="/waitlist"
      />
    </>
  );
}
