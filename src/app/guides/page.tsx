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
    date: "July 19, 2026",
    readingTime: "8 min read",
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
