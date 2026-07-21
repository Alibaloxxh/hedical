import Link from "next/link";
import { notFound } from "next/navigation";
import { StateVariationCallout } from "@/components/StateVariationCallout";
import { SourceDisagreementCallout } from "@/components/SourceDisagreementCallout";
import { FaqPageSchema } from "@/components/FaqPageSchema";
import { Disclaimer } from "@/components/Disclaimer";

const guideSlugs = [
  "co-50-denial-code",
  "pr-50-vs-co-50",
  "co-4-denial-code",
  "co-16-denial-code",
  "co-96-denial-code",
  "how-to-read-an-eob",
  "no-surprises-act-explained",
  "appeal-deadlines-by-state",
  "medical-billing-glossary",
];

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
  "pr-50-vs-co-50": [
    {
      question: "What is the difference between PR-50 and CO-50?",
      answer:
        "Both mean 'not medically necessary,' but the group code determines who pays. CO-50 (Contractual Obligation) means the provider writes it off under their participation agreement. PR-50 (Patient Responsibility) means you may owe the amount. The two-letter prefix is the most financially significant detail on your EOB.",
    },
    {
      question: "Can I be billed for a PR-50 denial?",
      answer:
        "Yes — PR-50 means you may be responsible for the denied amount. Contact the provider's billing office to confirm the code is correct and whether any waiver form was signed. If you believe the denial is incorrect, file an internal appeal with your insurer.",
    },
    {
      question: "Why does my EOB show PR-50 instead of CO-50?",
      answer:
        "The same denial reason can appear as PR-50 or CO-50 depending on provider network status, signed waiver forms (like a Medicare ABN), state law, and plan type. In-network denials are almost always CO; out-of-network may be PR.",
    },
    {
      question: "Does PR-50 mean I definitely owe the money?",
      answer:
        "Not necessarily. The code means the insurer says you may be responsible, but billing errors are common. Always confirm with your provider's billing office and review your plan documents before paying.",
    },
    {
      question: "Can I appeal a PR-50 denial?",
      answer:
        "Yes — PR-50 is appealable the same way CO-50 is. You have the right to an internal appeal regardless of the group code. Follow the same steps: get a Letter of Medical Necessity, gather supporting records, and file within your plan's deadline.",
    },
  ],
  "co-4-denial-code": [
    {
      question: "What does CO-4 mean on my EOB?",
      answer:
        "CO-4 means your claim was adjusted because a procedure modifier was missing, incorrect, or not supported by medical records. For in-network care, the CO group code means the provider writes off the adjusted amount.",
    },
    {
      question: "Can a CO-4 denial be fixed?",
      answer:
        "Yes — CO-4 is one of the most easily corrected denial codes. The provider can usually correct the modifier and resubmit the claim. Contact the provider's billing office to start the correction process.",
    },
    {
      question: "Will I receive a bill for a CO-4 denial?",
      answer:
        "Generally no, if you saw an in-network provider. The CO group code means the adjustment is a contractual write-off. If you receive a bill for a CO-4 denied amount, it's likely a billing error — call the provider's billing office.",
    },
    {
      question: "What is a procedure modifier?",
      answer:
        "A modifier is a two-character code (e.g., RT for right side, 50 for bilateral) added to a CPT code that provides additional detail about the service performed. Incorrect modifiers are a common source of billing errors.",
    },
  ],
  "co-16-denial-code": [
    {
      question: "What does CO-16 mean on my EOB?",
      answer:
        "CO-16 means the claim was adjusted due to missing or incomplete information. For in-network care, the CO group code means the provider writes off the amount. This is an administrative denial, not a clinical one.",
    },
    {
      question: "Can a CO-16 denial be fixed?",
      answer:
        "Yes — CO-16 denials are usually fixable. The provider can provide the missing documentation and resubmit the claim. Common missing items include medical records, referring provider information, and diagnosis codes.",
    },
    {
      question: "What information does the insurer need to fix a CO-16 denial?",
      answer:
        "Read the RARC code on your EOB — it specifies what's missing. Common requirements include medical records, prior authorization numbers, referring provider NPI, or corrected patient demographics.",
    },
    {
      question: "Will I be billed for a CO-16 denial?",
      answer:
        "Generally no for in-network care — the CO group code means a contractual write-off. However, if the missing information is not provided and the claim is ultimately denied, you may become responsible. Follow up promptly.",
    },
  ],
  "co-96-denial-code": [
    {
      question: "What does CO-96 mean on my EOB?",
      answer:
        "CO-96 means the service is not a covered benefit under your insurance plan. Unlike CO-50 (not medically necessary), CO-96 means your plan excludes the service entirely — regardless of medical need.",
    },
    {
      question: "Can I appeal a CO-96 denial?",
      answer:
        "Yes, but the strategy is different. A CO-96 appeal should argue that the service IS covered under your plan — not that it's medically necessary. Check your plan documents first to see if the service is truly excluded or was coded incorrectly.",
    },
    {
      question: "What is the difference between CO-96 and CO-50?",
      answer:
        "CO-96 means 'service not covered by your plan' (benefit exclusion). CO-50 means 'not medically necessary' (clinical decision). CO-96 cannot be overturned with medical necessity evidence; you must show the service is covered under your plan benefits.",
    },
    {
      question: "Can I be billed for a CO-96 denial?",
      answer:
        "For in-network care, generally no — the CO group code means a contractual write-off. For out-of-network care, you may be balance-billed. Check your state's out-of-network protections if you saw an out-of-network provider.",
    },
  ],
  "how-to-read-an-eob": [
    {
      question: "What is an EOB and is it a bill?",
      answer:
        "An Explanation of Benefits (EOB) is a document from your insurance company showing how a claim was processed. It is NOT a bill — you do not pay your insurance company directly. The provider will send a separate bill later.",
    },
    {
      question: "What does 'amount billed' vs 'allowed amount' mean on an EOB?",
      answer:
        "The 'amount billed' is the provider's list price. The 'allowed amount' is the negotiated rate your insurer and provider have agreed on. You are only responsible for your share of the allowed amount, not the billed amount.",
    },
    {
      question: "How do I find denial codes on my EOB?",
      answer:
        "Look for CARC (Claim Adjustment Reason Codes) and RARC (Remittance Advice Remark Codes) next to each line item. CARCs explain why the paid amount differs from the billed amount. Common codes include CO-50, CO-4, CO-16, and CO-96.",
    },
    {
      question: "What should I do if I find an error on my EOB?",
      answer:
        "Contact the provider's billing office first — they have the most context. If they can't resolve it, call your insurer. Document everything and file a formal appeal if the claim was denied or underpaid.",
    },
    {
      question: "How is 'patient responsibility' calculated on an EOB?",
      answer:
        "Patient responsibility is the total of your deductible, copay, and coinsurance for the service, based on your plan's cost-sharing structure. Compare this amount to what the provider bills you — they should match.",
    },
  ],
  "no-surprises-act-explained": [
    {
      question: "What is the No Surprises Act?",
      answer:
        "The No Surprises Act is a federal law effective January 1, 2022, that protects patients from most unexpected out-of-network medical bills for emergency services, certain non-emergency care at in-network facilities, and air ambulance services.",
    },
    {
      question: "Does the No Surprises Act protect me from ground ambulance bills?",
      answer:
        "No — ground ambulance services are excluded from the No Surprises Act. Ground ambulance billing is regulated at the state level and protections vary widely by state.",
    },
    {
      question: "What do I do if I receive a surprise bill?",
      answer:
        "Contact your insurer and ask them to reprocess the claim under NSA protections. If the provider continues to pursue the balance bill, file a complaint with CMS at cms.gov/nosurprises or with your state insurance department.",
    },
    {
      question: "Can I still get a surprise bill after the No Surprises Act?",
      answer:
        "Yes, in situations not covered by the NSA: ground ambulance, out-of-network providers you chose knowingly, non-emergency care at out-of-network facilities, and services not covered by your plan. State laws may provide additional protection.",
    },
    {
      question: "What is a consent waiver under the No Surprises Act?",
      answer:
        "A consent waiver is a form an out-of-network provider can ask you to sign before non-emergency treatment at an in-network facility. If you sign it, you agree to be billed at out-of-network rates. You are never required to sign it for emergency services.",
    },
  ],
  "appeal-deadlines-by-state": [
    {
      question: "How long do I have to appeal a denied insurance claim?",
      answer:
        "You generally have at least 180 days from your denial notice for group health plans under federal law (29 CFR §2560.503-1). However, state-regulated plans may have different deadlines, ranging from 60 to 180 days. Check your denial letter for your specific deadline.",
    },
    {
      question: "What happens if I miss my appeal deadline?",
      answer:
        "Missing your deadline typically means losing your right to challenge the denial through your plan's formal process. You may request a late appeal with a reasonable explanation, but insurers are not required to accept it.",
    },
    {
      question: "Do appeal deadlines vary by state?",
      answer:
        "Yes — some states provide only 60 days while others provide up to 180 days. The deadline depends on how your plan is regulated (ERISA vs. state-regulated) and your state's specific laws.",
    },
    {
      question: "How do I find my exact appeal deadline?",
      answer:
        "Your denial letter must state your plan's specific deadline. If it doesn't, assume the federal minimum of 180 days for internal appeals and 4 months for external review. Contact your state insurance department for confirmation.",
    },
    {
      question: "What is the difference between internal and external review?",
      answer:
        "An internal appeal is reviewed by your insurance company. An external review is conducted by an independent third party. You must exhaust the internal appeal process before requesting an external review.",
    },
  ],
  "medical-billing-glossary": [
    {
      question: "What is the difference between a deductible and coinsurance?",
      answer:
        "A deductible is the amount you pay for covered services before your insurance starts paying. Coinsurance is your percentage share of costs after meeting your deductible (e.g., 20% of the allowed amount). Both count toward your out-of-pocket maximum.",
    },
    {
      question: "What does EOB stand for and why is it important?",
      answer:
        "EOB stands for Explanation of Benefits — a document from your insurer showing how a claim was processed. It's important because it tells you what your plan paid, what was denied, and what you may owe. Always review it before paying any medical bill.",
    },
    {
      question: "What is the difference between in-network and out-of-network?",
      answer:
        "In-network providers have a contract with your insurer at negotiated rates, resulting in lower out-of-pocket costs and protection from balance billing. Out-of-network providers do not have such a contract, generally costing more and potentially resulting in surprise bills.",
    },
    {
      question: "What does 'balance billing' mean?",
      answer:
        "Balance billing is when a provider bills you for the difference between their full charge and what your insurance paid. It is generally prohibited for in-network providers and in certain situations protected by the No Surprises Act.",
    },
    {
      question: "What is prior authorization?",
      answer:
        "Prior authorization is a requirement that your provider obtain approval from your insurance company before performing certain services. Failure to obtain it can result in a denial. Some plans waive this requirement for emergency services.",
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
