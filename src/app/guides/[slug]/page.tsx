import Link from "next/link";
import { notFound } from "next/navigation";
import { StateVariationCallout } from "@/components/StateVariationCallout";
import { SourceDisagreementCallout } from "@/components/SourceDisagreementCallout";
import { FaqPageSchema } from "@/components/FaqPageSchema";
import { Disclaimer } from "@/components/Disclaimer";

const guideSlugs = ["co-50-denial-code"];

const faqData: Record<string, { question: string; answer: string }[]> = {
  "co-50-denial-code": [
    {
      question: "What does CO-50 mean on my insurance EOB?",
      answer:
        "CO-50 is a Claim Adjustment Reason Code that means your insurance company denied the service as not medically necessary. The 'CO' (Contractual Obligation) group code means the provider must write off the amount and generally cannot bill you for it if they are in-network.",
    },
    {
      question: "Can I be billed for a CO-50 denial?",
      answer:
        "If you saw an in-network provider, generally no. The CO group code means the provider's contract with your insurer prohibits balance billing for that amount. If you receive a bill, contact the provider's billing office — it's likely an error. Out-of-network providers may have different rules.",
    },
    {
      question: "What is the difference between CO-50 and PR-50?",
      answer:
        "Both mean 'not medically necessary,' but the group code determines who pays. CO-50 (Contractual Obligation) means the provider writes it off. PR-50 (Patient Responsibility) means you may owe the amount. Check the two-letter prefix on your EOB — it is the most financially significant detail.",
    },
    {
      question: "How do I appeal a CO-50 denial with private insurance?",
      answer:
        "File an internal appeal within your plan's deadline (typically 180 days for group health plans). Include a cover letter referencing the claim and CO-50 code, a Letter of Medical Necessity from your provider, supporting medical records, and any relevant clinical literature. Read the RARC code on your EOB first to understand the specific denial reason.",
    },
    {
      question: "Does the No Surprises Act protect me from CO-50 balance billing?",
      answer:
        "Not directly. The No Surprises Act protects against surprise out-of-network bills for emergency services, certain non-emergency care at in-network facilities, and air ambulance services. CO-50 is a medical necessity determination, which is a separate issue. However, the NSA's external review provisions may apply to your appeal process.",
    },
  ],
};

export default async function GuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!guideSlugs.includes(slug)) {
    notFound();
  }

  const { default: Post, guideMeta } = await import(`@/guides/${slug}.mdx`);
  const faqs = faqData[slug] || [];

  return (
    <>
      <FaqPageSchema faqs={faqs} />

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-2">
          <Link
            href="/guides"
            className="text-sm text-muted hover:text-foreground"
          >
            &larr; Back to Guides
          </Link>
        </div>

        <header className="mb-8">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {guideMeta.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-muted">
            <time dateTime={guideMeta.published}>{guideMeta.published}</time>
            <span aria-hidden="true">&middot;</span>
            <span>{guideMeta.readingTime}</span>
          </div>
        </header>

        <div className="prose-custom">
          <Post />
        </div>

        <hr className="my-10 border-gray-200" />

        <Disclaimer variant="banner" />
      </article>
    </>
  );
}

export function generateStaticParams() {
  return guideSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { guideMeta } = await import(`@/guides/${slug}.mdx`);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

  return {
    title: guideMeta.title,
    description: guideMeta.description,
    alternates: {
      canonical: `${siteUrl}/guides/${slug}`,
    },
    openGraph: {
      title: `${guideMeta.title} | Hedical`,
      description: guideMeta.description,
      images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
    },
    twitter: {
      title: `${guideMeta.title} | Hedical`,
      description: guideMeta.description,
      images: [`${siteUrl}/images/og-default.png`],
    },
  };
}
