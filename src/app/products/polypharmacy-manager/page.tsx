import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SoftwareAppSchema } from "@/components/SoftwareAppSchema";
import { CTASection } from "@/components/CTASection";
import { FeatureGrid } from "@/components/FeatureGrid";
import { Disclaimer } from "@/components/Disclaimer";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Polypharmacy Medication Manager",
  description:
    "Upload medication lists for yourself or loved ones. Get plain-language interaction explanations, flag concerns for your doctor, and manage multiple profiles as a caregiver.",
  alternates: {
    canonical: `${siteUrl}/products/polypharmacy-manager`,
  },
  openGraph: {
    title: "Polypharmacy Medication Manager | Hedical",
    description:
      "Upload medication lists for yourself or loved ones. Get plain-language interaction explanations and multi-profile caregiver support.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Polypharmacy Medication Manager | Hedical",
    description:
      "Upload medication lists for yourself or loved ones. Get plain-language interaction explanations and multi-profile caregiver support.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const medicationFeatures = [
  {
    icon: "\u{1F9EC}",
    title: "Multi-Profile Caregiver Dashboard",
    description: "Manage medications for yourself, your parents, your children, and your spouse — all from one account.",
  },
  {
    icon: "\u{1F91D}",
    title: "Plain-Language Interaction Checks",
    description: "No more decoding medical jargon. Our AI explains drug-drug, drug-supplement, and drug-food interactions in simple terms.",
  },
  {
    icon: "\u{2753}",
    title: "Smart Questions for Your Doctor",
    description: "Get a tailored list of questions to ask at your next appointment — flagged interactions, dosage concerns, and monitoring needs.",
  },
  {
    icon: "\u{1F4C4}",
    title: "Printable Medication Summaries",
    description: "One-page summaries for each family member — perfect for appointments, hospital visits, and pharmacy runs.",
  },
  {
    icon: "\u{23F0}",
    title: "Schedule & Refill Tracking",
    description: "Track medication schedules, set reminders, and get notified when refills are due.",
  },
  {
    icon: "\u{1F4B0}",
    title: "Cost-Saving Alternatives",
    description: "AI suggests therapeutic alternatives and manufacturer coupons where available — helping you save on out-of-pocket costs.",
  },
];

const statSources = {
  polypharmacy: "https://www.cdc.gov/nchs/",
  readmissions: "https://www.ahrq.gov/",
  cost: "https://www.iqvia.com/insights/",
  caregivers: "https://www.aarp.org/research/",
};

const stats = [
  { value: "40%", label: "of older adults take 5+ medications daily", source: statSources.polypharmacy },
  { value: "1 in 5", label: "hospital readmissions due to medication non-adherence", source: statSources.readmissions },
  { value: "$528B", label: "annual cost of medication-related morbidity and mortality", source: statSources.cost },
  { value: "67%", label: "of caregivers manage medications for a loved one", source: statSources.caregivers },
];

export default function PolypharmacyManagerPage() {
  return (
    <>
      <SoftwareAppSchema
        name="Polypharmacy Medication Manager"
        description="Upload medication lists for yourself or loved ones. Get plain-language interaction explanations, flag concerns for your doctor, and manage multiple profiles as a caregiver."
        url={`${siteUrl}/products/polypharmacy-manager`}
      />
      <section className="bg-gradient-to-br from-hedical-50 via-white to-hedical-100">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Breadcrumb items={[{ label: "Polypharmacy Manager" }]} />
          </div>
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center rounded-full bg-amber-50 px-4 py-1.5 text-sm font-medium text-amber-700 mb-4">
              Runner-Up
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Polypharmacy Medication &amp; Supplement Manager
            </h1>
            <p className="mt-6 text-lg text-muted leading-relaxed">
              Existing tools are either reminder-focused or written for clinicians. Hedical is built for
              caregivers managing multiple people&apos;s medications — explaining interactions in plain language
              and flagging what to ask the doctor.
            </p>
            <p className="mt-2 text-xs text-muted-tertiary">
              Last updated:{" "}
              <time dateTime="2026-07-21">July 21, 2026</time>
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

      <section className="border-y border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="mt-1 text-xs text-muted leading-tight">{stat.label}</div>
                <span className="mt-0.5 inline-block text-[10px] text-muted-tertiary"><a href={stat.source} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">source</a></span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FeatureGrid
        title="Features built for caregivers"
        subtitle="Because managing medications for a family shouldn't feel like a second job."
        features={medicationFeatures}
      />

      <section className="py-16 sm:py-24 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              How caregivers use Hedical
            </h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-8">
            {[
              { title: "Add medications", desc: "Type or scan medication names, dosages, and frequencies for each family member. Include supplements and OTCs too." },
              { title: "AI interaction analysis", desc: "Our engine checks every combination across all profiles. It flags interactions, duplicative therapies, and age-specific concerns." },
              { title: "Review in plain language", desc: "See a clear explanation of each interaction — what it means, how serious it is, and what to ask the doctor." },
              { title: "Generate doctor discussion guide", desc: "Print or email a tailored list of concerns and questions for your next appointment. Bring clarity, not confusion." },
            ].map((step, i) => (
              <div key={step.title} className="flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-hedical-100 text-sm font-bold text-primary">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-1 text-sm text-muted">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The gap we fill
            </h2>
          </div>
          <div className="mt-12 mx-auto max-w-3xl space-y-4">
            {[
              "Medisafe and similar apps focus on pill reminders — they don't explain interactions or support caregiver multi-profile management.",
              "Drugs.com and WebMD interaction checkers are written for clinicians, not caregivers or patients.",
              "Pharmacists are understaffed and can't provide detailed counseling on every patient's full regimen.",
              "Caregivers managing multiple family members need a unified view, not separate apps for each person.",
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
        title="Take control of your family's medications"
        description="Join the waitlist and get early access pricing."
        buttonText="Get Early Access"
        buttonHref="/waitlist"
      />
    </>
  );
}
