import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Disclaimer } from "@/components/Disclaimer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Niche Vertical Documentation Tool",
  description:
    "An ambient-scribe-style AI assistant for allied health, ABA therapy, lactation, nutrition, and small dental practices. Automate SOAP notes and patient education.",
  alternates: {
    canonical: `${siteUrl}/products/documentation-tool`,
  },
  openGraph: {
    title: "Niche Vertical Documentation Tool | Hedical",
    description:
      "An ambient-scribe-style AI assistant for allied health, ABA therapy, lactation, nutrition, and small dental practices.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Niche Vertical Documentation Tool | Hedical",
    description:
      "An ambient-scribe-style AI assistant for allied health, ABA therapy, lactation, nutrition, and small dental practices.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const verticals = [
  { icon: "\u{1F3E5}", title: "Allied Health", desc: "PT, OT, speech therapy, chiropractic — note formats that match your workflow." },
  { icon: "\u{1F9E0}", title: "ABA Therapy", desc: "Behavioral session notes, goal tracking, and insurance-ready documentation." },
  { icon: "\u{1F476}", title: "Lactation / IBCLC", desc: "Feeding assessments, latch evaluations, and parent take-home instructions." },
  { icon: "\u{1F34E}", title: "Nutrition & Dietetics", desc: "Dietary assessments, meal planning notes, and outcome tracking." },
  { icon: "\u{1F9B7}", title: "Small Dental", desc: "Procedure notes, treatment plans, and patient aftercare instructions." },
];

export default function DocumentationToolPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-hedical-50 via-white to-hedical-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 mb-4">
              Runner-Up
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Niche Vertical Documentation &amp; Patient-Education Tool
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Generalist ambient scribes are saturated. But purpose-built tools win in underserved verticals.
              Hedical delivers specialty-specific documentation and auto-generated patient instructions for
              allied health, ABA therapy, lactation, nutrition, and small dental practices.
            </p>
            <div className="mt-6 max-w-lg mx-auto">
              <Disclaimer variant="banner" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-light transition-colors"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-border bg-white px-6 py-3 text-base font-medium text-foreground shadow-sm hover:bg-zinc-50 transition-colors"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Purpose-built for your specialty
            </h2>
            <p className="mt-4 text-lg text-muted">
              One size does not fit all. We build note templates and workflows that actually match how you practice.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {verticals.map((v) => (
              <div key={v.title} className="rounded-xl border border-border bg-zinc-50 p-6">
                <div className="text-2xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid
        title="Core features"
        subtitle="Everything you need to cut documentation time in half."
        features={[
          { icon: "\u{1F399}\uFE0F", title: "Voice & Text Input", description: "Dictate notes naturally during sessions. AI structures them into your specialty's format." },
          { icon: "\u{1F4C4}", title: "Specialty Templates", description: "SOAP, BIRP, DAP, and custom note formats pre-configured for your vertical." },
          { icon: "\u{1F4D6}", title: "Auto Patient Instructions", description: "Generate take-home instructions, exercise plans, and educational handouts from session notes." },
          { icon: "\u{1F517}", title: "EHR Export", description: "One-click export to your existing EHR. No painful integration needed." },
          { icon: "\u{1F512}", title: "HIPAA Compliant", description: "Enterprise-grade security and data handling. Built for healthcare from day one." },
          { icon: "\u{1F4CA}", title: "Outcome Tracking", description: "Track patient progress over time with AI-summarized session histories." },
        ]}
      />

      <section className="py-16 sm:py-24 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Market opportunity
            </h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="text-3xl font-bold text-primary">$1.2B</div>
              <p className="mt-2 text-sm text-muted">Ambient documentation market size (2025)</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="text-3xl font-bold text-primary">$49-129</div>
              <p className="mt-2 text-sm text-muted">Per-provider monthly pricing range</p>
            </div>
            <div className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="text-3xl font-bold text-primary">28.8%</div>
              <p className="mt-2 text-sm text-muted">Projected CAGR through 2035</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Why this gap exists
            </h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-4">
            {[
              "Generalist scribes (Heidi, Freed) target physicians and ignore allied health workflows.",
              "Enterprise vendors (Nuance, Abridge) sell at $500+/provider/month — out of reach for small practices.",
              "Most vertical-specific tools focus on mental health and veterinary — leaving ABA, lactation, nutrition, and dental underserved.",
              "Solo and small practices lack the procurement power to negotiate with enterprise EHR vendors.",
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-hedical-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Ready to cut documentation time in half?"
        description="Join our waitlist for early access and launch pricing."
        buttonText="Get Early Access"
        buttonHref="/waitlist"
        variant="secondary"
      />
    </>
  );
}
