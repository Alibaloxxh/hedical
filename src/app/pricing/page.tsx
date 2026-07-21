import type { Metadata } from "next";
import Link from "next/link";
import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { CheckoutButton } from "@/components/CheckoutButton";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Hedical offers freemium bill decoding, per-use appeal letters, and unlimited subscriptions for caregivers and power users.",
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
  openGraph: {
    title: "Pricing | Hedical",
    description:
      "Hedical offers freemium bill decoding, per-use appeal letters, and unlimited subscriptions for caregivers and power users.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Hedical",
    description:
      "Hedical offers freemium bill decoding, per-use appeal letters, and unlimited subscriptions for caregivers and power users.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const pricePerUse = process.env.STRIPE_PRICE_PER_USE || "";
const priceUnlimited = process.env.STRIPE_PRICE_UNLIMITED || "";

const tiers = [
  {
    name: "Free",
    price: "$0",
    description: "Upload a bill or EOB to see what's in it.",
    features: [
      "Upload & decode 1 bill/EOB per month",
      "Plain-English explanation of charges",
      "Basic error flagging",
    ],
    cta: "Get Started",
    href: "/products/bill-denial-navigator",
    featured: false,
    priceId: null,
    mode: null as "payment" | "subscription" | null,
  },
  {
    name: "Per-Use",
    price: "$19",
    period: "/letter",
    description: "Pay only when you need an AI-drafted appeal or negotiation letter.",
    features: [
      "One tailored appeal or negotiation letter",
      "Full bill audit with error report",
      "Deadline tracking for one case",
      "State-specific rights guidance",
    ],
    cta: "Buy Now — $19",
    href: null,
    featured: false,
    priceId: pricePerUse,
    mode: "payment" as const,
  },
  {
    name: "Unlimited",
    price: "$9",
    period: "/month",
    description: "For patients, caregivers, and frequent users. Everything included.",
    features: [
      "Unlimited bill/EOB uploads",
      "Unlimited appeal & negotiation letters",
      "Multi-profile caregiver support (up to 5)",
      "Deadline & savings dashboard",
      "Financial-aid letter generation",
      "Policy upload & coverage analysis",
    ],
    cta: "Subscribe — $9/mo",
    href: null,
    featured: true,
    priceId: priceUnlimited,
    mode: "subscription" as const,
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-hedical-50 via-white to-hedical-100 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Simple, transparent pricing
            </h1>
            <p className="mt-4 text-lg text-muted">
              Start free. Pay only when you save. No hidden fees, no insurance login required.
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col rounded-2xl border p-6 shadow-sm ${
                  tier.featured
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-white"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-lg font-semibold ${tier.featured ? "text-white" : "text-foreground"}`}>
                  {tier.name}
                </h3>
                <div className="mt-4">
                  <span className={`text-4xl font-bold ${tier.featured ? "text-white" : "text-foreground"}`}>
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className={`text-sm ${tier.featured ? "text-hedical-100" : "text-muted"}`}>
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${tier.featured ? "text-hedical-100" : "text-muted"}`}>
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <svg className={`mt-0.5 h-4 w-4 shrink-0 ${tier.featured ? "text-accent-light" : "text-hedical-500"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={tier.featured ? "text-white" : "text-muted"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                {tier.href ? (
                  <Link
                    href={tier.href}
                    className={`mt-8 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-medium ${
                      tier.featured
                        ? "bg-white text-primary hover:bg-hedical-50"
                        : "bg-primary text-white hover:bg-primary-light"
                    } transition-colors`}
                  >
                    {tier.cta}
                  </Link>
                ) : (
                  <CheckoutButton
                    priceId={tier.priceId!}
                    mode={tier.mode!}
                    label={tier.cta}
                    featured={tier.featured}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 max-w-lg mx-auto">
            <Disclaimer variant="banner" />
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            All prices in USD. No long-term contracts. Cancel anytime. Not medical or legal advice.
          </p>
        </div>
      </section>

      <section className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Coming soon: Add-ons
            </h2>
            <p className="mt-4 text-lg text-muted">
              Optional services to enhance your experience.
            </p>
          </div>
          <div className="mt-8 mx-auto max-w-lg space-y-4">
            {[
              { name: "Certified Mail Dispatch", price: "$5/letter", desc: "We print, mail, and track your appeal letter via certified mail." },
              { name: "Fax Delivery", price: "$3/letter", desc: "We fax your letter directly to the insurer or provider." },
            ].map((addon) => (
              <div key={addon.name} className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <h3 className="font-medium text-foreground">{addon.name}</h3>
                  <p className="text-sm text-muted">{addon.desc}</p>
                </div>
                <span className="text-sm font-semibold text-primary">{addon.price}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-zinc-50">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
          <div className="mt-8 space-y-4 text-left">
            {[
              { q: "Can I cancel anytime?", a: "Yes. No long-term contracts. Cancel your subscription with one click." },
              { q: "Is my data secure?", a: "We use enterprise-grade encryption. We never sell or share your health information." },
              { q: "Do I need to link my insurance?", a: "No. Upload documents directly. No account linking required." },
              { q: "What do I get for free?", a: "Upload a bill or EOB and get a plain-English breakdown with error flags. The free tier is designed to help you understand what you're looking at." },
              { q: "What do I get when I pay?", a: "A professionally formatted appeal or negotiation letter, AI-drafted from your documents and flagged issues. You review and send." },
              { q: "Is this medical or legal advice?", a: "No. Hedical is an informational and administrative tool. AI-drafted letters are based on your documents — always review before sending." },
            ].map((faq) => (
              <details key={faq.q} className="group rounded-lg border border-border bg-white">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-foreground">
                  {faq.q}
                  <svg className="h-5 w-5 text-muted transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-4 pb-4 text-sm text-muted">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Start saving on your medical bills today"
        description="Free tier available. No credit card required."
        buttonText="Try It Free"
        buttonHref="/products/bill-denial-navigator"
        variant="secondary"
      />
    </>
  );
}
