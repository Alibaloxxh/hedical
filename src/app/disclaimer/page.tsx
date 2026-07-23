import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hedical.online";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "Hedical — important legal, medical, and privacy disclaimers for AI-powered healthcare navigation tools.",
  alternates: {
    canonical: `${siteUrl}/disclaimer`,
  },
  openGraph: {
    title: "Disclaimer | Hedical",
    description: "Important disclaimers regarding use of Hedical's AI-powered healthcare navigation tools.",
    images: [{ url: `${siteUrl}/images/og-default.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disclaimer | Hedical",
    description: "Important disclaimers regarding use of Hedical's AI-powered healthcare navigation tools.",
    images: [`${siteUrl}/images/og-default.png`],
  },
};

export default function DisclaimerPage() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Disclaimer</h1>
        <p className="mt-2 text-sm text-muted">Last updated: July 2026</p>

        <div className="mt-8 prose prose-sm text-muted space-y-6">
          <h2 className="text-xl font-semibold text-foreground">1. Not Medical Advice</h2>
          <p>
            Hedical provides AI-generated analysis, explanations, and document drafts for informational
            purposes only. It does not constitute medical advice, diagnosis, or treatment. Always consult
            a qualified healthcare provider regarding any medical condition or treatment decisions.
          </p>

          <h2 className="text-xl font-semibold text-foreground">2. Not Legal Advice</h2>
          <p>
            Hedical does not provide legal advice. AI-generated appeal letters, explanations of policy
            terms, and regulatory references are informational tools, not legal opinions. If you need
            legal advice, consult a licensed attorney, especially for matters involving ERISA,
            Medicare appeals, or potential litigation.
          </p>

          <h2 className="text-xl font-semibold text-foreground">3. No Guarantee of Appeal Outcomes</h2>
          <p>
            Insurance appeal outcomes depend on your specific policy terms, state regulations, medical
            necessity documentation, and the insurer's internal review process. Hedical does not
            guarantee that an appeal will be approved or that any particular outcome will result from
            using our tools.
          </p>

          <h2 className="text-xl font-semibold text-foreground">4. AI-Generated Content</h2>
          <p>
            Hedical uses large language models to analyze documents and generate draft text. AI outputs
            may contain errors, omissions, or inaccuracies — including hallucinated codes, citations,
            or policy references. Review all AI-generated content carefully before submitting or
            relying on it. You are solely responsible for verifying accuracy and appropriateness.
          </p>

          <h2 className="text-xl font-semibold text-foreground">5. No Financial Advice</h2>
          <p>
            Cost estimates, savings suggestions, and pricing comparisons are approximate and based on
            available data. Hedical does not provide financial or insurance advice. Verify all
            financial figures with your provider, insurer, or a qualified financial advisor.
          </p>

          <h2 className="text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
          <p>
            Hedical (including its founders, contributors, and affiliates) is not liable for any
            direct, indirect, incidental, or consequential damages arising from the use of or
            inability to use our tools or content. You use Hedical at your own risk.
          </p>

          <h2 className="text-xl font-semibold text-foreground">7. No Doctor-Patient Relationship</h2>
          <p>
            Use of Hedical does not create a doctor-patient, attorney-client, or any other
            professional relationship. The platform is a self-service informational tool, not a
            licensed medical or legal service.
          </p>

          <h2 className="text-xl font-semibold text-foreground">8. Third-Party References</h2>
          <p>
            Hedical may reference third-party sources, studies, or statistics (including CMS, KFF,
            AHIP, and the Commonwealth Fund). These references are provided for context and do not
            imply endorsement by those organizations.
          </p>

          <h2 className="text-xl font-semibold text-foreground">9. Changes</h2>
          <p>
            This disclaimer may be updated at any time. Continued use of Hedical after changes
            constitutes acceptance of the updated disclaimer. Check this page periodically.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Contact</h2>
          <p>
            Questions about this disclaimer?{" "}
            <a href="/contact" className="text-primary underline">Contact us</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
