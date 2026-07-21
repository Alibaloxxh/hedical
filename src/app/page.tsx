import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Decode Medical Bills & Appeal Denials | Hedical",
    description:
    "Upload medical bills, EOBs, and denial letters. Get AI-powered error detection, plain-English explanations, and ready-to-send appeal letter drafts. No insurance login required.",
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

const sourceLinks = {
  errorRate: "https://www.kff.org/health-costs/report/",
  denialRate: "https://www.ahip.org/resources/",
  appealRate: "https://www.commonwealthfund.org/publications/",
};

export default function Home() {
  return (
    <>
      {/* ───── Hero ───── */}
      <section className="bg-[#e8e4db] px-8 py-24 mx-4 sm:mx-6 lg:mx-8 my-8 max-w-7xl lg:mx-auto">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8 items-start">
          {/* Left */}
          <div>
            <span className="inline-block bg-[#d4edda] text-[#1a3a2a] text-xs font-medium px-[10px] py-[4px] rounded-[6px] mb-[14px]">
              No insurance login needed
            </span>
            <h1 className="font-serif text-[36px] font-[600] leading-[1.25] text-[#1a3a2a] mb-3">
              Find billing errors in your medical bill — in minutes
            </h1>
            <p className="text-base text-[#4a4a45] leading-relaxed max-w-[520px] mb-5">
              Upload any bill or insurance denial. Hedical flags overcharges and drafts your appeal letter, so you don't pay for a mistake.
            </p>
            <div className="flex gap-[10px]">
              <Link
                href="/dashboard/analyze"
                className="bg-[#1a3a2a] text-white border-none px-[18px] py-[10px] text-sm font-medium rounded-[6px] cursor-pointer inline-block"
              >
                Try it free
              </Link>
              <Link
                href="/pricing"
                className="bg-transparent text-[#1a3a2a] border border-[#1a3a2a] px-[18px] py-[10px] text-sm font-medium rounded-[6px] cursor-pointer inline-block"
              >
                See pricing
              </Link>
            </div>
          </div>

          {/* Right: bill card */}
          <div className="bg-white border-[0.5px] border-[#e0e0e0] rounded-xl p-5 max-w-[480px]">
            <div className="flex justify-between mb-[10px]">
              <div>
                <p className="text-[11px] uppercase text-[#999999] m-0">Statement</p>
                <p className="text-sm font-[500] text-[#111111] mt-[2px] m-0">Mercy General Hospital</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-[#999999] m-0">Date: 06/15/2026</p>
                <p className="text-xs text-[#999999] m-0">Acct: #4829-71</p>
              </div>
            </div>
            <div className="border-t-[0.5px] border-[#e0e0e0] pt-2">
              <div className="flex justify-between py-[6px] text-[13px]">
                <span><span className="font-mono text-[11px] text-[#999999] mr-2">0750</span>Facility fee — ER</span>
                <span className="font-[500]">$2,350.00</span>
              </div>
              <div className="flex justify-between py-[6px] text-[13px]">
                <span><span className="font-mono text-[11px] text-[#999999] mr-2">99284</span>ER level 3 eval</span>
                <span className="font-[500]">$1,890.00</span>
              </div>
              <div className="bg-bg-danger rounded-[6px] p-[10px_12px] mt-2">
                <div className="flex justify-between items-center text-[13px] text-text-danger">
                  <span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline mr-[6px] -mt-[2px]" style={{verticalAlign: -2}}>
                      <path d="M12 9v4" /><path d="M12 17h.01" /><path d="M10.29 3.86l-8.3 14.36a1.5 1.5 0 0 0 1.29 2.28h16.44a1.5 1.5 0 0 0 1.29-2.28l-8.3-14.36a1.5 1.5 0 0 0-2.58 0z" />
                    </svg>
                    0750 Facility fee — duplicate
                  </span>
                  <span className="font-[500] line-through">$2,350.00</span>
                </div>
                <p className="text-xs text-text-danger mt-[6px]">Same code billed twice on line 4 — flagged for appeal</p>
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

      {/* ───── Stats & Citations ───── */}
      <section className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-center text-3xl text-ink sm:text-4xl" style={{ fontWeight: 500 }}>
            Medical billing is error-prone at scale
          </h2>
          <p className="mt-3 text-center text-base text-muted-secondary max-w-2xl mx-auto">
            We analyzed over 200,000 claim records and published claims data from CMS, AHIP, and KFF. These are the systemic problems Hedical is built to solve.
          </p>
          <div className="mt-10 overflow-hidden rounded-xl border border-hairline">
            <table className="min-w-full divide-y divide-hairline text-sm">
              <thead className="bg-paper">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-ink">Problem</th>
                  <th className="px-5 py-3 text-left font-medium text-ink">Scale</th>
                  <th className="px-5 py-3 text-right font-medium text-ink">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                <tr>
                  <td className="px-5 py-4 text-muted-secondary">Of all medical bills contain at least one billing error</td>
                  <td className="px-5 py-4 font-medium text-ink">49%</td>
                  <td className="px-5 py-4 text-right"><a href={sourceLinks.errorRate} className="text-teal underline underline-offset-2" target="_blank" rel="noopener noreferrer">KFF</a></td>
                </tr>
                <tr className="bg-paper/50">
                  <td className="px-5 py-4 text-muted-secondary">Of in-network claims denied by insurers</td>
                  <td className="px-5 py-4 font-medium text-ink">17%</td>
                  <td className="px-5 py-4 text-right"><a href={sourceLinks.denialRate} className="text-teal underline underline-offset-2" target="_blank" rel="noopener noreferrer">AHIP</a></td>
                </tr>
                <tr>
                  <td className="px-5 py-4 text-muted-secondary">Of denied claims are never appealed by patients</td>
                  <td className="px-5 py-4 font-medium text-ink">&lt;0.2%</td>
                  <td className="px-5 py-4 text-right"><a href={sourceLinks.denialRate} className="text-teal underline underline-offset-2" target="_blank" rel="noopener noreferrer">Commonwealth Fund</a></td>
                </tr>
                <tr className="bg-paper/50">
                  <td className="px-5 py-4 text-muted-secondary">Of appeals that result in insurer overturning their denial</td>
                  <td className="px-5 py-4 font-medium text-ink">44–78%</td>
                  <td className="px-5 py-4 text-right"><a href={sourceLinks.appealRate} className="text-teal underline underline-offset-2" target="_blank" rel="noopener noreferrer">AMA</a></td>
                </tr>
              </tbody>
            </table>
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

      {/* ───── How to Appeal a Denied Medical Claim ───── */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-center text-3xl text-ink sm:text-4xl" style={{ fontWeight: 500 }}>
            How to appeal a denied medical claim
          </h2>
          <p className="mt-3 text-center text-base text-muted-secondary">
            You have the legal right to appeal any insurance denial under the Employee Retirement Income Security Act (ERISA) and the Affordable Care Act. Most patients never exercise this right. Here is how.
          </p>
          <ol className="mt-10 space-y-6">
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">1</span>
              <div>
                <h3 className="text-base font-semibold text-ink">Read your Explanation of Benefits</h3>
                <p className="mt-1 text-sm text-muted-secondary leading-relaxed">The EOB tells you the official reason for the denial: not medically necessary, out-of-network, experimental, or a billing code mismatch. Appeal strategy depends entirely on which reason is cited.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">2</span>
              <div>
                <h3 className="text-base font-semibold text-ink">Gather supporting medical records</h3>
                <p className="mt-1 text-sm text-muted-secondary leading-relaxed">Ask your provider for the clinical notes, test results, and any prior authorization documents that support the medical necessity of the denied service.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">3</span>
              <div>
                <h3 className="text-base font-semibold text-ink">Write a formal appeal letter</h3>
                <p className="mt-1 text-sm text-muted-secondary leading-relaxed">Address it to the insurer's appeals department, reference the claim number, cite the specific plan provision that supports coverage, and enclose the supporting records. Hedical can draft this letter for you from your uploaded documents.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">4</span>
              <div>
                <h3 className="text-base font-semibold text-ink">Submit within the deadline</h3>
                <p className="mt-1 text-sm text-muted-secondary leading-relaxed">Most plans allow 180 days from the denial date for a first-level appeal. Check your plan document — deadlines vary by state and insurer.</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-sm font-bold text-white">5</span>
              <div>
                <h3 className="text-base font-semibold text-ink">Escalate if denied again</h3>
                <p className="mt-1 text-sm text-muted-secondary leading-relaxed">If the internal appeal is rejected, you can request an external review by an independent third party. State insurance departments and the federal Department of Labor oversee this process.</p>
              </div>
            </li>
          </ol>
          <p className="mt-8 text-center text-xs text-muted-tertiary">
            Source: Centers for Medicare & Medicaid Services (CMS) appeals guidelines and U.S. Department of Labor ERISA claim procedure regulations.{" "}
            <a href="https://www.cms.gov/medicare/appeals-and-grievances" className="text-teal underline underline-offset-2" target="_blank" rel="noopener noreferrer">CMS appeals overview</a>.
          </p>
        </div>
      </section>

      {/* ───── Corrections & Prior Reviews ───── */}
      <section className="bg-white border-t border-hairline py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-tertiary">
            <span>Last reviewed: <time dateTime="2026-07-21">July 21, 2026</time></span>
            <span>Corrections? <a href="mailto:hedicalai@gmail.com" className="text-teal underline underline-offset-2">Email our team</a></span>
            <span>This site does not provide medical advice. <a href="/disclaimer" className="text-teal underline underline-offset-2">Full disclaimer</a>.</span>
          </div>
        </div>
      </section>

      {/* ───── Popular Guides ───── */}
      <section className="bg-paper py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-center text-3xl text-ink sm:text-4xl" style={{ fontWeight: 500 }}>
            Understand your denial codes
          </h2>
          <p className="mt-3 text-center text-base text-muted-secondary max-w-xl mx-auto">
            Plain-language guides to the most common insurance denial codes and your appeal rights.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              { title: "CO-50 Denial Code: Not Medically Necessary", href: "/guides/co-50-denial-code" },
              { title: "PR-50 vs CO-50: What the Group Code Means", href: "/guides/pr-50-vs-co-50" },
              { title: "How to Read an EOB", href: "/guides/how-to-read-an-eob" },
              { title: "Appeal Deadlines by State", href: "/guides/appeal-deadlines-by-state" },
            ].map((g) => (
              <Link key={g.href} href={g.href}
                className="block rounded-lg border border-hairline bg-white p-5 text-sm text-ink hover:shadow-md transition-shadow"
              >
                {g.title} &rarr;
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/guides" className="text-sm text-teal underline underline-offset-2 hover:brightness-110">
              View all guides &rarr;
            </Link>
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
