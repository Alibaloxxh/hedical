import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Disclaimer } from "@/components/Disclaimer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Medical Bill & Denial Navigator",
  description:
    "Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and a ready-to-send appeal letter draft.",
  alternates: {
    canonical: `${siteUrl}/products/bill-denial-navigator`,
  },
  openGraph: {
    title: "Medical Bill & Denial Navigator | Hedical",
    description:
      "Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and a ready-to-send appeal letter draft.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Medical Bill & Denial Navigator | Hedical",
    description:
      "Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and a ready-to-send appeal letter draft.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const painPoints = [
  { icon: "\u{1F4B5}", title: "Hidden Errors", description: "Up to 80% of medical bills contain errors — duplicate charges, upcoding, unbundling, and out-of-network surprises." },
  { icon: "\u{1F6AB}", title: "Denied Claims", description: "Insurers deny 19% of in-network claims. Fewer than 1% of denials are ever appealed, even though 44-78% could be overturned." },
  { icon: "\u{1F4AD}", title: "Confusing Jargon", description: "EOBs and medical bills are written in opaque language designed for providers and payers, not patients." },
  { icon: "\u{23F3}", title: "Tight Deadlines", description: "Appeal windows are short — often 30-180 days. Missing a deadline means losing your right to challenge a denial." },
];

const features = [
  {
    icon: "\u{1F5BC}\uFE0F",
    title: "Upload any document",
    description: "Photograph or upload any medical bill, EOB, or denial letter. Our AI extracts every line item automatically.",
  },
  {
    icon: "\u{1F50D}",
    title: "Understand what you owe",
    description: "Every charge and code is translated into plain English. Know exactly what each line item means and whether it looks right.",
  },
  {
    icon: "\u{1F6E1}\uFE0F",
    title: "Flag potential errors",
    description: "Our AI checks for duplicate charges, upcoding, unbundling, out-of-network surprises, and charges exceeding typical rates.",
  },
  {
    icon: "\u{2728}",
    title: "Get an AI-drafted appeal letter",
    description: "Generate a ready-to-send appeal or negotiation letter draft based on your documents — formatted, grounded in your policy, and yours to review and send.",
  },
  {
    icon: "\u{1F4C5}",
    title: "Know your deadlines",
    description: "We track your appeal windows and guide you through each step of the process.",
  },
  {
    icon: "\u{1F4BA}",
    title: "Understand your rights",
    description: "Know what protections your state offers — from surprise billing laws to independent external review rights.",
  },
];

export default function BillDenialNavigatorPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-hedical-50 via-white to-hedical-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-hedical-100 px-4 py-1.5 text-sm font-medium text-hedical-700 mb-4">
              Recommended
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Medical Bill &amp; Insurance Denial Navigator
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Understand your medical bills in plain English. Flag potential errors. Get a ready-to-send
              appeal letter draft — AI-drafted from your documents, reviewed by you before sending.
            </p>
            <div className="mt-6 max-w-lg mx-auto">
              <Disclaimer variant="banner" />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <Link
                href="/dashboard/analyze"
                className="rounded-lg bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-light transition-colors"
              >
                Try It Free
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

      {/* Pain Points */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The problem
            </h2>
            <p className="mt-4 text-lg text-muted">
              Insurers use AI to deny claims at scale. Hospitals use AI to fight back. The patient is left with confusing paperwork and tight deadlines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point) => (
              <div key={point.title} className="rounded-xl border border-border bg-zinc-50 p-6">
                <div className="text-2xl mb-3">{point.icon}</div>
                <h3 className="font-semibold text-foreground">{point.title}</h3>
                <p className="mt-2 text-sm text-muted">{point.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <FeatureGrid
        title="What it does"
        subtitle="From upload to understanding — everything you need to make sense of your medical bills."
        features={features}
      />

      {/* How It Works */}
      <section className="py-16 sm:py-24 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-muted">
              Three steps from confusion to clarity.
            </p>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-8">
            {[
              { step: "1", title: "Upload your document", desc: "Snap a photo of your medical bill, EOB, or denial letter — or upload a PDF. We accept images and PDFs up to 10 MB." },
              { step: "2", title: "AI analyzes and explains", desc: "Our AI extracts every line item, identifies codes and charges, and flags potential errors. You get a plain-English breakdown — free." },
              { step: "3", title: "Get a letter draft and take action", desc: "With one click, generate an AI-drafted appeal or negotiation letter. Review it, make changes, and send it yourself." },
            ].map((item) => (
              <div key={item.step} className="flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hedical-100 text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1 text-sm text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Try It Section */}
      <section id="try-it" className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Try it now
          </h2>
          <p className="mt-4 text-lg text-muted">
            Upload a bill, EOB, or denial letter to see what&apos;s in it. Free, no credit card required.
          </p>
          <div className="mt-8">
            <Link
              href="/dashboard/analyze"
              className="inline-block rounded-lg bg-primary px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-primary-light transition-colors"
            >
              Analyze your first bill
            </Link>
          </div>
        </div>
      </section>

      <CTASection
        title="Understand your bills. Take control."
        description="Free tier available. No credit card required."
        buttonText="Try It Free"
        buttonHref="/dashboard/analyze"
      />
    </>
  );
}
