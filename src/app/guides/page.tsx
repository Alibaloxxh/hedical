import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Guides",
  description:
    "Understand medical billing codes, insurance denials, and your appeal rights with Hedical's library of plain-language guides.",
  alternates: {
    canonical: `${siteUrl}/guides`,
  },
  openGraph: {
    title: "Guides | Hedical",
    description:
      "Plain-language guides for medical billing codes, insurance denials, and appeal rights.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    title: "Guides | Hedical",
    description:
      "Plain-language guides for medical billing codes, insurance denials, and appeal rights.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

const guides = [
  {
    slug: "co-50-denial-code",
    title: "CO-50 Denial Code: What It Means for Patients with Private Insurance",
    description:
      "Learn what a CO-50 denial code means on your EOB, who is financially responsible, and how to appeal if you have private insurance.",
    date: "2026-07-19",
    readingTime: "8 min read",
  },
  {
    slug: "co-4-denial-code",
    title: "CO-4 Denial Code: Missing or Incorrect Procedure Modifier",
    description:
      "A CO-4 denial means the claim was adjusted due to a missing or incorrect procedure modifier. This is one of the most fixable denial codes.",
    date: "2026-07-20",
    readingTime: "5 min read",
  },
  {
    slug: "co-16-denial-code",
    title: "CO-16 Denial Code: Missing or Incomplete Information on Your Claim",
    description:
      "A CO-16 denial means your insurer adjusted the claim due to missing or incomplete information. This is a fixable administrative error.",
    date: "2026-07-20",
    readingTime: "5 min read",
  },
  {
    slug: "co-96-denial-code",
    title: "CO-96 Denial Code: Service Not Covered by Your Insurance Plan",
    description:
      "A CO-96 denial means the service is not a covered benefit under your insurance plan. Unlike CO-50, the plan excludes the service entirely.",
    date: "2026-07-20",
    readingTime: "6 min read",
  },
  {
    slug: "pr-50-vs-co-50",
    title: "PR-50 vs CO-50: What the Group Code on Your EOB Means for Your Wallet",
    description:
      "PR-50 and CO-50 both mean 'not medically necessary,' but they have opposite financial outcomes. Learn which one means you owe money.",
    date: "2026-07-20",
    readingTime: "7 min read",
  },
  {
    slug: "how-to-read-an-eob",
    title: "How to Read Your Explanation of Benefits (EOB): A Plain-Language Guide",
    description:
      "Your EOB tells you what your insurance paid and what you may owe. Learn how to read every section, decode CARC and RARC codes, and spot errors.",
    date: "2026-07-20",
    readingTime: "10 min read",
  },
  {
    slug: "no-surprises-act-explained",
    title: "The No Surprises Act Explained: What It Covers and Who It Protects",
    description:
      "The No Surprises Act protects you from unexpected out-of-network medical bills. Learn what's covered, what's not, and how to assert your rights.",
    date: "2026-07-20",
    readingTime: "8 min read",
  },
  {
    slug: "appeal-deadlines-by-state",
    title: "Insurance Appeal Deadlines by State: How Long You Have to File",
    description:
      "Appeal deadlines vary by state and plan type. Learn federal minimums, state-specific timelines, and how to find your exact appeal window.",
    date: "2026-07-20",
    readingTime: "7 min read",
  },
  {
    slug: "medical-billing-glossary",
    title: "Medical Billing Glossary: Insurance and Billing Terms Explained",
    description:
      "A plain-language glossary of medical billing and insurance terms — EOB, prior authorization, balance billing, deductible, coinsurance, CPT codes, and more.",
    date: "2026-07-20",
    readingTime: "12 min read",
  },
];

export default function GuidesIndex() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Guides
      </h1>
      <p className="mb-10 text-lg text-muted">
        Plain-language explanations of medical billing codes, denial reasons, and your appeal rights.
      </p>
      <div className="space-y-6">
        {guides.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guides/${guide.slug}`}
            className="block rounded-lg border border-border bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-3 text-sm text-muted mb-2">
              <time dateTime={guide.date}>{guide.date}</time>
              <span aria-hidden="true">&middot;</span>
              <span>{guide.readingTime}</span>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {guide.title}
            </h2>
            <p className="text-sm text-muted">{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
