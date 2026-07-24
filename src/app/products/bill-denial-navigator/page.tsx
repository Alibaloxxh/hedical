import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconCurrencyDollar, IconBan, IconBubbleText, IconHourglass, IconPhoto, IconSearch, IconShieldCheck, IconStars, IconCalendar, IconArmchair } from "@tabler/icons-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SoftwareAppSchema } from "@/components/SoftwareAppSchema";
import { FaqPageSchema } from "@/components/FaqPageSchema";
import { CTASection } from "@/components/CTASection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Disclaimer } from "@/components/Disclaimer";
import { getCurrentUserPlan } from "@/lib/entitlements";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

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
  { icon: <IconCurrencyDollar className="size-6 text-teal" />, title: "Hidden Errors", description: 'Up to 80% of medical bills contain errors — duplicate charges, upcoding, unbundling, and out-of-network surprises. <a href="https://www.kff.org/health-costs/" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-teal transition-colors">[KFF]</a>' },
  { icon: <IconBan className="size-6 text-teal" />, title: "Denied Claims", description: 'Insurers deny 19% of in-network claims. Fewer than 1% of denials are ever appealed, even though 44-78% could be overturned. <a href="https://www.ahip.org/resources/" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-teal transition-colors">[AHIP]</a> <a href="https://www.commonwealthfund.org/publications/" target="_blank" rel="noopener noreferrer" class="underline underline-offset-2 hover:text-teal transition-colors">[Commonwealth Fund]</a>' },
  { icon: <IconBubbleText className="size-6 text-teal" />, title: "Confusing Jargon", description: "EOBs and medical bills are written in opaque language designed for providers and payers, not patients." },
  { icon: <IconHourglass className="size-6 text-teal" />, title: "Tight Deadlines", description: "Appeal windows are short — often 30-180 days. Missing a deadline means losing your right to challenge a denial." },
];

const features = [
  {
    icon: <IconPhoto className="size-6 text-teal" />,
    title: "Upload any document",
    description: "Photograph or upload any medical bill, EOB, or denial letter. Our AI extracts every line item automatically.",
  },
  {
    icon: <IconSearch className="size-6 text-teal" />,
    title: "Understand what you owe",
    description: "Every charge and code is translated into plain English. Know exactly what each line item means and whether it looks right.",
  },
  {
    icon: <IconShieldCheck className="size-6 text-teal" />,
    title: "Flag potential errors",
    description: "Our AI checks for duplicate charges, upcoding, unbundling, out-of-network surprises, and charges exceeding typical rates.",
  },
  {
    icon: <IconStars className="size-6 text-teal" />,
    title: "Get an AI-drafted appeal letter",
    description: "Generate a ready-to-send appeal or negotiation letter draft based on your documents — formatted, grounded in your policy, and yours to review and send.",
  },
  {
    icon: <IconCalendar className="size-6 text-teal" />,
    title: "Know your deadlines",
    description: "We track your appeal windows and guide you through each step of the process.",
  },
  {
    icon: <IconArmchair className="size-6 text-teal" />,
    title: "Understand your rights",
    description: "Know what protections your state offers — from surprise billing laws to independent external review rights.",
  },
];

const billDenialFaqs = [
  {
    question: "What documents does Hedical accept?",
    answer: "Hedical accepts PDFs and photos (JPEG, PNG) of medical bills, Explanation of Benefits (EOB) forms, and insurance denial letters. Each file must be 10 MB or smaller. Our AI extracts line items, codes, and charges automatically from the document.",
  },
  {
    question: "Is this medical or legal advice?",
    answer: "No. Hedical is an informational and administrative tool. It analyzes your documents, flags potential errors, and drafts appeal letters based on the information you provide. Always review the letter before sending, and consult a medical professional or attorney for medical or legal advice.",
  },
  {
    question: "Do I need to link my insurance account?",
    answer: "No. There is no insurance login or account linking required. Upload your documents directly — Hedical reads the information from the files you provide.",
  },
  {
    question: "How long does it take to get an appeal letter?",
    answer: "Free analysis is instant — upload a document and see the breakdown immediately. Paid appeal letters are typically generated within minutes. Priority processing is included with the Per-Use and Unlimited tiers.",
  },
  {
    question: "Can I use Hedical for someone else, like a family member?",
    answer: "Yes. The Unlimited plan supports multi-profile caregiver management for up to 5 people. You can upload and manage documents for yourself, your parents, your spouse, or anyone you care for — all from one account.",
  },
  {
    question: "What if my appeal is denied again?",
    answer: "Hedical can help you prepare a second-level appeal or external review request. Most plans allow at least one internal appeal followed by an external review by an independent third party. State and federal deadlines vary — check our appeal deadlines guide for your specific timeline.",
  },
];

export default async function BillDenialNavigatorPage() {
  const { isLoggedIn, activePlan } = await getCurrentUserPlan();
  const isActive = isLoggedIn && activePlan === "unlimited";
  const ctaText = isActive ? "Go to Dashboard" : "Try It Free";
  const ctaHref = isActive ? "/dashboard" : "/dashboard/analyze";
  const cta2Text = isActive ? "Go to Dashboard" : "Analyze your first bill";

  return (
    <>
      <SoftwareAppSchema
        name="Medical Bill & Denial Navigator"
        description="Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and a ready-to-send appeal letter draft."
        url={`${siteUrl}/products/bill-denial-navigator`}
      />
      <FaqPageSchema faqs={billDenialFaqs} />
      {/* Hero */}
      <section className="bg-gradient-to-br from-paper via-white to-paper-dark">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Breadcrumb items={[
              { label: "Medical Bill & Denial Navigator" },
            ]} />
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-teal mb-4">
              Recommended
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Medical Bill &amp; Insurance Denial Navigator
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Understand bills in plain English. Flag errors. Get a ready-to-send appeal letter draft you review before sending.
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
                href={ctaHref}
                className="rounded-lg bg-teal px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-light transition active:scale-[0.97]"
              >
                {ctaText}
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

      {/* Pain Points */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The problem
            </h2>
            <p className="mt-4 text-lg text-muted">
              Insurers use AI to deny claims at scale. Hospitals use AI to fight back. The patient is left with confusing paperwork and tight deadlines.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {painPoints.map((point) => (
              <div key={point.title} className="rounded-xl border border-hairline bg-paper-light p-6">
                <div className="mb-3">{point.icon}</div>
                <h3 className="font-semibold text-ink">{point.title}</h3>
                <p className="mt-2 text-sm text-muted" dangerouslySetInnerHTML={{ __html: point.description }} />
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
      <section className="py-16 sm:py-24 bg-paper-light">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
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
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/80 text-sm font-bold text-teal">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
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
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Try it now
          </h2>
          <p className="mt-4 text-lg text-muted">
            Upload a bill, EOB, or denial letter to see what&apos;s in it. Free, no credit card required.
          </p>
          <div className="mt-8">
            <Link
              href={ctaHref}
              className="inline-block rounded-lg bg-teal px-8 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-light transition active:scale-[0.97]"
            >
              {cta2Text}
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-paper-light">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-ink">Frequently asked questions</h2>
          <div className="mt-8 space-y-4 text-left">
            {billDenialFaqs.map((faq) => (
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
        title="Understand your bills. Take control."
        description={isActive ? "You have an Unlimited plan — start analyzing." : "Free tier available. No credit card required."}
        buttonText={ctaText}
        buttonHref={ctaHref}
      />
    </>
  );
}
