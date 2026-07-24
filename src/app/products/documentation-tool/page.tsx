import type { Metadata } from "next";
import Link from "next/link";
import { IconBuildingHospital, IconBrain, IconBabyBottle, IconBrandApple, IconDental, IconMicrophone, IconFile, IconBook, IconLink, IconLock, IconChartBar } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SoftwareAppSchema } from "@/components/SoftwareAppSchema";
import { FaqPageSchema } from "@/components/FaqPageSchema";
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
  { icon: <IconBuildingHospital className="size-6 text-teal" />, title: "Allied Health", desc: "PT, OT, speech therapy, chiropractic — note formats that match your workflow." },
  { icon: <IconBrain className="size-6 text-teal" />, title: "ABA Therapy", desc: "Behavioral session notes, goal tracking, and insurance-ready documentation." },
  { icon: <IconBabyBottle className="size-6 text-teal" />, title: "Lactation / IBCLC", desc: "Feeding assessments, latch evaluations, and parent take-home instructions." },
  { icon: <IconBrandApple className="size-6 text-teal" />, title: "Nutrition & Dietetics", desc: "Dietary assessments, meal planning notes, and outcome tracking." },
  { icon: <IconDental className="size-6 text-teal" />, title: "Small Dental", desc: "Procedure notes, treatment plans, and patient aftercare instructions." },
];

const docToolFaqs = [
  {
    question: "Is the Documentation Tool HIPAA compliant?",
    answer: "Yes. Hedical is built with enterprise-grade security and data handling from day one. All data is encrypted in transit and at rest. We never sell or share patient information. We designed the tool specifically for healthcare workflows, not repurposed from a general-purpose product.",
  },
  {
    question: "What specialties does the tool support?",
    answer: "Currently the Documentation Tool supports allied health (PT, OT, speech therapy, chiropractic), ABA therapy, lactation consulting (IBCLC), nutrition and dietetics, and small dental practices. Each specialty has pre-configured note templates (SOAP, BIRP, DAP, and custom formats) that match your workflow.",
  },
  {
    question: "Can I export notes to my existing EHR?",
    answer: "Yes. The Documentation Tool offers one-click export to your existing EHR system. No painful integration or API setup needed — export structured notes in standard formats that most EHRs can import.",
  },
  {
    question: "How does the voice input work?",
    answer: "Dictate notes naturally during or after sessions using the voice input feature. The AI transcribes and structures your dictation into your specialty's note format automatically. You can also type notes directly — both text and voice input are supported.",
  },
  {
    question: "Is this a replacement for my EHR?",
    answer: "No. The Documentation Tool is designed to complement your existing EHR, not replace it. It handles the time-consuming parts of documentation — structuring notes, generating patient instructions — and exports the finished product to your EHR. Think of it as an AI assistant that cuts documentation time in half.",
  },
  {
    question: "When will the Documentation Tool be available?",
    answer: "The Documentation Tool is currently in development and listed as coming soon. Join the waitlist to receive early access notifications and launch pricing. We are onboarding beta users in small batches.",
  },
];

export default function DocumentationToolPage() {
  return (
    <>
      <SoftwareAppSchema
        name="Niche Vertical Documentation Tool"
        description="An ambient-scribe-style AI assistant for allied health, ABA therapy, lactation, nutrition, and small dental practices. Automate SOAP notes and patient education."
        url={`${siteUrl}/products/documentation-tool`}
      />
      <FaqPageSchema faqs={docToolFaqs} />
      <section className="bg-gradient-to-br from-paper via-white to-paper-dark">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Breadcrumb items={[{ label: "Documentation Tool" }]} />
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 mb-4">
              Coming Soon
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Niche Vertical Documentation &amp; Patient-Education Tool
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Generalist ambient scribes are saturated. But purpose-built tools win in underserved verticals.
              Hedical delivers specialty-specific documentation and auto-generated patient instructions for
              allied health, ABA therapy, lactation, nutrition, and small dental practices.
            </p>
            <p className="mt-2 text-xs text-muted">
              Last updated:{" "}
              <time dateTime="2026-07-21">July 21, 2026</time>
            </p>
            <div className="mt-6 max-w-lg mx-auto">
              <Disclaimer variant="banner" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/waitlist"
                className="rounded-lg bg-teal px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-light transition active:scale-[0.97]"
              >
                Join the Waitlist
              </Link>
              <Link
                href="/pricing"
                className="rounded-lg border border-hairline bg-white px-6 py-3 text-base font-medium text-ink shadow-sm hover:bg-paper-light transition active:scale-[0.97]"
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
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Purpose-built for your specialty
            </h2>
            <p className="mt-4 text-lg text-muted">
              One size does not fit all. We build note templates and workflows that actually match how you practice.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {verticals.map((v) => (
              <div key={v.title} className="rounded-xl border border-hairline bg-paper-light p-6">
                <div className="mb-3">{v.icon}</div>
                <h3 className="font-semibold text-ink">{v.title}</h3>
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
          { icon: <IconMicrophone className="size-6 text-teal" />, title: "Voice & Text Input", description: "Dictate notes naturally during sessions. AI structures them into your specialty's format." },
          { icon: <IconFile className="size-6 text-teal" />, title: "Specialty Templates", description: "SOAP, BIRP, DAP, and custom note formats pre-configured for your vertical." },
          { icon: <IconBook className="size-6 text-teal" />, title: "Auto Patient Instructions", description: "Generate take-home instructions, exercise plans, and educational handouts from session notes." },
          { icon: <IconLink className="size-6 text-teal" />, title: "EHR Export", description: "One-click export to your existing EHR. No painful integration needed." },
          { icon: <IconLock className="size-6 text-teal" />, title: "HIPAA Compliant", description: "Enterprise-grade security and data handling. Built for healthcare from day one." },
          { icon: <IconChartBar className="size-6 text-teal" />, title: "Outcome Tracking", description: "Track patient progress over time with AI-summarized session histories." },
        ]}
      />

      <section className="py-16 sm:py-24 bg-paper-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Market opportunity
            </h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-hairline bg-white p-6 text-center">
              <div className="text-3xl font-bold text-teal">$1.2B</div>
              <p className="mt-2 text-sm text-muted">Ambient documentation market size (2025)</p>
              <span className="mt-1 inline-block text-[10px] text-muted"><a href="https://www.grandviewresearch.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Grand View Research</a></span>
            </div>
            <div className="rounded-xl border border-hairline bg-white p-6 text-center">
              <div className="text-3xl font-bold text-teal">$49-129</div>
              <p className="mt-2 text-sm text-muted">Per-provider monthly pricing range</p>
              <span className="mt-1 inline-block text-[10px] text-muted"><a href="https://www.heidihealth.com/pricing" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Industry pricing</a></span>
            </div>
            <div className="rounded-xl border border-hairline bg-white p-6 text-center">
              <div className="text-3xl font-bold text-teal">28.8%</div>
              <p className="mt-2 text-sm text-muted">Projected CAGR through 2035</p>
              <span className="mt-1 inline-block text-[10px] text-muted"><a href="https://www.marketsandmarkets.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">MarketsandMarkets</a></span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
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
              <div key={i} className="flex items-start gap-3 rounded-lg border border-hairline p-4">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-paper-light">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
          <div className="mt-8 space-y-4 text-left">
            {docToolFaqs.map((faq) => (
              <details key={faq.question} className="group rounded-lg border border-hairline bg-white">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-ink">
                  {faq.question}
                  <svg className="h-5 w-5 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="faq-content px-4 pb-4 text-sm text-body">{faq.answer}</div>
              </details>
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
