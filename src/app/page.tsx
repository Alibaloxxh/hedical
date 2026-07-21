import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "AI-Powered Healthcare Navigation — Decode Medical Bills & Appeal Denials",
  description:
    "Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and appeal letter drafts. Start free, no insurance login needed.",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "AI-Powered Healthcare Navigation | Hedical",
    description:
      "AI tools for medical bills, insurance denials, documentation, and medication management.",
    url: siteUrl,
    siteName: "Hedical",
    locale: "en_US",
    type: "website",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Healthcare Navigation | Hedical",
    description:
      "AI tools for medical bills, insurance denials, documentation, and medication management.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const trustClaims = [
  "Non-diagnostic, no clinical claims",
  "No insurance login needed",
  "44–78% appeal success rate",
  "HIPAA-aware architecture",
  "No data shared with insurers",
];

const sourceLinks = {
  errorRate: "https://www.kff.org/health-costs/report/",
  denialRate: "https://www.ahip.org/resources/",
  appealRate: "https://www.commonwealthfund.org/publications/",
};

export default function Home() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="bg-paper">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-5 lg:gap-16 items-center">
            {/* Left: headline + CTA */}
            <div className="lg:col-span-2">
              <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl lg:text-5xl xl:text-6xl" style={{ fontWeight: 500 }}>
                Your medical bill,<br />
                decoded and disputed
              </h1>
              <p className="mt-4 text-base text-muted-secondary sm:text-lg leading-relaxed">
                Upload any bill, EOB, or denial letter. Hedical extracts every line item, flags errors, and drafts your appeal letter — no insurance login required.
              </p>
              <p className="mt-2 text-xs text-muted-tertiary">
                Last updated:{" "}
                <time dateTime="2026-07-21">July 21, 2026</time>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/dashboard/analyze"
                  className="rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:brightness-110"
                >
                  Try it free
                </Link>
                <Link
                  href="/pricing"
                  className="rounded-lg border border-hairline bg-white px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-paper"
                >
                  See pricing
                </Link>
              </div>
              {/* Trust tags below CTA */}
              <div className="mt-8 flex flex-wrap gap-2">
                {trustClaims.map((claim) => (
                  <span
                    key={claim}
                    className="inline-flex items-center rounded-full bg-tag-bg px-3 py-1 text-xs font-medium text-ink"
                  >
                    {claim}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: annotated sample bill */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-hairline bg-white p-5 sm:p-7">
                {/* Bill header */}
                <div className="flex items-center justify-between border-b border-hairline pb-3">
                  <div>
                    <p className="text-xs text-muted-tertiary uppercase tracking-wider">Statement</p>
                    <p className="text-sm font-semibold text-ink">Mercy General Hospital</p>
                  </div>
                  <div className="text-right text-xs text-muted-tertiary">
                    <p>Date: 06/15/2026</p>
                    <p>Acct: #4829-71</p>
                  </div>
                </div>

                {/* Line items */}
                <div className="mt-4 space-y-3">
                  {[
                    { code: "0750", desc: "Facility fee — Emergency department", amount: "$2,350.00" },
                    { code: "99284", desc: "ER level 3 evaluation and management", amount: "$1,890.00" },
                    { code: "99244", desc: "Physician consult — inpatient", amount: "$720.00" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-muted-tertiary">{item.code}</span>
                        <span className="text-ink">{item.desc}</span>
                      </div>
                      <span className="text-ink font-medium">{item.amount}</span>
                    </div>
                  ))}

                  {/* Flagged / struck-through line */}
                  <div className="rounded-lg border border-coral/20 bg-coral/5 p-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral/15 text-xs text-coral">&#x26A0;</span>
                        <span className="font-mono text-xs text-muted-tertiary">0750</span>
                        <span className="line-through text-coral">Facility fee — Emergency department</span>
                      </div>
                      <span className="line-through text-coral font-medium">$2,350.00</span>
                    </div>
                    <p className="mt-1.5 pl-7 text-xs text-coral">
                      Duplicate charge — same code billed twice on line 4
                    </p>
                  </div>
                </div>

                {/* Totals row */}
                <div className="mt-4 border-t border-hairline pt-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">Disputable amount found</span>
                  <span className="text-xl font-bold text-teal">$2,350.00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-center text-2xl text-ink sm:text-3xl mb-16" style={{ fontWeight: 500 }}>
            How it works
          </h2>
          <div className="relative flex flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="absolute left-[3.25rem] right-[3.25rem] top-6 hidden h-px bg-hairline sm:block" />
            {[
              { icon: "upload", label: "Upload", desc: "Any bill or EOB" },
              { icon: "search", label: "Analyze", desc: "Errors get flagged" },
              { icon: "check", label: "Act", desc: "Letter, ready to send." },
            ].map((s, i) => {
              const isFinal = i === 2;
              return (
                <div key={s.label} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${
                      isFinal ? "bg-teal" : "bg-ink"
                    }`}
                  >
                    {s.icon === "upload" ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14" /><path d="M8 9l4-4 4 4" /><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                      </svg>
                    ) : s.icon === "search" ? (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" /><path d="M9 15l2 2 4-4" />
                      </svg>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-semibold text-ink">{s.label}</p>
                  <p className="mt-0.5 max-w-32 text-center text-xs text-muted-tertiary leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ───── Three tools, one job ───── */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl text-ink sm:text-4xl" style={{ fontWeight: 500 }}>
              Three tools, one job
            </h2>
            <p className="mt-3 text-base text-muted-secondary">
              Each one reads a different document and tells you what&apos;s wrong with it.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                eyebrow: "Reads bills, denials",
                title: "Bill and Denial Navigator",
                desc: "Finds billing errors, flags bad codes, and drafts your appeal letter.",
                recommended: true,
                href: "/products/bill-denial-navigator",
              },
              {
                eyebrow: "Reads visit notes",
                title: "Documentation Tool",
                desc: "Turns messy clinical notes into clean, structured summaries.",
                recommended: false,
                href: "/products/documentation-tool",
              },
              {
                eyebrow: "Reads medication lists",
                title: "Polypharmacy Manager",
                desc: "Catches risky drug combos across medications and supplements.",
                recommended: false,
                href: "/products/polypharmacy-manager",
              },
            ].map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className={`group relative block rounded-xl bg-white p-6 transition-shadow hover:shadow-md ${
                  card.recommended ? "border-2 border-teal" : "border border-hairline"
                }`}
              >
                {card.recommended && (
                  <span className="absolute -top-2.5 left-4 inline-flex items-center rounded-full bg-teal px-2.5 py-0.5 text-xs font-medium text-white">
                    Recommended
                  </span>
                )}
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-tertiary mb-2">
                  {card.eyebrow}
                </p>
                <h3 className="font-serif text-base text-ink" style={{ fontWeight: 500 }}>
                  {card.title}
                </h3>
                <p className="mt-2 text-sm text-muted-secondary leading-relaxed">
                  {card.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-ink p-10 sm:p-14 text-center">
            <h2 className="font-serif text-2xl text-white sm:text-3xl" style={{ fontWeight: 500 }}>
              Be among the first to try it
            </h2>
            <p className="mt-3 text-sm text-muted-tertiary leading-relaxed max-w-md mx-auto">
              We&apos;re onboarding early users in small batches so every letter gets reviewed properly before it ships.
            </p>
            <div className="mt-8">
              <Link
                href="/waitlist"
                className="inline-flex items-center rounded-lg bg-teal px-6 py-3 text-base font-medium text-white transition-colors hover:brightness-110"
              >
                Join the waitlist
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
